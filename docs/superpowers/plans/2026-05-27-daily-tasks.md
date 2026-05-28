# Daily Tasks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Daily Tasks feature — a Focus page showing today's recurring habits with a completion toggle, and a Manage page for creating, editing, and deleting tasks.

**Architecture:** Two routes (`/focus`, `/focus/manage`). All server state via React Query + Supabase — no Zustand for task data. Optimistic updates on the completion toggle. All DB calls go through `src/lib/supabase/queries/daily-tasks.ts`; components never import the supabase client.

**Tech Stack:** React 19, TypeScript (strict), TanStack Query v5, Supabase (project `ckrwpretboflbusecdde`, region `sa-east-1`), Vitest + React Testing Library v16, lucide-react, Tailwind CSS v4, shadcn/ui

---

## File Map

### Created

```
src/
  types/
    daily-tasks.ts
  lib/supabase/queries/
    daily-tasks.ts
    daily-tasks.test.ts
  hooks/
    useTodayTasks.ts
    useTodayTasks.test.ts
    useAllTasks.ts
    useAllTasks.test.ts
    useTaskMutations.ts
    useTaskMutations.test.ts
  components/daily-tasks/
    DaySelector.tsx
    DaySelector.test.tsx
    ColorPicker.tsx
    ColorPicker.test.tsx
    TaskCard.tsx
    TaskCard.test.tsx
    TaskList.tsx
    TaskList.test.tsx
    DoneSection.tsx
    DoneSection.test.tsx
    TaskForm.tsx
    TaskForm.test.tsx
  pages/
    TasksManagePage.tsx
```

### Modified

```
src/
  App.tsx                — add /focus/manage route
  pages/FocusPage.tsx    — replace stub with full implementation
package.json             — update supabase:types script
```

---

## Task 1: Database migration and TypeScript types

**Files:**
- Supabase migration (applied via MCP tool)
- Modify: `package.json`
- Modify: `src/lib/supabase/types.ts` (regenerated)
- Create: `src/types/daily-tasks.ts`

- [ ] **Step 1.1: Apply the migration using the Supabase MCP tool**

Use the `mcp__claude_ai_Supabase__apply_migration` tool with:
- `project_id`: `ckrwpretboflbusecdde`
- `name`: `create_daily_tasks`
- `query`:

```sql
create table if not exists daily_tasks (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  days_of_week integer[] not null,
  category     text,
  color        text,
  sort_order   integer,
  created_at   timestamptz not null default now()
);

create table if not exists task_completions (
  id         uuid primary key default gen_random_uuid(),
  task_id    uuid not null references daily_tasks(id) on delete cascade,
  date       date not null,
  created_at timestamptz not null default now(),
  unique (task_id, date)
);
```

Expected: tool returns success.

- [ ] **Step 1.2: Regenerate TypeScript types from the schema**

Use the `mcp__claude_ai_Supabase__generate_typescript_types` tool with `project_id: "ckrwpretboflbusecdde"`. The tool returns a TypeScript string. Write the full output to `src/lib/supabase/types.ts`, replacing the placeholder content.

Expected: `src/lib/supabase/types.ts` now contains a `Database` type with `daily_tasks` and `task_completions` in `public.Tables`.

- [ ] **Step 1.3: Update the supabase:types script for future use**

Open `package.json`. Change the `supabase:types` script from `--local` to use the remote project:

```json
"supabase:types": "npx supabase gen types typescript --project-id ckrwpretboflbusecdde > src/lib/supabase/types.ts"
```

- [ ] **Step 1.4: Create app-level types**

Create `src/types/daily-tasks.ts`:

```ts
export interface DailyTask {
  id: string
  title: string
  days_of_week: number[]
  category: string | null
  color: string | null
  sort_order: number | null
  created_at: string
}

export interface TaskCompletion {
  id: string
  task_id: string
  date: string
  created_at: string
}

export interface CreateTaskInput {
  title: string
  days_of_week: number[]
  category?: string | null
  color?: string | null
}

export interface UpdateTaskInput {
  id: string
  title?: string
  days_of_week?: number[]
  category?: string | null
  color?: string | null
}
```

- [ ] **Step 1.5: Verify typecheck still passes**

```bash
pnpm typecheck
```

Expected: 0 errors.

- [ ] **Step 1.6: Commit**

```bash
git add src/lib/supabase/types.ts src/types/daily-tasks.ts package.json
git commit -m "Add daily_tasks schema and app-level types"
```

---

## Task 2: Query functions (TDD)

**Files:**
- Create: `src/lib/supabase/queries/daily-tasks.ts`
- Create: `src/lib/supabase/queries/daily-tasks.test.ts`

- [ ] **Step 2.1: Write the failing tests**

