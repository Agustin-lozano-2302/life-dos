import type { DailyTask, TaskCompletion } from '@/types/daily-tasks'

function calcCompletionRate(tasks: DailyTask[], completions: TaskCompletion[], range: { start: string; end: string }): number {
  if (tasks.length === 0) return 0
  const days: string[] = []
  const d = new Date(range.start)
  const end = new Date(range.end)
  while (d <= end) {
    days.push(d.toISOString().slice(0, 10))
    d.setDate(d.getDate() + 1)
  }
  let expected = 0
  let done = 0
  for (const day of days) {
    const dayOfWeek = new Date(day).getDay()
    const scheduled = tasks.filter((t) => t.days_of_week.includes(dayOfWeek))
    expected += scheduled.length
    done += completions.filter((c) => c.date === day && scheduled.some((t) => t.id === c.task_id)).length
  }
  return expected === 0 ? 0 : Math.round((done / expected) * 100)
}

function calcBestStreak(completions: TaskCompletion[], today: string): number {
  const completedDays = new Set(completions.map((c) => c.date))
  let streak = 0
  const d = new Date(today)
  while (completedDays.has(d.toISOString().slice(0, 10))) {
    streak++
    d.setDate(d.getDate() - 1)
  }
  return streak
}

interface HabitStatsCardProps {
  tasks: DailyTask[]
  completions: TaskCompletion[]
  range: { start: string; end: string }
  today: string
}

export function HabitStatsCard({ tasks, completions, range, today }: HabitStatsCardProps) {
  const rate = calcCompletionRate(tasks, completions, range)
  const streak = calcBestStreak(completions, today)

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Daily habits
      </h3>
      <div className="flex gap-6">
        <div>
          <p className="text-2xl font-bold text-primary">{rate}%</p>
          <p className="text-xs text-muted-foreground">completion rate</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{streak}</p>
          <p className="text-xs text-muted-foreground">day streak</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{completions.length}</p>
          <p className="text-xs text-muted-foreground">completions</p>
        </div>
      </div>
    </div>
  )
}
