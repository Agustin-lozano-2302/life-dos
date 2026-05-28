import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { useAllTasks } from '@/hooks/useAllTasks'
import { useProjects } from '@/hooks/useProjects'
import { useGoals } from '@/hooks/useGoals'
import type { NoteEntityType } from '@/types/notes'

export interface LinkSelection {
  entityType: NoteEntityType
  entityId: string
  label: string
}

interface LinkPickerProps {
  open: boolean
  onClose: () => void
  onSelect: (selection: LinkSelection) => void
}

interface EntityEntry {
  entityType: NoteEntityType
  entityId: string
  label: string
  group: string
}

const GROUP_COLORS: Record<string, string> = {
  'Hábitos':   'text-orange-300',
  'Proyectos': 'text-indigo-300',
  'Goals':     'text-emerald-300',
}

export function LinkPicker({ open, onClose, onSelect }: LinkPickerProps) {
  const [query, setQuery] = useState('')
  const { tasks } = useAllTasks()
  const { projects } = useProjects()
  const { goals } = useGoals()

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  if (!open) return null

  const all: EntityEntry[] = [
    ...tasks.map((t) => ({ entityType: 'daily_task' as NoteEntityType, entityId: t.id, label: t.title, group: 'Hábitos' })),
    ...projects.map((p) => ({ entityType: 'project' as NoteEntityType, entityId: p.id, label: p.title, group: 'Proyectos' })),
    ...goals.map((g) => ({ entityType: 'goal' as NoteEntityType, entityId: g.id, label: g.title, group: 'Goals' })),
  ]

  const filtered = query.trim()
    ? all.filter((e) => e.label.toLowerCase().includes(query.toLowerCase()))
    : all

  const groups = Array.from(new Set(filtered.map((e) => e.group)))

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/50 backdrop-blur-[6px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Vincular a entidad"
        className="relative z-10 w-full max-w-md overflow-hidden rounded-[20px] border border-white/[0.12] bg-[rgba(12,10,28,0.95)] shadow-[0_16px_48px_rgba(0,0,0,0.6)] backdrop-blur-[32px]"
      >
        {/* Search bar */}
        <div className="flex items-center gap-2 border-b border-white/[0.08] px-4 py-3">
          <Search size={16} className="shrink-0 text-white/30" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar hábitos, proyectos, goals…"
            className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
          />
          <button onClick={onClose} aria-label="Close" className="text-white/30 hover:text-white">
            <X size={16} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto p-2">
          {filtered.length === 0 && (
            <p className="px-3 py-4 text-center text-sm text-white/30">Sin resultados.</p>
          )}
          {groups.map((group) => (
            <div key={group} className="mb-2">
              <p className={`px-3 pb-1 text-[10px] font-bold uppercase tracking-widest ${GROUP_COLORS[group] ?? 'text-white/30'}`}>
                {group}
              </p>
              {filtered
                .filter((e) => e.group === group)
                .map((e) => (
                  <button
                    key={e.entityId}
                    onClick={() => {
                      onSelect({ entityType: e.entityType, entityId: e.entityId, label: e.label })
                      onClose()
                    }}
                    className="w-full rounded-[10px] px-3 py-2 text-left text-sm text-white/80 transition-colors hover:bg-white/[0.06]"
                  >
                    {e.label}
                  </button>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
