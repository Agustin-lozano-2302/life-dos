import { useQuery } from '@tanstack/react-query'
import { fetchAllTasks } from '@/lib/supabase/queries/daily-tasks'

export function useAllTasks() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['daily-tasks', 'all'],
    queryFn: fetchAllTasks,
  })
  return { tasks: data ?? [], isLoading, isError }
}
