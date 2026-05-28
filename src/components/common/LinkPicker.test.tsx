import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LinkPicker } from './LinkPicker'
import type { NoteEntityType } from '@/types/notes'

vi.mock('@/hooks/useAllTasks', () => ({
  useAllTasks: () => ({ tasks: [{ id: 't1', title: 'Morning run' }] }),
}))
vi.mock('@/hooks/useProjects', () => ({
  useProjects: () => ({ projects: [{ id: 'p1', title: 'My Project' }] }),
}))
vi.mock('@/hooks/useGoals', () => ({
  useGoals: () => ({ goals: [{ id: 'g1', title: 'Run 100km' }] }),
}))

function wrap(ui: React.ReactElement) {
  const qc = new QueryClient()
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>)
}

describe('LinkPicker', () => {
  it('does not render when closed', () => {
    wrap(<LinkPicker open={false} onClose={vi.fn()} onSelect={vi.fn()} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows search input when open', () => {
    wrap(<LinkPicker open={true} onClose={vi.fn()} onSelect={vi.fn()} />)
    expect(screen.getByPlaceholderText(/buscar/i)).toBeInTheDocument()
  })

  it('shows all entities when search is empty', () => {
    wrap(<LinkPicker open={true} onClose={vi.fn()} onSelect={vi.fn()} />)
    expect(screen.getByText('Morning run')).toBeInTheDocument()
    expect(screen.getByText('My Project')).toBeInTheDocument()
    expect(screen.getByText('Run 100km')).toBeInTheDocument()
  })

  it('filters results on input', async () => {
    const user = userEvent.setup()
    wrap(<LinkPicker open={true} onClose={vi.fn()} onSelect={vi.fn()} />)
    await user.type(screen.getByPlaceholderText(/buscar/i), 'run')
    expect(screen.getByText('Morning run')).toBeInTheDocument()
    expect(screen.getByText('Run 100km')).toBeInTheDocument()
    expect(screen.queryByText('My Project')).not.toBeInTheDocument()
  })

  it('calls onSelect with entity info when item clicked', async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    wrap(<LinkPicker open={true} onClose={vi.fn()} onSelect={onSelect} />)
    await user.click(screen.getByText('Run 100km'))
    expect(onSelect).toHaveBeenCalledWith({
      entityType: 'goal' as NoteEntityType,
      entityId: 'g1',
      label: 'Run 100km',
    })
  })

  it('closes on Escape', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    wrap(<LinkPicker open={true} onClose={onClose} onSelect={vi.fn()} />)
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