Create `src/lib/supabase/queries/daily-tasks.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import supabase from '@/lib/supabase/client'
import {
  fetchTodayTasks,
  fetchAllTasks,
  fetchTodayCompletions,
  createTask,
  updateTask,
  deleteTask,
  upsertCompletion,
  deleteCompletion,
} from './daily-tasks'
import type { DailyTask, TaskCompletion } from '@/types/daily-tasks'

vi.mock('@/lib/supabase/client')

const mockFrom = vi.mocked(supabase.from)

const mockTask: DailyTask = {
  id: 'task-1',
  title: 'Morning run',
  days_of_week: [2],
  category: 'Health',
  color: '#7c3aed',
  sort_order: null,
  created_at: '2026-01-01T00:00:00Z',
}

const mockCompletion: TaskCompletion = {
  id: 'comp-1',
  task_id: 'task-1',
  date: '2026-05-27',
  created_at: '2026-05-27T08:00:00Z',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('fetchTodayTasks', () => {
  it('returns tasks scheduled for the given day', async () => {
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        contains: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [mockTask], error: null }),
        }),
      }),
    } as any)

    const result = await fetchTodayTasks('2026-05-27') // Tuesday = 2
    expect(result).toEqual([mockTask])
    expect(mockFrom).toHaveBeenCalledWith('daily_tasks')
  })

  it('throws when supabase returns an error', async () => {
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        contains: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
        }),
      }),
    } as any)

    await expect(fetchTodayTasks('2026-05-27')).rejects.toMatchObject({ message: 'DB error' })
  })
})

describe('fetchAllTasks', () => {
  it('returns all tasks ordered by created_at', async () => {
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [mockTask], error: null }),
      }),
    } as any)

    const result = await fetchAllTasks()
    expect(result).toEqual([mockTask])
  })
})

describe('fetchTodayCompletions', () => {
  it('returns completions for the given date', async () => {
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [mockCompletion], error: null }),
      }),
    } as any)

    const result = await fetchTodayCompletions('2026-05-27')
    expect(result).toEqual([mockCompletion])
  })
})

describe('createTask', () => {
  it('inserts and returns the new task', async () => {
    mockFrom.mockReturnValueOnce({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockTask, error: null }),
        }),
      }),
    } as any)

    const result = await createTask({ title: 'Morning run', days_of_week: [2] })
    expect(result).toEqual(mockTask)
  })
})

describe('updateTask', () => {
  it('updates and returns the modified task', async () => {
    mockFrom.mockReturnValueOnce({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { ...mockTask, title: 'Evening run' }, error: null }),
          }),
        }),
      }),
    } as any)

    const result = await updateTask({ id: 'task-1', title: 'Evening run' })
    expect(result.title).toBe('Evening run')
  })
})

describe('deleteTask', () => {
  it('calls delete with the task id', async () => {
    const eqMock = vi.fn().mockResolvedValue({ error: null })
    mockFrom.mockReturnValueOnce({
      delete: vi.fn().mockReturnValue({ eq: eqMock }),
    } as any)

    await deleteTask('task-1')
    expect(eqMock).toHaveBeenCalledWith('id', 'task-1')
  })
})

describe('upsertCompletion', () => {
  it('upserts a completion record', async () => {
    const upsertMock = vi.fn().mockResolvedValue({ error: null })
    mockFrom.mockReturnValueOnce({ upsert: upsertMock } as any)

    await upsertCompletion('task-1', '2026-05-27')
    expect(upsertMock).toHaveBeenCalledWith({ task_id: 'task-1', date: '2026-05-27' })
  })
})

describe('deleteCompletion', () => {
  it('deletes the completion record for the task and date', async () => {
    const eq2Mock = vi.fn().mockResolvedValue({ error: null })
    const eq1Mock = vi.fn().mockReturnValue({ eq: eq2Mock })
    mockFrom.mockReturnValueOnce({
      delete: vi.fn().mockReturnValue({ eq: eq1Mock }),
    } as any)

    await deleteCompletion('task-1', '2026-05-27')
    expect(eq1Mock).toHaveBeenCalledWith('task_id', 'task-1')
    expect(eq2Mock).toHaveBeenCalledWith('date', '2026-05-27')
  })
})
```

- [ ] **Step 2.2: Run tests — verify they fail**

```bash
pnpm test:run src/lib/supabase/queries/daily-tasks.test.ts
```

Expected: all tests fail with "Cannot find module './daily-tasks'".

- [ ] **Step 2.3: Implement the query functions**

Create `src/lib/supabase/queries/daily-tasks.ts`:

```ts
import supabase from '@/lib/supabase/client'
import type { DailyTask, TaskCompletion, CreateTaskInput, UpdateTaskInput } from '@/types/daily-tasks'

export async function fetchTodayTasks(today: string): Promise<DailyTask[]> {
  const dayOfWeek = new Date(today).getDay()
  const { data, error } = await supabase
    .from('daily_tasks')
    .select('*')
    .contains('days_of_week', [dayOfWeek])
    .order('created_at', { ascending: true })
  if (error) throw error
  return data as DailyTask[]
}

export async function fetchAllTasks(): Promise<DailyTask[]> {
  const { data, error } = await supabase
    .from('daily_tasks')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data as DailyTask[]
}

export async function fetchTodayCompletions(today: string): Promise<TaskCompletion[]> {
  const { data, error } = await supabase
    .from('task_completions')
    .select('*')
    .eq('date', today)
  if (error) throw error
  return data as TaskCompletion[]
}

export async function createTask(input: CreateTaskInput): Promise<DailyTask> {
  const { data, error } = await supabase
    .from('daily_tasks')
    .insert(input)
    .select()
    .single()
  if (error) throw error
  return data as DailyTask
}

export async function updateTask({ id, ...rest }: UpdateTaskInput): Promise<DailyTask> {
  const { data, error } = await supabase
    .from('daily_tasks')
    .update(rest)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as DailyTask
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase
    .from('daily_tasks')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function upsertCompletion(taskId: string, date: string): Promise<void> {
  const { error } = await supabase
    .from('task_completions')
    .upsert({ task_id: taskId, date })
  if (error) throw error
}

export async function deleteCompletion(taskId: string, date: string): Promise<void> {
  const { error } = await supabase
    .from('task_completions')
    .delete()
    .eq('task_id', taskId)
    .eq('date', date)
  if (error) throw error
}
```

- [ ] **Step 2.4: Run tests — verify they pass**

```bash
pnpm test:run src/lib/supabase/queries/daily-tasks.test.ts
```

Expected: 8 tests pass.

- [ ] **Step 2.5: Commit**

```bash
git add src/lib/supabase/queries/daily-tasks.ts src/lib/supabase/queries/daily-tasks.test.ts
git commit -m "Add daily tasks query functions"
```

---

## Task 3: Hooks (TDD)

**Files:**
- Create: `src/hooks/useTodayTasks.ts`, `src/hooks/useTodayTasks.test.ts`
- Create: `src/hooks/useAllTasks.ts`, `src/hooks/useAllTasks.test.ts`
- Create: `src/hooks/useTaskMutations.ts`, `src/hooks/useTaskMutations.test.ts`

- [ ] **Step 3.1: Write failing tests for useTodayTasks**

