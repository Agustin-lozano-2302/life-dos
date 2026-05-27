import { describe, it, expect, vi, beforeEach } from 'vitest'
import supabase from '@/lib/supabase/client'
import {
  fetchNotes,
  fetchNoteLinks,
  createNote,
  updateNote,
  deleteNote,
  addNoteLink,
  removeNoteLink,
} from './notes'
import type { Note, NoteLink } from '@/types/notes'

vi.mock('@/lib/supabase/client')

const mockFrom = vi.mocked(supabase.from)

const mockNote: Note = {
  id: 'note-1',
  title: 'Meeting notes',
  content: 'Some content here',
  category: 'Work',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

const mockLink: NoteLink = {
  id: 'link-1',
  note_id: 'note-1',
  entity_type: 'project',
  entity_id: 'proj-1',
  created_at: '2026-01-01T00:00:00Z',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('fetchNotes', () => {
  it('returns all notes ordered by updated_at', async () => {
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [mockNote], error: null }),
      }),
    } as any)

    const result = await fetchNotes()
    expect(result).toEqual([mockNote])
    expect(mockFrom).toHaveBeenCalledWith('notes')
  })

  it('throws when supabase returns an error', async () => {
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
      }),
    } as any)

    await expect(fetchNotes()).rejects.toMatchObject({ message: 'DB error' })
  })
})

describe('fetchNoteLinks', () => {
  it('returns links for a given note', async () => {
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [mockLink], error: null }),
      }),
    } as any)

    const result = await fetchNoteLinks('note-1')
    expect(result).toEqual([mockLink])
  })
})

describe('createNote', () => {
  it('inserts and returns the new note', async () => {
    mockFrom.mockReturnValueOnce({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockNote, error: null }),
        }),
      }),
    } as any)

    const result = await createNote({ title: 'Meeting notes' })
    expect(result).toEqual(mockNote)
  })
})

describe('updateNote', () => {
  it('updates and returns the modified note', async () => {
    mockFrom.mockReturnValueOnce({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { ...mockNote, title: 'Updated' }, error: null }),
          }),
        }),
      }),
    } as any)

    const result = await updateNote({ id: 'note-1', title: 'Updated' })
    expect(result.title).toBe('Updated')
  })
})

describe('deleteNote', () => {
  it('calls delete with the note id', async () => {
    const eqMock = vi.fn().mockResolvedValue({ error: null })
    mockFrom.mockReturnValueOnce({
      delete: vi.fn().mockReturnValue({ eq: eqMock }),
    } as any)

    await deleteNote('note-1')
    expect(eqMock).toHaveBeenCalledWith('id', 'note-1')
  })
})

describe('addNoteLink', () => {
  it('inserts a note link', async () => {
    const insertMock = vi.fn().mockResolvedValue({ error: null })
    mockFrom.mockReturnValueOnce({ insert: insertMock } as any)

    await addNoteLink('note-1', 'project', 'proj-1')
    expect(insertMock).toHaveBeenCalledWith({
      note_id: 'note-1',
      entity_type: 'project',
      entity_id: 'proj-1',
    })
  })
})

describe('removeNoteLink', () => {
  it('deletes a note link by note_id and entity_id', async () => {
    const eq2Mock = vi.fn().mockResolvedValue({ error: null })
    const eq1Mock = vi.fn().mockReturnValue({ eq: eq2Mock })
    mockFrom.mockReturnValueOnce({
      delete: vi.fn().mockReturnValue({ eq: eq1Mock }),
    } as any)

    await removeNoteLink('note-1', 'proj-1')
    expect(eq1Mock).toHaveBeenCalledWith('note_id', 'note-1')
    expect(eq2Mock).toHaveBeenCalledWith('entity_id', 'proj-1')
  })
})
