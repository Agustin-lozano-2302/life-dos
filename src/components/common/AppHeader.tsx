import { Moon, Sun } from 'lucide-react'
import { useThemeStore } from '@/store/theme'

export function AppHeader() {
  const { theme, toggle } = useThemeStore()

  return (
    <header className="flex items-center justify-between border-b border-border bg-background px-4 py-3">
      <span className="text-lg font-semibold tracking-tight">Life Do's</span>
      <button
        onClick={toggle}
        aria-label="Toggle theme"
        className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </header>
  )
}
