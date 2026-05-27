import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useTaskMutations } from './useTaskMutations'
import * as queries from '@/lib/supabase/queries/daily-tasks'
import type { DailyTask } from '@/types/daily-tasks'

vi.mock('@/lib/supabase/queries/daily-tasks')

const mockTask: DailyTask = {
  id: 'task-1',
  title: 'Morning run',
  days_of_week: [2],
  category: null,
  color: null,
  sort_order: null,
  created_at: '2026-01-01T00:00:00Z',
}

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useTaskMutations', () => {
  it('createTask calls createTask query', async () => {
    vi.mocked(queries.createTask).mockResolvedValue(mockTask)

    const { result } = renderHook(() => useTaskMutations(), { wrapper: makeWrapper() })

    await act(async () => {
      result.current.createTask({ title: 'Morning run', days_of_week: [2] })
    })

    expect(queries.createTask).toHaveBeenCalledWith({ title: 'Morning run', days_of_week: [2] })
  })

  it('deleteTask calls deleteTask query', async () => {
    vi.mocked(queries.deleteTask).mockResolvedValue(undefined)

    const { result } = renderHook(() => useTaskMutations(), { wrapper: makeWrapper() })

    await act(async () => {
      result.current.deleteTask('task-1')
    })

    expect(queries.deleteTask).toHaveBeenCalledWith('task-1')
  })

  it('toggleCompletion calls upsertCompletion when not completed', async () => {
    vi.mocked(queries.upsertCompletion).mockResolvedValue(undefined)

    const { result } = renderHook(() => useTaskMutations(), { wrapper: makeWrapper() })

    await act(async () => {
      result.current.toggleCompletion({ taskId: 'task-1', isCompleted: false })
    })

    expect(queries.upsertCompletion).toHaveBeenCalledWith('task-1', expect.any(String))
  })

  it('toggleCompletion calls deleteCompletion when already completed', async () => {
    vi.mocked(queries.deleteCompletion).mockResolvedValue(undefined)

    const { result } = renderHook(() => useTaskMutations(), { wrapper: makeWrapper() })

    await act(async () => {
      result.current.toggleCompletion({ taskId: 'task-1', isCompleted: true })
    })

    expect(queries.deleteCompletion).toHaveBeenCalledWith('task-1', expect.any(String))
  })
})
