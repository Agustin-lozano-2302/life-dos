import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { Project, CreateProjectInput, UpdateProjectInput, ProjectStatus } from '@/types/projects'

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'active', label: 'Activo' },
  { value: 'paused', label: 'Pausado' },
  { value: 'completed', label: 'Completado' },
  { value: 'archived', label: 'Archivado' },
]

interface ProjectFormProps {
  initial?: Project
  onSubmit: (data: CreateProjectInput | UpdateProjectInput) => void
  onCancel: () => void
  isPending?: boolean
}

export function ProjectForm({ initial, onSubmit, onCancel, isPending = false }: ProjectFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [status, setStatus] = useState<ProjectStatus>(initial?.status ?? 'active')
  const [dueDate, setDueDate] = useState(initial?.due_date ?? '')

  const canSubmit = title.trim().length > 0 && !isPending

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    onSubmit({
      ...(initial ? { id: initial.id } : {}),
      title: title.trim(),
      description: description.trim() || null,
      status,
      due_date: dueDate || null,
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-[18px] border border-white/[0.12] bg-white/7 p-4 backdrop-blur-2xl"
    >
      <div>
        <label htmlFor="proj-title" className="text-xs font-semibold uppercase tracking-widest text-white/40">
          Título
        </label>
        <input
          id="proj-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej. Lanzar sitio web"
          className="mt-1 w-full rounded-[12px] border border-white/[0.12] bg-white/[0.05] px-3 py-2 text-sm text-white placeholder-white/25 outline-none focus:border-white/25"
        />
      </div>

      <div>
        <label htmlFor="proj-desc" className="text-xs font-semibold uppercase tracking-widest text-white/40">
          Descripción <span className="normal-case font-normal text-white/25">(opcional)</span>
        </label>
        <textarea
          id="proj-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="¿De qué trata este proyecto?"
          rows={3}
          className="mt-1 w-full resize-none rounded-[12px] border border-white/[0.12] bg-white/[0.05] px-3 py-2 text-sm text-white placeholder-white/25 outline-none focus:border-white/25"
        />
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label htmlFor="proj-status" className="text-xs font-semibold uppercase tracking-widest text-white/40">
            Estado
          </label>
          <select
            id="proj-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            className="mt-1 w-full rounded-[12px] border border-white/[0.12] bg-white/[0.05] px-3 py-2 text-sm text-white outline-none focus:border-white/25"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label htmlFor="proj-due" className="text-xs font-semibold uppercase tracking-widest text-white/40">
            Fecha límite <span className="normal-case font-normal text-white/25">(opcional)</span>
          </label>
          <input
            id="proj-due"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="mt-1 w-full rounded-[12px] border border-white/[0.12] bg-white/[0.05] px-3 py-2 text-sm text-white outline-none focus:border-white/25"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!canSubmit}
          className={cn(
            'flex-1 rounded-[12px] bg-indigo-500/25 px-4 py-2 text-sm font-medium text-indigo-200 transition-opacity',
            !canSubmit && 'cursor-not-allowed opacity-40',
          )}
        >
          {isPending ? 'Guardando…' : 'Guardar'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-[12px] border border-white/[0.12] px-4 py-2 text-sm font-medium text-white/50 hover:text-white"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
