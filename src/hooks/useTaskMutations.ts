import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createTask as createTaskFn,
  updateTask as updateTaskFn,
  deleteTask as deleteTaskFn,
  upsertCompletion,
  deleteCompletion,
} from '@/lib/supabase/queries/daily-tasks'
import type { CreateTaskInput, UpdateTaskInput } from '@/types/daily-tasks'
import type { TaskCompletion } from '@/types/daily-tasks'

function getTodayString() {
  return new Date().toISOString().slice(0, 10)
}

export function useTaskMutations() {
  const queryClient = useQueryClient()
  const today = getTodayString()

  const createTask = useMutation({
    mutationFn: (input: CreateTaskInput) => createTaskFn(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['daily-tasks'] }),
  })

  const updateTask = useMutation({
    mutationFn: (input: UpdateTaskInput) => updateTaskFn(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['daily-tasks'] }),
  })

  const deleteTask = useMutation({
    mutationFn: (id: string) => deleteTaskFn(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['daily-tasks'] }),
  })

  const toggleCompletion = useMutation({
    mutationFn: ({ taskId, isCompleted }: { taskId: string; isCompleted: boolean }) =>
      isCompleted
        ? deleteCompletion(taskId, today)
        : upsertCompletion(taskId, today),
    onMutate: async ({ taskId, isCompleted }) => {
      await queryClient.cancelQueries({ queryKey: ['task-completions', today] })
      const prev = queryClient.getQueryData<TaskCompletion[]>(['task-completions', today])
      queryClient.setQueryData<TaskCompletion[]>(
        ['task-completions', today],
        (old) => {
          if (isCompleted) {
            return (old ?? []).filter((c) => c.task_id !== taskId)
          }
          return [...(old ?? []), { id: 'optimistic', task_id: taskId, date: today, created_at: '' }]
        }
      )
      return { prev }
    },
    onError: (_err, _vars, context) => {
      if (context?.prev !== undefined) {
        queryClient.setQueryData(['task-completions', today], context.prev)
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['task-completions', today] }),
  })

  return {
    createTask: createTask.mutate,
    updateTask: updateTask.mutate,
    deleteTask: deleteTask.mutate,
    toggleCompletion: toggleCompletion.mutate,
    isCreating: createTask.isPending,
    isUpdating: updateTask.isPending,
    isDeleting: deleteTask.isPending,
  }
}
