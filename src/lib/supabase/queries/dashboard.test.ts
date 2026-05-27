import { describe, it, expect, vi, beforeEach } from 'vitest'
import supabase from '@/lib/supabase/client'
import {
  fetchCompletionsByRange,
  fetchGoalSnapshots,
  fetchNoteActivityByRange,
} from './dashboard'

vi.mock('@/lib/supabase/client')

const mockFrom = vi.mocked(supabase.from)

beforeEach(() => { vi.clearAllMocks() })

describe('fetchCompletionsByRange', () => {
  it('returns completions in the given range', async () => {
    const mockData = [{ id: 'c1', task_id: 't1', date: '2026-05-01', created_at: '' }]
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        gte: vi.fn().mockReturnValue({
          lte: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
          }),
        }),
      }),
    } as any)

    const result = await fetchCompletionsByRange({ start: '2026-05-01', end: '2026-05-31' })
    expect(result).toEqual(mockData)
    expect(mockFrom).toHaveBeenCalledWith('task_completions')
  })

  it('throws on error', async () => {
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        gte: vi.fn().mockReturnValue({
          lte: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: null, error: { message: 'fail' } }),
          }),
        }),
      }),
    } as any)

    await expect(fetchCompletionsByRange({ start: '2026-05-01', end: '2026-05-31' })).rejects.toMatchObject({ message: 'fail' })
  })
})

describe('fetchGoalSnapshots', () => {
  it('returns all goals', async () => {
    const mockData = [{ id: 'g1', title: 'Goal', target_value: 10, current_value: 5, unit: 'x', deadline: null, linked_daily_task_id: null, linked_project_id: null, created_at: '' }]
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      }),
    } as any)

    const result = await fetchGoalSnapshots()
    expect(result).toEqual(mockData)
  })
})

describe('fetchNoteActivityByRange', () => {
  it('returns notes in the given range', async () => {
    const mockData = [{ id: 'n1', title: 'Note', content: null, category: null, created_at: '2026-05-01T00:00:00Z', updated_at: '2026-05-01T00:00:00Z' }]
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        gte: vi.fn().mockReturnValue({
          lte: vi.fn().mockResolvedValue({ data: mockData, error: null }),
        }),
      }),
    } as any)

    const result = await fetchNoteActivityByRange({ start: '2026-05-01', end: '2026-05-31' })
    expect(result).toEqual(mockData)
  })
})
