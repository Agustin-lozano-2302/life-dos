import type { Note } from '@/types/notes'

interface NoteCardProps {
  note: Note
  onOpen: (note: Note) => void
  onDelete: (id: string) => void
}

export function NoteCard({ note, onOpen, onDelete }: NoteCardProps) {
  const preview = note.content?.slice(0, 120)

  return (
    <div className="group rounded-xl border border-border bg-card transition-colors hover:border-primary/40">
      <div className="flex items-start gap-2 p-4">
        <button
          onClick={() => onOpen(note)}
          aria-label={`Open ${note.title}`}
          className="min-w-0 flex-1 text-left"
        >
          <h3 className="font-semibold leading-tight">{note.title}</h3>
          {preview && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{preview}</p>
          )}
          <p className="mt-2 text-xs text-muted-foreground/60">
            {new Date(note.updated_at).toLocaleDateString()}
          </p>
        </button>

        <div className="flex shrink-0 flex-col items-end gap-2">
          {note.category && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {note.category}
            </span>
          )}
          <button
            onClick={() => onDelete(note.id)}
            aria-label={`Delete ${note.title}`}
            className="rounded p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}
