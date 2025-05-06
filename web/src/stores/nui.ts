import { create } from 'zustand'
import { shallow } from 'zustand/shallow'

export type NuiMessage =
  | { type: 'setVisible'; data: boolean }
  | { type: 'rateLimitResponse'; data: { actionId: string; allowed: boolean } }
  | { type: string; data: any } // fallback for unknown types

export interface NuiState {
  visible: boolean
  uiReady: boolean
  lastMessage: NuiMessage | null
  rateLimitResponses: Map<string, boolean>
  setVisible: (visible: boolean) => void
  setUiReady: (ready: boolean) => void
  handleRateLimitResponse: (actionId: string, allowed: boolean) => void
  handleNuiMessage: (event: MessageEvent<NuiMessage>) => void
}

// Define the state structure and actions
export const useNuiState = create<NuiState>((set, get) => ({
  // Initial state
  visible: false,
  uiReady: false,
  lastMessage: null,
  rateLimitResponses: new Map(), // Store rate limit responses

  // Action to set visibility
  setVisible: (visible: boolean) => {
    set({ visible })
  },

  // Action to mark UI as ready
  setUiReady: (ready: boolean) => {
    set({ uiReady: ready })
  },

  // Action to handle rate limit response
  handleRateLimitResponse: (actionId: string, allowed: boolean) => {
    set((state) => ({
      rateLimitResponses: new Map(state.rateLimitResponses).set(actionId, allowed)
    }))
  },

  // Action to handle incoming NUI messages
  handleNuiMessage: (event: MessageEvent<NuiMessage>) => {
    const { type, data } = event.data
    set({ lastMessage: { type, data } }) // Store last message for debugging

    switch (type) {
      case 'setVisible':
        // Only allow game to control visibility if not in dev mode
        // In dev mode, the DevTools component will control visibility directly
        if (!import.meta.env.DEV) {
          get().setVisible(data)
        } else {
          console.log('[NUI Store] Ignoring setVisible in DEV mode (use DevTools)')
        }
        break
      case 'rateLimitResponse':
        get().handleRateLimitResponse(data.actionId, data.allowed)
        break
      // Add more message type handlers here as needed
      default:
        console.warn(`[NUI Store] Unhandled message type: ${type}`)
        break
    }
  },
}))

export const selectVisible = (state: NuiState) => state.visible
export const selectUiReady = (state: NuiState) => state.uiReady
export const selectLastMessage = (state: NuiState) => state.lastMessage
export const selectRateLimitResponses = (state: NuiState) => state.rateLimitResponses

// Hook to select specific state properties with shallow comparison
export const useNuiSelector = <T>(selector: (state: NuiState) => T): T => {
  return useNuiState(selector, shallow)
} 