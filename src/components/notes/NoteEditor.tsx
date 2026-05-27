import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { Note, CreateNoteInput, UpdateNoteInput } from '@/types/notes'

interface NoteEditorProps {
  initial?: Note
  onSubmit: (data: CreateNoteInput | UpdateNoteInput) => void
  onCancel: () => void
  isPending?: boolean
}

export function NoteEditor({ initial, onSubmit, onCancel, isPending = false }: NoteEditorProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [content, setContent] = useState(initial?.content ?? '')
  const [category, setCategory] = useState(initial?.category ?? '')

  const canSubmit = title.trim().length > 0 && !isPending

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    onSubmit({
      ...(initial ? { id: initial.id } : {}),
      title: title.trim(),
      content: content.trim() || null,
      category: category.trim() || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <input
        aria-label="Note title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-semibold outline-none focus:ring-1 focus:ring-ring"
      />
      <input
        aria-label="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder="Category (optional)"
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
      />
      <textarea
        aria-label="Note content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your note…"
        rows={8}
        className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!canSubmit}
          className={cn(
            'flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity',
            !canSubmit && 'cursor-not-allowed opacity-50',
          )}
        >
          {isPending ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-border px-4 py-2 text-sm font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
