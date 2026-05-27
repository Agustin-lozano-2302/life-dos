import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useTodayTasks } from './useTodayTasks'
import * as queries from '@/lib/supabase/queries/daily-tasks'
import type { DailyTask, TaskCompletion } from '@/types/daily-tasks'

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

const mockCompletion: TaskCompletion = {
  id: 'comp-1',
  task_id: 'task-1',
  date: '2026-05-27',
  created_at: '2026-05-27T08:00:00Z',
}

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useTodayTasks', () => {
  it('returns tasks and completions when loaded', async () => {
    vi.mocked(queries.fetchTodayTasks).mockResolvedValue([mockTask])
    vi.mocked(queries.fetchTodayCompletions).mockResolvedValue([mockCompletion])

    const { result } = renderHook(() => useTodayTasks(), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.tasks).toEqual([mockTask])
    expect(result.current.completions).toEqual([mockCompletion])
  })

  it('returns empty arrays while loading', () => {
    vi.mocked(queries.fetchTodayTasks).mockReturnValue(new Promise(() => {}))
    vi.mocked(queries.fetchTodayCompletions).mockReturnValue(new Promise(() => {}))

    const { result } = renderHook(() => useTodayTasks(), { wrapper: makeWrapper() })

    expect(result.current.tasks).toEqual([])
    expect(result.current.completions).toEqual([])
    expect(result.current.isLoading).toBe(true)
  })
})
