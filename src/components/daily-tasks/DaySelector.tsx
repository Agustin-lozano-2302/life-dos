import { cn } from '@/lib/utils'

const DAYS = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
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
            'h-8 w-8 rounded-full text-xs font-medium transition-colors',
            value.includes(day)
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-accent',
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
