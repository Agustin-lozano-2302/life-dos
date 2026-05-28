import { GlassCard } from '@/components/common/GlassCard'
import { DotMenu } from '@/components/common/DotMenu'
import type { Note } from '@/types/notes'

interface NoteCardProps {
  note: Note
  onClick: (note: Note) => void
  onDelete: (id: string) => void
}

export function NoteCard({ note, onClick, onDelete }: NoteCardProps) {
  const preview = note.content?.slice(0, 120)

  return (
    <GlassCard tint="violet" className="p-4">
      <div className="flex items-start gap-2">
        <button
          onClick={() => onClick(note)}
          aria-label={`Open ${note.title}`}
          className="min-w-0 flex-1 text-left"
        >
          <h3 className="font-semibold leading-tight text-white">{note.title}</h3>
          {preview && (
            <p className="mt-1 line-clamp-2 text-sm text-white/50">{preview}</p>
          )}
          <p className="mt-2 text-xs text-white/30">
            {new Date(note.updated_at).toLocaleDateString()}
          </p>
        </button>

        <div className="flex shrink-0 flex-col items-end gap-2">
          {note.category && (
            <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-xs text-violet-300">
              {note.category}
            </span>
          )}
          <DotMenu
            items={[
              { label: 'Editar', onClick: () => onClick(note) },
              { label: 'Eliminar', destructive: true, onClick: () => onDelete(note.id) },
            ]}
          />
        </div>
      </div>
    </GlassCard>
  )
}
