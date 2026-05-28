import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DotMenu } from './DotMenu'
import type { DotMenuItem } from './DotMenu'

const items: DotMenuItem[] = [
  { label: 'Editar', onClick: vi.fn() },
  { label: 'Eliminar', destructive: true, onClick: vi.fn() },
]

describe('DotMenu', () => {
  beforeEach(() => {
    items.forEach(() => vi.clearAllMocks())
  })

  it('renders trigger button', () => {
    render(<DotMenu items={items} />)
    expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument()
  })

  it('menu is hidden initially', () => {
    render(<DotMenu items={items} />)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('shows menu on trigger click', async () => {
    const user = userEvent.setup()
    render(<DotMenu items={items} />)
    await user.click(screen.getByRole('button', { name: /open menu/i }))
    expect(screen.getByRole('menu')).toBeInTheDocument()
    expect(screen.getByText('Editar')).toBeInTheDocument()
    expect(screen.getByText('Eliminar')).toBeInTheDocument()
  })

  it('calls item onClick and closes menu', async () => {
    const user = userEvent.setup()
    render(<DotMenu items={items} />)
    await user.click(screen.getByRole('button', { name: /open menu/i }))
    await user.click(screen.getByRole('menuitem', { name: 'Editar' }))
    expect(items[0].onClick).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('closes menu on Escape key', async () => {
    const user = userEvent.setup()
    render(<DotMenu items={items} />)
    await user.click(screen.getByRole('button', { name: /open menu/i }))
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('applies destructive styling to destructive items', async () => {
    const user = userEvent.setup()
    render(<DotMenu items={items} />)
    await user.click(screen.getByRole('button', { name: /open menu/i }))
    const deleteBtn = screen.getByRole('menuitem', { name: 'Eliminar' })
    expect(deleteBtn.className).toMatch(/text-red/)
  })
})
