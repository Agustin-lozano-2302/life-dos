import { useQuery } from '@tanstack/react-query'
import { fetchGoals } from '@/lib/supabase/queries/goals'

export function useGoals() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['goals'],
    queryFn: fetchGoals,
  })
  return { goals: data ?? [], isLoading, isError }
}
