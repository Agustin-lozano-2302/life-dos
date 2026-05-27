import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { useAllTasks } from '@/hooks/useAllTasks'
import { useTaskMutations } from '@/hooks/useTaskMutations'
import { TaskForm } from '@/components/daily-tasks/TaskForm'
import type { DailyTask, CreateTaskInput, UpdateTaskInput } from '@/types/daily-tasks'

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export default function TasksManagePage() {
  const navigate = useNavigate()
  const { tasks, isLoading } = useAllTasks()
  const { createTask, updateTask, deleteTask, isCreating, isUpdating } = useTaskMutations()

  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<DailyTask | null>(null)

  function handleCreate(data: CreateTaskInput | UpdateTaskInput) {
    createTask(data as CreateTaskInput, { onSuccess: () => setShowCreate(false) })
  }

  function handleUpdate(data: CreateTaskInput | UpdateTaskInput) {
    updateTask(data as UpdateTaskInput, { onSuccess: () => setEditing(null) })
  }

  function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete "${title}"?`)) return
    deleteTask(id)
  }

  if (isLoading) {
    return <div className="py-8 text-center text-sm text-muted-foreground">Loading…</div>
  }

  return (
    <div className="py-4">
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Go back"
        >
          ←
        </button>
        <h1 className="text-lg font-semibold">Tasks</h1>
      </div>

      {showCreate ? (
        <TaskForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} isPending={isCreating} />
      ) : (
        <button
          onClick={() => { setEditing(null); setShowCreate(true) }}
          className="mb-4 w-full rounded-lg border border-dashed border-border py-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
        >
          + New task
        </button>
      )}

      <div className="space-y-2">
        {tasks.map((task) =>
          editing?.id === task.id ? (
            <TaskForm
              key={task.id}
              initial={task}
              onSubmit={handleUpdate}
              onCancel={() => setEditing(null)}
              isPending={isUpdating}
            />
          ) : (
            <div
              key={task.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
            >
              <div
                className="h-3 w-3 flex-shrink-0 rounded-full"
                style={{ backgroundColor: task.color ?? 'var(--color-muted-foreground)' }}
              />
              <button
                className="min-w-0 flex-1 text-left"
                onClick={() => { setShowCreate(false); setEditing(task) }}
              >
                <p className="text-sm font-medium">{task.title}</p>
                <div className="mt-0.5 flex gap-1">
                  {DAY_LABELS.map((label, i) => (
                    <span
                      key={i}
                      className={`text-[10px] font-medium ${
                        task.days_of_week.includes(i) ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      {label}
                    </span>
                  ))}
                </div>
                {task.category && <p className="text-xs text-muted-foreground">{task.category}</p>}
              </button>
              <button
                onClick={() => handleDelete(task.id, task.title)}
                aria-label={`Delete ${task.title}`}
                className="text-muted-foreground transition-colors hover:text-destructive"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ),
        )}

        {tasks.length === 0 && !showCreate && (
          <p className="py-6 text-center text-sm text-muted-foreground">No tasks yet. Add one above.</p>
        )}
      </div>
    </div>
  )
}
