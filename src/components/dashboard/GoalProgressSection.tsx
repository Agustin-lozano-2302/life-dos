import { cn } from '@/lib/utils'
import type { Goal } from '@/types/goals'

function progressColor(pct: number): string {
  if (pct >= 100) return 'bg-emerald-500'
  if (pct >= 60) return 'bg-blue-500'
  if (pct >= 30) return 'bg-amber-500'
  return 'bg-rose-500'
}

interface GoalProgressSectionProps {
  goals: Goal[]
}

export function GoalProgressSection({ goals }: GoalProgressSectionProps) {
  if (goals.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Goals</h3>
        <p className="text-sm text-muted-foreground">No goals yet.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Goals</h3>
      <div className="space-y-3">
        {goals.map((goal) => {
          const pct = Math.min(100, Math.round((goal.current_value / goal.target_value) * 100))
          return (
            <div key={goal.id}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="truncate font-medium">{goal.title}</span>
                <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                  {goal.current_value}/{goal.target_value} {goal.unit}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn('h-full rounded-full transition-all', progressColor(pct))}
                  style={{ width: `${pct}%` }}
                  aria-label={`${pct}% complete`}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
