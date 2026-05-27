import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GoalForm } from './GoalForm'

describe('GoalForm', () => {
  const defaultProps = {
    dailyTasks: [],
    projects: [],
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
  }

  it('renders all required fields', () => {
    render(<GoalForm {...defaultProps} />)
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/target/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/unit/i)).toBeInTheDocument()
  })

  it('Save is disabled when title is empty', () => {
    render(<GoalForm {...defaultProps} />)
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
  })

  it('Save is enabled when title, target > 0, and unit are filled', async () => {
    const user = userEvent.setup()
    render(<GoalForm {...defaultProps} />)
    await user.type(screen.getByLabelText(/title/i), 'Read books')
    await user.clear(screen.getByLabelText(/target/i))
    await user.type(screen.getByLabelText(/target/i), '20')
    await user.type(screen.getByLabelText(/unit/i), 'books')
    expect(screen.getByRole('button', { name: /save/i })).not.toBeDisabled()
  })

  it('calls onSubmit with correct data', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(<GoalForm {...defaultProps} onSubmit={onSubmit} />)
    await user.type(screen.getByLabelText(/title/i), 'Read books')
    await user.clear(screen.getByLabelText(/target/i))
    await user.type(screen.getByLabelText(/target/i), '20')
    await user.type(screen.getByLabelText(/unit/i), 'books')
    await user.click(screen.getByRole('button', { name: /save/i }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Read books', target_value: 20, unit: 'books' }),
    )
  })

  it('calls onCancel when Cancel is clicked', async () => {
    const onCancel = vi.fn()
    const user = userEvent.setup()
    render(<GoalForm {...defaultProps} onCancel={onCancel} />)
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onCancel).toHaveBeenCalled()
  })
})
