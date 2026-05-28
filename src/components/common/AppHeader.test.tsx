import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AppHeader } from './AppHeader'

vi.mock('@/lib/supabase/client', () => ({
  default: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
  },
}))

describe('AppHeader', () => {
  it("renders the app name", () => {
    render(<AppHeader />)
    expect(screen.getByText("Life Do's")).toBeInTheDocument()
  })

  it('does not render a sign-out button when no user is logged in', () => {
    render(<AppHeader />)
    expect(screen.queryByRole('button', { name: /sign out/i })).not.toBeInTheDocument()
  })
})
