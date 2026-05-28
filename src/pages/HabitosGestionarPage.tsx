import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAllTasks } from '@/hooks/useAllTasks'
import { useTaskMutations } from '@/hooks/useTaskMutations'
import { TaskForm } from '@/components/daily-tasks/TaskForm'
import { DotMenu } from '@/components/common/DotMenu'
import type { DailyTask, CreateTaskInput, UpdateTaskInput } from '@/types/daily-tasks'

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export default function HabitosGestionarPage() {
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
    if (!window.confirm(`¿Eliminar "${title}"?`)) return
    deleteTask(id)
  }

  if (isLoading) {
    return <div className="py-8 text-center text-sm text-white/40">Loading…</div>
  }

  return (
    <div className="py-4">
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="text-white/40 hover:text-white"
          aria-label="Go back"
        >
          ←
        </button>
        <h1 className="text-[22px] font-extrabold tracking-[-0.4px] text-white">Hábitos</h1>
      </div>

      {showCreate ? (
        <TaskForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} isPending={isCreating} />
      ) : (
        <button
          onClick={() => { setEditing(null); setShowCreate(true) }}
          className="mb-4 w-full rounded-[18px] border border-dashed border-white/[0.15] py-3 text-sm text-white/40 transition-colors hover:border-white/30 hover:text-white/70"
        >
          + Nuevo hábito
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
              className="flex items-center gap-3 rounded-[18px] border border-white/[0.12] bg-white/7 p-3 backdrop-blur-2xl"
            >
              <div
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: task.color ?? '#6366f1' }}
              />
              <button
                className="min-w-0 flex-1 text-left"
                onClick={() => { setShowCreate(false); setEditing(task) }}
              >
                <p className="text-sm font-medium text-white">{task.title}</p>
                <div className="mt-0.5 flex gap-1">
                  {DAY_LABELS.map((label, i) => (
                    <span
                      key={i}
                      className={`text-[10px] font-medium ${
                        task.days_of_week.includes(i) ? 'text-white/70' : 'text-white/20'
                      }`}
                    >
                      {label}
                    </span>
                  ))}
                </div>
                {task.category && <p className="text-xs text-white/40">{task.category}</p>}
              </button>
              <DotMenu
                items={[
                  { label: 'Editar', onClick: () => { setShowCreate(false); setEditing(task) } },
                  { label: 'Eliminar', destructive: true, onClick: () => handleDelete(task.id, task.title) },
                ]}
              />
            </div>
          ),
        )}
        {tasks.length === 0 && !showCreate && (
          <p className="py-6 text-center text-sm text-white/40">Sin hábitos. Agrega uno arriba.</p>
        )}
      </div>
    </div>
  )
}