Create `src/hooks/useTodayTasks.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useTodayTasks } from './useTodayTasks'
import * as queries from '@/lib/supabase/queries/daily-tasks'
import type { DailyTask, TaskCompletion } from '@/types/daily-tasks'

vi.mock('@/lib/supabase/queries/daily-tasks')

const mockTask: DailyTask = {
  id: 'task-1',
  title: 'Morning run',
  days_of_week: [2],
  category: null,
  color: null,
  sort_order: null,
  created_at: '2026-01-01T00:00:00Z',
}

const mockCompletion: TaskCompletion = {
  id: 'comp-1',
  task_id: 'task-1',
  date: '2026-05-27',
  created_at: '2026-05-27T08:00:00Z',
}

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useTodayTasks', () => {
  it('returns tasks and completions when loaded', async () => {
    vi.mocked(queries.fetchTodayTasks).mockResolvedValue([mockTask])
    vi.mocked(queries.fetchTodayCompletions).mockResolvedValue([mockCompletion])

    const { result } = renderHook(() => useTodayTasks(), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.tasks).toEqual([mockTask])
    expect(result.current.completions).toEqual([mockCompletion])
  })

  it('returns empty arrays while loading', () => {
    vi.mocked(queries.fetchTodayTasks).mockReturnValue(new Promise(() => {}))
    vi.mocked(queries.fetchTodayCompletions).mockReturnValue(new Promise(() => {}))

    const { result } = renderHook(() => useTodayTasks(), { wrapper: makeWrapper() })

    expect(result.current.tasks).toEqual([])
    expect(result.current.completions).toEqual([])
    expect(result.current.isLoading).toBe(true)
  })
})
```

- [ ] **Step 3.2: Write failing tests for useAllTasks**

Create `src/hooks/useAllTasks.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useAllTasks } from './useAllTasks'
import * as queries from '@/lib/supabase/queries/daily-tasks'
import type { DailyTask } from '@/types/daily-tasks'

vi.mock('@/lib/supabase/queries/daily-tasks')

const mockTask: DailyTask = {
  id: 'task-1',
  title: 'Morning run',
  days_of_week: [2],
  category: null,
  color: null,
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

describe('useAllTasks', () => {
  it('returns all tasks when loaded', async () => {
    vi.mocked(queries.fetchAllTasks).mockResolvedValue([mockTask])

    const { result } = renderHook(() => useAllTasks(), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.tasks).toEqual([mockTask])
  })

  it('returns empty array while loading', () => {
    vi.mocked(queries.fetchAllTasks).mockReturnValue(new Promise(() => {}))

    const { result } = renderHook(() => useAllTasks(), { wrapper: makeWrapper() })
    expect(result.current.tasks).toEqual([])
    expect(result.current.isLoading).toBe(true)
  })
})
```

- [ ] **Step 3.3: Write failing tests for useTaskMutations**

Create `src/hooks/useTaskMutations.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useTaskMutations } from './useTaskMutations'
import * as queries from '@/lib/supabase/queries/daily-tasks'
import type { DailyTask } from '@/types/daily-tasks'

vi.mock('@/lib/supabase/queries/daily-tasks')

const mockTask: DailyTask = {
  id: 'task-1',
  title: 'Morning run',
  days_of_week: [2],
  category: null,
  color: null,
  sort_order: null,
  created_at: '2026-01-01T00:00:00Z',
}

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useTaskMutations', () => {
  it('createTask calls createTask query', async () => {
    vi.mocked(queries.createTask).mockResolvedValue(mockTask)

    const { result } = renderHook(() => useTaskMutations(), { wrapper: makeWrapper() })

    await act(async () => {
      result.current.createTask({ title: 'Morning run', days_of_week: [2] })
    })

    expect(queries.createTask).toHaveBeenCalledWith({ title: 'Morning run', days_of_week: [2] })
  })

  it('deleteTask calls deleteTask query', async () => {
    vi.mocked(queries.deleteTask).mockResolvedValue(undefined)

    const { result } = renderHook(() => useTaskMutations(), { wrapper: makeWrapper() })

    await act(async () => {
      result.current.deleteTask('task-1')
    })

    expect(queries.deleteTask).toHaveBeenCalledWith('task-1')
  })

  it('toggleCompletion calls upsertCompletion when not completed', async () => {
    vi.mocked(queries.upsertCompletion).mockResolvedValue(undefined)

    const { result } = renderHook(() => useTaskMutations(), { wrapper: makeWrapper() })

    await act(async () => {
      result.current.toggleCompletion({ taskId: 'task-1', isCompleted: false })
    })

    expect(queries.upsertCompletion).toHaveBeenCalledWith('task-1', expect.any(String))
  })

  it('toggleCompletion calls deleteCompletion when already completed', async () => {
    vi.mocked(queries.deleteCompletion).mockResolvedValue(undefined)

    const { result } = renderHook(() => useTaskMutations(), { wrapper: makeWrapper() })

    await act(async () => {
      result.current.toggleCompletion({ taskId: 'task-1', isCompleted: true })
    })

    expect(queries.deleteCompletion).toHaveBeenCalledWith('task-1', expect.any(String))
  })
})
```

- [ ] **Step 3.4: Run tests — verify they fail**

```bash
pnpm test:run src/hooks/
```

Expected: all tests fail with "Cannot find module".

- [ ] **Step 3.5: Implement useTodayTasks**

Create `src/hooks/useTodayTasks.ts`:

```ts
import { useQuery } from '@tanstack/react-query'
import { fetchTodayTasks, fetchTodayCompletions } from '@/lib/supabase/queries/daily-tasks'

function getTodayString() {
  return new Date().toISOString().slice(0, 10)
}

export function useTodayTasks() {
  const today = getTodayString()

  const tasksQuery = useQuery({
    queryKey: ['daily-tasks', 'today', today],
    queryFn: () => fetchTodayTasks(today),
  })

  const completionsQuery = useQuery({
    queryKey: ['task-completions', today],
    queryFn: () => fetchTodayCompletions(today),
  })

  return {
    tasks: tasksQuery.data ?? [],
    completions: completionsQuery.data ?? [],
    isLoading: tasksQuery.isLoading || completionsQuery.isLoading,
    isError: tasksQuery.isError || completionsQuery.isError,
  }
}
```

- [ ] **Step 3.6: Implement useAllTasks**

Create `src/hooks/useAllTasks.ts`:

```ts
import { useQuery } from '@tanstack/react-query'
import { fetchAllTasks } from '@/lib/supabase/queries/daily-tasks'

export function useAllTasks() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['daily-tasks', 'all'],
    queryFn: fetchAllTasks,
  })
  return { tasks: data ?? [], isLoading, isError }
}
```

- [ ] **Step 3.7: Implement useTaskMutations**

Create `src/hooks/useTaskMutations.ts`:

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createTask as createTaskFn,
  updateTask as updateTaskFn,
  deleteTask as deleteTaskFn,
  upsertCompletion,
  deleteCompletion,
} from '@/lib/supabase/queries/daily-tasks'
import type { CreateTaskInput, UpdateTaskInput } from '@/types/daily-tasks'

