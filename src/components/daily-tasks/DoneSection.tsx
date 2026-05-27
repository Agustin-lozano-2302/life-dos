import { TaskCard } from './TaskCard'
import type { DailyTask, TaskCompletion } from '@/types/daily-tasks'

interface DoneSectionProps {
  tasks: DailyTask[]
  completions: TaskCompletion[]
  onToggle: (taskId: string, isCompleted: boolean) => void
}

export function DoneSection({ tasks, completions, onToggle }: DoneSectionProps) {
  const completedIds = new Set(completions.map((c) => c.task_id))
  const done = tasks.filter((t) => completedIds.has(t.id))

  if (done.length === 0) return null

  return (
    <div className="mt-6">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Done today · {done.length}
      </p>
      <div className="space-y-1">
        {done.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            completion={completions.find((c) => c.task_id === task.id)}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  )
}
