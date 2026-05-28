import { BarChart2, FileText, LayoutGrid, Target, Zap } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

const tabs = [
  { to: '/habitos',   label: 'Hábitos',   Icon: Zap },
  { to: '/projects',  label: 'Projects',  Icon: LayoutGrid },
  { to: '/goals',     label: 'Goals',     Icon: Target },
  { to: '/notes',     label: 'Notes',     Icon: FileText },
  { to: '/dashboard', label: 'Dashboard', Icon: BarChart2 },
] as const

export function BottomNav() {
  return (
    <nav
      className="relative z-10 flex border-t border-white/[0.07]"
      style={{ background: 'rgba(8,6,20,0.85)', backdropFilter: 'blur(20px)' }}
    >
      {tabs.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors',
              isActive ? 'text-white' : 'text-white/30 hover:text-white/70',
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={20} className={isActive ? 'fill-white stroke-white' : ''} />
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
