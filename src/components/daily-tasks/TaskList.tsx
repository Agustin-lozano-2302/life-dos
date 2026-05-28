import { Link } from 'react-router-dom'
import { TaskCard } from './TaskCard'
import type { DailyTask, TaskCompletion } from '@/types/daily-tasks'

interface TaskListProps {
  tasks: DailyTask[]
  completions: TaskCompletion[]
  onToggle: (taskId: string, isCompleted: boolean) => void
}

export function TaskList({ tasks, completions, onToggle }: TaskListProps) {
  const completedIds = new Set(completions.map((c) => c.task_id))
  const pending = tasks.filter((t) => !completedIds.has(t.id))

  if (tasks.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nothing scheduled for today.{' '}
        <Link to="/habitos/gestionar" className="underline">
          Manage →
        </Link>
      </p>
    )
  }

  if (pending.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">All done for today ✓</p>
  }

  return (
    <div className="space-y-1">
      {pending.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          completion={completions.find((c) => c.task_id === task.id)}
          onToggle={onToggle}
        />
      ))}
    </div>
  )
}
