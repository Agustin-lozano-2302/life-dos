import { useQuery } from '@tanstack/react-query'
import { fetchProjects, fetchProject, fetchProjectTasks } from '@/lib/supabase/queries/projects'

export function useProjects() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  })
  return { projects: data ?? [], isLoading, isError }
}

export function useProject(id: string) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['projects', id],
    queryFn: () => fetchProject(id),
    enabled: Boolean(id),
  })
  return { project: data ?? null, isLoading, isError }
}

export function useProjectTasks(projectId: string) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['project-tasks', projectId],
    queryFn: () => fetchProjectTasks(projectId),
    enabled: Boolean(projectId),
  })
  return { tasks: data ?? [], isLoading, isError }
}
