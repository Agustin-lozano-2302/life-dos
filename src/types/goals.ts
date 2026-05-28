export interface Goal {
  id: string
  title: string
  target_value: number
  current_value: number
  unit: string
  deadline: string | null
  linked_daily_task_id: string | null
  linked_project_id: string | null
  created_at: string
  updated_at?: string
}

export interface CreateGoalInput {
  title: string
  target_value: number
  current_value?: number
  unit: string
  deadline?: string | null
  linked_daily_task_id?: string | null
  linked_project_id?: string | null
}

export interface UpdateGoalInput {
  id: string
  title?: string
  target_value?: number
  current_value?: number
  unit?: string
  deadline?: string | null
  linked_daily_task_id?: string | null
  linked_project_id?: string | null
}
