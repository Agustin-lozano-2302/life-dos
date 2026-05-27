import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { KanbanBoard } from './KanbanBoard'
import type { ProjectTask } from '@/types/projects'

const tasks: ProjectTask[] = [
  { id: 't1', project_id: 'p1', title: 'Task A', description: null, status: 'todo', sort_order: null, created_at: '' },
  { id: 't2', project_id: 'p1', title: 'Task B', description: null, status: 'in_progress', sort_order: null, created_at: '' },
  { id: 't3', project_id: 'p1', title: 'Task C', description: null, status: 'done', sort_order: null, created_at: '' },
]

describe('KanbanBoard', () => {
  it('renders all 4 column headers', () => {
    render(<KanbanBoard tasks={tasks} onMoveTask={vi.fn()} onDeleteTask={vi.fn()} onAddTask={vi.fn()} />)
    expect(screen.getByText(/to do/i)).toBeInTheDocument()
    expect(screen.getByText(/in progress/i)).toBeInTheDocument()
    expect(screen.getByText(/review/i)).toBeInTheDocument()
    expect(screen.getByText(/done/i)).toBeInTheDocument()
  })

  it('places tasks in the correct columns', () => {
    render(<KanbanBoard tasks={tasks} onMoveTask={vi.fn()} onDeleteTask={vi.fn()} onAddTask={vi.fn()} />)
    expect(screen.getByText('Task A')).toBeInTheDocument()
    expect(screen.getByText('Task B')).toBeInTheDocument()
    expect(screen.getByText('Task C')).toBeInTheDocument()
  })

  it('shows add task form when Add button clicked', async () => {
    const user = userEvent.setup()
    render(<KanbanBoard tasks={[]} onMoveTask={vi.fn()} onDeleteTask={vi.fn()} onAddTask={vi.fn()} />)
    await user.click(screen.getByLabelText('Add task'))
    expect(screen.getByPlaceholderText(/task title/i)).toBeInTheDocument()
  })

  it('calls onAddTask with the entered title', async () => {
    const onAddTask = vi.fn()
    const user = userEvent.setup()
    render(<KanbanBoard tasks={[]} onMoveTask={vi.fn()} onDeleteTask={vi.fn()} onAddTask={onAddTask} />)
    await user.click(screen.getByLabelText('Add task'))
    await user.type(screen.getByPlaceholderText(/task title/i), 'New task')
    await user.click(screen.getByRole('button', { name: /^add$/i }))
    expect(onAddTask).toHaveBeenCalledWith('New task')
  })
})
