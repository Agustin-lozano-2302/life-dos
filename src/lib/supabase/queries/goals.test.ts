import { describe, it, expect, vi, beforeEach } from 'vitest'
import supabase from '@/lib/supabase/client'
import {
  fetchGoals,
  createGoal,
  updateGoal,
  deleteGoal,
} from './goals'
import type { Goal } from '@/types/goals'

vi.mock('@/lib/supabase/client')

const mockFrom = vi.mocked(supabase.from)

const mockGoal: Goal = {
  id: 'goal-1',
  title: 'Read 20 books',
  target_value: 20,
  current_value: 5,
  unit: 'books',
  deadline: '2026-12-31',
  linked_daily_task_id: null,
  linked_project_id: null,
  created_at: '2026-01-01T00:00:00Z',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('fetchGoals', () => {
  it('returns all goals ordered by created_at', async () => {
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [mockGoal], error: null }),
      }),
    } as any)

    const result = await fetchGoals()
    expect(result).toEqual([mockGoal])
    expect(mockFrom).toHaveBeenCalledWith('goals')
  })

  it('throws when supabase returns an error', async () => {
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
      }),
    } as any)

    await expect(fetchGoals()).rejects.toMatchObject({ message: 'DB error' })
  })
})

describe('createGoal', () => {
  it('inserts and returns the new goal', async () => {
    mockFrom.mockReturnValueOnce({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockGoal, error: null }),
        }),
      }),
    } as any)

    const result = await createGoal({ title: 'Read 20 books', target_value: 20, unit: 'books' })
    expect(result).toEqual(mockGoal)
  })
})

describe('updateGoal', () => {
  it('updates and returns the modified goal', async () => {
    mockFrom.mockReturnValueOnce({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { ...mockGoal, current_value: 10 }, error: null }),
          }),
        }),
      }),
    } as any)

    const result = await updateGoal({ id: 'goal-1', current_value: 10 })
    expect(result.current_value).toBe(10)
  })
})

describe('deleteGoal', () => {
  it('calls delete with the goal id', async () => {
    const eqMock = vi.fn().mockResolvedValue({ error: null })
    mockFrom.mockReturnValueOnce({
      delete: vi.fn().mockReturnValue({ eq: eqMock }),
    } as any)

    await deleteGoal('goal-1')
    expect(eqMock).toHaveBeenCalledWith('id', 'goal-1')
  })
})
