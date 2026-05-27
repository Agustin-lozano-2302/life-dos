import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ActivityHeatmap } from './ActivityHeatmap'
import type { TaskCompletion } from '@/types/daily-tasks'

const completions: TaskCompletion[] = [
  { id: 'c1', task_id: 't1', date: '2026-05-20', created_at: '' },
  { id: 'c2', task_id: 't2', date: '2026-05-20', created_at: '' },
]

describe('ActivityHeatmap', () => {
  it('renders without crashing', () => {
    render(<ActivityHeatmap completions={completions} today="2026-05-27" />)
    expect(screen.getByText('1 year')).toBeInTheDocument()
    expect(screen.getByText('Today')).toBeInTheDocument()
  })

  it('renders legend', () => {
    render(<ActivityHeatmap completions={[]} today="2026-05-27" />)
    expect(screen.getByText('Less')).toBeInTheDocument()
    expect(screen.getByText('More')).toBeInTheDocument()
  })

  it('shows tooltip text for a day with completions', () => {
    render(<ActivityHeatmap completions={completions} today="2026-05-27" />)
    const cell = document.querySelector('[title="2026-05-20: 2 completions"]')
    expect(cell).toBeTruthy()
  })
})
