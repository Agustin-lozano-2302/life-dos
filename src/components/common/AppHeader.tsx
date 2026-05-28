import { LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { signOut } from '@/lib/supabase/auth'

export function AppHeader() {
  const user = useAuthStore((s) => s.user)

  return (
    <header className="relative z-10 flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-2.5">
        <img
          src="/logos/lifedos-logo-nobg.png"
          alt="Life Do's"
          className="h-8 w-8 drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]"
        />
        <span className="text-[20px] font-extrabold tracking-[-0.4px] text-white">
          Life Do's
        </span>
      </div>
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
