import { Trash2, ChevronRight, ChevronLeft } from 'lucide-react'
import type { ProjectTask, ProjectTaskStatus } from '@/types/projects'

const STATUS_ORDER: ProjectTaskStatus[] = ['todo', 'in_progress', 'review', 'done']

interface ProjectTaskCardProps {
  task: ProjectTask
  onMove: (taskId: string, newStatus: ProjectTaskStatus) => void
  onDelete: (taskId: string) => void
}

export function ProjectTaskCard({ task, onMove, onDelete }: ProjectTaskCardProps) {
  const currentIndex = STATUS_ORDER.indexOf(task.status as ProjectTaskStatus)
  const canMoveLeft = currentIndex > 0
  const canMoveRight = currentIndex < STATUS_ORDER.length - 1

  return (
    <div className="group rounded-lg border border-border bg-card p-3">
      <p className="mb-2 text-sm font-medium leading-snug">{task.title}</p>
      {task.description && (
        <p className="mb-2 text-xs text-muted-foreground line-clamp-2">{task.description}</p>
      )}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {canMoveLeft && (
            <button
              onClick={() => onMove(task.id, STATUS_ORDER[currentIndex - 1])}
              aria-label="Move left"
              className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronLeft size={14} />
            </button>
          )}
          {canMoveRight && (
            <button
              onClick={() => onMove(task.id, STATUS_ORDER[currentIndex + 1])}
              aria-label="Move right"
              className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronRight size={14} />
            </button>
          )}
        </div>
        <button
          onClick={() => onDelete(task.id)}
          aria-label={`Delete ${task.title}`}
          className="rounded p-0.5 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 hover:text-destructive"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  )
}
