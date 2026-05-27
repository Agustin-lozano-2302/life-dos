import { useState } from 'react'
import type { ProjectTask, ProjectTaskStatus } from '@/types/projects'
import { KanbanColumn } from './KanbanColumn'

const COLUMNS: ProjectTaskStatus[] = ['todo', 'in_progress', 'review', 'done']

interface AddTaskFormProps {
  onAdd: (title: string) => void
  onCancel: () => void
}

function AddTaskForm({ onAdd, onCancel }: AddTaskFormProps) {
  const [title, setTitle] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onAdd(title.trim())
    setTitle('')
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 space-y-2">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title…"
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!title.trim()}
          className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
        >
          Add
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-border px-3 py-1.5 text-xs font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

interface KanbanBoardProps {
  tasks: ProjectTask[]
  onMoveTask: (taskId: string, newStatus: ProjectTaskStatus) => void
  onDeleteTask: (taskId: string) => void
  onAddTask: (title: string) => void
}

export function KanbanBoard({ tasks, onMoveTask, onDeleteTask, onAddTask }: KanbanBoardProps) {
  const [showAddForm, setShowAddForm] = useState(false)

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {COLUMNS.map((status) => (
        <div key={status}>
          <KanbanColumn
            status={status}
            tasks={tasks.filter((t) => t.status === status)}
            onMoveTask={onMoveTask}
            onDeleteTask={onDeleteTask}
            onAddTask={() => setShowAddForm(true)}
          />
          {status === 'todo' && showAddForm && (
            <AddTaskForm
              onAdd={(title) => { onAddTask(title); setShowAddForm(false) }}
              onCancel={() => setShowAddForm(false)}
            />
          )}
        </div>
      ))}
    </div>
  )
}
