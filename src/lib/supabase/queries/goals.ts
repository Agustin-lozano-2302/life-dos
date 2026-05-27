import supabase from '@/lib/supabase/client'
import type { Goal, CreateGoalInput, UpdateGoalInput } from '@/types/goals'

export async function fetchGoals(): Promise<Goal[]> {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Goal[]
}

export async function createGoal(input: CreateGoalInput): Promise<Goal> {
  const { data, error } = await supabase
    .from('goals')
    .insert(input)
    .select()
    .single()
  if (error) throw error
  return data as Goal
}

export async function updateGoal({ id, ...rest }: UpdateGoalInput): Promise<Goal> {
  const { data, error } = await supabase
    .from('goals')
    .update(rest)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Goal
}

export async function deleteGoal(id: string): Promise<void> {
  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', id)
  if (error) throw error
}
