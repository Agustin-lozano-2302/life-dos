import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useAllTasks } from './useAllTasks'
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
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useAllTasks', () => {
  it('returns all tasks when loaded', async () => {
    vi.mocked(queries.fetchAllTasks).mockResolvedValue([mockTask])

    const { result } = renderHook(() => useAllTasks(), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.tasks).toEqual([mockTask])
  })

  it('returns empty array while loading', () => {
    vi.mocked(queries.fetchAllTasks).mockReturnValue(new Promise(() => {}))

    const { result } = renderHook(() => useAllTasks(), { wrapper: makeWrapper() })
    expect(result.current.tasks).toEqual([])
    expect(result.current.isLoading).toBe(true)
  })
})