function getTodayString() {
  return new Date().toISOString().slice(0, 10)
}

export function useTaskMutations() {
  const queryClient = useQueryClient()
  const today = getTodayString()

  const createTask = useMutation({
    mutationFn: (input: CreateTaskInput) => createTaskFn(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['daily-tasks'] }),
  })

  const updateTask = useMutation({
    mutationFn: (input: UpdateTaskInput) => updateTaskFn(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['daily-tasks'] }),
  })

  const deleteTask = useMutation({
    mutationFn: (id: string) => deleteTaskFn(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['daily-tasks'] }),
  })

  const toggleCompletion = useMutation({
    mutationFn: ({ taskId, isCompleted }: { taskId: string; isCompleted: boolean }) =>
      isCompleted
        ? deleteCompletion(taskId, today)
        : upsertCompletion(taskId, today),
    onMutate: async ({ taskId, isCompleted }) => {
      await queryClient.cancelQueries({ queryKey: ['task-completions', today] })
      const prev = queryClient.getQueryData<{ id: string; task_id: string; date: string; created_at: string }[]>(
        ['task-completions', today]
      )
      queryClient.setQueryData<{ id: string; task_id: string; date: string; created_at: string }[]>(
        ['task-completions', today],
        (old) => {
          if (isCompleted) {
            return (old ?? []).filter((c) => c.task_id !== taskId)
          }
          return [...(old ?? []), { id: 'optimistic', task_id: taskId, date: today, created_at: '' }]
        }
      )
      return { prev }
    },
    onError: (_err, _vars, context) => {
      if (context?.prev !== undefined) {
        queryClient.setQueryData(['task-completions', today], context.prev)
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['task-completions', today] }),
  })

  return {
    createTask: createTask.mutate,
    updateTask: updateTask.mutate,
    deleteTask: deleteTask.mutate,
    toggleCompletion: toggleCompletion.mutate,
    isCreating: createTask.isPending,
    isUpdating: updateTask.isPending,
    isDeleting: deleteTask.isPending,
  }
}
```

- [ ] **Step 3.8: Run tests — verify they pass**

```bash
pnpm test:run src/hooks/
```

Expected: 8 tests pass.

- [ ] **Step 3.9: Commit**

```bash
git add src/hooks/useTodayTasks.ts src/hooks/useTodayTasks.test.ts src/hooks/useAllTasks.ts src/hooks/useAllTasks.test.ts src/hooks/useTaskMutations.ts src/hooks/useTaskMutations.test.ts
git commit -m "Add React Query hooks for daily tasks"
```

---

## Task 4: DaySelector component (TDD)

**Files:**
- Create: `src/components/daily-tasks/DaySelector.tsx`
- Create: `src/components/daily-tasks/DaySelector.test.tsx`

- [ ] **Step 4.1: Write failing tests**

Create `src/components/daily-tasks/DaySelector.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DaySelector } from './DaySelector'

describe('DaySelector', () => {
  it('renders all 7 day buttons', () => {
    render(<DaySelector value={[1]} onChange={vi.fn()} />)
    expect(screen.getByText('Sun')).toBeInTheDocument()
    expect(screen.getByText('Mon')).toBeInTheDocument()
    expect(screen.getByText('Tue')).toBeInTheDocument()
    expect(screen.getByText('Wed')).toBeInTheDocument()
    expect(screen.getByText('Thu')).toBeInTheDocument()
    expect(screen.getByText('Fri')).toBeInTheDocument()
    expect(screen.getByText('Sat')).toBeInTheDocument()
  })

  it('marks selected days as pressed', () => {
    render(<DaySelector value={[1, 3]} onChange={vi.fn()} />)
    expect(screen.getByText('Mon')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('Wed')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('Tue')).toHaveAttribute('aria-pressed', 'false')
  })

  it('clicking an inactive day adds it', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<DaySelector value={[1]} onChange={onChange} />)
    await user.click(screen.getByText('Fri'))
    expect(onChange).toHaveBeenCalledWith([1, 5])
  })

  it('clicking an active day removes it when more than one is selected', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<DaySelector value={[1, 5]} onChange={onChange} />)
    await user.click(screen.getByText('Mon'))
    expect(onChange).toHaveBeenCalledWith([5])
  })

  it('does not remove the last selected day', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<DaySelector value={[1]} onChange={onChange} />)
    await user.click(screen.getByText('Mon'))
    expect(onChange).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 4.2: Run tests — verify they fail**

```bash
pnpm test:run src/components/daily-tasks/DaySelector.test.tsx
```

Expected: all 5 tests fail with "Cannot find module './DaySelector'".

- [ ] **Step 4.3: Implement DaySelector**

Create `src/components/daily-tasks/DaySelector.tsx`:

```tsx
import { cn } from '@/lib/utils'

const DAYS = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
] as const

interface DaySelectorProps {
  value: number[]
  onChange: (days: number[]) => void
}

export function DaySelector({ value, onChange }: DaySelectorProps) {
  function toggle(day: number) {
    if (value.includes(day)) {
      if (value.length === 1) return
      onChange(value.filter((d) => d !== day))
    } else {
      onChange([...value, day].sort((a, b) => a - b))
    }
  }

  return (
    <div className="flex gap-1.5">
      {DAYS.map(({ label, value: day }) => (
        <button
          key={day}
          type="button"
          onClick={() => toggle(day)}
          aria-pressed={value.includes(day)}
          className={cn(
            'h-8 w-8 rounded-full text-xs font-medium transition-colors',
            value.includes(day)
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-accent',
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 4.4: Run tests — verify they pass**

```bash
pnpm test:run src/components/daily-tasks/DaySelector.test.tsx
```

Expected: 5 tests pass.

- [ ] **Step 4.5: Commit**

```bash
git add src/components/daily-tasks/DaySelector.tsx src/components/daily-tasks/DaySelector.test.tsx
git commit -m "Add DaySelector component"
```

---

## Task 5: ColorPicker component (TDD)

**Files:**
- Create: `src/components/daily-tasks/ColorPicker.tsx`
- Create: `src/components/daily-tasks/ColorPicker.test.tsx`

- [ ] **Step 5.1: Write failing tests**

Create `src/components/daily-tasks/ColorPicker.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ColorPicker } from './ColorPicker'

