import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DoneSection } from './DoneSection'
import type { DailyTask, TaskCompletion } from '@/types/daily-tasks'

const task1: DailyTask = {
  id: 'task-1', title: 'Morning run', days_of_week: [2], category: null, color: null, sort_order: null, created_at: '',
}
const completion: TaskCompletion = {
  id: 'comp-1', task_id: 'task-1', date: '2026-05-27', created_at: '',
}

describe('DoneSection', () => {
  it('renders nothing when no completions', () => {
    const { container } = render(
      <DoneSection tasks={[task1]} completions={[]} onToggle={vi.fn()} />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders "Done today · N" label with count', () => {
    render(<DoneSection tasks={[task1]} completions={[completion]} onToggle={vi.fn()} />)
    expect(screen.getByText(/done today · 1/i)).toBeInTheDocument()
  })

  it('renders completed task titles', () => {
    render(<DoneSection tasks={[task1]} completions={[completion]} onToggle={vi.fn()} />)
    expect(screen.getByText('Morning run')).toBeInTheDocument()
  })
})
