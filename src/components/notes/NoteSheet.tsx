import { useState } from 'react'
import { X } from 'lucide-react'
import { GlassSheet } from '@/components/common/GlassSheet'
import { DotMenu } from '@/components/common/DotMenu'
import { useNoteMutations } from '@/hooks/useNoteMutations'
import type { Note, UpdateNoteInput } from '@/types/notes'

interface NoteSheetProps {
  note: Note | null
  onClose: () => void
  onDelete: (id: string) => void
}

export function NoteSheet({ note, onClose, onDelete }: NoteSheetProps) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const { updateNote, isUpdating } = useNoteMutations()

  function openEdit() {
    if (!note) return
    setTitle(note.title)
    setContent(note.content ?? '')
    setEditing(true)
  }

  function handleSave() {
    if (!note) return
    const input: UpdateNoteInput = { id: note.id, title, content: content || null }
    updateNote(input, { onSuccess: () => setEditing(false) })
  }

  function handleClose() {
    setEditing(false)
    onClose()
  }

  return (
    <GlassSheet open={!!note} onClose={handleClose}>
      {note && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
            {editing ? (
              <input
                aria-label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex-1 bg-transparent text-base font-semibold text-white outline-none"
              />
            ) : (
              <h2 className="flex-1 text-base font-semibold text-white">{note.title}</h2>
            )}
            <div className="flex items-center gap-1">
              <DotMenu
                items={[
                  { label: 'Editar', onClick: openEdit },
                  { label: 'Eliminar', destructive: true, onClick: () => { onDelete(note.id); handleClose() } },
                ]}
              />
              <button
                onClick={handleClose}
                aria-label="Close"
                className="ml-1 flex h-8 w-8 items-center justify-center rounded-[10px] text-white/40 transition-colors hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4">
            {note.category && (
              <span className="mb-3 inline-block rounded-full bg-violet-500/20 px-2 py-0.5 text-xs text-violet-300">
                {note.category}
              </span>
            )}

            {editing ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full resize-none bg-transparent text-sm text-white/80 outline-none"
                rows={12}
                placeholder="Contenido de la nota…"
              />
            ) : (
              <p className="whitespace-pre-wrap text-sm text-white/80">
                {note.content ?? <span className="text-white/30">Sin contenido.</span>}
              </p>
            )}
          </div>

          {/* Footer */}
          {editing ? (
            <div className="flex gap-2 border-t border-white/[0.08] p-3">
              <button
                onClick={handleSave}
                disabled={isUpdating}
                className="flex-1 rounded-[14px] bg-violet-500/30 py-2 text-sm font-medium text-violet-200 transition-colors hover:bg-violet-500/40 disabled:opacity-50"
              >
                Guardar
              </button>
              <button
                onClick={() => setEditing(false)}
                className="flex-1 rounded-[14px] bg-white/7 py-2 text-sm font-medium text-white/60 transition-colors hover:bg-white/10"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <div className="border-t border-white/[0.08] px-4 py-2">
              <p className="text-xs text-white/25">
                Última edición {new Date(note.updated_at).toLocaleDateString()}
              </p>
            </div>
          )}
        </>
      )}
    </GlassSheet>
  )
}
