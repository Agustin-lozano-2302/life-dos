import { cn } from '@/lib/utils'
import type { Goal } from '@/types/goals'

function progressColor(pct: number): string {
  if (pct >= 100) return 'bg-emerald-500'
  if (pct >= 60) return 'bg-blue-500'
  if (pct >= 30) return 'bg-amber-500'
  return 'bg-rose-500'
}

function daysLeft(deadline: string | null): string | null {
  if (!deadline) return null
  const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000)
  if (diff < 0) return 'Overdue'
  if (diff === 0) return 'Due today'
  return `${diff}d left`
}

interface GoalCardProps {
  goal: Goal
  onEdit: (goal: Goal) => void
  onDelete: (id: string) => void
  linkedTaskTitle?: string
  linkedProjectTitle?: string
}

export function GoalCard({ goal, onEdit, onDelete, linkedTaskTitle, linkedProjectTitle }: GoalCardProps) {
  const pct = Math.min(100, Math.round((goal.current_value / goal.target_value) * 100))
  const deadline = daysLeft(goal.deadline)
  const isOverdue = deadline === 'Overdue'

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold leading-tight">{goal.title}</h3>
          {(linkedTaskTitle || linkedProjectTitle) && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {linkedTaskTitle && `↳ ${linkedTaskTitle}`}
              {linkedProjectTitle && `↳ ${linkedProjectTitle}`}
            </p>
          )}
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            onClick={() => onEdit(goal)}
            aria-label={`Edit ${goal.title}`}
            className="rounded p-1 text-xs text-muted-foreground hover:text-foreground"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(goal.id)}
            aria-label={`Delete ${goal.title}`}
            className="rounded p-1 text-xs text-muted-foreground hover:text-destructive"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="mb-2 flex items-end justify-between text-sm">
        <span className="font-semibold">
          {goal.current_value} / {goal.target_value}{' '}
          <span className="text-xs font-normal text-muted-foreground">{goal.unit}</span>
        </span>
        <span className={cn('text-xs font-medium', isOverdue ? 'text-destructive' : 'text-muted-foreground')}>
          {deadline ?? ''}
        </span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn('h-full rounded-full transition-all', progressColor(pct))}
          style={{ width: `${pct}%` }}
          aria-label={`${pct}% complete`}
        />
      </div>
      <p className="mt-1 text-right text-xs text-muted-foreground">{pct}%</p>
    </div>
  )
}
