import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GoalCard } from './GoalCard'
import type { Goal } from '@/types/goals'

const goal: Goal = {
  id: 'goal-1',
  title: 'Read 20 books',
  target_value: 20,
  current_value: 10,
  unit: 'books',
  deadline: null,
  linked_daily_task_id: null,
  linked_project_id: null,
  created_at: '2026-01-01T00:00:00Z',
}

describe('GoalCard', () => {
  it('renders the goal title', () => {
    render(<GoalCard goal={goal} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Read 20 books')).toBeInTheDocument()
  })

  it('renders progress values', () => {
    render(<GoalCard goal={goal} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText(/10 \/ 20/)).toBeInTheDocument()
  })

  it('renders unit', () => {
    render(<GoalCard goal={goal} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('books')).toBeInTheDocument()
  })

  it('renders 50% progress label', () => {
    render(<GoalCard goal={goal} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  it('calls onEdit when Edit is clicked', async () => {
    const onEdit = vi.fn()
    const user = userEvent.setup()
    render(<GoalCard goal={goal} onEdit={onEdit} onDelete={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /edit/i }))
    expect(onEdit).toHaveBeenCalledWith(goal)
  })

  it('calls onDelete when ✕ is clicked', async () => {
    const onDelete = vi.fn()
    const user = userEvent.setup()
    render(<GoalCard goal={goal} onEdit={vi.fn()} onDelete={onDelete} />)
    await user.click(screen.getByLabelText(`Delete ${goal.title}`))
    expect(onDelete).toHaveBeenCalledWith('goal-1')
  })

  it('shows linked task title when provided', () => {
    render(<GoalCard goal={goal} onEdit={vi.fn()} onDelete={vi.fn()} linkedTaskTitle="Morning run" />)
    expect(screen.getByText('↳ Morning run')).toBeInTheDocument()
  })
})
