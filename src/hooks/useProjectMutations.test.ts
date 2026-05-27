import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useProjectMutations } from './useProjectMutations'
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
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useProjectMutations', () => {
  it('createProject calls createProject query', async () => {
    vi.mocked(queries.createProject).mockResolvedValue(mockProject)
    const { result } = renderHook(() => useProjectMutations(), { wrapper: makeWrapper() })
    await act(async () => { result.current.createProject({ title: 'My Project' }) })
    expect(queries.createProject).toHaveBeenCalledWith({ title: 'My Project' })
  })

  it('updateProject calls updateProject query', async () => {
    vi.mocked(queries.updateProject).mockResolvedValue(mockProject)
    const { result } = renderHook(() => useProjectMutations(), { wrapper: makeWrapper() })
    await act(async () => { result.current.updateProject({ id: 'proj-1', title: 'Renamed' }) })
    expect(queries.updateProject).toHaveBeenCalledWith({ id: 'proj-1', title: 'Renamed' })
  })

  it('deleteProject calls deleteProject query', async () => {
    vi.mocked(queries.deleteProject).mockResolvedValue(undefined)
    const { result } = renderHook(() => useProjectMutations(), { wrapper: makeWrapper() })
    await act(async () => { result.current.deleteProject('proj-1') })
    expect(queries.deleteProject).toHaveBeenCalledWith('proj-1')
  })

  it('createProjectTask calls createProjectTask query', async () => {
    vi.mocked(queries.createProjectTask).mockResolvedValue(mockTask)
    const { result } = renderHook(() => useProjectMutations(), { wrapper: makeWrapper() })
    await act(async () => {
      result.current.createProjectTask({ project_id: 'proj-1', title: 'Task 1' })
    })
    expect(queries.createProjectTask).toHaveBeenCalledWith({ project_id: 'proj-1', title: 'Task 1' })
  })

  it('updateProjectTask calls updateProjectTask query', async () => {
    vi.mocked(queries.updateProjectTask).mockResolvedValue(mockTask)
    const { result } = renderHook(() => useProjectMutations(), { wrapper: makeWrapper() })
    await act(async () => {
      result.current.updateProjectTask({ id: 'ptask-1', status: 'in_progress' })
    })
    expect(queries.updateProjectTask).toHaveBeenCalledWith({ id: 'ptask-1', status: 'in_progress' })
  })
})
