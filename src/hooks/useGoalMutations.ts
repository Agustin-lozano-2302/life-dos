import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createGoal as createGoalFn,
  updateGoal as updateGoalFn,
  deleteGoal as deleteGoalFn,
} from '@/lib/supabase/queries/goals'
import type { CreateGoalInput, UpdateGoalInput } from '@/types/goals'

export function useGoalMutations() {
  const queryClient = useQueryClient()

  const createGoal = useMutation({
    mutationFn: (input: CreateGoalInput) => createGoalFn(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
  })

  const updateGoal = useMutation({
    mutationFn: (input: UpdateGoalInput) => updateGoalFn(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
  })

  const deleteGoal = useMutation({
    mutationFn: (id: string) => deleteGoalFn(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
  })

  return {
    createGoal: createGoal.mutate,
    updateGoal: updateGoal.mutate,
    deleteGoal: deleteGoal.mutate,
    isCreating: createGoal.isPending,
    isUpdating: updateGoal.isPending,
  }
}
