// src/components/goals/GoalCard.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GoalCard } from './GoalCard'
import type { Goal } from '@/types/goals'

const goal: Goal = {
  id: 'g1',
  title: 'Run 100km',
  target_value: 100,
  current_value: 42,
  unit: 'km',
  deadline: null,
  linked_daily_task_id: null,
  linked_project_id: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

describe('GoalCard', () => {
  it('renders goal title', () => {
    render(<GoalCard goal={goal} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Run 100km')).toBeInTheDocument()
  })

  it('renders progress percentage', () => {
    render(<GoalCard goal={goal} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('42%')).toBeInTheDocument()
  })

  it('calls onEdit when Editar menu item is clicked', async () => {
    const onEdit = vi.fn()
    const user = userEvent.setup()
    render(<GoalCard goal={goal} onEdit={onEdit} onDelete={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /open menu/i }))
    await user.click(screen.getByRole('menuitem', { name: 'Editar' }))
    expect(onEdit).toHaveBeenCalledWith(goal)
  })

  it('calls onDelete when Eliminar menu item is clicked', async () => {
    const onDelete = vi.fn()
    const user = userEvent.setup()
    render(<GoalCard goal={goal} onEdit={vi.fn()} onDelete={onDelete} />)
    await user.click(screen.getByRole('button', { name: /open menu/i }))
    await user.click(screen.getByRole('menuitem', { name: 'Eliminar' }))
    expect(onDelete).toHaveBeenCalledWith('g1')
  })

  it('shows overdue chip when deadline is in the past', () => {
    render(<GoalCard goal={{ ...goal, deadline: '2020-01-01' }} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Overdue')).toBeInTheDocument()
  })
})
