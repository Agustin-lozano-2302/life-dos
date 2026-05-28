import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GlassSheet } from './GlassSheet'

describe('GlassSheet', () => {
  it('does not render when closed', () => {
    render(<GlassSheet open={false} onClose={vi.fn()}>content</GlassSheet>)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders children when open', () => {
    render(<GlassSheet open={true} onClose={vi.fn()}>panel content</GlassSheet>)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('panel content')).toBeInTheDocument()
  })

  it('calls onClose when Escape is pressed', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<GlassSheet open={true} onClose={onClose}>x</GlassSheet>)
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when backdrop is clicked', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    const { container } = render(<GlassSheet open={true} onClose={onClose}>x</GlassSheet>)
    // The backdrop is the first child of the fixed container
    const backdrop = container.querySelector('[aria-hidden]') as HTMLElement
    await user.click(backdrop)
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
