import { LogOut, Moon, Sun } from 'lucide-react'
import { useThemeStore } from '@/store/theme'
import { useAuthStore } from '@/store/auth'
import { signOut } from '@/lib/supabase/auth'

export function AppHeader() {
  const { theme, toggle } = useThemeStore()
  const user = useAuthStore((s) => s.user)

  return (
    <header className="flex items-center justify-between border-b border-border bg-background px-4 py-3">
      <span className="text-lg font-semibold tracking-tight">Life Do's</span>
      <div className="flex items-center gap-1">
        <button
          onClick={toggle}
          aria-label="Toggle theme"
          className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        {user && (
          <button
            onClick={() => signOut()}
            aria-label="Sign out"
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <LogOut size={18} />
          </button>
        )}
      </div>
    </header>
  )
}
