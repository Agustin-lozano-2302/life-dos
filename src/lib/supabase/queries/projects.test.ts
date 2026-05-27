import { describe, it, expect, vi, beforeEach } from 'vitest'
import supabase from '@/lib/supabase/client'
import {
  fetchProjects,
  fetchProject,
  fetchProjectTasks,
  createProject,
  updateProject,
  deleteProject,
  createProjectTask,
  updateProjectTask,
  deleteProjectTask,
} from './projects'
import type { Project, ProjectTask } from '@/types/projects'

vi.mock('@/lib/supabase/client')

const mockFrom = vi.mocked(supabase.from)

const mockProject: Project = {
  id: 'proj-1',
  title: 'My Project',
  description: 'A test project',
  status: 'active',
  due_date: '2026-12-31',
  created_at: '2026-01-01T00:00:00Z',
}

const mockTask: ProjectTask = {
  id: 'ptask-1',
  project_id: 'proj-1',
  title: 'Setup repo',
  description: null,
  status: 'todo',
  sort_order: null,
  created_at: '2026-01-01T00:00:00Z',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('fetchProjects', () => {
  it('returns all projects ordered by created_at', async () => {
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [mockProject], error: null }),
      }),
    } as any)

    const result = await fetchProjects()
    expect(result).toEqual([mockProject])
    expect(mockFrom).toHaveBeenCalledWith('projects')
  })

  it('throws when supabase returns an error', async () => {
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
      }),
    } as any)

    await expect(fetchProjects()).rejects.toMatchObject({ message: 'DB error' })
  })
})

describe('fetchProject', () => {
  it('returns a single project by id', async () => {
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockProject, error: null }),
        }),
      }),
    } as any)

    const result = await fetchProject('proj-1')
    expect(result).toEqual(mockProject)
  })
})

describe('fetchProjectTasks', () => {
  it('returns tasks for a given project', async () => {
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [mockTask], error: null }),
        }),
      }),
    } as any)

    const result = await fetchProjectTasks('proj-1')
    expect(result).toEqual([mockTask])
  })
})

describe('createProject', () => {
  it('inserts and returns the new project', async () => {
    mockFrom.mockReturnValueOnce({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockProject, error: null }),
        }),
      }),
    } as any)

    const result = await createProject({ title: 'My Project' })
    expect(result).toEqual(mockProject)
  })
})

describe('updateProject', () => {
  it('updates and returns the modified project', async () => {
    mockFrom.mockReturnValueOnce({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { ...mockProject, title: 'Renamed' }, error: null }),
          }),
        }),
      }),
    } as any)

    const result = await updateProject({ id: 'proj-1', title: 'Renamed' })
    expect(result.title).toBe('Renamed')
  })
})

describe('deleteProject', () => {
  it('calls delete with the project id', async () => {
    const eqMock = vi.fn().mockResolvedValue({ error: null })
    mockFrom.mockReturnValueOnce({
      delete: vi.fn().mockReturnValue({ eq: eqMock }),
    } as any)

    await deleteProject('proj-1')
    expect(eqMock).toHaveBeenCalledWith('id', 'proj-1')
  })
})

describe('createProjectTask', () => {
  it('inserts and returns the new task', async () => {
    mockFrom.mockReturnValueOnce({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockTask, error: null }),
        }),
      }),
    } as any)

    const result = await createProjectTask({ project_id: 'proj-1', title: 'Setup repo' })
    expect(result).toEqual(mockTask)
  })
})

describe('updateProjectTask', () => {
  it('updates the task status', async () => {
    mockFrom.mockReturnValueOnce({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { ...mockTask, status: 'in_progress' }, error: null }),
          }),
        }),
      }),
    } as any)

    const result = await updateProjectTask({ id: 'ptask-1', status: 'in_progress' })
    expect(result.status).toBe('in_progress')
  })
})

describe('deleteProjectTask', () => {
  it('calls delete with the task id', async () => {
    const eqMock = vi.fn().mockResolvedValue({ error: null })
    mockFrom.mockReturnValueOnce({
      delete: vi.fn().mockReturnValue({ eq: eqMock }),
    } as any)

    await deleteProjectTask('ptask-1')
    expect(eqMock).toHaveBeenCalledWith('id', 'ptask-1')
  })
})
