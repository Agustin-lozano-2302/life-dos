import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProjectForm } from './ProjectForm'
import type { Project } from '@/types/projects'

const existingProject: Project = {
  id: 'proj-1',
  title: 'My Project',
  description: 'A description',
  status: 'active',
  due_date: '2026-12-31',
  created_at: '2026-01-01T00:00:00Z',
}

describe('ProjectForm', () => {
  it('renders title, description, status and due date fields', () => {
    render(<ProjectForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument()
  })

  it('Save button is disabled when title is empty', () => {
    render(<ProjectForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
  })

  it('Save button is enabled after typing a title', async () => {
    const user = userEvent.setup()
    render(<ProjectForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    await user.type(screen.getByLabelText(/title/i), 'New project')
    expect(screen.getByRole('button', { name: /save/i })).not.toBeDisabled()
  })

  it('submits with correct data', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(<ProjectForm onSubmit={onSubmit} onCancel={vi.fn()} />)
    await user.type(screen.getByLabelText(/title/i), 'My project')
    await user.click(screen.getByRole('button', { name: /save/i }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'My project', status: 'active' }),
    )
  })

  it('pre-fills fields when editing', () => {
    render(<ProjectForm initial={existingProject} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByLabelText(/title/i)).toHaveValue('My Project')
    expect(screen.getByLabelText(/description/i)).toHaveValue('A description')
  })

  it('calls onCancel when Cancel is clicked', async () => {
    const onCancel = vi.fn()
    const user = userEvent.setup()
    render(<ProjectForm onSubmit={vi.fn()} onCancel={onCancel} />)
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onCancel).toHaveBeenCalled()
  })
})
