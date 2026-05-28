import { useState } from 'react'
import { useNotes } from '@/hooks/useNotes'
import { useNoteMutations } from '@/hooks/useNoteMutations'
import { NoteCard } from '@/components/notes/NoteCard'
import { NoteEditor } from '@/components/notes/NoteEditor'
import { NoteSheet } from '@/components/notes/NoteSheet'
import type { Note, CreateNoteInput } from '@/types/notes'

export default function NotesPage() {
  const { notes, isLoading } = useNotes()
  const { createNote, deleteNote, isCreating } = useNoteMutations()

  const [mode, setMode] = useState<'list' | 'create'>('list')
  const [activeNote, setActiveNote] = useState<Note | null>(null)
  const [search, setSearch] = useState('')

  function handleCreate(data: CreateNoteInput) {
    createNote(data, { onSuccess: () => setMode('list') })
  }

  function handleDelete(id: string) {
    if (!window.confirm('¿Eliminar esta nota?')) return
    deleteNote(id)
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
          <h1 className="text-[22px] font-extrabold tracking-[-0.4px] text-white">Nueva nota</h1>
        </div>
        <NoteEditor onSubmit={(d) => handleCreate(d as CreateNoteInput)} onCancel={() => setMode('list')} isPending={isCreating} />
      </div>
    )
  }

  return (
    <div className="py-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-[22px] font-extrabold tracking-[-0.4px] text-white">Notas</h1>
        <button
          onClick={() => setMode('create')}
          className="rounded-[14px] bg-violet-500/20 px-3 py-1.5 text-sm font-medium text-violet-200 transition-colors hover:bg-violet-500/30"
        >
          + Nueva
        </button>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar notas…"
        aria-label="Search notes"
        className="mb-4 w-full rounded-[18px] border border-white/[0.12] bg-white/7 px-3 py-2 text-sm text-white placeholder-white/30 outline-none backdrop-blur-2xl focus:border-violet-400/40"
      />

      <div className="space-y-3">
        {filtered.map((note) => (
          <NoteCard key={note.id} note={note} onClick={setActiveNote} onDelete={handleDelete} />
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-white/40">
            {search ? 'No hay notas que coincidan.' : 'Sin notas. Crea una arriba.'}
          </p>
        )}
      </div>

      <NoteSheet
        note={activeNote}
        onClose={() => setActiveNote(null)}
        onDelete={(id) => { handleDelete(id); setActiveNote(null) }}
      />
    </div>
  )
}
