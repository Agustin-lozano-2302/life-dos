import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useProjects, useProject, useProjectTasks } from './useProjects'
import * as queries from '@/lib/supabase/queries/projects'
import type { Project, ProjectTask } from '@/types/projects'

vi.mock('@/lib/supabase/queries/projects')

const mockProject: Project = {
  id: 'proj-1',
  title: 'My Project',
  description: null,
  status: 'active',
  due_date: null,
  created_at: '2026-01-01T00:00:00Z',
}

const mockTask: ProjectTask = {
  id: 'ptask-1',
  project_id: 'proj-1',
  title: 'Task 1',
  description: null,
  status: 'todo',
  sort_order: null,
  created_at: '2026-01-01T00:00:00Z',
}

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useProjects', () => {
  it('returns projects when loaded', async () => {
    vi.mocked(queries.fetchProjects).mockResolvedValue([mockProject])
    const { result } = renderHook(() => useProjects(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.projects).toEqual([mockProject])
  })

  it('returns empty array while loading', () => {
    vi.mocked(queries.fetchProjects).mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useProjects(), { wrapper: makeWrapper() })
    expect(result.current.projects).toEqual([])
    expect(result.current.isLoading).toBe(true)
  })
})

describe('useProject', () => {
  it('returns a single project when loaded', async () => {
    vi.mocked(queries.fetchProject).mockResolvedValue(mockProject)
    const { result } = renderHook(() => useProject('proj-1'), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.project).toEqual(mockProject)
  })
})

describe('useProjectTasks', () => {
  it('returns tasks when loaded', async () => {
    vi.mocked(queries.fetchProjectTasks).mockResolvedValue([mockTask])
    const { result } = renderHook(() => useProjectTasks('proj-1'), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.tasks).toEqual([mockTask])
  })
})
