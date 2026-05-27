import { cn } from '@/lib/utils'
import type { TaskCompletion } from '@/types/daily-tasks'

function getHeatmapDays(today: string): string[] {
  const days: string[] = []
  const end = new Date(today)
  const start = new Date(today)
  start.setFullYear(start.getFullYear() - 1)
  start.setDate(start.getDate() + 1)
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

function cellColor(count: number): string {
  if (count === 0) return 'bg-muted'
  if (count === 1) return 'bg-violet-900'
  if (count === 2) return 'bg-violet-700'
  if (count <= 4) return 'bg-violet-500'
  return 'bg-violet-400'
}

interface ActivityHeatmapProps {
  completions: TaskCompletion[]
  today: string
}

export function ActivityHeatmap({ completions, today }: ActivityHeatmapProps) {
  const days = getHeatmapDays(today)
  const countByDay = new Map<string, number>()
  for (const c of completions) {
    countByDay.set(c.date, (countByDay.get(c.date) ?? 0) + 1)
  }

  // Pad beginning to align to Sunday
  const firstDay = new Date(days[0])
  const leadingBlanks = firstDay.getDay()

  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-muted-foreground">
        <span>1 year</span>
        <span>Today</span>
      </div>
      <div
        className="grid gap-0.5"
        style={{ gridTemplateColumns: 'repeat(53, minmax(0, 1fr))' }}
      >
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {days.map((day) => {
          const count = countByDay.get(day) ?? 0
          return (
            <div
              key={day}
              title={`${day}: ${count} completion${count !== 1 ? 's' : ''}`}
              className={cn('aspect-square rounded-sm', cellColor(count))}
            />
          )
        })}
      </div>
      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
        <span>Less</span>
        {[0, 1, 2, 3, 5].map((n) => (
          <div key={n} className={cn('h-2.5 w-2.5 rounded-sm', cellColor(n))} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}
