import { useRef, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
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

interface MenuPos {
  top: number
  left?: number
  right?: number
}

export function DotMenu({ items, align = 'right' }: DotMenuProps) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<MenuPos | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  function openMenu(e: React.MouseEvent) {
    e.stopPropagation()
    if (open) { setOpen(false); return }
    const rect = triggerRef.current?.getBoundingClientRect()
    if (!rect) return
    setPos(
      align === 'right'
        ? { top: rect.bottom + 4, right: window.innerWidth - rect.right }
        : { top: rect.bottom + 4, left: rect.left },
    )
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    function onOutside(e: MouseEvent) {
      const target = e.target as Node
      const inTrigger = triggerRef.current?.contains(target) ?? false
      const inMenu = menuRef.current?.contains(target) ?? false
      if (!inTrigger && !inMenu) {
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
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={openMenu}
        aria-label="Open menu"
        aria-expanded={open}
        className="flex h-8 w-8 items-center justify-center rounded-[10px] border border-white/[0.12] bg-white/7 text-white/60 transition-colors hover:text-white"
      >
        <MoreHorizontal size={16} />
      </button>

      {open && pos && createPortal(
        <div
          ref={menuRef}
          role="menu"
          style={{
            position: 'fixed',
            top: pos.top,
            ...(pos.right !== undefined ? { right: pos.right } : { left: pos.left }),
          }}
          className={cn(
            'z-[9999] min-w-[160px] overflow-hidden rounded-[16px] border border-white/[0.10] py-1',
            'bg-[rgba(18,15,35,0.95)] shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-[28px]',
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
        </div>,
        document.body,
      )}
    </>
  )
}
