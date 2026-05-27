import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { BottomNav } from './BottomNav'

function renderNav(path = '/focus') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <BottomNav />
    </MemoryRouter>,
  )
}

describe('BottomNav', () => {
  it('renders all four tab labels', () => {
    renderNav()
    expect(screen.getByText('Focus')).toBeInTheDocument()
    expect(screen.getByText('Projects')).toBeInTheDocument()
    expect(screen.getByText('Goals')).toBeInTheDocument()
    expect(screen.getByText('Notes')).toBeInTheDocument()
  })

  it('each tab links to the correct route', () => {
    renderNav()
    expect(screen.getByText('Focus').closest('a')).toHaveAttribute('href', '/focus')
    expect(screen.getByText('Projects').closest('a')).toHaveAttribute('href', '/projects')
    expect(screen.getByText('Goals').closest('a')).toHaveAttribute('href', '/goals')
    expect(screen.getByText('Notes').closest('a')).toHaveAttribute('href', '/notes')
  })

  it('marks the current route with aria-current="page"', () => {
    renderNav('/projects')
    expect(screen.getByText('Projects').closest('a')).toHaveAttribute('aria-current', 'page')
  })

  it('does not mark inactive tabs with aria-current', () => {
    renderNav('/projects')
    expect(screen.getByText('Focus').closest('a')).not.toHaveAttribute('aria-current', 'page')
  })
})
