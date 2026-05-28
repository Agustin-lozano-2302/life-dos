import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NoteSheet } from './NoteSheet'
import type { Note } from '@/types/notes'

vi.mock('@/hooks/useNoteMutations', () => ({
  useNoteMutations: () => ({
    updateNote: vi.fn(),
    deleteNote: vi.fn(),
    isUpdating: false,
  }),
}))

vi.mock('@/hooks/useNoteLinks', () => ({
  useNoteLinks: () => ({ data: [] }),
  useNoteLinkMutations: () => ({ addLink: vi.fn(), removeLink: vi.fn() }),
}))

vi.mock('@/hooks/useAllTasks', () => ({
  useAllTasks: () => ({ tasks: [] }),
}))
vi.mock('@/hooks/useProjects', () => ({
  useProjects: () => ({ projects: [] }),
}))
vi.mock('@/hooks/useGoals', () => ({
  useGoals: () => ({ goals: [] }),
}))

const note: Note = {
  id: 'note-1',
  title: 'Stand-up notes',
  content: 'Discussed sprint goals.',
  category: 'Work',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
}

function wrap(ui: React.ReactElement) {
  const qc = new QueryClient()
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>)
}

describe('NoteSheet', () => {
  it('does not render when note is null', () => {
    wrap(<NoteSheet note={null} onClose={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders note title and content when open', () => {
    wrap(<NoteSheet note={note} onClose={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Stand-up notes')).toBeInTheDocument()
    expect(screen.getByText('Discussed sprint goals.')).toBeInTheDocument()
  })

  it('calls onClose when × is clicked', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    wrap(<NoteSheet note={note} onClose={onClose} onDelete={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /close/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('switches to edit mode when Editar DotMenu item is clicked', async () => {
    const user = userEvent.setup()
    wrap(<NoteSheet note={note} onClose={vi.fn()} onDelete={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /open menu/i }))
    await user.click(screen.getByRole('menuitem', { name: 'Editar' }))
    expect(screen.getByRole('textbox', { name: /title/i })).toBeInTheDocument()
  })

  it('shows Vincular button in RelationChips', () => {
    wrap(<NoteSheet note={note} onClose={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByRole('button', { name: /vincular/i })).toBeInTheDocument()
  })
})
