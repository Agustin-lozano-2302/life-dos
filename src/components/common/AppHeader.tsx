import { LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { signOut } from '@/lib/supabase/auth'

export function AppHeader() {
  const user = useAuthStore((s) => s.user)

  return (
    <header className="relative z-10 flex items-center justify-between px-4 py-3">
      <span className="text-[22px] font-extrabold tracking-[-0.4px] text-white">
        Life Do's
      </span>
      {user && (
        <button
          onClick={() => signOut()}
          aria-label="Sign out"
          className="rounded-md p-2 text-white/40 transition-colors hover:text-white"
        >
          <LogOut size={18} />
        </button>
      )}
    </header>
  )
}
