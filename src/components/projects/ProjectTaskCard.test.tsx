// src/components/projects/ProjectTaskCard.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProjectTaskCard } from './ProjectTaskCard'
import type { ProjectTask } from '@/types/projects'

vi.mock('@/hooks/useAttachments', () => ({
  useAttachments: () => ({ attachments: [] }),
  useAttachmentMutations: () => ({ upload: vi.fn(), remove: vi.fn(), isUploading: false }),
}))

function wrap(ui: React.ReactElement) {
  return render(<QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>)
}

const task: ProjectTask = {
  id: 't1',
  project_id: 'p1',
  title: 'Fix the bug',
  description: null,
  status: 'in_progress',
  sort_order: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

describe('ProjectTaskCard', () => {
  it('renders task title', () => {
    wrap(<ProjectTaskCard task={task} onMove={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Fix the bug')).toBeInTheDocument()
  })

  it('calls onMove left when move left menu item is clicked', async () => {
    const onMove = vi.fn()
    const user = userEvent.setup()
    wrap(<ProjectTaskCard task={task} onMove={onMove} onDelete={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /open menu/i }))
    await user.click(screen.getByRole('menuitem', { name: /mover atrás/i }))
    expect(onMove).toHaveBeenCalledWith('t1', 'todo')
  })

  it('calls onDelete when Eliminar menu item is clicked', async () => {
    const onDelete = vi.fn()
    const user = userEvent.setup()
    wrap(<ProjectTaskCard task={task} onMove={vi.fn()} onDelete={onDelete} />)
    await user.click(screen.getByRole('button', { name: /open menu/i }))
    await user.click(screen.getByRole('menuitem', { name: 'Eliminar' }))
    expect(onDelete).toHaveBeenCalledWith('t1')
  })
})
