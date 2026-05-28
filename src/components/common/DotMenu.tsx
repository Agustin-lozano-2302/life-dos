import { useRef, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DotMenuItem {
  label: string
  icon?: ReactNode
  shortcut?: string
  destructive?: boolean
  onClick: () => void
}

interface DotMenuProps {
  items: DotMenuItem[]
  align?: 'left' | 'right'
}

export function DotMenu({ items, align = 'right' }: DotMenuProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    function onOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onOutside)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onOutside)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}
        aria-label="Open menu"
        aria-expanded={open}
        className="flex h-8 w-8 items-center justify-center rounded-[10px] border border-white/[0.12] bg-white/7 text-white/60 transition-colors hover:text-white"
      >
        <MoreHorizontal size={16} />
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            'absolute z-50 mt-1 min-w-[160px] overflow-hidden rounded-[16px] border border-white/[0.10] py-1',
            'bg-[rgba(18,15,35,0.95)] shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-[28px]',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          {items.map((item, i) => (
            <button
              key={i}
              role="menuitem"
              type="button"
              onClick={(e) => { e.stopPropagation(); item.onClick(); setOpen(false) }}
              className={cn(
                'flex w-full items-center gap-2.5 px-3 py-2 text-sm font-medium transition-colors hover:bg-white/[0.06]',
                item.destructive ? 'text-red-400' : 'text-white/85',
                i > 0 && 'border-t border-white/[0.05]',
              )}
            >
              {item.icon && <span className="shrink-0">{item.icon}</span>}
              <span className="flex-1 text-left">{item.label}</span>
              {item.shortcut && (
                <span className="text-xs text-white/30">{item.shortcut}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
