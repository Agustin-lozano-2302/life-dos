import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NoteCard } from './NoteCard'
import type { Note } from '@/types/notes'

const note: Note = {
  id: 'note-1',
  title: 'Meeting notes',
  content: 'We discussed the roadmap for Q3.',
  category: 'Work',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
}

describe('NoteCard', () => {
  it('renders the note title', () => {
    render(<NoteCard note={note} onOpen={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Meeting notes')).toBeInTheDocument()
  })

  it('renders a preview of the content', () => {
    render(<NoteCard note={note} onOpen={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('We discussed the roadmap for Q3.')).toBeInTheDocument()
  })

  it('renders the category badge', () => {
    render(<NoteCard note={note} onOpen={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Work')).toBeInTheDocument()
  })

  it('calls onOpen when card is clicked', async () => {
    const onOpen = vi.fn()
    const user = userEvent.setup()
    render(<NoteCard note={note} onOpen={onOpen} onDelete={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /^open meeting notes/i }))
    expect(onOpen).toHaveBeenCalledWith(note)
  })

  it('calls onDelete when ✕ is clicked without opening', async () => {
    const onDelete = vi.fn()
    const onOpen = vi.fn()
    const user = userEvent.setup()
    render(<NoteCard note={note} onOpen={onOpen} onDelete={onDelete} />)
    await user.click(screen.getByLabelText(`Delete ${note.title}`))
    expect(onDelete).toHaveBeenCalledWith('note-1')
  })
})
