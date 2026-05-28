import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DotMenu } from '@/components/common/DotMenu'
import type { DailyTask, TaskCompletion } from '@/types/daily-tasks'

interface TaskCardProps {
  task: DailyTask
  completion: TaskCompletion | undefined
  onToggle: (taskId: string, isCompleted: boolean) => void
}

export function TaskCard({ task, completion, onToggle }: TaskCardProps) {
  const isCompleted = completion !== undefined

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-[18px] border border-white/[0.12] bg-white/7 p-3 backdrop-blur-2xl transition-opacity',
        isCompleted && 'opacity-40',
      )}
      style={{ borderColor: `${task.color ?? '#6366f1'}33` }}
    >
      <div
        className="h-3 w-3 shrink-0 rounded-full"
        style={{ backgroundColor: task.color ?? '#6366f1' }}
      />
      <div className="min-w-0 flex-1">
        <p className={cn('text-sm font-medium text-white', isCompleted && 'line-through text-white/50')}>
          {task.title}
        </p>
        {task.category && <p className="text-xs text-white/40">{task.category}</p>}
      </div>
      <DotMenu
        items={[
          { label: 'Vincular nota', onClick: () => {} },
        ]}
      />
      <button
        type="button"
        onClick={() => onToggle(task.id, isCompleted)}
        aria-label={isCompleted ? 'Mark as pending' : 'Mark as done'}
        className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
          isCompleted
            ? 'border-white/60 bg-white/60 text-black'
            : 'border-white/30 hover:border-white/60',
        )}
      >
        {isCompleted && <Check size={12} />}
      </button>
    </div>
  )
}
