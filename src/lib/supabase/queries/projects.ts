import supabase from '@/lib/supabase/client'
import type {
  Project,
  ProjectTask,
  CreateProjectInput,
  UpdateProjectInput,
  CreateProjectTaskInput,
  UpdateProjectTaskInput,
} from '@/types/projects'

export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Project[]
}

export async function fetchProject(id: string): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as Project
}

export async function fetchProjectTasks(projectId: string): Promise<ProjectTask[]> {
  const { data, error } = await supabase
    .from('project_tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data as ProjectTask[]
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .insert(input)
    .select()
    .single()
  if (error) throw error
  return data as Project
}

export async function updateProject({ id, ...rest }: UpdateProjectInput): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .update(rest)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Project
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function createProjectTask(input: CreateProjectTaskInput): Promise<ProjectTask> {
  const { data, error } = await supabase
    .from('project_tasks')
    .insert(input)
    .select()
    .single()
  if (error) throw error
  return data as ProjectTask
}

export async function updateProjectTask({ id, ...rest }: UpdateProjectTaskInput): Promise<ProjectTask> {
  const { data, error } = await supabase
    .from('project_tasks')
    .update(rest)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as ProjectTask
}

export async function deleteProjectTask(id: string): Promise<void> {
  const { error } = await supabase
    .from('project_tasks')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function fetchAllProjectTasks(): Promise<ProjectTask[]> {
  const { data, error } = await supabase
    .from('project_tasks')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data as ProjectTask[]
}
