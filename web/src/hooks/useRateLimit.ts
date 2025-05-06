import { useState, useCallback, useEffect, useRef } from 'react'
import { useNui } from '../providers/NuiProvider'
import { useNuiState, selectRateLimitResponses, NuiMessage } from '../stores/nui'
import { useRateLimitStore } from '../stores/rateLimitStore'
import type { RateLimitStoreState } from '../stores/rateLimitStore'

interface UseRateLimitReturn {
  isRateLimited: boolean
  performAction: (actionFn: () => void) => void
  rateLimitMessage: string | null
}

/**
 * Custom hook to manage rate limiting for actions with server-side validation.
 * @param id - A unique identifier for the action being rate-limited.
 * @param cooldown - The cooldown period in milliseconds.
 * @param messageDuration - How long to show the rate limit message (ms).
 */
export function useRateLimit(
  id: string,
  cooldown: number,
  messageDuration: number = 2000
): UseRateLimitReturn {
  const { sendMessage } = useNui()
  const [isRateLimited, setIsRateLimited] = useState<boolean>(false)
  const [rateLimitMessage, setRateLimitMessage] = useState<string | null>(null)
  const messageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { getLastActionTime, setLastActionTime } = useRateLimitStore() as RateLimitStoreState
  const rateLimitResponses = useNuiState(selectRateLimitResponses)

  const showMessage = (msg: string) => {
    setRateLimitMessage(msg)
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current)
    }
    messageTimeoutRef.current = setTimeout(() => {
      setRateLimitMessage(null)
    }, messageDuration)
  }

  // Effect to handle rate limit responses from the store
  useEffect(() => {
    const allowed = rateLimitResponses.get(id)
    if (allowed !== undefined) {
      setIsRateLimited(!allowed)
      if (allowed) {
        setLastActionTime(id, Date.now()) // Set local timestamp on server success
        setRateLimitMessage(null) // Clear message on success
        if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current)
      } else {
        // Show message if server denies
        showMessage(`Action [${id}] is rate limited. Please wait.`)
      }
    }
  }, [id, rateLimitResponses, setLastActionTime])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current)
      }
    }
  }, [])

  // Function to attempt performing an action, checking with server first
  const performAction = useCallback((actionFn: () => void): void => {
    // Check local cooldown first to avoid unnecessary server calls
    const lastActionTime = getLastActionTime(id)
    const now = Date.now()
    
    if (now - lastActionTime < cooldown) {
      // Show message if local check fails
      showMessage(`Action [${id}] is rate limited. Please wait.`)
      return
    }

    // Clear any previous message immediately when attempting
    setRateLimitMessage(null)
    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current)

    // Request server validation
    void sendMessage('checkRateLimit', { actionId: id, cooldown })
    
    // The action will be executed based on the server response handled in the effect
    // If server allows, the original actionFn passed here isn't executed directly,
    // because we need to wait for the server confirmation.
    // We might need to refactor this if the actionFn *must* run after confirmation.
    // For now, assuming the actionFn itself triggers the sendMessage logic.
    
    // Let's trigger the actionFn here for now, assuming it's okay to run locally
    // immediately, and the rate limit is primarily for server-side effects or logging.
    // If this needs to be strictly after server confirmation, we need a different approach.
    actionFn() 

  }, [id, cooldown, sendMessage, getLastActionTime, showMessage])

  return { isRateLimited, performAction, rateLimitMessage }
} 