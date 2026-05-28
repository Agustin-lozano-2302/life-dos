import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import supabase from '@/lib/supabase/client'

interface AuthStore {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
}))

// Bootstrap: sync with Supabase session on app start
supabase.auth.getSession().then(({ data }) => {
  useAuthStore.setState({ user: data.session?.user ?? null, isLoading: false })
})

supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.setState({ user: session?.user ?? null, isLoading: false })
})
