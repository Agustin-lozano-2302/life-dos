import { useQuery } from '@tanstack/react-query'
import { useDashboardStore } from '@/store/dashboard'
import {
  fetchCompletionsByRange,
  fetchAllCompletions,
  fetchProjectTasksByRange,
  fetchGoalSnapshots,
  fetchNoteActivityByRange,
} from '@/lib/supabase/queries/dashboard'
import { getTodayString } from '@/utils/date'

function getPeriodRange(period: 'week' | 'month' | 'year', today: string) {
  const end = today
  const d = new Date(today)
  if (period === 'week') d.setDate(d.getDate() - 6)
  else if (period === 'month') d.setDate(d.getDate() - 29)
  else d.setFullYear(d.getFullYear() - 1)
  return { start: d.toISOString().slice(0, 10), end }
}

export function useDashboard() {
  const period = useDashboardStore((s) => s.period)
  const today = getTodayString()
  const range = getPeriodRange(period, today)

  const completionsQuery = useQuery({
    queryKey: ['dashboard', 'completions', range],
    queryFn: () => fetchCompletionsByRange(range),
  })

  const allCompletionsQuery = useQuery({
    queryKey: ['dashboard', 'all-completions'],
    queryFn: fetchAllCompletions,
  })

  const projectTasksQuery = useQuery({
    queryKey: ['dashboard', 'project-tasks', range],
    queryFn: () => fetchProjectTasksByRange(range),
  })

  const goalsQuery = useQuery({
    queryKey: ['dashboard', 'goals'],
    queryFn: fetchGoalSnapshots,
  })

  const notesQuery = useQuery({
    queryKey: ['dashboard', 'notes', range],
    queryFn: () => fetchNoteActivityByRange(range),
  })

  return {
    range,
    completions: completionsQuery.data ?? [],
    allCompletions: allCompletionsQuery.data ?? [],
    projectTasks: projectTasksQuery.data ?? [],
    goals: goalsQuery.data ?? [],
    notes: notesQuery.data ?? [],
    isLoading:
      completionsQuery.isLoading ||
      allCompletionsQuery.isLoading ||
      projectTasksQuery.isLoading ||
      goalsQuery.isLoading ||
      notesQuery.isLoading,
  }
}
