import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppHeader } from './AppHeader'

describe('AppHeader', () => {
  beforeEach(() => {
    // Start each test in a known state: dark mode active
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  })

  afterEach(() => {
    document.documentElement.classList.remove('dark')
    localStorage.clear()
  })

  it("renders the app name", () => {
    render(<AppHeader />)
    expect(screen.getByText("Life Do's")).toBeInTheDocument()
  })

  it('renders a theme toggle button', () => {
    render(<AppHeader />)
    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument()
  })

  it('clicking the toggle button removes the dark class', async () => {
    const user = userEvent.setup()
    render(<AppHeader />)
    await user.click(screen.getByRole('button', { name: /toggle theme/i }))
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
