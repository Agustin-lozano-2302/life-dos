import type { HTMLAttributes, CSSProperties } from 'react'
import { cn } from '@/lib/utils'

const TINT_CLASSES = {
  neutral: { bg: 'bg-white/7',              border: 'border-white/[0.12]' },
  orange:  { bg: 'bg-orange-500/[0.10]',    border: 'border-orange-400/[0.22]' },
  indigo:  { bg: 'bg-indigo-500/[0.10]',    border: 'border-indigo-400/[0.22]' },
  emerald: { bg: 'bg-emerald-500/[0.10]',   border: 'border-emerald-400/[0.22]' },
  violet:  { bg: 'bg-violet-500/[0.10]',    border: 'border-violet-400/[0.22]' },
  sky:     { bg: 'bg-sky-500/[0.10]',       border: 'border-sky-400/[0.22]' },
} satisfies Record<string, { bg: string; border: string }>

export type GlassTint = keyof typeof TINT_CLASSES | 'custom'

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  tint?: GlassTint
  hex?: string
}

export function GlassCard({
  tint = 'neutral',
  hex,
  className,
  style,
  children,
  ...props
}: GlassCardProps) {
  const isCustom = tint === 'custom' && !!hex
  const tintEntry = isCustom ? null : (TINT_CLASSES[tint] ?? TINT_CLASSES.neutral)

  const customStyle: CSSProperties = isCustom
    ? { backgroundColor: `${hex}1a`, borderColor: `${hex}40`, ...style }
    : { ...style }

  return (
    <div
      className={cn(
        'rounded-[18px] border backdrop-blur-2xl backdrop-saturate-[180%]',
        'shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.14)]',
        tintEntry?.bg,
        tintEntry?.border,
        className,
      )}
      style={customStyle}
      {...props}
    >
      {children}
    </div>
  )
}
