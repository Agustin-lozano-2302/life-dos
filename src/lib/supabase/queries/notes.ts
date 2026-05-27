import supabase from '@/lib/supabase/client'
import type { Note, NoteLink, NoteEntityType, CreateNoteInput, UpdateNoteInput } from '@/types/notes'

export async function fetchNotes(): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data as Note[]
}

export async function fetchNoteLinks(noteId: string): Promise<NoteLink[]> {
  const { data, error } = await supabase
    .from('note_links')
    .select('*')
    .eq('note_id', noteId)
  if (error) throw error
  return data as NoteLink[]
}

export async function createNote(input: CreateNoteInput): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .insert(input)
    .select()
    .single()
  if (error) throw error
  return data as Note
}

export async function updateNote({ id, ...rest }: UpdateNoteInput): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .update(rest)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Note
}

export async function deleteNote(id: string): Promise<void> {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function addNoteLink(noteId: string, entityType: NoteEntityType, entityId: string): Promise<void> {
  const { error } = await supabase
    .from('note_links')
    .insert({ note_id: noteId, entity_type: entityType, entity_id: entityId })
  if (error) throw error
}

export async function removeNoteLink(noteId: string, entityId: string): Promise<void> {
  const { error } = await supabase
    .from('note_links')
    .delete()
    .eq('note_id', noteId)
    .eq('entity_id', entityId)
  if (error) throw error
}
