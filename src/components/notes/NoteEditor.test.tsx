import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NoteEditor } from './NoteEditor'
import type { Note } from '@/types/notes'

const existingNote: Note = {
  id: 'note-1',
  title: 'My note',
  content: 'Some content',
  category: 'Work',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

describe('NoteEditor', () => {
  it('renders title, category, and content fields', () => {
    render(<NoteEditor onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByLabelText(/note title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/note content/i)).toBeInTheDocument()
  })

  it('Save is disabled when title is empty', () => {
    render(<NoteEditor onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
  })

  it('Save is enabled after typing a title', async () => {
    const user = userEvent.setup()
    render(<NoteEditor onSubmit={vi.fn()} onCancel={vi.fn()} />)
    await user.type(screen.getByLabelText(/note title/i), 'Hello')
    expect(screen.getByRole('button', { name: /save/i })).not.toBeDisabled()
  })

  it('calls onSubmit with correct data', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(<NoteEditor onSubmit={onSubmit} onCancel={vi.fn()} />)
    await user.type(screen.getByLabelText(/note title/i), 'My note')
    await user.type(screen.getByLabelText(/note content/i), 'Content here')
    await user.click(screen.getByRole('button', { name: /save/i }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'My note', content: 'Content here' }),
    )
  })

  it('pre-fills fields when editing', () => {
    render(<NoteEditor initial={existingNote} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByLabelText(/note title/i)).toHaveValue('My note')
    expect(screen.getByLabelText(/category/i)).toHaveValue('Work')
    expect(screen.getByLabelText(/note content/i)).toHaveValue('Some content')
  })

  it('calls onCancel when Cancel is clicked', async () => {
    const onCancel = vi.fn()
    const user = userEvent.setup()
    render(<NoteEditor onSubmit={vi.fn()} onCancel={onCancel} />)
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onCancel).toHaveBeenCalled()
  })
})
