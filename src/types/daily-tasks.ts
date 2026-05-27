export interface DailyTask {
  id: string
  title: string
  days_of_week: number[]
  category: string | null
  color: string | null
  sort_order: number | null
  created_at: string
}

export interface TaskCompletion {
  id: string
  task_id: string
  date: string
  created_at: string
}

export interface CreateTaskInput {
  title: string
  days_of_week: number[]
  category?: string | null
  color?: string | null
}

export interface UpdateTaskInput {
  id: string
  title?: string
  days_of_week?: number[]
  category?: string | null
  color?: string | null
}
