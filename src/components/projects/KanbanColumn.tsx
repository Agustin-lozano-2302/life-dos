// src/components/projects/KanbanColumn.tsx
import { useState } from 'react'
import { Plus, ChevronDown, ChevronRight } from 'lucide-react'
import type { ProjectTask, ProjectTaskStatus } from '@/types/projects'
import { ProjectTaskCard } from './ProjectTaskCard'

const COLUMN_LABELS: Record<ProjectTaskStatus, string> = {
  todo: 'Por hacer',
  in_progress: 'En progreso',
  review: 'Revisión',
  done: 'Hecho',
}

const COLUMN_ACCENT: Record<ProjectTaskStatus, string> = {
  todo: 'text-white/50 border-white/[0.12]',
  in_progress: 'text-sky-300 border-sky-400/30',
  review: 'text-amber-300 border-amber-400/30',
  done: 'text-emerald-300 border-emerald-400/30',
}

const COLUMN_COUNT_BG: Record<ProjectTaskStatus, string> = {
  todo: 'bg-white/10 text-white/40',
  in_progress: 'bg-sky-500/20 text-sky-300',
  review: 'bg-amber-500/20 text-amber-300',
  done: 'bg-emerald-500/20 text-emerald-300',
}

interface KanbanColumnProps {
  status: ProjectTaskStatus
  tasks: ProjectTask[]
  onMoveTask: (taskId: string, newStatus: ProjectTaskStatus) => void
  onDeleteTask: (taskId: string) => void
  onAddTask: () => void
  addForm?: React.ReactNode
}

export function KanbanColumn({ status, tasks, onMoveTask, onDeleteTask, onAddTask, addForm }: KanbanColumnProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      {/* Column header */}
      <div className={`mb-2 flex items-center gap-1.5 rounded-[12px] border px-2.5 py-1.5 ${COLUMN_ACCENT[status]} bg-white/[0.04]`}>
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="flex flex-1 items-center gap-1.5 text-left"
          aria-expanded={!collapsed}
        >
          {collapsed
            ? <ChevronRight size={12} className="shrink-0 opacity-60" />
            : <ChevronDown size={12} className="shrink-0 opacity-60" />
          }
          <span className="text-[10px] font-bold uppercase tracking-widest">
            {COLUMN_LABELS[status]}
          </span>
        </button>
        {tasks.length > 0 && (
          <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${COLUMN_COUNT_BG[status]}`}>
            {tasks.length}
          </span>
        )}
        <button
          type="button"
          onClick={onAddTask}
          aria-label={`Agregar tarea a ${COLUMN_LABELS[status]}`}
          className="ml-0.5 rounded p-0.5 text-current opacity-50 hover:opacity-100"
        >
          <Plus size={12} />
        </button>
      </div>

      {/* Tasks */}
      {!collapsed && (
        <div className="space-y-2">
          {tasks.map((task) => (
            <ProjectTaskCard
              key={task.id}
              task={task}
              onMove={onMoveTask}
              onDelete={onDeleteTask}
            />
          ))}
          {tasks.length === 0 && !addForm && (
            <button
              type="button"
              onClick={onAddTask}
              className="w-full rounded-[14px] border border-dashed border-white/[0.10] py-5 text-xs text-white/20 transition-colors hover:border-white/20 hover:text-white/40"
            >
              + tarea
            </button>
          )}
          {addForm}
        </div>
      )}
    </div>
  )
}
