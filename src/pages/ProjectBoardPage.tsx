// src/pages/ProjectBoardPage.tsx
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useProject, useProjectTasks } from '@/hooks/useProjects'
import { useProjectMutations } from '@/hooks/useProjectMutations'
import { KanbanBoard } from '@/components/projects/KanbanBoard'
import { ProjectForm } from '@/components/projects/ProjectForm'
import { DotMenu } from '@/components/common/DotMenu'
import { GlassCard } from '@/components/common/GlassCard'
import type { ProjectTaskStatus, CreateProjectInput, UpdateProjectInput } from '@/types/projects'

const STATUS_LABELS: Record<string, string> = {
  active: 'Activo',
  paused: 'Pausado',
  completed: 'Completado',
  archived: 'Archivado',
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-indigo-500/20 text-indigo-300',
  paused: 'bg-amber-500/20 text-amber-300',
  completed: 'bg-emerald-500/20 text-emerald-300',
  archived: 'bg-white/10 text-white/40',
}

export default function ProjectBoardPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { project, isLoading: loadingProject } = useProject(id!)
  const { tasks, isLoading: loadingTasks } = useProjectTasks(id!)
  const { updateProject, deleteProject, createProjectTask, updateProjectTask, deleteProjectTask } = useProjectMutations()
  const [editing, setEditing] = useState(false)

  function handleUpdate(data: CreateProjectInput | UpdateProjectInput) {
    updateProject(data as UpdateProjectInput, { onSuccess: () => setEditing(false) })
  }

  function handleDelete() {
    if (!project) return
    if (!window.confirm(`¿Eliminar "${project.title}"? Se borrarán todas sus tareas.`)) return
    deleteProject(project.id, { onSuccess: () => navigate('/projects') })
  }

  function handleMoveTask(taskId: string, newStatus: ProjectTaskStatus) {
    updateProjectTask({ id: taskId, status: newStatus })
  }

  function handleDeleteTask(taskId: string) {
    deleteProjectTask({ id: taskId, projectId: id! })
  }

  function handleAddTask(title: string, status: ProjectTaskStatus = 'todo') {
    createProjectTask({ project_id: id!, title, status })
  }

  if (loadingProject || loadingTasks) {
    return <div className="py-8 text-center text-sm text-white/40">Loading…</div>
  }

  if (!project) {
    return <div className="py-8 text-center text-sm text-white/40">Proyecto no encontrado.</div>
  }

  if (editing) {
    return (
      <div className="py-4">
        <ProjectForm initial={project} onSubmit={handleUpdate} onCancel={() => setEditing(false)} />
      </div>
    )
  }

  const doneCount = tasks.filter((t) => t.status === 'done').length
  const progress = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0

  return (
    <div className="py-4">
      {/* Header card */}
      <GlassCard tint="indigo" className="mb-5 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              onClick={() => navigate('/projects')}
              className="shrink-0 text-white/40 hover:text-white"
              aria-label="Volver a proyectos"
            >
              ←
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-[22px] font-extrabold tracking-[-0.4px] text-white">
                {project.title}
              </h1>
              {project.description && (
                <p className="mt-0.5 line-clamp-2 text-sm text-white/50">{project.description}</p>
              )}
            </div>
          </div>
          <DotMenu
            items={[
              { label: 'Editar', onClick: () => setEditing(true) },
              { label: 'Eliminar', destructive: true, onClick: handleDelete },
            ]}
          />
        </div>

        <div className="mt-3 flex items-center gap-3">
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[project.status] ?? STATUS_COLORS.active}`}>
            {STATUS_LABELS[project.status] ?? project.status}
          </span>
          {project.due_date && (
            <span className="text-xs text-white/40">{project.due_date}</span>
          )}
          <span className="ml-auto text-xs text-white/40">
            {doneCount}/{tasks.length} tareas · {progress}%
          </span>
        </div>

        {tasks.length > 0 && (
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-indigo-400 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </GlassCard>

      <KanbanBoard
        tasks={tasks}
        onMoveTask={handleMoveTask}
        onDeleteTask={handleDeleteTask}
        onAddTask={handleAddTask}
      />
    </div>
  )
}
