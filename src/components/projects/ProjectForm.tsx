import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { Project, CreateProjectInput, UpdateProjectInput, ProjectStatus } from '@/types/projects'

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
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
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-4">
      <div>
        <label htmlFor="proj-title" className="text-xs font-medium text-muted-foreground">Title</label>
        <input
          id="proj-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Launch website"
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <div>
        <label htmlFor="proj-desc" className="text-xs font-medium text-muted-foreground">
          Description <span className="text-muted-foreground/60">(optional)</span>
        </label>
        <textarea
          id="proj-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is this project about?"
          rows={3}
          className="mt-1 w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label htmlFor="proj-status" className="text-xs font-medium text-muted-foreground">Status</label>
          <select
            id="proj-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label htmlFor="proj-due" className="text-xs font-medium text-muted-foreground">
            Due date <span className="text-muted-foreground/60">(optional)</span>
          </label>
          <input
            id="proj-due"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

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
