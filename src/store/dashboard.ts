import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type DashboardPeriod = 'week' | 'month' | 'year'

interface DashboardStore {
  period: DashboardPeriod
  setPeriod: (period: DashboardPeriod) => void
  dismissedSuggestions: string[]
  dismissSuggestion: (id: string) => void
}

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set) => ({
      period: 'week',
      setPeriod: (period) => set({ period }),
      dismissedSuggestions: [],
      dismissSuggestion: (id) =>
        set((s) => ({ dismissedSuggestions: [...s.dismissedSuggestions, id] })),
    }),
    { name: 'dashboard-store' },
  ),
)
