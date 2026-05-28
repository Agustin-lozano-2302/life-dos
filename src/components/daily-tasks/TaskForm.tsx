// src/components/daily-tasks/TaskForm.tsx
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
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-[18px] border border-white/[0.12] bg-white/7 p-4 backdrop-blur-2xl"
    >
      <div>
        <label htmlFor="task-title" className="text-xs font-semibold uppercase tracking-widest text-white/40">
          Título
        </label>
        <input
          id="task-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Morning run"
          className="mt-1.5 w-full rounded-[12px] border border-white/[0.12] bg-white/[0.05] px-3 py-2 text-sm text-white placeholder-white/25 outline-none focus:border-white/25"
        />
      </div>

      <div>
        <span className="text-xs font-semibold uppercase tracking-widest text-white/40">Días</span>
        <div className="mt-2">
          <DaySelector value={days} onChange={setDays} />
        </div>
      </div>

      <div>
        <label htmlFor="task-category" className="text-xs font-semibold uppercase tracking-widest text-white/40">
          Categoría <span className="normal-case text-white/25">(opcional)</span>
        </label>
        <input
          id="task-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g. Health, Work…"
          className="mt-1.5 w-full rounded-[12px] border border-white/[0.12] bg-white/[0.05] px-3 py-2 text-sm text-white placeholder-white/25 outline-none focus:border-white/25"
        />
      </div>

      <div>
        <span className="text-xs font-semibold uppercase tracking-widest text-white/40">
          Color <span className="normal-case text-white/25">(opcional)</span>
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
            'flex-1 rounded-[14px] bg-orange-500/25 py-2 text-sm font-medium text-orange-200 transition-opacity hover:bg-orange-500/35',
            !canSubmit && 'cursor-not-allowed opacity-40',
          )}
        >
          {isPending ? 'Guardando…' : 'Guardar'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-[14px] border border-white/[0.12] bg-white/7 px-4 py-2 text-sm font-medium text-white/60 hover:text-white"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
