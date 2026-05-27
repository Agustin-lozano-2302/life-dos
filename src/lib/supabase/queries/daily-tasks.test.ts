import { describe, it, expect, vi, beforeEach } from 'vitest'
import supabase from '@/lib/supabase/client'
import {
  fetchTodayTasks,
  fetchAllTasks,
  fetchTodayCompletions,
  createTask,
  updateTask,
  deleteTask,
  upsertCompletion,
  deleteCompletion,
} from './daily-tasks'
import type { DailyTask, TaskCompletion } from '@/types/daily-tasks'

vi.mock('@/lib/supabase/client')

const mockFrom = vi.mocked(supabase.from)

const mockTask: DailyTask = {
  id: 'task-1',
  title: 'Morning run',
  days_of_week: [2],
  category: 'Health',
  color: '#7c3aed',
  sort_order: null,
  created_at: '2026-01-01T00:00:00Z',
}

const mockCompletion: TaskCompletion = {
  id: 'comp-1',
  task_id: 'task-1',
  date: '2026-05-27',
  created_at: '2026-05-27T08:00:00Z',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('fetchTodayTasks', () => {
  it('returns tasks scheduled for the given day', async () => {
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        contains: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [mockTask], error: null }),
        }),
      }),
    } as any)

    const result = await fetchTodayTasks('2026-05-27') // Tuesday = 2
    expect(result).toEqual([mockTask])
    expect(mockFrom).toHaveBeenCalledWith('daily_tasks')
  })

  it('throws when supabase returns an error', async () => {
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        contains: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
        }),
      }),
    } as any)

    await expect(fetchTodayTasks('2026-05-27')).rejects.toMatchObject({ message: 'DB error' })
  })
})

describe('fetchAllTasks', () => {
  it('returns all tasks ordered by created_at', async () => {
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [mockTask], error: null }),
      }),
    } as any)

    const result = await fetchAllTasks()
    expect(result).toEqual([mockTask])
  })
})

describe('fetchTodayCompletions', () => {
  it('returns completions for the given date', async () => {
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [mockCompletion], error: null }),
      }),
    } as any)

    const result = await fetchTodayCompletions('2026-05-27')
    expect(result).toEqual([mockCompletion])
  })
})

describe('createTask', () => {
  it('inserts and returns the new task', async () => {
    mockFrom.mockReturnValueOnce({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockTask, error: null }),
        }),
      }),
    } as any)

    const result = await createTask({ title: 'Morning run', days_of_week: [2] })
    expect(result).toEqual(mockTask)
  })
})

describe('updateTask', () => {
  it('updates and returns the modified task', async () => {
    mockFrom.mockReturnValueOnce({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { ...mockTask, title: 'Evening run' }, error: null }),
          }),
        }),
      }),
    } as any)

    const result = await updateTask({ id: 'task-1', title: 'Evening run' })
    expect(result.title).toBe('Evening run')
  })
})

describe('deleteTask', () => {
  it('calls delete with the task id', async () => {
    const eqMock = vi.fn().mockResolvedValue({ error: null })
    mockFrom.mockReturnValueOnce({
      delete: vi.fn().mockReturnValue({ eq: eqMock }),
    } as any)

    await deleteTask('task-1')
    expect(eqMock).toHaveBeenCalledWith('id', 'task-1')
  })
})

describe('upsertCompletion', () => {
  it('upserts a completion record', async () => {
    const upsertMock = vi.fn().mockResolvedValue({ error: null })
    mockFrom.mockReturnValueOnce({ upsert: upsertMock } as any)

    await upsertCompletion('task-1', '2026-05-27')
    expect(upsertMock).toHaveBeenCalledWith({ task_id: 'task-1', date: '2026-05-27' })
  })
})

describe('deleteCompletion', () => {
  it('deletes the completion record for the task and date', async () => {
    const eq2Mock = vi.fn().mockResolvedValue({ error: null })
    const eq1Mock = vi.fn().mockReturnValue({ eq: eq2Mock })
    mockFrom.mockReturnValueOnce({
      delete: vi.fn().mockReturnValue({ eq: eq1Mock }),
    } as any)

    await deleteCompletion('task-1', '2026-05-27')
    expect(eq1Mock).toHaveBeenCalledWith('task_id', 'task-1')
    expect(eq2Mock).toHaveBeenCalledWith('date', '2026-05-27')
  })
})
