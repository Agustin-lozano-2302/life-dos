// src/components/projects/ProjectTaskCard.tsx
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { GlassCard } from '@/components/common/GlassCard'
import { DotMenu } from '@/components/common/DotMenu'
import { AttachmentStrip } from '@/components/common/AttachmentStrip'
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

  const menuItems = [
    ...(canMoveLeft ? [{ label: 'Mover atrás', icon: <ChevronLeft size={14} />, onClick: () => onMove(task.id, STATUS_ORDER[currentIndex - 1]) }] : []),
    ...(canMoveRight ? [{ label: 'Mover adelante', icon: <ChevronRight size={14} />, onClick: () => onMove(task.id, STATUS_ORDER[currentIndex + 1]) }] : []),
    { label: 'Eliminar', destructive: true, onClick: () => onDelete(task.id) },
  ]

  return (
    <GlassCard tint="indigo" className="p-3">
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="flex-1 text-sm font-medium leading-snug text-white">{task.title}</p>
        <DotMenu items={menuItems} />
      </div>
      {task.description && (
        <p className="text-xs text-white/40 line-clamp-2">{task.description}</p>
      )}
      <div className="mt-2">
        <AttachmentStrip entityType="project_task" entityId={task.id} />
      </div>
    </GlassCard>
  )
}
