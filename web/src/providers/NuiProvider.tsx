import React, { createContext, useContext, useCallback, useEffect, ReactNode, useMemo } from 'react'
import { useNuiState, useNuiSelector, selectVisible, selectUiReady, selectLastMessage, selectRateLimitResponses, NuiMessage } from '../stores/nui'

// Add global type augmentation for FiveM and Vite
declare global {
  interface Window {
    GetParentResourceName?: () => string;
  }
  interface ImportMeta {
    env: Record<string, any>;
  }
}

export interface NuiContextValue {
  visible: boolean
  setVisible: (visible: boolean) => void
  sendMessage: (event: string, data?: Record<string, unknown>) => Promise<any>
  hideFrame: () => void
  handleNuiMessage: (event: MessageEvent<NuiMessage>) => void
}

const NuiContext = createContext<NuiContextValue | null>(null)

export const useNui = (): NuiContextValue => {
  const context = useContext(NuiContext)
  if (!context) throw new Error('useNui must be used within NuiProvider')
  return context
}

interface NuiProviderProps {
  children: ReactNode
}

export const NuiProvider: React.FC<NuiProviderProps> = ({ children }) => {
  const setVisible = useNuiState(state => state.setVisible)
  const setUiReady = useNuiState(state => state.setUiReady)
  const handleNuiMessage = useNuiState(state => state.handleNuiMessage)
  const visible = useNuiSelector(selectVisible)

  // Function to send messages to the game client
  const sendMessage = useCallback(async (event: string, data: Record<string, unknown> = {}) => {
    const eventName = typeof event === 'string' ? event : 'unknownEvent'
    try {
      const resourceName = window.GetParentResourceName ? window.GetParentResourceName() : 'inkwell-react-template'
      const resp = await fetch(`https://${resourceName}/${eventName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify(data),
      })

      if (!resp.ok) {
        console.error(`[NUI Provider] Failed to send ${eventName}: ${resp.status}`)
        return null
      }
      try {
        return await resp.json()
      } catch (e) {
        return await resp.text()
      }
    } catch (err) {
      console.error(`[NUI Provider] Error sending ${eventName}:`, err)
      return null
    }
  }, [])

  // Function to hide the NUI frame (requests client to hide)
  const hideFrame = useCallback(() => {
    if (import.meta.env.DEV) {
      setVisible(false)
    } else {
      void sendMessage('hideFrame')
    }
  }, [sendMessage, setVisible])

  useEffect(() => {
    window.addEventListener('message', handleNuiMessage as EventListener)
    sendMessage('uiReady')
    setUiReady(true)
    return () => {
      window.removeEventListener('message', handleNuiMessage as EventListener)
    }
  }, [sendMessage, handleNuiMessage, setUiReady])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        hideFrame()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [hideFrame])

  const value = useMemo<NuiContextValue>(() => ({
    visible,
    setVisible,
    sendMessage,
    hideFrame,
    handleNuiMessage
  }), [visible, setVisible, sendMessage, hideFrame, handleNuiMessage])

  return (
    <NuiContext.Provider value={value}>
      {children}
    </NuiContext.Provider>
  )
} 