import { cn } from '@/lib/utils'
import type { NoteEntityType } from '@/types/notes'

const DOMAIN_COLORS: Record<NoteEntityType, { bg: string; text: string }> = {
  daily_task:   { bg: 'bg-orange-500/20',  text: 'text-orange-300' },
  project:      { bg: 'bg-indigo-500/20',  text: 'text-indigo-300' },
  project_task: { bg: 'bg-indigo-500/15',  text: 'text-indigo-200' },
  goal:         { bg: 'bg-emerald-500/20', text: 'text-emerald-300' },
}

export interface Relation {
  id: string
  entityType: NoteEntityType
  entityId: string
  label: string
}

interface RelationChipsProps {
  relations: Relation[]
  onAddLink: () => void
  onRemoveLink: (relationId: string) => void
}

export function RelationChips({ relations, onAddLink, onRemoveLink }: RelationChipsProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {relations.map((rel) => {
        const colors = DOMAIN_COLORS[rel.entityType]
        return (
          <span
            key={rel.id}
            className={cn(
              'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
              colors.bg,
              colors.text,
            )}
          >
            {rel.label}
            <button
              onClick={() => onRemoveLink(rel.id)}
              aria-label={`Remove link to ${rel.label}`}
              className="ml-0.5 opacity-60 hover:opacity-100"
            >
              ×
            </button>
          </span>
        )
      })}
      <button
        onClick={onAddLink}
        aria-label="Vincular"
        className="rounded-full border border-white/[0.12] px-2 py-0.5 text-xs text-white/40 transition-colors hover:border-white/25 hover:text-white/70"
      >
        + Vincular
      </button>
    </div>
  )
}
