import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ProjectCard } from './ProjectCard'
import type { Project } from '@/types/projects'

const project: Project = {
  id: 'proj-1',
  title: 'My Project',
  description: 'A description',
  status: 'active',
  due_date: '2026-12-31',
  created_at: '2026-01-01T00:00:00Z',
}

function renderCard(props: Partial<Parameters<typeof ProjectCard>[0]> = {}) {
  return render(
    <MemoryRouter>
      <ProjectCard project={project} {...props} />
    </MemoryRouter>,
  )
}

describe('ProjectCard', () => {
  it('renders the project title', () => {
    renderCard()
    expect(screen.getByText('My Project')).toBeInTheDocument()
  })

  it('renders the description', () => {
    renderCard()
    expect(screen.getByText('A description')).toBeInTheDocument()
  })

  it('renders the status badge', () => {
    renderCard()
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('renders task count', () => {
    renderCard({ taskCount: 5, doneCount: 2 })
    expect(screen.getByText('5 tasks · 2 done')).toBeInTheDocument()
  })

  it('renders due date', () => {
    renderCard()
    expect(screen.getByText('2026-12-31')).toBeInTheDocument()
  })

  it('links to the project board', () => {
    renderCard()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/projects/proj-1')
  })
})
