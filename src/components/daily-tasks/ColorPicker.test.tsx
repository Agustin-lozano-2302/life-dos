import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ColorPicker } from './ColorPicker'

describe('ColorPicker', () => {
  it('renders 8 preset color buttons', () => {
    render(<ColorPicker value={null} onChange={vi.fn()} />)
    const presets = screen.getAllByRole('button', { name: /^#/ })
    expect(presets).toHaveLength(8)
  })

  it('renders a "No color" button', () => {
    render(<ColorPicker value={null} onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: /no color/i })).toBeInTheDocument()
  })

  it('clicking a preset calls onChange with that hex value', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<ColorPicker value={null} onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: '#7c3aed' }))
    expect(onChange).toHaveBeenCalledWith('#7c3aed')
  })

  it('clicking "No color" calls onChange with null', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<ColorPicker value="#7c3aed" onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: /no color/i }))
    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('selected preset has aria-pressed="true"', () => {
    render(<ColorPicker value="#7c3aed" onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: '#7c3aed' })).toHaveAttribute('aria-pressed', 'true')
  })
})
