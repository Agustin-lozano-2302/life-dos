import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DailyTask, TaskCompletion } from '@/types/daily-tasks'

interface TaskCardProps {
  task: DailyTask
  completion: TaskCompletion | undefined
  onToggle: (taskId: string, isCompleted: boolean) => void
}

export function TaskCard({ task, completion, onToggle }: TaskCardProps) {
  const isCompleted = completion !== undefined

  return (
    <div className={cn('flex items-center gap-3 rounded-lg p-3 transition-opacity', isCompleted && 'opacity-40')}>
      <div
        className="h-3 w-3 flex-shrink-0 rounded-full"
        style={{ backgroundColor: task.color ?? 'var(--color-muted-foreground)' }}
      />
      <div className="min-w-0 flex-1">
        <p className={cn('text-sm font-medium', isCompleted && 'line-through')}>{task.title}</p>
        {task.category && <p className="text-xs text-muted-foreground">{task.category}</p>}
      </div>
      <button
        type="button"
        onClick={() => onToggle(task.id, isCompleted)}
        aria-label={isCompleted ? 'Mark as pending' : 'Mark as done'}
        className={cn(
          'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors',
          isCompleted
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-muted-foreground hover:border-primary',
        )}
      >
        {isCompleted && <Check size={12} />}
      </button>
    </div>
  )
}
