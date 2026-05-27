import { Link } from 'react-router-dom'
import { useTodayTasks } from '@/hooks/useTodayTasks'
import { useTaskMutations } from '@/hooks/useTaskMutations'
import { TaskList } from '@/components/daily-tasks/TaskList'
import { DoneSection } from '@/components/daily-tasks/DoneSection'

export default function FocusPage() {
  const { tasks, completions, isLoading } = useTodayTasks()
  const { toggleCompletion } = useTaskMutations()

  if (isLoading) {
    return <div className="py-8 text-center text-sm text-muted-foreground">Loading…</div>
  }

  return (
    <div className="py-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Today</h1>
        <Link to="/focus/manage" className="text-sm text-muted-foreground hover:text-foreground">
          Manage →
        </Link>
      </div>

      <TaskList
        tasks={tasks}
        completions={completions}
        onToggle={(taskId, isCompleted) => toggleCompletion({ taskId, isCompleted })}
      />

      <DoneSection
        tasks={tasks}
        completions={completions}
        onToggle={(taskId, isCompleted) => toggleCompletion({ taskId, isCompleted })}
      />
    </div>
  )
}
