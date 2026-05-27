import type { Goal } from '@/types/goals'
import type { Project } from '@/types/projects'
import type { TaskCompletion } from '@/types/daily-tasks'

export interface Suggestion {
  id: string
  text: string
}

interface SuggestionInput {
  goals: Goal[]
  projects: Project[]
  completions: TaskCompletion[]
  today: string
}

export function generateSuggestions({ goals, projects, completions, today }: SuggestionInput): Suggestion[] {
  const suggestions: Suggestion[] = []

  // Goals approaching deadline at high progress
  for (const goal of goals) {
    if (!goal.deadline) continue
    const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date(today).getTime()) / 86_400_000)
    const pct = Math.round((goal.current_value / goal.target_value) * 100)

    if (daysLeft > 0 && daysLeft <= 14 && pct < 80) {
      suggestions.push({
        id: `goal-deadline-${goal.id}`,
        text: `"${goal.title}" is at ${pct}% but the deadline is in ${daysLeft} day${daysLeft === 1 ? '' : 's'}.`,
      })
    }
  }

  // Goals at 100%
  for (const goal of goals) {
    const pct = Math.round((goal.current_value / goal.target_value) * 100)
    if (pct >= 100) {
      suggestions.push({
        id: `goal-done-${goal.id}`,
        text: `"${goal.title}" is at 100%. Consider archiving or updating the target.`,
      })
    }
  }

  // Paused projects
  const paused = projects.filter((p) => p.status === 'paused')
  for (const project of paused.slice(0, 1)) {
    suggestions.push({
      id: `project-paused-${project.id}`,
      text: `"${project.title}" has been paused. Ready to resume?`,
    })
  }

  // Habit streak — find the best streak in the last 7 days
  const last7Days = new Set<string>()
  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    last7Days.add(d.toISOString().slice(0, 10))
  }
  const recentTaskIds = new Set(
    completions.filter((c) => last7Days.has(c.date)).map((c) => c.task_id),
  )
  if (recentTaskIds.size > 0) {
    suggestions.push({
      id: 'habit-streak',
      text: `You completed ${recentTaskIds.size} different habit${recentTaskIds.size === 1 ? '' : 's'} in the last 7 days. Keep it up!`,
    })
  }

  return suggestions.slice(0, 3)
}
