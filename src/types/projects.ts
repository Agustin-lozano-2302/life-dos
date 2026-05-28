export type ProjectStatus = 'active' | 'paused' | 'completed' | 'archived'
export type ProjectTaskStatus = 'todo' | 'in_progress' | 'review' | 'done'

export interface Project {
  id: string
  title: string
  description: string | null
  status: ProjectStatus
  due_date: string | null
  created_at: string
  updated_at?: string
}

export interface ProjectTask {
  id: string
  project_id: string
  title: string
  description: string | null
  status: ProjectTaskStatus
  sort_order: number | null
  created_at: string
  updated_at?: string
}

export interface CreateProjectInput {
  title: string
  description?: string | null
  status?: ProjectStatus
  due_date?: string | null
}

export interface UpdateProjectInput {
  id: string
  title?: string
  description?: string | null
  status?: ProjectStatus
  due_date?: string | null
}

export interface CreateProjectTaskInput {
  project_id: string
  title: string
  description?: string | null
  status?: ProjectTaskStatus
}

export interface UpdateProjectTaskInput {
  id: string
  title?: string
  description?: string | null
  status?: ProjectTaskStatus
}
