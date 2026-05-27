import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HabitStatsCard } from './HabitStatsCard'
import type { DailyTask, TaskCompletion } from '@/types/daily-tasks'

const task: DailyTask = {
  id: 'task-1',
  title: 'Morning run',
  days_of_week: [0, 1, 2, 3, 4, 5, 6],
  category: null,
  color: null,
  sort_order: null,
  created_at: '',
}

const range = { start: '2026-05-20', end: '2026-05-20' }
const today = '2026-05-20'

describe('HabitStatsCard', () => {
  it('renders without crashing', () => {
    render(<HabitStatsCard tasks={[task]} completions={[]} range={range} today={today} />)
    expect(screen.getByText('Daily habits')).toBeInTheDocument()
  })

  it('shows 0% completion rate when no completions', () => {
    render(<HabitStatsCard tasks={[task]} completions={[]} range={range} today={today} />)
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('shows 100% completion rate when all tasks completed', () => {
    const completion: TaskCompletion = { id: 'c1', task_id: 'task-1', date: '2026-05-20', created_at: '' }
    render(<HabitStatsCard tasks={[task]} completions={[completion]} range={range} today={today} />)
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('renders completion count', () => {
    const completions: TaskCompletion[] = [
      { id: 'c1', task_id: 'task-1', date: '2026-05-20', created_at: '' },
      { id: 'c2', task_id: 'task-1', date: '2026-05-19', created_at: '' },
    ]
    render(<HabitStatsCard tasks={[task]} completions={completions} range={range} today={today} />)
    expect(screen.getByText('completions').previousSibling?.textContent).toBe('2')
  })
})
