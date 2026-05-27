import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SuggestionsSection } from './SuggestionsSection'
import type { Suggestion } from '@/lib/suggestions'

const suggestions: Suggestion[] = [
  { id: 's1', text: 'You have been doing great!' },
  { id: 's2', text: 'Project X is paused.' },
]

describe('SuggestionsSection', () => {
  it('renders visible suggestions', () => {
    render(<SuggestionsSection suggestions={suggestions} dismissed={[]} onDismiss={vi.fn()} />)
    expect(screen.getByText('You have been doing great!')).toBeInTheDocument()
    expect(screen.getByText('Project X is paused.')).toBeInTheDocument()
  })

  it('hides dismissed suggestions', () => {
    render(<SuggestionsSection suggestions={suggestions} dismissed={['s1']} onDismiss={vi.fn()} />)
    expect(screen.queryByText('You have been doing great!')).not.toBeInTheDocument()
    expect(screen.getByText('Project X is paused.')).toBeInTheDocument()
  })

  it('returns null when all dismissed', () => {
    const { container } = render(
      <SuggestionsSection suggestions={suggestions} dismissed={['s1', 's2']} onDismiss={vi.fn()} />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('calls onDismiss when ✕ is clicked', async () => {
    const onDismiss = vi.fn()
    const user = userEvent.setup()
    render(<SuggestionsSection suggestions={[suggestions[0]]} dismissed={[]} onDismiss={onDismiss} />)
    await user.click(screen.getByLabelText('Dismiss suggestion'))
    expect(onDismiss).toHaveBeenCalledWith('s1')
  })
})
