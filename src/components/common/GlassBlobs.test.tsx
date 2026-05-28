import { render } from '@testing-library/react'
import { GlassBlobs } from './GlassBlobs'

describe('GlassBlobs', () => {
  it('renders without crashing for every domain', () => {
    const domains = ['habitos', 'projects', 'goals', 'notes', 'dashboard'] as const
    for (const domain of domains) {
      const { unmount } = render(<GlassBlobs domain={domain} />)
      unmount()
    }
  })

  it('is aria-hidden', () => {
    const { container } = render(<GlassBlobs domain="habitos" />)
    expect(container.firstChild).toHaveAttribute('aria-hidden')
  })

  it('renders blob elements', () => {
    const { container } = render(<GlassBlobs domain="goals" />)
    const blobs = container.querySelectorAll('.rounded-full')
    expect(blobs.length).toBeGreaterThanOrEqual(2)
  })
})
