import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface GlassSheetProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  className?: string
}

export function GlassSheet({ open, onClose, children, className }: GlassSheetProps) {
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-40">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/30 backdrop-blur-[4px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'absolute bottom-0 right-0 top-0 z-10 flex flex-col',
          'w-[72%] max-w-[420px]',
          'border-l border-white/[0.10] bg-[rgba(12,10,28,0.92)]',
          'shadow-[-8px_0_40px_rgba(0,0,0,0.4)] backdrop-blur-[32px] backdrop-saturate-200',
          className,
        )}
      >
        {children}
      </div>
    </div>
  )
}
