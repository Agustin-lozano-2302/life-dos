# Life Do's — Daily Tasks Design

**Date:** 2026-05-27
**Sub-project:** 2 of 6 — Daily Tasks (Tareas diarias)
**Status:** Approved

---

## Overview

Daily tasks are recurring habits and routines that repeat on selected days of the week. They never "complete" permanently — the user marks them done for a given day. The feature consists of two screens: a Focus page showing today's pending and completed tasks, and a Manage page for creating, editing, and deleting tasks.

---

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Architecture | Two routes + pure React Query | Follows CLAUDE.md (React Query for server state); today's date is the only UI state needed |
| Completion style | Move to "Done today" section at bottom | Focus list stays clean; done tasks still visible |
| Task management | Separate `/focus/manage` route | Clean separation; Focus page stays focused on today |
| Category | Free-form text, optional | Flexible; no predefined list to maintain |
| Color | Free color picker, optional | 8 presets + native color input; nullable — can be set later |

---

## Section 1 — Database Schema

Two tables applied as a Supabase migration.

### `daily_tasks`

```sql
create table daily_tasks (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  days_of_week integer[] not null,   -- 0=Sun, 1=Mon, …, 6=Sat
  category     text,                 -- nullable, free-form
  color        text,                 -- nullable, hex e.g. '#7c3aed'
  sort_order   integer,              -- nullable, reserved for manual reordering
  created_at   timestamptz not null default now()
);
```

### `task_completions`

```sql
create table task_completions (
  id         uuid primary key default gen_random_uuid(),
  task_id    uuid not null references daily_tasks(id) on delete cascade,
  date       date not null,
  created_at timestamptz not null default now(),
  unique (task_id, date)
);
```

Key concept: completing a task is an upsert into `task_completions`; un-completing is a delete. The `daily_tasks` row never changes when a task is toggled.

---

## Section 2 — Routes & Navigation

```
/focus          → FocusPage         (today's tasks)
/focus/manage   → TasksManagePage   (all tasks — create / edit / delete)
```

`App.tsx` route tree addition:
```tsx
<Route path="focus" element={<FocusPage />} />
<Route path="focus/manage" element={<TasksManagePage />} />
```

Navigation:
- FocusPage → Manage: a "Manage" button/link on the page navigates to `/focus/manage`
- TasksManagePage → back: a `←` back button calls `navigate(-1)`
- BottomNav "Focus" tab stays active on both routes (React Router `NavLink` matches the prefix automatically)

---

## Section 3 — File Structure

### New files

```
src/
  components/
    daily-tasks/
      TaskCard.tsx          — single task row: color dot, title, category, checkbox
      TaskList.tsx          — renders the pending tasks for today
      DoneSection.tsx       — "Done today · N" section at the bottom of FocusPage
      DaySelector.tsx       — Mon–Sun toggle pills for the task form
      TaskForm.tsx          — create/edit form (title, days, category, color)
      ColorPicker.tsx       — 8 preset swatches + native <input type="color">
  pages/
    TasksManagePage.tsx     — new page: full task list + create/edit/delete
  lib/
    supabase/
      queries/
        daily-tasks.ts      — all DB query functions for this domain
  hooks/
    useTodayTasks.ts        — useQuery: today's tasks + today's completions
    useAllTasks.ts          — useQuery: all tasks (manage screen)
    useTaskMutations.ts     — useMutation: create, update, delete, toggleCompletion
  types/
    daily-tasks.ts          — DailyTask, TaskCompletion, CreateTaskInput, UpdateTaskInput
```

### Modified files

```
src/
  App.tsx                   — add /focus/manage route
  pages/
    FocusPage.tsx           — replace stub with full implementation
```

---

## Section 4 — Data Layer

### Types (`src/types/daily-tasks.ts`)

```ts
export interface DailyTask {
  id: string
  title: string
  days_of_week: number[]   // 0–6
  category: string | null
  color: string | null     // hex or null
  sort_order: number | null
  created_at: string
}

export interface TaskCompletion {
  id: string
  task_id: string
  date: string             // 'YYYY-MM-DD'
  created_at: string
}

export interface CreateTaskInput {
  title: string
  days_of_week: number[]
  category?: string
  color?: string
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  id: string
}
```

### Query functions (`src/lib/supabase/queries/daily-tasks.ts`)

