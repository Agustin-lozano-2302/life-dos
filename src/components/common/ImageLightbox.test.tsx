import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ImageLightbox } from './ImageLightbox'

describe('ImageLightbox', () => {
  it('renders nothing when src is null', () => {
    render(<ImageLightbox src={null} alt="photo" onClose={vi.fn()} />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('renders image when src is provided', () => {
    render(<ImageLightbox src="https://example.com/photo.png" alt="A photo" onClose={vi.fn()} />)
    expect(screen.getByRole('img', { name: 'A photo' })).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<ImageLightbox src="https://example.com/photo.png" alt="photo" onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: /close/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when backdrop is clicked', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<ImageLightbox src="https://example.com/photo.png" alt="photo" onClose={onClose} />)
    const backdrop = document.body.querySelector('.fixed') as HTMLElement
    await user.click(backdrop)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose on Escape key', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<ImageLightbox src="https://example.com/photo.png" alt="photo" onClose={onClose} />)
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
