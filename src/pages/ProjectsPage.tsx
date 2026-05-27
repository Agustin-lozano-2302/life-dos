import { useState } from 'react'
import { useProjects } from '@/hooks/useProjects'
import { useProjectMutations } from '@/hooks/useProjectMutations'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { ProjectForm } from '@/components/projects/ProjectForm'
import type { CreateProjectInput, UpdateProjectInput } from '@/types/projects'

export default function ProjectsPage() {
  const { projects, isLoading } = useProjects()
  const { createProject, isCreatingProject } = useProjectMutations()
  const [showForm, setShowForm] = useState(false)

  function handleCreate(data: CreateProjectInput | UpdateProjectInput) {
    createProject(data as CreateProjectInput, { onSuccess: () => setShowForm(false) })
  }

  if (isLoading) {
    return <div className="py-8 text-center text-sm text-muted-foreground">Loading…</div>
  }

  return (
    <div className="py-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Projects</h1>
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
          className="mb-4 w-full rounded-xl border border-dashed border-border py-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
        >
          + New project
        </button>
      )}

      <div className="space-y-3">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
        {projects.length === 0 && !showForm && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No projects yet. Create one above.
          </p>
        )}
      </div>
    </div>
  )
}
