import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Pencil, Trash2 } from 'lucide-react'
import { useProject, useProjectTasks } from '@/hooks/useProjects'
import { useProjectMutations } from '@/hooks/useProjectMutations'
import { KanbanBoard } from '@/components/projects/KanbanBoard'
import { ProjectForm } from '@/components/projects/ProjectForm'
import type { ProjectTaskStatus, CreateProjectInput, UpdateProjectInput } from '@/types/projects'

export default function ProjectBoardPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { project, isLoading: loadingProject } = useProject(id!)
  const { tasks, isLoading: loadingTasks } = useProjectTasks(id!)
  const {
    updateProject,
    deleteProject,
    createProjectTask,
    updateProjectTask,
    deleteProjectTask,
  } = useProjectMutations()

  const [editing, setEditing] = useState(false)

  function handleUpdate(data: CreateProjectInput | UpdateProjectInput) {
    updateProject(data as UpdateProjectInput, { onSuccess: () => setEditing(false) })
  }

  function handleDelete() {
    if (!project) return
    if (!window.confirm(`Delete "${project.title}"? This will also delete all tasks.`)) return
    deleteProject(project.id, { onSuccess: () => navigate('/projects') })
  }

  function handleMoveTask(taskId: string, newStatus: ProjectTaskStatus) {
    updateProjectTask({ id: taskId, status: newStatus })
  }

  function handleDeleteTask(taskId: string) {
    deleteProjectTask({ id: taskId, projectId: id! })
  }

  function handleAddTask(title: string) {
    createProjectTask({ project_id: id!, title })
  }

  if (loadingProject || loadingTasks) {
    return <div className="py-8 text-center text-sm text-muted-foreground">Loading…</div>
  }

  if (!project) {
    return <div className="py-8 text-center text-sm text-muted-foreground">Project not found.</div>
  }

  if (editing) {
    return (
      <div className="py-4">
        <ProjectForm
          initial={project}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(false)}
        />
      </div>
    )
  }

  return (
    <div className="py-4">
      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={() => navigate('/projects')}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Back to projects"
        >
          ←
        </button>
        <h1 className="flex-1 truncate text-lg font-semibold">{project.title}</h1>
        <button
          onClick={() => setEditing(true)}
          aria-label="Edit project"
          className="rounded p-1.5 text-muted-foreground transition-colors hover:text-foreground"
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={handleDelete}
          aria-label="Delete project"
          className="rounded p-1.5 text-muted-foreground transition-colors hover:text-destructive"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {project.description && (
        <p className="mb-4 text-sm text-muted-foreground">{project.description}</p>
      )}

      <KanbanBoard
        tasks={tasks}
        onMoveTask={handleMoveTask}
        onDeleteTask={handleDeleteTask}
        onAddTask={handleAddTask}
      />
    </div>
  )
}
