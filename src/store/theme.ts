import { create } from 'zustand'

type Theme = 'dark' | 'light'

interface ThemeStore {
  theme: Theme
  toggle: () => void
}

function getInitialTheme(): Theme {
  return localStorage.getItem('theme') === 'light' ? 'light' : 'dark'
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: getInitialTheme(),
  toggle: () =>
    set((state) => {
      const next: Theme = state.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem('theme', next)
      document.documentElement.classList.toggle('dark', next === 'dark')
      return { theme: next }
    }),
}))
