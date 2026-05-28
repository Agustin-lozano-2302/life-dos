import { useState } from 'react'
import { useNotes } from '@/hooks/useNotes'
import { useNoteMutations } from '@/hooks/useNoteMutations'
import { NoteCard } from '@/components/notes/NoteCard'
import { NoteEditor } from '@/components/notes/NoteEditor'
import type { Note, CreateNoteInput, UpdateNoteInput } from '@/types/notes'

export default function NotesPage() {
  const { notes, isLoading } = useNotes()
  const { createNote, updateNote, deleteNote, isCreating, isUpdating } = useNoteMutations()

  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list')
  const [editing, setEditing] = useState<Note | null>(null)
  const [search, setSearch] = useState('')

  function handleCreate(data: CreateNoteInput | UpdateNoteInput) {
    createNote(data as CreateNoteInput, { onSuccess: () => setMode('list') })
  }

  function handleUpdate(data: CreateNoteInput | UpdateNoteInput) {
    updateNote(data as UpdateNoteInput, { onSuccess: () => { setMode('list'); setEditing(null) } })
  }

  function handleDelete(id: string) {
    if (!window.confirm('Delete this note?')) return
    deleteNote(id)
  }

  function handleOpen(note: Note) {
    setEditing(note)
    setMode('edit')
  }

  const filtered = search.trim()
    ? notes.filter((n) =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.content?.toLowerCase().includes(search.toLowerCase()) ||
        n.category?.toLowerCase().includes(search.toLowerCase()),
      )
    : notes

  if (isLoading) {
    return <div className="py-8 text-center text-sm text-white/40">Loading…</div>
  }

  if (mode === 'create') {
    return (
      <div className="py-4">
        <div className="mb-4 flex items-center gap-2">
          <button onClick={() => setMode('list')} className="text-white/40 hover:text-white">←</button>
          <h1 className="text-[22px] font-extrabold tracking-[-0.4px] text-white">New note</h1>
        </div>
        <NoteEditor onSubmit={handleCreate} onCancel={() => setMode('list')} isPending={isCreating} />
      </div>
    )
  }

  if (mode === 'edit' && editing) {
    return (
      <div className="py-4">
        <div className="mb-4 flex items-center gap-2">
          <button onClick={() => { setMode('list'); setEditing(null) }} className="text-white/40 hover:text-white">←</button>
          <h1 className="text-[22px] font-extrabold tracking-[-0.4px] text-white">Edit note</h1>
        </div>
        <NoteEditor
          initial={editing}
          onSubmit={handleUpdate}
          onCancel={() => { setMode('list'); setEditing(null) }}
          isPending={isUpdating}
        />
      </div>
    )
  }

  return (
    <div className="py-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-[22px] font-extrabold tracking-[-0.4px] text-white">Notas</h1>
        <button
          onClick={() => setMode('create')}
          className="rounded-lg bg-violet-500/20 px-3 py-1.5 text-sm font-medium text-violet-200"
        >
          + New
        </button>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search notes…"
        aria-label="Search notes"
        className="mb-4 w-full rounded-md border border-white/[0.12] bg-white/7 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:ring-1 focus:ring-white/20"
      />

      <div className="space-y-3">
        {filtered.map((note) => (
          <NoteCard key={note.id} note={note} onClick={handleOpen} onDelete={handleDelete} />
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-white/40">
            {search ? 'No notes match your search.' : 'No notes yet. Create one above.'}
          </p>
        )}
      </div>
    </div>
  )
}
