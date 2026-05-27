import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppLayout } from './AppLayout'

describe('AppLayout', () => {
  it('renders header and bottom nav', () => {
    render(
      <MemoryRouter initialEntries={['/focus']}>
        <AppLayout />
      </MemoryRouter>,
    )
    expect(screen.getByText("Life Do's")).toBeInTheDocument()
    expect(screen.getByText('Focus')).toBeInTheDocument()
  })
})
