import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DaySelector } from './DaySelector'

describe('DaySelector', () => {
  it('renders all 7 day buttons', () => {
    render(<DaySelector value={[1]} onChange={vi.fn()} />)
    expect(screen.getByText('D')).toBeInTheDocument()
    expect(screen.getByText('L')).toBeInTheDocument()
    expect(screen.getByText('M')).toBeInTheDocument()
    expect(screen.getByText('X')).toBeInTheDocument()
    expect(screen.getByText('J')).toBeInTheDocument()
    expect(screen.getByText('V')).toBeInTheDocument()
    expect(screen.getByText('S')).toBeInTheDocument()
  })

  it('marks selected days as pressed', () => {
    render(<DaySelector value={[1, 3]} onChange={vi.fn()} />)
    // value=1 → L (Lunes), value=3 → X (Miércoles)
    const buttons = screen.getAllByRole('button')
    // L is index 1, X is index 3
    expect(buttons[1]).toHaveAttribute('aria-pressed', 'true')
    expect(buttons[3]).toHaveAttribute('aria-pressed', 'true')
    expect(buttons[2]).toHaveAttribute('aria-pressed', 'false')
  })

  it('clicking an inactive day adds it', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<DaySelector value={[1]} onChange={onChange} />)
    // V = Viernes = value 5
    await user.click(screen.getByText('V'))
    expect(onChange).toHaveBeenCalledWith([1, 5])
  })

  it('clicking an active day removes it when more than one is selected', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<DaySelector value={[1, 5]} onChange={onChange} />)
    // L = Lunes = value 1
    await user.click(screen.getByText('L'))
    expect(onChange).toHaveBeenCalledWith([5])
  })

  it('does not remove the last selected day', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<DaySelector value={[1]} onChange={onChange} />)
    // L = Lunes = value 1
    await user.click(screen.getByText('L'))
    expect(onChange).not.toHaveBeenCalled()
  })
})
