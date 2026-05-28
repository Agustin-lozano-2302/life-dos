import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskForm } from './TaskForm'
import type { DailyTask } from '@/types/daily-tasks'

const existingTask: DailyTask = {
  id: 'task-1',
  title: 'Morning run',
  days_of_week: [1, 3, 5],
  category: 'Health',
  color: '#7c3aed',
  sort_order: null,
  created_at: '2026-01-01T00:00:00Z',
}

describe('TaskForm', () => {
  it('renders title, days, category, and color fields', () => {
    render(<TaskForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByLabelText(/título/i)).toBeInTheDocument()
    // L = Lunes (Monday)
    expect(screen.getByText('L')).toBeInTheDocument()
    expect(screen.getByLabelText(/categoría/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /no color/i })).toBeInTheDocument()
  })

  it('Save button is disabled when title is empty', () => {
    render(<TaskForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByRole('button', { name: /guardar/i })).toBeDisabled()
  })

  it('Save button is enabled after typing a title', async () => {
    const user = userEvent.setup()
    render(<TaskForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    await user.type(screen.getByLabelText(/título/i), 'New task')
    expect(screen.getByRole('button', { name: /guardar/i })).not.toBeDisabled()
  })

  it('submits with correct data when filled and saved', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(<TaskForm onSubmit={onSubmit} onCancel={vi.fn()} />)
    await user.type(screen.getByLabelText(/título/i), 'My habit')
    // V = Viernes (Friday) = value 5
    await user.click(screen.getByText('V'))
    await user.click(screen.getByRole('button', { name: /guardar/i }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'My habit', days_of_week: expect.arrayContaining([5]) }),
    )
  })

  it('pre-fills fields when editing an existing task', () => {
    render(<TaskForm initial={existingTask} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByLabelText(/título/i)).toHaveValue('Morning run')
    expect(screen.getByLabelText(/categoría/i)).toHaveValue('Health')
  })

  it('calls onCancel when Cancel is clicked', async () => {
    const onCancel = vi.fn()
    const user = userEvent.setup()
    render(<TaskForm onSubmit={vi.fn()} onCancel={onCancel} />)
    await user.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onCancel).toHaveBeenCalled()
  })
})
