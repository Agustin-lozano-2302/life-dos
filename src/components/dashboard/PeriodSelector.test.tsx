import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PeriodSelector } from './PeriodSelector'

describe('PeriodSelector', () => {
  it('renders all three options', () => {
    render(<PeriodSelector value="week" onChange={vi.fn()} />)
    expect(screen.getByText('Week')).toBeInTheDocument()
    expect(screen.getByText('Month')).toBeInTheDocument()
    expect(screen.getByText('Year')).toBeInTheDocument()
  })

  it('marks the current period as pressed', () => {
    render(<PeriodSelector value="month" onChange={vi.fn()} />)
    expect(screen.getByText('Month')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('Week')).toHaveAttribute('aria-pressed', 'false')
  })

  it('calls onChange when a period is clicked', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<PeriodSelector value="week" onChange={onChange} />)
    await user.click(screen.getByText('Year'))
    expect(onChange).toHaveBeenCalledWith('year')
  })
})
