// src/components/daily-tasks/DaySelector.tsx
import { cn } from '@/lib/utils'

const DAYS = [
  { label: 'D', value: 0 },
  { label: 'L', value: 1 },
  { label: 'M', value: 2 },
  { label: 'X', value: 3 },
  { label: 'J', value: 4 },
  { label: 'V', value: 5 },
  { label: 'S', value: 6 },
] as const

interface DaySelectorProps {
  value: number[]
  onChange: (days: number[]) => void
}

export function DaySelector({ value, onChange }: DaySelectorProps) {
  function toggle(day: number) {
    if (value.includes(day)) {
      if (value.length === 1) return
      onChange(value.filter((d) => d !== day))
    } else {
      onChange([...value, day].sort((a, b) => a - b))
    }
  }

  return (
    <div className="flex gap-1.5">
      {DAYS.map(({ label, value: day }) => (
        <button
          key={day}
          type="button"
          onClick={() => toggle(day)}
          aria-pressed={value.includes(day)}
          className={cn(
            'h-8 w-8 rounded-full text-xs font-semibold transition-colors',
            value.includes(day)
              ? 'bg-orange-500/70 text-white shadow-[0_0_12px_rgba(249,115,22,0.4)]'
              : 'border border-white/[0.12] bg-white/[0.05] text-white/30 hover:border-white/25 hover:text-white/60',
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
