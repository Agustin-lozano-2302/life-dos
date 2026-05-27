import { Link } from 'react-router-dom'
import { CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Project } from '@/types/projects'

const STATUS_STYLES: Record<Project['status'], string> = {
  active: 'bg-emerald-500/15 text-emerald-400',
  paused: 'bg-amber-500/15 text-amber-400',
  completed: 'bg-blue-500/15 text-blue-400',
  archived: 'bg-muted text-muted-foreground',
}

const STATUS_LABELS: Record<Project['status'], string> = {
  active: 'Active',
  paused: 'Paused',
  completed: 'Completed',
  archived: 'Archived',
}

interface ProjectCardProps {
  project: Project
  taskCount?: number
  doneCount?: number
}

export function ProjectCard({ project, taskCount = 0, doneCount = 0 }: ProjectCardProps) {
  const progress = taskCount > 0 ? Math.round((doneCount / taskCount) * 100) : 0

  return (
    <Link
      to={`/projects/${project.id}`}
      className="block rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="font-semibold leading-tight">{project.title}</h3>
        <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-xs font-medium', STATUS_STYLES[project.status])}>
          {STATUS_LABELS[project.status]}
        </span>
      </div>

      {project.description && (
        <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{project.description}</p>
      )}

      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>{taskCount} task{taskCount !== 1 ? 's' : ''} · {doneCount} done</span>
        {project.due_date && (
          <span className="flex items-center gap-1">
            <CalendarDays size={12} />
            {project.due_date}
          </span>
        )}
      </div>

      {taskCount > 0 && (
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </Link>
  )
}
