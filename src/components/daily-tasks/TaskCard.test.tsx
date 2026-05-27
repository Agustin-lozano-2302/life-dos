import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskCard } from './TaskCard'
import type { DailyTask, TaskCompletion } from '@/types/daily-tasks'

const task: DailyTask = {
  id: 'task-1',
  title: 'Morning run',
  days_of_week: [2],
  category: 'Health',
  color: '#7c3aed',
  sort_order: null,
  created_at: '2026-01-01T00:00:00Z',
}

const completion: TaskCompletion = {
  id: 'comp-1',
  task_id: 'task-1',
  date: '2026-05-27',
  created_at: '2026-05-27T08:00:00Z',
}

describe('TaskCard', () => {
  it('renders the task title', () => {
    render(<TaskCard task={task} completion={undefined} onToggle={vi.fn()} />)
    expect(screen.getByText('Morning run')).toBeInTheDocument()
  })

  it('renders the category when present', () => {
    render(<TaskCard task={task} completion={undefined} onToggle={vi.fn()} />)
    expect(screen.getByText('Health')).toBeInTheDocument()
  })

  it('does not render category when null', () => {
    render(<TaskCard task={{ ...task, category: null }} completion={undefined} onToggle={vi.fn()} />)
    expect(screen.queryByText('Health')).not.toBeInTheDocument()
  })

  it('clicking the checkbox calls onToggle with taskId and isCompleted=false when pending', async () => {
    const onToggle = vi.fn()
    const user = userEvent.setup()
    render(<TaskCard task={task} completion={undefined} onToggle={onToggle} />)
    await user.click(screen.getByRole('button', { name: /mark as done/i }))
    expect(onToggle).toHaveBeenCalledWith('task-1', false)
  })

  it('clicking the checkbox calls onToggle with isCompleted=true when done', async () => {
    const onToggle = vi.fn()
    const user = userEvent.setup()
    render(<TaskCard task={task} completion={completion} onToggle={onToggle} />)
    await user.click(screen.getByRole('button', { name: /mark as pending/i }))
    expect(onToggle).toHaveBeenCalledWith('task-1', true)
  })

  it('completed card title has line-through style', () => {
    render(<TaskCard task={task} completion={completion} onToggle={vi.fn()} />)
    expect(screen.getByText('Morning run')).toHaveClass('line-through')
  })
})
