import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskCard } from './TaskCard'
import type { DailyTask, TaskCompletion } from '@/types/daily-tasks'

const task: DailyTask = {
  id: 'task-1',
  title: 'Morning run',
  days_of_week: [1, 2, 3, 4, 5],
  category: 'Health',
  color: '#f97316',
  sort_order: null,
  created_at: '2026-01-01T00:00:00Z',
}

describe('TaskCard', () => {
  it('renders task title', () => {
    render(<TaskCard task={task} completion={undefined} onToggle={vi.fn()} />)
    expect(screen.getByText('Morning run')).toBeInTheDocument()
  })

  it('calls onToggle when toggle button is clicked', async () => {
    const onToggle = vi.fn()
    const user = userEvent.setup()
    render(<TaskCard task={task} completion={undefined} onToggle={onToggle} />)
    await user.click(screen.getByRole('button', { name: /mark as done/i }))
    expect(onToggle).toHaveBeenCalledWith('task-1', false)
  })

  it('shows DotMenu trigger', () => {
    render(<TaskCard task={task} completion={undefined} onToggle={vi.fn()} />)
    expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument()
  })

  it('applies opacity when completed', () => {
    const completion: TaskCompletion = { id: 'c1', task_id: 'task-1', date: '2026-05-28', created_at: '' }
    const { container } = render(<TaskCard task={task} completion={completion} onToggle={vi.fn()} />)
    expect(container.firstChild).toHaveClass('opacity-40')
  })
})
