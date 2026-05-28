// src/components/projects/ProjectCard.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ProjectCard } from './ProjectCard'
import type { Project } from '@/types/projects'

const project: Project = {
  id: 'p1',
  title: 'My Project',
  description: 'A test project',
  status: 'active',
  due_date: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

function render_(props = {}) {
  return render(
    <MemoryRouter>
      <ProjectCard project={project} taskCount={5} doneCount={2} {...props} />
    </MemoryRouter>,
  )
}

describe('ProjectCard', () => {
  it('renders project title', () => {
    render_()
    expect(screen.getByText('My Project')).toBeInTheDocument()
  })

  it('renders task counts', () => {
    render_()
    expect(screen.getByText(/5 task/)).toBeInTheDocument()
  })

  it('renders status badge', () => {
    render_()
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('links to the project board', () => {
    render_()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/projects/p1')
  })
})
