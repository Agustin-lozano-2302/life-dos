import { useDashboard } from '@/hooks/useDashboard'
import { useDashboardStore } from '@/store/dashboard'
import { useAllTasks } from '@/hooks/useAllTasks'
import { useProjects } from '@/hooks/useProjects'
import { PeriodSelector } from '@/components/dashboard/PeriodSelector'
import { ActivityHeatmap } from '@/components/dashboard/ActivityHeatmap'
import { HabitStatsCard } from '@/components/dashboard/HabitStatsCard'
import { GoalProgressSection } from '@/components/dashboard/GoalProgressSection'
import { ProjectStatsCard } from '@/components/dashboard/ProjectStatsCard'
import { NotesStatsCard } from '@/components/dashboard/NotesStatsCard'
import { SuggestionsSection } from '@/components/dashboard/SuggestionsSection'
import { generateSuggestions } from '@/lib/suggestions'
import { getTodayString } from '@/utils/date'

export default function DashboardPage() {
  const period = useDashboardStore((s) => s.period)
  const setPeriod = useDashboardStore((s) => s.setPeriod)
  const dismissed = useDashboardStore((s) => s.dismissedSuggestions)
  const dismissSuggestion = useDashboardStore((s) => s.dismissSuggestion)

  const { tasks } = useAllTasks()
  const { projects } = useProjects()
  const { completions, allCompletions, projectTasks, goals, notes, isLoading, range } = useDashboard()

  const today = getTodayString()

  const suggestions = generateSuggestions({
    goals,
    projects,
    completions: allCompletions,
    today,
  })

  if (isLoading) {
    return <div className="py-8 text-center text-sm text-muted-foreground">Loading…</div>
  }

  return (
    <div className="py-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Dashboard</h1>
      </div>

      <div className="mb-6">
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      <div className="space-y-4">
        <HabitStatsCard tasks={tasks} completions={completions} range={range} today={today} />

        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Activity — last year
          </h3>
          <ActivityHeatmap completions={allCompletions} today={today} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <GoalProgressSection goals={goals} />
          <ProjectStatsCard projects={projects} doneTasks={projectTasks} />
        </div>

        <NotesStatsCard notes={notes} />

        <SuggestionsSection
          suggestions={suggestions}
          dismissed={dismissed}
          onDismiss={dismissSuggestion}
        />
      </div>
    </div>
  )
}
