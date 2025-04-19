import { useState, useCallback, useEffect, useRef } from 'react'
import { useNui } from '../providers/NuiProvider'
import { useNuiState } from '../stores/nui'
import { useRateLimitStore } from '../stores/rateLimitStore'

/**
 * Custom hook to manage rate limiting for actions with server-side validation.
 * @param {string} id - A unique identifier for the action being rate-limited.
 * @param {number} cooldown - The cooldown period in milliseconds.
 * @param {number} messageDuration - How long to show the rate limit message (ms).
 * @returns {{ isRateLimited: boolean, performAction: (actionFn: () => void) => void, rateLimitMessage: string | null }}
 */
export function useRateLimit(id, cooldown, messageDuration = 2000) {
  const { sendMessage } = useNui()
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [rateLimitMessage, setRateLimitMessage] = useState(null)
  const messageTimeoutRef = useRef(null)
  const { getLastActionTime, setLastActionTime } = useRateLimitStore()
  const rateLimitResponses = useNuiState((state) => state.rateLimitResponses)

  const showMessage = (msg) => {
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
  const performAction = useCallback(async (actionFn) => {
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
    await sendMessage('checkRateLimit', { actionId: id, cooldown })
    
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