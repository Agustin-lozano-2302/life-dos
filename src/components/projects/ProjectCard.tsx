// src/components/projects/ProjectCard.tsx
import { Link } from 'react-router-dom'
import { CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlassCard } from '@/components/common/GlassCard'
import type { Project } from '@/types/projects'

const STATUS_STYLES: Record<Project['status'], string> = {
  active:    'bg-indigo-500/20 text-indigo-300',
  paused:    'bg-amber-500/20 text-amber-300',
  completed: 'bg-emerald-500/20 text-emerald-300',
  archived:  'bg-white/10 text-white/40',
}

const STATUS_LABELS: Record<Project['status'], string> = {
  active:    'Active',
  paused:    'Paused',
  completed: 'Completed',
  archived:  'Archived',
}

interface ProjectCardProps {
  project: Project
  taskCount?: number
  doneCount?: number
}

export function ProjectCard({ project, taskCount = 0, doneCount = 0 }: ProjectCardProps) {
  const progress = taskCount > 0 ? Math.round((doneCount / taskCount) * 100) : 0

  return (
    <Link to={`/projects/${project.id}`} className="block">
      <GlassCard tint="indigo" className="p-4 transition-opacity hover:opacity-90">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight text-white">{project.title}</h3>
          <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-xs font-medium', STATUS_STYLES[project.status])}>
            {STATUS_LABELS[project.status]}
          </span>
        </div>

        {project.description && (
          <p className="mb-3 line-clamp-2 text-sm text-white/50">{project.description}</p>
        )}

        <div className="flex items-center justify-between gap-3 text-xs text-white/40">
          <span>{taskCount} task{taskCount !== 1 ? 's' : ''} · {doneCount} done</span>
          {project.due_date && (
            <span className="flex items-center gap-1">
              <CalendarDays size={12} />
              {project.due_date}
            </span>
          )}
        </div>

        {taskCount > 0 && (
          <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-indigo-400 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </GlassCard>
    </Link>
  )
}
