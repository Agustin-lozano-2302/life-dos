import { Plus } from 'lucide-react'
import type { ProjectTask, ProjectTaskStatus } from '@/types/projects'
import { ProjectTaskCard } from './ProjectTaskCard'

const COLUMN_LABELS: Record<ProjectTaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
}

const COLUMN_COLORS: Record<ProjectTaskStatus, string> = {
  todo: 'text-muted-foreground',
  in_progress: 'text-blue-400',
  review: 'text-amber-400',
  done: 'text-emerald-400',
}

interface KanbanColumnProps {
  status: ProjectTaskStatus
  tasks: ProjectTask[]
  onMoveTask: (taskId: string, newStatus: ProjectTaskStatus) => void
  onDeleteTask: (taskId: string) => void
  onAddTask: () => void
}

export function KanbanColumn({ status, tasks, onMoveTask, onDeleteTask, onAddTask }: KanbanColumnProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="mb-3 flex items-center justify-between">
        <span className={`text-xs font-semibold uppercase tracking-wide ${COLUMN_COLORS[status]}`}>
          {COLUMN_LABELS[status]}
          {tasks.length > 0 && <span className="ml-1.5 text-muted-foreground">({tasks.length})</span>}
        </span>
        {status === 'todo' && (
          <button
            onClick={onAddTask}
            aria-label="Add task"
            className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Plus size={14} />
          </button>
        )}
      </div>

      <div className="space-y-2">
        {tasks.map((task) => (
          <ProjectTaskCard
            key={task.id}
            task={task}
            onMove={onMoveTask}
            onDelete={onDeleteTask}
          />
        ))}
        {tasks.length === 0 && (
          <div className="rounded-lg border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
            Empty
          </div>
        )}
      </div>
    </div>
  )
}
