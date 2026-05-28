import { render, screen } from '@testing-library/react'
import { GlassCard } from './GlassCard'

describe('GlassCard', () => {
  it('renders children', () => {
    render(<GlassCard>hello</GlassCard>)
    expect(screen.getByText('hello')).toBeInTheDocument()
  })

  it('applies neutral glass classes by default', () => {
    const { container } = render(<GlassCard>x</GlassCard>)
    const el = container.firstChild as HTMLElement
    expect(el.className).toMatch(/backdrop-blur/)
    expect(el.className).toMatch(/rounded/)
  })

  it('merges extra className', () => {
    const { container } = render(<GlassCard className="p-4">x</GlassCard>)
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain('p-4')
  })

  it('applies custom hex style when tint=custom', () => {
    const { container } = render(<GlassCard tint="custom" hex="#6366f1">x</GlassCard>)
    const el = container.firstChild as HTMLElement
    expect(el.style.backgroundColor).toBeTruthy()
  })
})
