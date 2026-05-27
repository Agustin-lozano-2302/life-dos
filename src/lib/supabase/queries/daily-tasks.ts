import supabase from '@/lib/supabase/client'
import type { DailyTask, TaskCompletion, CreateTaskInput, UpdateTaskInput } from '@/types/daily-tasks'

export async function fetchTodayTasks(today: string): Promise<DailyTask[]> {
  const dayOfWeek = new Date(today).getDay()
  const { data, error } = await supabase
    .from('daily_tasks')
    .select('*')
    .contains('days_of_week', [dayOfWeek])
    .order('created_at', { ascending: true })
  if (error) throw error
  return data as DailyTask[]
}

export async function fetchAllTasks(): Promise<DailyTask[]> {
  const { data, error } = await supabase
    .from('daily_tasks')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data as DailyTask[]
}

export async function fetchTodayCompletions(today: string): Promise<TaskCompletion[]> {
  const { data, error } = await supabase
    .from('task_completions')
    .select('*')
    .eq('date', today)
  if (error) throw error
  return data as TaskCompletion[]
}

export async function createTask(input: CreateTaskInput): Promise<DailyTask> {
  const { data, error } = await supabase
    .from('daily_tasks')
    .insert(input)
    .select()
    .single()
  if (error) throw error
  return data as DailyTask
}

export async function updateTask({ id, ...rest }: UpdateTaskInput): Promise<DailyTask> {
  const { data, error } = await supabase
    .from('daily_tasks')
    .update(rest)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as DailyTask
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase
    .from('daily_tasks')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function upsertCompletion(taskId: string, date: string): Promise<void> {
  const { error } = await supabase
    .from('task_completions')
    .upsert({ task_id: taskId, date })
  if (error) throw error
}

export async function deleteCompletion(taskId: string, date: string): Promise<void> {
  const { error } = await supabase
    .from('task_completions')
    .delete()
    .eq('task_id', taskId)
    .eq('date', date)
  if (error) throw error
}
