import supabase from '@/lib/supabase/client'
import type { TaskCompletion } from '@/types/daily-tasks'
import type { ProjectTask } from '@/types/projects'
import type { Goal } from '@/types/goals'
import type { Note } from '@/types/notes'

export interface DateRange {
  start: string
  end: string
}

export async function fetchCompletionsByRange(range: DateRange): Promise<TaskCompletion[]> {
  const { data, error } = await supabase
    .from('task_completions')
    .select('*')
    .gte('date', range.start)
    .lte('date', range.end)
    .order('date', { ascending: true })
  if (error) throw error
  return data as TaskCompletion[]
}

export async function fetchAllCompletions(): Promise<TaskCompletion[]> {
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
  const { data, error } = await supabase
    .from('task_completions')
    .select('*')
    .gte('date', oneYearAgo.toISOString().slice(0, 10))
    .order('date', { ascending: true })
  if (error) throw error
  return data as TaskCompletion[]
}

export async function fetchProjectTasksByRange(range: DateRange): Promise<ProjectTask[]> {
  const { data, error } = await supabase
    .from('project_tasks')
    .select('*')
    .eq('status', 'done')
    .gte('created_at', range.start)
    .lte('created_at', range.end + 'T23:59:59Z')
  if (error) throw error
  return data as ProjectTask[]
}

export async function fetchGoalSnapshots(): Promise<Goal[]> {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Goal[]
}

export async function fetchNoteActivityByRange(range: DateRange): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .gte('created_at', range.start)
    .lte('created_at', range.end + 'T23:59:59Z')
  if (error) throw error
  return data as Note[]
}
