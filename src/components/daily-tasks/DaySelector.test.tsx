import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DaySelector } from './DaySelector'

describe('DaySelector', () => {
  it('renders all 7 day buttons', () => {
    render(<DaySelector value={[1]} onChange={vi.fn()} />)
    expect(screen.getByText('Sun')).toBeInTheDocument()
    expect(screen.getByText('Mon')).toBeInTheDocument()
    expect(screen.getByText('Tue')).toBeInTheDocument()
    expect(screen.getByText('Wed')).toBeInTheDocument()
    expect(screen.getByText('Thu')).toBeInTheDocument()
    expect(screen.getByText('Fri')).toBeInTheDocument()
    expect(screen.getByText('Sat')).toBeInTheDocument()
  })

  it('marks selected days as pressed', () => {
    render(<DaySelector value={[1, 3]} onChange={vi.fn()} />)
    expect(screen.getByText('Mon')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('Wed')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('Tue')).toHaveAttribute('aria-pressed', 'false')
  })

  it('clicking an inactive day adds it', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<DaySelector value={[1]} onChange={onChange} />)
    await user.click(screen.getByText('Fri'))
    expect(onChange).toHaveBeenCalledWith([1, 5])
  })

  it('clicking an active day removes it when more than one is selected', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<DaySelector value={[1, 5]} onChange={onChange} />)
    await user.click(screen.getByText('Mon'))
    expect(onChange).toHaveBeenCalledWith([5])
  })

  it('does not remove the last selected day', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<DaySelector value={[1]} onChange={onChange} />)
    await user.click(screen.getByText('Mon'))
    expect(onChange).not.toHaveBeenCalled()
  })
})