describe('ColorPicker', () => {
  it('renders 8 preset color buttons', () => {
    render(<ColorPicker value={null} onChange={vi.fn()} />)
    const presets = screen.getAllByRole('button', { name: /^#/ })
    expect(presets).toHaveLength(8)
  })

  it('renders a "No color" button', () => {
    render(<ColorPicker value={null} onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: /no color/i })).toBeInTheDocument()
  })

  it('clicking a preset calls onChange with that hex value', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<ColorPicker value={null} onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: '#7c3aed' }))
    expect(onChange).toHaveBeenCalledWith('#7c3aed')
  })

  it('clicking "No color" calls onChange with null', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<ColorPicker value="#7c3aed" onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: /no color/i }))
    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('selected preset has aria-pressed="true"', () => {
    render(<ColorPicker value="#7c3aed" onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: '#7c3aed' })).toHaveAttribute('aria-pressed', 'true')
  })
})
```

- [ ] **Step 5.2: Run tests — verify they fail**

```bash
pnpm test:run src/components/daily-tasks/ColorPicker.test.tsx
```

Expected: all 5 tests fail.

- [ ] **Step 5.3: Implement ColorPicker**

Create `src/components/daily-tasks/ColorPicker.tsx`:

```tsx
import { useRef } from 'react'
import { cn } from '@/lib/utils'

const PRESETS = [
  '#7c3aed',
  '#2563eb',
  '#16a34a',
  '#dc2626',
  '#d97706',
  '#db2777',
  '#0891b2',
  '#65a30d',
] as const

interface ColorPickerProps {
  value: string | null
  onChange: (color: string | null) => void
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const isCustom = value !== null && !(PRESETS as readonly string[]).includes(value)

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onChange(null)}
        aria-label="No color"
        aria-pressed={value === null}
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded-full border-2 bg-muted text-xs text-muted-foreground transition-all',
          value === null
            ? 'border-primary ring-2 ring-primary ring-offset-1'
            : 'border-transparent',
        )}
      >
        ✕
      </button>

      {PRESETS.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          aria-label={color}
          aria-pressed={value === color}
          className={cn(
            'h-7 w-7 rounded-full border-2 transition-all',
            value === color
              ? 'border-primary ring-2 ring-primary ring-offset-1'
              : 'border-transparent',
          )}
          style={{ backgroundColor: color }}
        />
      ))}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label="Custom color"
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded-full border-2 border-dashed text-xs text-muted-foreground transition-all',
          isCustom
            ? 'border-primary ring-2 ring-primary ring-offset-1'
            : 'border-muted-foreground',
        )}
        style={isCustom ? { backgroundColor: value! } : undefined}
      >
        {!isCustom && '+'}
      </button>

      <input
        ref={inputRef}
        type="color"
        className="sr-only"
        value={isCustom ? value! : '#7c3aed'}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
```

- [ ] **Step 5.4: Run tests — verify they pass**

```bash
pnpm test:run src/components/daily-tasks/ColorPicker.test.tsx
```

Expected: 5 tests pass.

- [ ] **Step 5.5: Commit**

```bash
git add src/components/daily-tasks/ColorPicker.tsx src/components/daily-tasks/ColorPicker.test.tsx
git commit -m "Add ColorPicker component"
```

---

## Task 6: TaskCard component (TDD)

**Files:**
- Create: `src/components/daily-tasks/TaskCard.tsx`
- Create: `src/components/daily-tasks/TaskCard.test.tsx`

- [ ] **Step 6.1: Write failing tests**

Create `src/components/daily-tasks/TaskCard.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskCard } from './TaskCard'
import type { DailyTask, TaskCompletion } from '@/types/daily-tasks'

const task: DailyTask = {
  id: 'task-1',
  title: 'Morning run',
  days_of_week: [2],
  category: 'Health',
  color: '#7c3aed',
  sort_order: null,
  created_at: '2026-01-01T00:00:00Z',
}

const completion: TaskCompletion = {
  id: 'comp-1',
  task_id: 'task-1',
  date: '2026-05-27',
  created_at: '2026-05-27T08:00:00Z',
}

describe('TaskCard', () => {
  it('renders the task title', () => {
    render(<TaskCard task={task} completion={undefined} onToggle={vi.fn()} />)
    expect(screen.getByText('Morning run')).toBeInTheDocument()
  })

  it('renders the category when present', () => {
    render(<TaskCard task={task} completion={undefined} onToggle={vi.fn()} />)
    expect(screen.getByText('Health')).toBeInTheDocument()
  })

  it('does not render category when null', () => {
    render(<TaskCard task={{ ...task, category: null }} completion={undefined} onToggle={vi.fn()} />)
    expect(screen.queryByText('Health')).not.toBeInTheDocument()
  })

  it('clicking the checkbox calls onToggle with taskId and isCompleted=false when pending', async () => {
    const onToggle = vi.fn()
    const user = userEvent.setup()
    render(<TaskCard task={task} completion={undefined} onToggle={onToggle} />)
    await user.click(screen.getByRole('button', { name: /mark as done/i }))
    expect(onToggle).toHaveBeenCalledWith('task-1', false)
  })

  it('clicking the checkbox calls onToggle with isCompleted=true when done', async () => {
    const onToggle = vi.fn()
    const user = userEvent.setup()
    render(<TaskCard task={task} completion={completion} onToggle={onToggle} />)
    await user.click(screen.getByRole('button', { name: /mark as pending/i }))
    expect(onToggle).toHaveBeenCalledWith('task-1', true)
  })

  it('completed card title has line-through style', () => {
    render(<TaskCard task={task} completion={completion} onToggle={vi.fn()} />)
    expect(screen.getByText('Morning run')).toHaveClass('line-through')
  })
})
```

- [ ] **Step 6.2: Run tests — verify they fail**

```bash
pnpm test:run src/components/daily-tasks/TaskCard.test.tsx
```

Expected: all 6 tests fail.

- [ ] **Step 6.3: Implement TaskCard**

Create `src/components/daily-tasks/TaskCard.tsx`:

```tsx
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DailyTask, TaskCompletion } from '@/types/daily-tasks'

interface TaskCardProps {
  task: DailyTask
  completion: TaskCompletion | undefined
  onToggle: (taskId: string, isCompleted: boolean) => void
}

