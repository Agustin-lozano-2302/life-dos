import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { TaskList } from './TaskList'
import type { DailyTask, TaskCompletion } from '@/types/daily-tasks'

const task1: DailyTask = {
  id: 'task-1', title: 'Morning run', days_of_week: [2], category: null, color: null, sort_order: null, created_at: '',
}
const task2: DailyTask = {
  id: 'task-2', title: 'Meditate', days_of_week: [2], category: null, color: null, sort_order: null, created_at: '',
}
const completion: TaskCompletion = {
  id: 'comp-1', task_id: 'task-1', date: '2026-05-27', created_at: '',
}

function renderList(tasks: DailyTask[], completions: TaskCompletion[]) {
  return render(
    <MemoryRouter>
      <TaskList tasks={tasks} completions={completions} onToggle={vi.fn()} />
    </MemoryRouter>,
  )
}

describe('TaskList', () => {
  it('renders only pending tasks (not completed ones)', () => {
    renderList([task1, task2], [completion])
    expect(screen.queryByText('Morning run')).not.toBeInTheDocument()
    expect(screen.getByText('Meditate')).toBeInTheDocument()
  })

  it('shows empty-state when no tasks are scheduled', () => {
    renderList([], [])
    expect(screen.getByText(/nothing scheduled/i)).toBeInTheDocument()
  })

  it('shows all-done message when all tasks are completed', () => {
    renderList([task1], [completion])
    expect(screen.getByText(/all done/i)).toBeInTheDocument()
  })
})
