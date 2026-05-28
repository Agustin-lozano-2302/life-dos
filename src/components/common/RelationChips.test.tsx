import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RelationChips } from './RelationChips'
import type { NoteEntityType } from '@/types/notes'

const relations = [
  { id: 'r1', entityType: 'goal' as NoteEntityType, entityId: 'g1', label: 'Run 100km' },
  { id: 'r2', entityType: 'daily_task' as NoteEntityType, entityId: 't1', label: 'Morning run' },
]

describe('RelationChips', () => {
  it('renders a chip for each relation', () => {
    render(<RelationChips relations={relations} onAddLink={vi.fn()} onRemoveLink={vi.fn()} />)
    expect(screen.getByText('Run 100km')).toBeInTheDocument()
    expect(screen.getByText('Morning run')).toBeInTheDocument()
  })

  it('shows "+ Vincular" button', () => {
    render(<RelationChips relations={[]} onAddLink={vi.fn()} onRemoveLink={vi.fn()} />)
    expect(screen.getByRole('button', { name: /vincular/i })).toBeInTheDocument()
  })

  it('calls onAddLink when "+ Vincular" is clicked', async () => {
    const onAddLink = vi.fn()
    const user = userEvent.setup()
    render(<RelationChips relations={[]} onAddLink={onAddLink} onRemoveLink={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /vincular/i }))
    expect(onAddLink).toHaveBeenCalledTimes(1)
  })

  it('calls onRemoveLink when × on a chip is clicked', async () => {
    const onRemoveLink = vi.fn()
    const user = userEvent.setup()
    render(<RelationChips relations={relations} onAddLink={vi.fn()} onRemoveLink={onRemoveLink} />)
    await user.click(screen.getByRole('button', { name: /remove link to run 100km/i }))
    expect(onRemoveLink).toHaveBeenCalledWith('r1')
  })
})
