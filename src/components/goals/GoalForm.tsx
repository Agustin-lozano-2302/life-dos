import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { Goal, CreateGoalInput, UpdateGoalInput } from '@/types/goals'
import type { DailyTask } from '@/types/daily-tasks'
import type { Project } from '@/types/projects'

interface GoalFormProps {
  initial?: Goal
  dailyTasks: DailyTask[]
  projects: Project[]
  onSubmit: (data: CreateGoalInput | UpdateGoalInput) => void
  onCancel: () => void
  isPending?: boolean
}

export function GoalForm({ initial, dailyTasks, projects, onSubmit, onCancel, isPending = false }: GoalFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [targetValue, setTargetValue] = useState(String(initial?.target_value ?? ''))
  const [currentValue, setCurrentValue] = useState(String(initial?.current_value ?? '0'))
  const [unit, setUnit] = useState(initial?.unit ?? '')
  const [deadline, setDeadline] = useState(initial?.deadline ?? '')
  const [linkedTaskId, setLinkedTaskId] = useState(initial?.linked_daily_task_id ?? '')
  const [linkedProjectId, setLinkedProjectId] = useState(initial?.linked_project_id ?? '')

  const canSubmit =
    title.trim().length > 0 &&
    Number(targetValue) > 0 &&
    unit.trim().length > 0 &&
    !isPending

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    onSubmit({
      ...(initial ? { id: initial.id } : {}),
      title: title.trim(),
      target_value: Number(targetValue),
      current_value: Number(currentValue),
      unit: unit.trim(),
      deadline: deadline || null,
      linked_daily_task_id: linkedTaskId || null,
      linked_project_id: linkedProjectId || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-4">
      <div>
        <label htmlFor="goal-title" className="text-xs font-medium text-muted-foreground">Title</label>
        <input
          id="goal-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Read 20 books"
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label htmlFor="goal-current" className="text-xs font-medium text-muted-foreground">Current</label>
          <input
            id="goal-current"
            type="number"
            min={0}
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="goal-target" className="text-xs font-medium text-muted-foreground">Target</label>
          <input
            id="goal-target"
            type="number"
            min={1}
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="goal-unit" className="text-xs font-medium text-muted-foreground">Unit</label>
          <input
            id="goal-unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="books"
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      <div>
        <label htmlFor="goal-deadline" className="text-xs font-medium text-muted-foreground">
          Deadline <span className="text-muted-foreground/60">(optional)</span>
        </label>
        <input
          id="goal-deadline"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label htmlFor="goal-task" className="text-xs font-medium text-muted-foreground">
            Link daily task <span className="text-muted-foreground/60">(optional)</span>
          </label>
          <select
            id="goal-task"
            value={linkedTaskId}
            onChange={(e) => setLinkedTaskId(e.target.value)}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">None</option>
            {dailyTasks.map((t) => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label htmlFor="goal-project" className="text-xs font-medium text-muted-foreground">
            Link project <span className="text-muted-foreground/60">(optional)</span>
          </label>
          <select
            id="goal-project"
            value={linkedProjectId}
            onChange={(e) => setLinkedProjectId(e.target.value)}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">None</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
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
