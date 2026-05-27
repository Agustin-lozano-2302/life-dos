import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createProject as createProjectFn,
  updateProject as updateProjectFn,
  deleteProject as deleteProjectFn,
  createProjectTask as createProjectTaskFn,
  updateProjectTask as updateProjectTaskFn,
  deleteProjectTask as deleteProjectTaskFn,
} from '@/lib/supabase/queries/projects'
import type { CreateProjectInput, UpdateProjectInput, CreateProjectTaskInput, UpdateProjectTaskInput } from '@/types/projects'

export function useProjectMutations() {
  const queryClient = useQueryClient()

  const createProject = useMutation({
    mutationFn: (input: CreateProjectInput) => createProjectFn(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  })

  const updateProject = useMutation({
    mutationFn: (input: UpdateProjectInput) => updateProjectFn(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['projects', data.id] })
    },
  })

  const deleteProject = useMutation({
    mutationFn: (id: string) => deleteProjectFn(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  })

  const createProjectTask = useMutation({
    mutationFn: (input: CreateProjectTaskInput) => createProjectTaskFn(input),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: ['project-tasks', variables.project_id] }),
  })

  const updateProjectTask = useMutation({
    mutationFn: (input: UpdateProjectTaskInput) => updateProjectTaskFn(input),
    onSuccess: (data) =>
      queryClient.invalidateQueries({ queryKey: ['project-tasks', data.project_id] }),
  })

  const deleteProjectTask = useMutation({
    mutationFn: ({ id, projectId }: { id: string; projectId: string }) => deleteProjectTaskFn(id),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: ['project-tasks', variables.projectId] }),
  })

  return {
    createProject: createProject.mutate,
    updateProject: updateProject.mutate,
    deleteProject: deleteProject.mutate,
    createProjectTask: createProjectTask.mutate,
    updateProjectTask: updateProjectTask.mutate,
    deleteProjectTask: deleteProjectTask.mutate,
    isCreatingProject: createProject.isPending,
    isUpdatingProject: updateProject.isPending,
    isDeletingProject: deleteProject.isPending,
    isCreatingTask: createProjectTask.isPending,
    isUpdatingTask: updateProjectTask.isPending,
  }
}
