export type NoteEntityType = 'daily_task' | 'project' | 'project_task' | 'goal'

export interface Note {
  id: string
  title: string
  content: string | null
  category: string | null
  created_at: string
  updated_at: string
}

export interface NoteLink {
  id: string
  note_id: string
  entity_type: NoteEntityType
  entity_id: string
  created_at: string
}

export interface CreateNoteInput {
  title: string
  content?: string | null
  category?: string | null
}

export interface UpdateNoteInput {
  id: string
  title?: string
  content?: string | null
  category?: string | null
}
