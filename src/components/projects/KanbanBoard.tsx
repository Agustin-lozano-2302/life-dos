// src/components/projects/KanbanBoard.tsx
import { useState } from 'react'
import type { ProjectTask, ProjectTaskStatus } from '@/types/projects'
import { KanbanColumn } from './KanbanColumn'

const COLUMNS: ProjectTaskStatus[] = ['todo', 'in_progress', 'review', 'done']

interface KanbanBoardProps {
  tasks: ProjectTask[]
  onMoveTask: (taskId: string, newStatus: ProjectTaskStatus) => void
  onDeleteTask: (taskId: string) => void
  onAddTask: (title: string, status: ProjectTaskStatus) => void
}

export function KanbanBoard({ tasks, onMoveTask, onDeleteTask, onAddTask }: KanbanBoardProps) {
  const [addingTo, setAddingTo] = useState<ProjectTaskStatus | null>(null)
  const [newTitle, setNewTitle] = useState('')

  function handleAdd(status: ProjectTaskStatus) {
    if (!newTitle.trim()) return
    onAddTask(newTitle.trim(), status)
    setNewTitle('')
    setAddingTo(null)
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {COLUMNS.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          tasks={tasks.filter((t) => t.status === status)}
          onMoveTask={onMoveTask}
          onDeleteTask={onDeleteTask}
          onAddTask={() => { setNewTitle(''); setAddingTo(status) }}
          addForm={addingTo === status ? (
            <form
              onSubmit={(e) => { e.preventDefault(); handleAdd(status) }}
              className="mt-2 space-y-1.5"
            >
              <input
                autoFocus
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Título de la tarea…"
                className="w-full rounded-[12px] border border-white/[0.12] bg-white/[0.05] px-3 py-1.5 text-xs text-white placeholder-white/25 outline-none focus:border-white/25"
              />
              <div className="flex gap-1.5">
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="flex-1 rounded-[10px] bg-indigo-500/25 py-1.5 text-xs font-medium text-indigo-200 disabled:opacity-40"
                >
                  Agregar
                </button>
                <button
                  type="button"
                  onClick={() => setAddingTo(null)}
                  className="rounded-[10px] border border-white/[0.12] px-2 py-1.5 text-xs text-white/40 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </form>
          ) : null}
        />
      ))}
    </div>
  )
}
