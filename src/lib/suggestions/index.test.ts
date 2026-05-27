import { describe, it, expect } from 'vitest'
import { generateSuggestions } from './index'
import type { Goal } from '@/types/goals'
import type { Project } from '@/types/projects'
import type { TaskCompletion } from '@/types/daily-tasks'

const today = '2026-05-27'

const makeGoal = (overrides: Partial<Goal> = {}): Goal => ({
  id: 'goal-1',
  title: 'Read 20 books',
  target_value: 20,
  current_value: 10,
  unit: 'books',
  deadline: null,
  linked_daily_task_id: null,
  linked_project_id: null,
  created_at: '2026-01-01T00:00:00Z',
  ...overrides,
})

const makeProject = (overrides: Partial<Project> = {}): Project => ({
  id: 'proj-1',
  title: 'My project',
  description: null,
  status: 'active',
  due_date: null,
  created_at: '2026-01-01T00:00:00Z',
  ...overrides,
})

const makeCompletion = (date: string, taskId = 'task-1'): TaskCompletion => ({
  id: `comp-${date}-${taskId}`,
  task_id: taskId,
  date,
  created_at: date + 'T08:00:00Z',
})

describe('generateSuggestions', () => {
  it('returns empty array when there is nothing notable', () => {
    const result = generateSuggestions({ goals: [], projects: [], completions: [], today })
    expect(result).toEqual([])
  })

  it('suggests action for goal near deadline at low progress', () => {
    const goal = makeGoal({ deadline: '2026-06-07', current_value: 5, target_value: 20 })
    const result = generateSuggestions({ goals: [goal], projects: [], completions: [], today })
    expect(result.some((s) => s.text.includes('Read 20 books'))).toBe(true)
  })

  it('suggests archiving for a completed goal', () => {
    const goal = makeGoal({ current_value: 20, target_value: 20 })
    const result = generateSuggestions({ goals: [goal], projects: [], completions: [], today })
    expect(result.some((s) => s.id.startsWith('goal-done-'))).toBe(true)
  })

  it('suggests resuming paused projects', () => {
    const project = makeProject({ status: 'paused' })
    const result = generateSuggestions({ goals: [], projects: [project], completions: [], today })
    expect(result.some((s) => s.id.startsWith('project-paused-'))).toBe(true)
  })

  it('returns at most 3 suggestions', () => {
    const goals = [
      makeGoal({ id: 'g1', current_value: 20, target_value: 20 }),
      makeGoal({ id: 'g2', deadline: '2026-06-01', current_value: 1, target_value: 20 }),
      makeGoal({ id: 'g3', deadline: '2026-06-03', current_value: 2, target_value: 20 }),
    ]
    const project = makeProject({ status: 'paused' })
    const completions = [makeCompletion('2026-05-25'), makeCompletion('2026-05-26')]
    const result = generateSuggestions({ goals, projects: [project], completions, today })
    expect(result.length).toBeLessThanOrEqual(3)
  })

  it('generates a habit streak suggestion when habits completed recently', () => {
    const completions = [
      makeCompletion('2026-05-26', 'task-1'),
      makeCompletion('2026-05-25', 'task-2'),
    ]
    const result = generateSuggestions({ goals: [], projects: [], completions, today })
    expect(result.some((s) => s.id === 'habit-streak')).toBe(true)
  })
})
