import { FileText, LayoutGrid, Target, Zap } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

const tabs = [
  { to: '/focus', label: 'Focus', Icon: Zap },
  { to: '/projects', label: 'Projects', Icon: LayoutGrid },
  { to: '/goals', label: 'Goals', Icon: Target },
  { to: '/notes', label: 'Notes', Icon: FileText },
] as const

export function BottomNav() {
  return (
    <nav className="flex border-t border-border bg-background">
      {tabs.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors',
              isActive
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground',
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon
                size={20}
                className={isActive ? 'fill-primary stroke-primary' : ''}
              />
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
