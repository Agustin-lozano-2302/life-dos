import { useState } from 'react'
import { useGoals } from '@/hooks/useGoals'
import { useGoalMutations } from '@/hooks/useGoalMutations'
import { useAllTasks } from '@/hooks/useAllTasks'
import { useProjects } from '@/hooks/useProjects'
import { GoalCard } from '@/components/goals/GoalCard'
import { GoalForm } from '@/components/goals/GoalForm'
import type { Goal, CreateGoalInput, UpdateGoalInput } from '@/types/goals'

export default function GoalsPage() {
  const { goals, isLoading } = useGoals()
  const { tasks } = useAllTasks()
  const { projects } = useProjects()
  const { createGoal, updateGoal, deleteGoal, isCreating, isUpdating } = useGoalMutations()

  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<Goal | null>(null)

  function handleCreate(data: CreateGoalInput | UpdateGoalInput) {
    createGoal(data as CreateGoalInput, { onSuccess: () => setShowCreate(false) })
  }

  function handleUpdate(data: CreateGoalInput | UpdateGoalInput) {
    updateGoal(data as UpdateGoalInput, { onSuccess: () => setEditing(null) })
  }

  function handleDelete(id: string) {
    if (!window.confirm('Delete this goal?')) return
    deleteGoal(id)
  }

  const taskMap = Object.fromEntries(tasks.map((t) => [t.id, t.title]))
  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p.title]))

  if (isLoading) {
    return <div className="py-8 text-center text-sm text-muted-foreground">Loading…</div>
  }

  return (
    <div className="py-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Goals</h1>
      </div>

      {editing ? (
        <div className="mb-4">
          <GoalForm
            initial={editing}
            dailyTasks={tasks}
            projects={projects}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
            isPending={isUpdating}
          />
        </div>
      ) : showCreate ? (
        <div className="mb-4">
          <GoalForm
            dailyTasks={tasks}
            projects={projects}
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
            isPending={isCreating}
          />
        </div>
      ) : (
        <button
          onClick={() => setShowCreate(true)}
          className="mb-4 w-full rounded-xl border border-dashed border-border py-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
        >
          + New goal
        </button>
      )}

      <div className="space-y-3">
        {goals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            onEdit={setEditing}
            onDelete={handleDelete}
            linkedTaskTitle={goal.linked_daily_task_id ? taskMap[goal.linked_daily_task_id] : undefined}
            linkedProjectTitle={goal.linked_project_id ? projectMap[goal.linked_project_id] : undefined}
          />
        ))}
        {goals.length === 0 && !showCreate && !editing && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No goals yet. Create one above.
          </p>
        )}
      </div>
    </div>
  )
}