```ts
fetchTodayTasks(today: string): Promise<DailyTask[]>
  // supabase-js: .from('daily_tasks').select('*').contains('days_of_week', [dayOfWeek])
  // where dayOfWeek = new Date(today).getDay()  (0=Sun … 6=Sat)

fetchAllTasks(): Promise<DailyTask[]>
  // SELECT * FROM daily_tasks ORDER BY created_at ASC

fetchTodayCompletions(today: string): Promise<TaskCompletion[]>
  // SELECT * FROM task_completions WHERE date = today

createTask(input: CreateTaskInput): Promise<DailyTask>
updateTask(input: UpdateTaskInput): Promise<DailyTask>
deleteTask(id: string): Promise<void>

upsertCompletion(taskId: string, date: string): Promise<TaskCompletion>
  // INSERT INTO task_completions (task_id, date) VALUES (…) ON CONFLICT DO NOTHING

deleteCompletion(taskId: string, date: string): Promise<void>
  // DELETE FROM task_completions WHERE task_id = … AND date = …
```

### Hooks

**`useTodayTasks`** — single hook that fetches both today's tasks and completions, returns `{ tasks, completions, isLoading }`. Query key includes today's date so cache invalidates at midnight.

**`useAllTasks`** — fetches all tasks for the manage screen.

**`useTaskMutations`** — returns mutation functions: `createTask`, `updateTask`, `deleteTask`, `toggleCompletion`. `toggleCompletion` does an optimistic update: adds/removes the completion from the cache immediately, then syncs with Supabase. On error it rolls back.

---

## Section 5 — UI Behavior

### FocusPage

- Header area: "Focus" title on the left, "Manage →" link on the right
- `TaskList`: renders `TaskCard` for each task scheduled today that has no completion
- `DoneSection`: at the bottom, shows completed tasks dimmed with a checkmark. Label: "Done today · N"
- **Empty states:**
  - No tasks scheduled for today: "Nothing scheduled for today. [Manage →]"
  - All tasks done: pending list replaced with a short congratulatory line (e.g. "All done for today ✓")

### TaskCard

- Left: circular color indicator (filled with task color, or muted gray if no color)
- Middle: task title (bold), category below in muted text (hidden if null)
- Right: circular checkbox button
- Tapping checkbox calls `toggleCompletion` with optimistic update

### DoneSection

- Always visible when at least one task is completed today (not collapsible)
- Completed `TaskCard` variants: dimmed opacity, title struck through, checkbox shows checkmark

### TasksManagePage

- Header: `←` back button + "Tasks" title
- "+ New task" button at top opens `TaskForm` inline (expands below the button)
- Each task row: color dot, title, day pills (all 7 days, active ones highlighted), category in muted text, trash icon on the right
- Tapping a task row opens `TaskForm` pre-filled for editing (same inline expand)
- Delete: trash icon → `window.confirm` dialog → `deleteTask` mutation → row removed optimistically

### TaskForm

Fields:
1. **Title** — text input, required
2. **Days** — `DaySelector`: 7 pill toggles (M T W T F S S), at least one required
3. **Category** — text input, optional, placeholder "e.g. Health, Work…"
4. **Color** — `ColorPicker`: 8 preset hex swatches + one "+" swatch that opens native `<input type="color">`. A "None" option (gray dot with ✕) clears the color.

Submit: "Save" button, disabled while mutation is in flight. On success the form collapses and the task list refreshes.

### ColorPicker

8 presets: `['#7c3aed','#2563eb','#16a34a','#dc2626','#d97706','#db2777','#0891b2','#65a30d']`

The "+" swatch opens a visually hidden `<input type="color">` via a ref click. Selected color shown with a ring. No color selected = gray dot shown in TaskCard.

### DaySelector

7 pills: Sun Mon Tue Wed Thu Fri Sat (0–6). Each toggles on/off. At least one must remain selected (validation prevents deselecting all). Displays in a single horizontal row.

---

## Acceptance Criteria

- [ ] `pnpm dev` shows today's tasks on the Focus page; tasks not scheduled for today are hidden
- [ ] Tapping checkbox moves task to Done section instantly (optimistic); Supabase row created
- [ ] Tapping a completed task's checkbox un-completes it (moves back to pending); Supabase row deleted
- [ ] `/focus/manage` lists all tasks; "+ New task" creates a task; it appears on Focus if scheduled for today
- [ ] Edit task → changes reflect on Focus page
- [ ] Delete task → disappears from both screens
- [ ] Color picker: preset swatches work; "+" opens native picker; "None" clears color
- [ ] DaySelector prevents deselecting all days
- [ ] `pnpm typecheck` passes with zero errors
- [ ] `pnpm test:run` passes (unit tests for query functions and hooks; component tests for TaskCard, DaySelector, ColorPicker)
