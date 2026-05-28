// src/components/goals/GoalCard.tsx
import { cn } from '@/lib/utils'
import { GlassCard } from '@/components/common/GlassCard'
import { DotMenu } from '@/components/common/DotMenu'
import type { Goal } from '@/types/goals'

function progressColor(pct: number): string {
  if (pct >= 100) return 'bg-emerald-400'
  if (pct >= 60) return 'bg-sky-400'
  if (pct >= 30) return 'bg-amber-400'
  return 'bg-rose-400'
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

export function GoalCard({
  goal,
  onEdit,
  onDelete,
  linkedTaskTitle,
  linkedProjectTitle,
}: GoalCardProps) {
  const pct = Math.min(100, Math.round((goal.current_value / goal.target_value) * 100))
  const deadline = daysLeft(goal.deadline)
  const isOverdue = deadline === 'Overdue'

  return (
    <GlassCard tint="emerald" className="p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold leading-tight text-white">{goal.title}</h3>
          {(linkedTaskTitle || linkedProjectTitle) && (
            <p className="mt-0.5 text-xs text-white/40">
              {linkedTaskTitle && `↳ ${linkedTaskTitle}`}
              {linkedProjectTitle && `↳ ${linkedProjectTitle}`}
            </p>
          )}
        </div>
        <DotMenu
          items={[
            { label: 'Editar', onClick: () => onEdit(goal) },
            { label: 'Eliminar', destructive: true, onClick: () => onDelete(goal.id) },
          ]}
        />
      </div>

      <div className="mb-2 flex items-end justify-between text-sm">
        <span className="font-semibold text-white">
          {goal.current_value} / {goal.target_value}{' '}
          <span className="text-xs font-normal text-white/40">{goal.unit}</span>
        </span>
        <span className={cn('text-xs font-medium', isOverdue ? 'text-rose-400' : 'text-white/40')}>
          {deadline ?? ''}
        </span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={cn('h-full rounded-full transition-all', progressColor(pct))}
          style={{ width: `${pct}%` }}
          aria-label={`${pct}% complete`}
        />
      </div>
      <p className="mt-1 text-right text-xs text-white/40">{pct}%</p>
    </GlassCard>
  )
}
