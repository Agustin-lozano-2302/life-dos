import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useGoals } from './useGoals'
import * as queries from '@/lib/supabase/queries/goals'
import type { Goal } from '@/types/goals'

vi.mock('@/lib/supabase/queries/goals')

const mockGoal: Goal = {
  id: 'goal-1',
  title: 'Read 20 books',
  target_value: 20,
  current_value: 5,
  unit: 'books',
  deadline: null,
  linked_daily_task_id: null,
  linked_project_id: null,
  created_at: '2026-01-01T00:00:00Z',
}

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

beforeEach(() => { vi.clearAllMocks() })

describe('useGoals', () => {
  it('returns goals when loaded', async () => {
    vi.mocked(queries.fetchGoals).mockResolvedValue([mockGoal])
    const { result } = renderHook(() => useGoals(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.goals).toEqual([mockGoal])
  })

  it('returns empty array while loading', () => {
    vi.mocked(queries.fetchGoals).mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useGoals(), { wrapper: makeWrapper() })
    expect(result.current.goals).toEqual([])
    expect(result.current.isLoading).toBe(true)
  })
})
