// src/hooks/useAllProjectTasks.ts
import { useQuery } from '@tanstack/react-query'
import { fetchAllProjectTasks } from '@/lib/supabase/queries/projects'

export function useAllProjectTasks() {
  const { data = [], ...rest } = useQuery({
    queryKey: ['all-project-tasks'],
    queryFn: fetchAllProjectTasks,
  })
  return { projectTasks: data, ...rest }
}
