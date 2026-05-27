import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProjectTaskCard } from './ProjectTaskCard'
import type { ProjectTask } from '@/types/projects'

const task: ProjectTask = {
  id: 'ptask-1',
  project_id: 'proj-1',
  title: 'Setup repo',
  description: 'Initialize the repository',
  status: 'in_progress',
  sort_order: null,
  created_at: '2026-01-01T00:00:00Z',
}

describe('ProjectTaskCard', () => {
  it('renders the task title', () => {
    render(<ProjectTaskCard task={task} onMove={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Setup repo')).toBeInTheDocument()
  })

  it('renders the description', () => {
    render(<ProjectTaskCard task={task} onMove={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Initialize the repository')).toBeInTheDocument()
  })

  it('shows move-left button when not at first column', () => {
    render(<ProjectTaskCard task={task} onMove={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByLabelText('Move left')).toBeInTheDocument()
  })

  it('shows move-right button when not at last column', () => {
    render(<ProjectTaskCard task={task} onMove={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByLabelText('Move right')).toBeInTheDocument()
  })

  it('does not show move-left when in first column (todo)', () => {
    render(<ProjectTaskCard task={{ ...task, status: 'todo' }} onMove={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.queryByLabelText('Move left')).not.toBeInTheDocument()
  })

  it('does not show move-right when in last column (done)', () => {
    render(<ProjectTaskCard task={{ ...task, status: 'done' }} onMove={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.queryByLabelText('Move right')).not.toBeInTheDocument()
  })

  it('calls onMove with correct next status when moving right', async () => {
    const onMove = vi.fn()
    const user = userEvent.setup()
    render(<ProjectTaskCard task={task} onMove={onMove} onDelete={vi.fn()} />)
    await user.click(screen.getByLabelText('Move right'))
    expect(onMove).toHaveBeenCalledWith('ptask-1', 'review')
  })

  it('calls onMove with correct prev status when moving left', async () => {
    const onMove = vi.fn()
    const user = userEvent.setup()
    render(<ProjectTaskCard task={task} onMove={onMove} onDelete={vi.fn()} />)
    await user.click(screen.getByLabelText('Move left'))
    expect(onMove).toHaveBeenCalledWith('ptask-1', 'todo')
  })
})
