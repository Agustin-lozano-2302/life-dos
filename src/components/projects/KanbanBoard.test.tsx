import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { KanbanBoard } from './KanbanBoard'
import type { ProjectTask, ProjectTaskStatus } from '@/types/projects'

vi.mock('@/hooks/useAttachments', () => ({
  useAttachments: () => ({ attachments: [] }),
  useAttachmentMutations: () => ({ upload: vi.fn(), remove: vi.fn(), isUploading: false }),
}))

function wrap(ui: React.ReactElement) {
  return render(<QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>)
}

const tasks: ProjectTask[] = [
  { id: 't1', project_id: 'p1', title: 'Task A', description: null, status: 'todo', sort_order: null, created_at: '' },
  { id: 't2', project_id: 'p1', title: 'Task B', description: null, status: 'in_progress', sort_order: null, created_at: '' },
  { id: 't3', project_id: 'p1', title: 'Task C', description: null, status: 'done', sort_order: null, created_at: '' },
]

describe('KanbanBoard', () => {
  it('renders all 4 column headers', () => {
    wrap(<KanbanBoard tasks={tasks} onMoveTask={vi.fn()} onDeleteTask={vi.fn()} onAddTask={vi.fn()} />)
    expect(screen.getByText(/por hacer/i)).toBeInTheDocument()
    expect(screen.getByText(/en progreso/i)).toBeInTheDocument()
    expect(screen.getByText(/revisión/i)).toBeInTheDocument()
    expect(screen.getByText(/hecho/i)).toBeInTheDocument()
  })

  it('places tasks in the correct columns', () => {
    wrap(<KanbanBoard tasks={tasks} onMoveTask={vi.fn()} onDeleteTask={vi.fn()} onAddTask={vi.fn()} />)
    expect(screen.getByText('Task A')).toBeInTheDocument()
    expect(screen.getByText('Task B')).toBeInTheDocument()
    expect(screen.getByText('Task C')).toBeInTheDocument()
  })

  it('shows add task form when add button clicked', async () => {
    const user = userEvent.setup()
    wrap(<KanbanBoard tasks={[]} onMoveTask={vi.fn()} onDeleteTask={vi.fn()} onAddTask={vi.fn()} />)
    await user.click(screen.getAllByLabelText(/agregar tarea a/i)[0])
    expect(screen.getByPlaceholderText(/título de la tarea/i)).toBeInTheDocument()
  })

  it('calls onAddTask with the entered title and status', async () => {
    const onAddTask = vi.fn()
    const user = userEvent.setup()
    wrap(<KanbanBoard tasks={[]} onMoveTask={vi.fn()} onDeleteTask={vi.fn()} onAddTask={onAddTask} />)
    await user.click(screen.getAllByLabelText(/agregar tarea a/i)[0])
    await user.type(screen.getByPlaceholderText(/título de la tarea/i), 'New task')
    await user.click(screen.getByRole('button', { name: /^agregar$/i }))
    expect(onAddTask).toHaveBeenCalledWith('New task', 'todo' as ProjectTaskStatus)
  })
})
