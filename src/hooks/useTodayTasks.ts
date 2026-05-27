import { useQuery } from '@tanstack/react-query'
import { fetchTodayTasks, fetchTodayCompletions } from '@/lib/supabase/queries/daily-tasks'
import { getTodayString } from '@/utils/date'

export function useTodayTasks() {
  const today = getTodayString()

  const tasksQuery = useQuery({
    queryKey: ['daily-tasks', 'today', today],
    queryFn: () => fetchTodayTasks(today),
  })

  const completionsQuery = useQuery({
    queryKey: ['task-completions', today],
    queryFn: () => fetchTodayCompletions(today),
  })

  return {
    tasks: tasksQuery.data ?? [],
    completions: completionsQuery.data ?? [],
    isLoading: tasksQuery.isLoading || completionsQuery.isLoading,
    isError: tasksQuery.isError || completionsQuery.isError,
  }
}
