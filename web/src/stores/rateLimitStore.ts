import { create } from 'zustand'

export interface RateLimitStoreState {
  actionTimestamps: Record<string, number>
  setLastActionTime: (id: string, time: number) => void
  getLastActionTime: (id: string) => number
}

// Store to manage timestamps for rate-limited actions
export const useRateLimitStore = create<RateLimitStoreState>((set, get) => ({
  actionTimestamps: {},

  // Sets the last execution time for a specific action ID
  setLastActionTime: (id, time) => set((state) => ({
    actionTimestamps: {
      ...state.actionTimestamps,
      [id]: time,
    },
  })),

  // Gets the last execution time for a specific action ID
  getLastActionTime: (id) => get().actionTimestamps[id] || 0,
})) 