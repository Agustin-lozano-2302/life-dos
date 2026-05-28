import { Link } from 'react-router-dom'
import { useTodayTasks } from '@/hooks/useTodayTasks'
import { useTaskMutations } from '@/hooks/useTaskMutations'
import { TaskList } from '@/components/daily-tasks/TaskList'
import { DoneSection } from '@/components/daily-tasks/DoneSection'

export default function HabitosPage() {
  const { tasks, completions, isLoading } = useTodayTasks()
  const { toggleCompletion } = useTaskMutations()

  if (isLoading) {
    return <div className="py-8 text-center text-sm text-white/40">Loading…</div>
  }

  return (
    <div className="py-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-[22px] font-extrabold tracking-[-0.4px] text-white">Hoy</h1>
        <Link to="/habitos/gestionar" className="text-sm text-white/40 hover:text-white">
          Gestionar →
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
