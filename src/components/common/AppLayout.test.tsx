import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppLayout } from './AppLayout'

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
  },
}))

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