export function TaskCard({ task, completion, onToggle }: TaskCardProps) {
  const isCompleted = completion !== undefined

  return (
    <div className={cn('flex items-center gap-3 rounded-lg p-3 transition-opacity', isCompleted && 'opacity-40')}>
      <div
        className="h-3 w-3 flex-shrink-0 rounded-full"
        style={{ backgroundColor: task.color ?? 'var(--color-muted-foreground)' }}
      />
      <div className="min-w-0 flex-1">
        <p className={cn('text-sm font-medium', isCompleted && 'line-through')}>{task.title}</p>
        {task.category && <p className="text-xs text-muted-foreground">{task.category}</p>}
      </div>
      <button
        type="button"
        onClick={() => onToggle(task.id, isCompleted)}
        aria-label={isCompleted ? 'Mark as pending' : 'Mark as done'}
        className={cn(
          'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors',
          isCompleted
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-muted-foreground hover:border-primary',
        )}
      >
        {isCompleted && <Check size={12} />}
      </button>
    </div>
  )
}
```

- [ ] **Step 6.4: Run tests — verify they pass**

```bash
pnpm test:run src/components/daily-tasks/TaskCard.test.tsx
```

Expected: 6 tests pass.

- [ ] **Step 6.5: Commit**

```bash
git add src/components/daily-tasks/TaskCard.tsx src/components/daily-tasks/TaskCard.test.tsx
git commit -m "Add TaskCard component"
```

---

## Task 7: TaskList and DoneSection components (TDD)

**Files:**
- Create: `src/components/daily-tasks/TaskList.tsx`
- Create: `src/components/daily-tasks/TaskList.test.tsx`
- Create: `src/components/daily-tasks/DoneSection.tsx`
- Create: `src/components/daily-tasks/DoneSection.test.tsx`

- [ ] **Step 7.1: Write failing tests for TaskList**

Create `src/components/daily-tasks/TaskList.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { TaskList } from './TaskList'
import type { DailyTask, TaskCompletion } from '@/types/daily-tasks'

const task1: DailyTask = {
  id: 'task-1', title: 'Morning run', days_of_week: [2], category: null, color: null, sort_order: null, created_at: '',
}
const task2: DailyTask = {
  id: 'task-2', title: 'Meditate', days_of_week: [2], category: null, color: null, sort_order: null, created_at: '',
}
const completion: TaskCompletion = {
  id: 'comp-1', task_id: 'task-1', date: '2026-05-27', created_at: '',
}

function renderList(tasks: DailyTask[], completions: TaskCompletion[]) {
  return render(
    <MemoryRouter>
      <TaskList tasks={tasks} completions={completions} onToggle={vi.fn()} />
    </MemoryRouter>,
  )
}

