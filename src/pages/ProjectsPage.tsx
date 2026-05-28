import { useState } from 'react'
import { useProjects } from '@/hooks/useProjects'
import { useProjectMutations } from '@/hooks/useProjectMutations'
import { useAllProjectTasks } from '@/hooks/useAllProjectTasks'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { ProjectForm } from '@/components/projects/ProjectForm'
import type { CreateProjectInput, UpdateProjectInput } from '@/types/projects'

export default function ProjectsPage() {
  const { projects, isLoading } = useProjects()
  const { projectTasks } = useAllProjectTasks()
  const { createProject, isCreatingProject } = useProjectMutations()
  const [showForm, setShowForm] = useState(false)

  function handleCreate(data: CreateProjectInput | UpdateProjectInput) {
    createProject(data as CreateProjectInput, { onSuccess: () => setShowForm(false) })
  }

  if (isLoading) {
    return <div className="py-8 text-center text-sm text-white/40">Loading…</div>
  }

  return (
    <div className="py-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-[22px] font-extrabold tracking-[-0.4px] text-white">Proyectos</h1>
      </div>

      {showForm ? (
        <div className="mb-4">
          <ProjectForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
            isPending={isCreatingProject}
          />
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="mb-4 w-full rounded-[18px] border border-dashed border-white/[0.15] py-3 text-sm text-white/40 transition-colors hover:border-white/30 hover:text-white/70"
        >
          + Nuevo proyecto
        </button>
      )}

      <div className="space-y-3">
        {projects.map((project) => {
          const tasks = projectTasks.filter((t) => t.project_id === project.id)
          const doneCount = tasks.filter((t) => t.status === 'done').length
          return (
            <ProjectCard
              key={project.id}
              project={project}
              taskCount={tasks.length}
              doneCount={doneCount}
            />
          )
        })}
        {projects.length === 0 && !showForm && (
          <p className="py-8 text-center text-sm text-white/40">
            No hay proyectos aún. Crea uno arriba.
          </p>
        )}
      </div>
    </div>
  )
}
