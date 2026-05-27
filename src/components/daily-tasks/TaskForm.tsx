import { useState } from 'react'
import { cn } from '@/lib/utils'
import { DaySelector } from './DaySelector'
import { ColorPicker } from './ColorPicker'
import type { DailyTask, CreateTaskInput, UpdateTaskInput } from '@/types/daily-tasks'

interface TaskFormProps {
  initial?: DailyTask
  onSubmit: (data: CreateTaskInput | UpdateTaskInput) => void
  onCancel: () => void
  isPending?: boolean
}

export function TaskForm({ initial, onSubmit, onCancel, isPending = false }: TaskFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [days, setDays] = useState<number[]>(initial?.days_of_week ?? [new Date().getDay()])
  const [category, setCategory] = useState(initial?.category ?? '')
  const [color, setColor] = useState<string | null>(initial?.color ?? null)

  const canSubmit = title.trim().length > 0 && days.length > 0 && !isPending

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    onSubmit({
      ...(initial ? { id: initial.id } : {}),
      title: title.trim(),
      days_of_week: days,
      category: category.trim() || null,
      color,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-border bg-card p-4">
      <div>
        <label htmlFor="task-title" className="text-xs font-medium text-muted-foreground">
          Title
        </label>
        <input
          id="task-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Morning run"
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <div>
        <span className="text-xs font-medium text-muted-foreground">Days</span>
        <div className="mt-2">
          <DaySelector value={days} onChange={setDays} />
        </div>
      </div>

      <div>
        <label htmlFor="task-category" className="text-xs font-medium text-muted-foreground">
          Category{' '}
          <span className="text-muted-foreground/60">(optional)</span>
        </label>
        <input
          id="task-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g. Health, Work…"
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <div>
        <span className="text-xs font-medium text-muted-foreground">
          Color <span className="text-muted-foreground/60">(optional)</span>
        </span>
        <div className="mt-2">
          <ColorPicker value={color} onChange={setColor} />
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