describe('TaskList', () => {
  it('renders only pending tasks (not completed ones)', () => {
    renderList([task1, task2], [completion])
    expect(screen.queryByText('Morning run')).not.toBeInTheDocument()
    expect(screen.getByText('Meditate')).toBeInTheDocument()
  })

  it('shows empty-state when no tasks are scheduled', () => {
    renderList([], [])
    expect(screen.getByText(/nothing scheduled/i)).toBeInTheDocument()
  })

  it('shows all-done message when all tasks are completed', () => {
    renderList([task1], [completion])
    expect(screen.getByText(/all done/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 7.2: Write failing tests for DoneSection**

Create `src/components/daily-tasks/DoneSection.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DoneSection } from './DoneSection'
import type { DailyTask, TaskCompletion } from '@/types/daily-tasks'

const task1: DailyTask = {
  id: 'task-1', title: 'Morning run', days_of_week: [2], category: null, color: null, sort_order: null, created_at: '',
}
const completion: TaskCompletion = {
  id: 'comp-1', task_id: 'task-1', date: '2026-05-27', created_at: '',
}

describe('DoneSection', () => {
  it('renders nothing when no completions', () => {
    const { container } = render(
      <DoneSection tasks={[task1]} completions={[]} onToggle={vi.fn()} />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders "Done today · N" label with count', () => {
    render(<DoneSection tasks={[task1]} completions={[completion]} onToggle={vi.fn()} />)
    expect(screen.getByText(/done today · 1/i)).toBeInTheDocument()
  })

  it('renders completed task titles', () => {
    render(<DoneSection tasks={[task1]} completions={[completion]} onToggle={vi.fn()} />)
    expect(screen.getByText('Morning run')).toBeInTheDocument()
  })
})
```

- [ ] **Step 7.3: Run tests — verify they fail**

```bash
pnpm test:run src/components/daily-tasks/TaskList.test.tsx src/components/daily-tasks/DoneSection.test.tsx
```

Expected: all 6 tests fail.

- [ ] **Step 7.4: Implement TaskList**

Create `src/components/daily-tasks/TaskList.tsx`:

```tsx
import { Link } from 'react-router-dom'
import { TaskCard } from './TaskCard'
import type { DailyTask, TaskCompletion } from '@/types/daily-tasks'

interface TaskListProps {
  tasks: DailyTask[]
  completions: TaskCompletion[]
  onToggle: (taskId: string, isCompleted: boolean) => void
}

export function TaskList({ tasks, completions, onToggle }: TaskListProps) {
  const completedIds = new Set(completions.map((c) => c.task_id))
  const pending = tasks.filter((t) => !completedIds.has(t.id))

  if (tasks.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nothing scheduled for today.{' '}
        <Link to="/focus/manage" className="underline">
          Manage →
        </Link>
      </p>
    )
  }

  if (pending.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">All done for today ✓</p>
  }

  return (
    <div className="space-y-3">
      {pending.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          completion={completions.find((c) => c.task_id === task.id)}
          onToggle={onToggle}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 7.5: Implement DoneSection**

Create `src/components/daily-tasks/DoneSection.tsx`:

```tsx
import { TaskCard } from './TaskCard'
import type { DailyTask, TaskCompletion } from '@/types/daily-tasks'

interface DoneSectionProps {
  tasks: DailyTask[]
  completions: TaskCompletion[]
  onToggle: (taskId: string, isCompleted: boolean) => void
}

export function DoneSection({ tasks, completions, onToggle }: DoneSectionProps) {
  const completedIds = new Set(completions.map((c) => c.task_id))
  const done = tasks.filter((t) => completedIds.has(t.id))

  if (done.length === 0) return null

  return (
    <div className="mt-6">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Done today · {done.length}
      </p>
      <div className="space-y-3">
        {done.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            completion={completions.find((c) => c.task_id === task.id)}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 7.6: Run tests — verify they pass**

```bash
pnpm test:run src/components/daily-tasks/TaskList.test.tsx src/components/daily-tasks/DoneSection.test.tsx
```

Expected: 6 tests pass.

- [ ] **Step 7.7: Commit**

```bash
git add src/components/daily-tasks/TaskList.tsx src/components/daily-tasks/TaskList.test.tsx src/components/daily-tasks/DoneSection.tsx src/components/daily-tasks/DoneSection.test.tsx
git commit -m "Add TaskList and DoneSection components"
```

---

## Task 8: TaskForm component (TDD)

**Files:**
- Create: `src/components/daily-tasks/TaskForm.tsx`
- Create: `src/components/daily-tasks/TaskForm.test.tsx`

- [ ] **Step 8.1: Write failing tests**

Create `src/components/daily-tasks/TaskForm.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskForm } from './TaskForm'
import type { DailyTask } from '@/types/daily-tasks'

const existingTask: DailyTask = {
  id: 'task-1',
  title: 'Morning run',
  days_of_week: [1, 3, 5],
  category: 'Health',
  color: '#7c3aed',
  sort_order: null,
  created_at: '2026-01-01T00:00:00Z',
}

describe('TaskForm', () => {
  it('renders title, days, category, and color fields', () => {
    render(<TaskForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByText('Mon')).toBeInTheDocument()
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /no color/i })).toBeInTheDocument()
  })

  it('Save button is disabled when title is empty', () => {
    render(<TaskForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
  })

  it('Save button is enabled after typing a title', async () => {
    const user = userEvent.setup()
    render(<TaskForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    await user.type(screen.getByLabelText(/title/i), 'New task')
    expect(screen.getByRole('button', { name: /save/i })).not.toBeDisabled()
  })

  it('submits with correct data when filled and saved', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(<TaskForm onSubmit={onSubmit} onCancel={vi.fn()} />)
    await user.type(screen.getByLabelText(/title/i), 'My habit')
    await user.click(screen.getByText('Fri'))
    await user.click(screen.getByRole('button', { name: /save/i }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'My habit', days_of_week: expect.arrayContaining([5]) }),
    )
  })

  it('pre-fills fields when editing an existing task', () => {
    render(<TaskForm initial={existingTask} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByLabelText(/title/i)).toHaveValue('Morning run')
    expect(screen.getByLabelText(/category/i)).toHaveValue('Health')
  })

  it('calls onCancel when Cancel is clicked', async () => {
    const onCancel = vi.fn()
    const user = userEvent.setup()
    render(<TaskForm onSubmit={vi.fn()} onCancel={onCancel} />)
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onCancel).toHaveBeenCalled()
  })
})
```

- [ ] **Step 8.2: Run tests — verify they fail**

```bash
pnpm test:run src/components/daily-tasks/TaskForm.test.tsx
```

Expected: all 6 tests fail.

- [ ] **Step 8.3: Implement TaskForm**

Create `src/components/daily-tasks/TaskForm.tsx`:

```tsx
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { DaySelector } from './DaySelector'
import { ColorPicker } from './ColorPicker'
import type { DailyTask, CreateTaskInput, UpdateTaskInput } from '@/types/daily-tasks'

interface TaskFormProps {
  initial?: DailyTask
  onSubmit: (data: CreateTaskInput | UpdateTaskInput) => void
  onCancel: () => void
  isPending?: boolean
}

export function TaskForm({ initial, onSubmit, onCancel, isPending = false }: TaskFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [days, setDays] = useState<number[]>(initial?.days_of_week ?? [new Date().getDay()])
  const [category, setCategory] = useState(initial?.category ?? '')
  const [color, setColor] = useState<string | null>(initial?.color ?? null)

  const canSubmit = title.trim().length > 0 && days.length > 0 && !isPending

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    onSubmit({
      ...(initial ? { id: initial.id } : {}),
      title: title.trim(),
      days_of_week: days,
      category: category.trim() || null,
      color,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-border bg-card p-4">
      <div>
        <label htmlFor="task-title" className="text-xs font-medium text-muted-foreground">
          Title
        </label>
        <input
          id="task-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Morning run"
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <div>
        <span className="text-xs font-medium text-muted-foreground">Days</span>
        <div className="mt-2">
          <DaySelector value={days} onChange={setDays} />
        </div>
      </div>

      <div>
        <label htmlFor="task-category" className="text-xs font-medium text-muted-foreground">
          Category{' '}
          <span className="text-muted-foreground/60">(optional)</span>
        </label>
        <input
          id="task-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g. Health, Work…"
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <div>
        <span className="text-xs font-medium text-muted-foreground">
          Color <span className="text-muted-foreground/60">(optional)</span>
        </span>
        <div className="mt-2">
          <ColorPicker value={color} onChange={setColor} />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!canSubmit}
          className={cn(
            'flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity',
            !canSubmit && 'cursor-not-allowed opacity-50',
          )}
        >
          {isPending ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-border px-4 py-2 text-sm font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
```

- [ ] **Step 8.4: Run tests — verify they pass**

```bash
pnpm test:run src/components/daily-tasks/TaskForm.test.tsx
```

Expected: 6 tests pass.

- [ ] **Step 8.5: Commit**

```bash
git add src/components/daily-tasks/TaskForm.tsx src/components/daily-tasks/TaskForm.test.tsx
git commit -m "Add TaskForm component"
```

---

## Task 9: FocusPage (replace stub)

**Files:**
- Modify: `src/pages/FocusPage.tsx`

No TDD for the page itself — the behavior is covered by the hook and component tests above. Verify manually by running the dev server.

- [ ] **Step 9.1: Replace the stub**

Replace the full contents of `src/pages/FocusPage.tsx` with:

```tsx
import { Link } from 'react-router-dom'
import { useTodayTasks } from '@/hooks/useTodayTasks'
import { useTaskMutations } from '@/hooks/useTaskMutations'
import { TaskList } from '@/components/daily-tasks/TaskList'
import { DoneSection } from '@/components/daily-tasks/DoneSection'

export default function FocusPage() {
  const { tasks, completions, isLoading } = useTodayTasks()
  const { toggleCompletion } = useTaskMutations()

  if (isLoading) {
    return <div className="py-8 text-center text-sm text-muted-foreground">Loading…</div>
  }

  return (
    <div className="py-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Today</h1>
        <Link to="/focus/manage" className="text-sm text-muted-foreground hover:text-foreground">
          Manage →
        </Link>
      </div>

      <TaskList
        tasks={tasks}
        completions={completions}
        onToggle={(taskId, isCompleted) => toggleCompletion({ taskId, isCompleted })}
      />

      <DoneSection
        tasks={tasks}
        completions={completions}
        onToggle={(taskId, isCompleted) => toggleCompletion({ taskId, isCompleted })}
      />
    </div>
  )
}
```

- [ ] **Step 9.2: Typecheck**

```bash
pnpm typecheck
```

Expected: 0 errors.

- [ ] **Step 9.3: Commit**

```bash
git add src/pages/FocusPage.tsx
git commit -m "Implement FocusPage with today's tasks and completion toggle"
```

---

## Task 10: TasksManagePage and route

**Files:**
- Create: `src/pages/TasksManagePage.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 10.1: Create TasksManagePage**

Create `src/pages/TasksManagePage.tsx`:

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { useAllTasks } from '@/hooks/useAllTasks'
import { useTaskMutations } from '@/hooks/useTaskMutations'
import { TaskForm } from '@/components/daily-tasks/TaskForm'
import type { DailyTask, CreateTaskInput, UpdateTaskInput } from '@/types/daily-tasks'

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export default function TasksManagePage() {
  const navigate = useNavigate()
  const { tasks, isLoading } = useAllTasks()
  const { createTask, updateTask, deleteTask, isCreating, isUpdating } = useTaskMutations()

  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<DailyTask | null>(null)

  function handleCreate(data: CreateTaskInput | UpdateTaskInput) {
    createTask(data as CreateTaskInput, { onSuccess: () => setShowCreate(false) })
  }

  function handleUpdate(data: CreateTaskInput | UpdateTaskInput) {
    updateTask(data as UpdateTaskInput, { onSuccess: () => setEditing(null) })
  }

  function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete "${title}"?`)) return
    deleteTask(id)
  }

  if (isLoading) {
    return <div className="py-8 text-center text-sm text-muted-foreground">Loading…</div>
  }

  return (
    <div className="py-4">
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Go back"
        >
          ←
        </button>
        <h1 className="text-lg font-semibold">Tasks</h1>
      </div>

      {showCreate ? (
        <TaskForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} isPending={isCreating} />
      ) : (
        <button
          onClick={() => { setEditing(null); setShowCreate(true) }}
          className="mb-4 w-full rounded-lg border border-dashed border-border py-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
        >
          + New task
        </button>
      )}

      <div className="space-y-2">
        {tasks.map((task) =>
          editing?.id === task.id ? (
            <TaskForm
              key={task.id}
              initial={task}
              onSubmit={handleUpdate}
              onCancel={() => setEditing(null)}
              isPending={isUpdating}
            />
          ) : (
            <div
              key={task.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
            >
              <div
                className="h-3 w-3 flex-shrink-0 rounded-full"
                style={{ backgroundColor: task.color ?? 'var(--color-muted-foreground)' }}
              />
              <button
                className="min-w-0 flex-1 text-left"
                onClick={() => { setShowCreate(false); setEditing(task) }}
              >
                <p className="text-sm font-medium">{task.title}</p>
                <div className="mt-0.5 flex gap-1">
                  {DAY_LABELS.map((label, i) => (
                    <span
                      key={i}
                      className={`text-[10px] font-medium ${
                        task.days_of_week.includes(i) ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      {label}
                    </span>
                  ))}
                </div>
                {task.category && <p className="text-xs text-muted-foreground">{task.category}</p>}
              </button>
              <button
                onClick={() => handleDelete(task.id, task.title)}
                aria-label={`Delete ${task.title}`}
                className="text-muted-foreground transition-colors hover:text-destructive"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ),
        )}

        {tasks.length === 0 && !showCreate && (
          <p className="py-6 text-center text-sm text-muted-foreground">No tasks yet. Add one above.</p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 10.2: Add the route in App.tsx**

Open `src/App.tsx`. Add the import and the new route. The full file should look like this:

```tsx
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/common/AppLayout'
import FocusPage from '@/pages/FocusPage'
import GoalsPage from '@/pages/GoalsPage'
import NotesPage from '@/pages/NotesPage'
import ProjectsPage from '@/pages/ProjectsPage'
import TasksManagePage from '@/pages/TasksManagePage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/focus" replace />} />
        <Route path="focus" element={<FocusPage />} />
        <Route path="focus/manage" element={<TasksManagePage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="goals" element={<GoalsPage />} />
        <Route path="notes" element={<NotesPage />} />
      </Route>
    </Routes>
  )
}
```

- [ ] **Step 10.3: Typecheck**

```bash
pnpm typecheck
```

Expected: 0 errors.

- [ ] **Step 10.4: Commit**

```bash
git add src/pages/TasksManagePage.tsx src/App.tsx
git commit -m "Add TasksManagePage and /focus/manage route"
```

---

## Task 11: Final verification

**Files:** none

- [ ] **Step 11.1: Run all tests**

```bash
pnpm test:run
```

Expected: all tests pass. Previous count was 15 (scaffold). New total should be at least 44 (15 + 8 query + 8 hooks + 5 DaySelector + 5 ColorPicker + 6 TaskCard + 6 TaskList+DoneSection + 6 TaskForm).

- [ ] **Step 11.2: Typecheck**

```bash
pnpm typecheck
```

Expected: 0 errors.

- [ ] **Step 11.3: Build**

```bash
pnpm build
```

Expected: build completes with no errors.

- [ ] **Step 11.4: Manual smoke test**

```bash
pnpm dev
```

Open http://localhost:5173 and verify:
- Focus page loads without errors; shows "Nothing scheduled" or loading state
- Clicking "Manage →" navigates to `/focus/manage`
- Creating a task with today's weekday selected: task appears on Focus page after saving
- Checking the task moves it to the "Done today" section
- Unchecking moves it back to pending
- Editing a task updates it
- Deleting a task removes it from both screens
- BottomNav "Focus" tab stays highlighted on both `/focus` and `/focus/manage`

Stop the server with Ctrl+C.

- [ ] **Step 11.5: Final commit**

```bash
git add -A
git status
```

If nothing unexpected is staged, commit:

```bash
git commit -m "Daily Tasks complete: Focus page, Manage page, completion toggle — all tests passing"
```

If `git status` shows only things already committed, skip this step.
