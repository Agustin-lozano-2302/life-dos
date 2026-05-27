# Productivity App — Claude Code Context

## Project overview

Personal productivity app that unifies the full lifecycle of a person's activities:
daily habits, projects, goals, and notes — and the relationships between them.
The core insight is that most productivity tools treat these as isolated silos;
this app makes the connections explicit.

**Stack:** React + Vite + TypeScript · Supabase · shadcn/ui + Tailwind · PWA via vite-plugin-pwa · Vercel

---

## Bash commands

```bash
# Dev
pnpm dev               # Start dev server (localhost:5173)
pnpm build             # Production build
pnpm preview           # Preview production build locally

# Type checking & linting
pnpm typecheck         # tsc --noEmit
pnpm lint              # ESLint
pnpm lint:fix          # ESLint --fix

# Tests
pnpm test              # Vitest (watch mode)
pnpm test:run          # Vitest (single run, CI)
pnpm test:ui           # Vitest UI

# Supabase
pnpm supabase:types    # Generate TypeScript types from DB schema
                       # (npx supabase gen types typescript --local > src/lib/supabase/types.ts)
```

Always run `pnpm typecheck` after a series of changes.
Always run `pnpm test:run` before considering a feature complete.

---

## Project structure

```
src/
  assets/              # Static assets
  components/
    ui/                # shadcn/ui primitives (do not edit directly)
    common/            # Shared app components (Button wrappers, modals, etc.)
    daily-tasks/       # Tareas diarias
    projects/          # Proyectos (Jira-style board)
    goals/             # Objetivos
    notes/             # Notas
  hooks/               # Custom React hooks
  lib/
    supabase/
      client.ts        # Supabase client singleton
      types.ts         # Auto-generated DB types (do not edit manually)
      queries/         # One file per domain (daily-tasks.ts, projects.ts, etc.)
  pages/               # Route-level components
  store/               # Zustand stores (one per domain)
  types/               # App-level TypeScript types (not DB types)
  utils/               # Pure utility functions
```

---

## Domain model

### 1 — Tareas diarias (Daily tasks)
Recurring tasks that repeat on selected days of the week. They never "end" —
the user marks them done for a given day. Think: habits, routines.

Key fields: `title`, `days_of_week` (array), `category`, `color`.
Key concept: a `completion` is a separate record (task_id + date), not a field on the task.

### 2 — Proyectos (Projects)
Jira-style kanban board. Tasks inside a project have a lifecycle with statuses.
Projects themselves have a start and end date.

Key fields: `title`, `description`, `status` (active | paused | completed | archived),
`due_date`. Child entity: `project_tasks` with `status` column (todo | in_progress | review | done).

### 3 — Objetivos (Goals)
Simpler than projects. A goal is a measurable target the user wants to reach.
Can be linked to daily tasks (e.g. "Leer 4 páginas por día" links to a daily task)
or to projects (e.g. "Lanzar mi producto" links to a project).

Key fields: `title`, `target_value`, `current_value`, `unit`, `deadline`,
`linked_daily_task_id` (nullable), `linked_project_id` (nullable).

### 4 — Notas (Notes)
Freeform notes with optional category. Can be linked to any of the three other
domains via a polymorphic `note_links` table (entity_type + entity_id).

Key fields: `title`, `content` (rich text as JSON or markdown), `category`.

### Relationships
- A `goal` can reference one `daily_task` and/or one `project`.
- A `note` can be linked to many entities of any type via `note_links`.
- Never create circular dependencies between domains in the data layer.

---

## Code style

- **TypeScript**: strict mode on. No `any`. Use `unknown` + type narrowing when needed.
- **Imports**: ES modules only. Use path aliases (`@/` maps to `src/`).
- **Components**: functional components with hooks only. No class components.
- **State management**: Zustand for global state. React Query (TanStack Query) for
  server state / Supabase data. Do not mix them for the same concern.
- **Naming**:
  - Components: PascalCase (`TaskCard.tsx`)
  - Hooks: camelCase prefixed with `use` (`useTaskCompletions.ts`)
  - Utilities: camelCase (`formatDate.ts`)
  - DB query functions: camelCase, verb-first (`fetchDailyTasks`, `upsertCompletion`)
- **No default exports** except for page-level route components and the Supabase client.
- **shadcn/ui**: use primitives from `@/components/ui/`. Do not modify them directly.
  Extend by wrapping in `@/components/common/`.

---

## Supabase conventions

- All DB access goes through functions in `src/lib/supabase/queries/`.
  Components never call `supabase` directly.
- Use RLS (Row Level Security) for all tables once auth is added.
- DB types are auto-generated — run `pnpm supabase:types` after any schema change.
  Never edit `src/lib/supabase/types.ts` by hand.
- Prefer Supabase realtime subscriptions (via React Query's `refetchInterval` or
  explicit channels) over polling.

---

## PWA

- Service worker is managed by `vite-plugin-pwa` (Workbox under the hood).
- Offline strategy per route type:
  - Data reads: stale-while-revalidate
  - Data writes: queue with background sync
- Do not manually edit the generated service worker files.
- Test PWA behavior with `pnpm preview` (not `pnpm dev`).

---

## Testing

- Use **Vitest** + **React Testing Library**.
- Every new component gets a corresponding `*.test.tsx` file.
- Test domain logic (hooks, query functions, utils) with unit tests.
- Test UI components with RTL — focus on behavior, not implementation.
- Mock Supabase client via `vi.mock('@/lib/supabase/client')`.
- Do not test shadcn/ui primitives.

---

## Git conventions

- Branch naming: `feat/`, `fix/`, `chore/`, `refactor/` prefixes.
  Example: `feat/goal-progress-tracker`
- One feature per branch. Keep PRs small and focused.
- Commit messages: imperative mood, sentence case.
  Example: `Add completion toggle to daily task card`
- Never commit directly to `main`.

---

## Deployment

- **Vercel** for hosting. Preview deployments on every PR.
- Environment variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
  These must be set in Vercel dashboard and in `.env.local` for local dev.
- `.env.local` is gitignored. Never commit secrets.

---

## Auth (deferred)

Auth is intentionally not implemented yet. The app is single-user for now.
When auth is added, it will use Supabase Auth (email + OAuth).
All data tables will have a `user_id` column added and RLS policies enabled.
Design the schema with this in mind — avoid patterns that are hard to migrate.

---

## Dashboard & estadísticas

### Concepto
El dashboard es un espejo, no un juez. Muestra el estado real de la actividad
del usuario de forma visual y clara. Las sugerencias son suaves y opcionales —
nunca alertas, nunca culpa, nunca presión.

### Período de tiempo
El usuario elige el período desde un selector global en el dashboard:
`semana` | `mes` | `año`. Este valor se guarda en Zustand (`useDashboardStore`)
y todas las métricas se recalculan al cambiarlo. No hay período "por defecto
fijo" — se recuerda la última selección en localStorage.

### Métricas por dominio

**Tareas diarias**
- Porcentaje de completitud en el período (completions / días esperados)
- Racha actual de días consecutivos por tarea
- Heatmap de actividad tipo GitHub contributions (año completo, siempre visible
  como contexto incluso cuando el selector está en semana/mes)
- Tarea con mejor racha del período

**Proyectos**
- Tareas cerradas por semana dentro del período (sparkline)
- Distribución de tareas por estado (donut chart simple)
- Proyectos activos vs pausados vs completados

**Objetivos**
- Progreso hacia el target (barra de progreso + valor actual / target)
- Proyección de fecha de cumplimiento basada en velocidad actual
- Objetivos en riesgo (proyección supera la deadline)

**Notas**
- Cantidad de notas creadas en el período
- Distribución por categoría
- Relación con otros dominios (cuántas notas están vinculadas a proyectos,
  objetivos o tareas)

**Cross-domain (la parte más valiosa)**
- Correlación visual entre completitud de hábitos y tareas cerradas en proyectos
  (gráfico de dos líneas superpuestas por semana)
- Resumen tipo "En tus mejores semanas de hábitos, cerraste X tareas de proyecto"

### Sugerencias suaves
- Se muestran en una sección discreta al final del dashboard, nunca como modales
  ni notificaciones push.
- Máximo 2-3 sugerencias visibles a la vez.
- Tono: observacional, nunca imperativo. Ejemplos:
  - "No abriste el proyecto X en los últimos 7 días."
  - "Tu racha en [tarea] lleva 5 días — la más larga del mes."
  - "El objetivo Y está al 80% pero la deadline es en 2 semanas."
- Las sugerencias se generan en el cliente a partir de las métricas calculadas.
  No hay backend de recomendaciones. Lógica en `src/lib/suggestions/`.
- El usuario puede descartar una sugerencia (se guarda en localStorage, no en DB).

### Queries necesarias
Agregar en `src/lib/supabase/queries/dashboard.ts`:
- `fetchCompletionsByRange(startDate, endDate)` — completions de tareas diarias
- `fetchProjectTasksByRange(startDate, endDate)` — tareas de proyecto cerradas
- `fetchGoalSnapshots()` — estado actual de todos los objetivos activos
- `fetchNoteActivityByRange(startDate, endDate)` — notas creadas en el período

Todas las queries de dashboard aceptan `{ start: Date, end: Date }` como
parámetro. Usar React Query con `queryKey` que incluya el período para que
el cache se invalide automáticamente al cambiar el selector.

### Restricciones de diseño del dashboard
- No mostrar más de 4-5 métricas "above the fold". El resto se puede scrollear.
- Evitar tablas de datos crudos — preferir visualizaciones simples (barras,
  líneas, donuts, heatmap). Usar Recharts.
- Los colores de las visualizaciones deben coincidir con los colores asignados
  a cada dominio en el resto de la app.
- El dashboard es read-only. No hay acciones ni edición desde aquí.
- En mobile (PWA), el layout pasa a una sola columna con las métricas más
  importantes primero (completitud de hábitos + progreso de objetivos).

## Design references
See `/design-references/README.md` before writing any UI component.
Extract intent and feeling from the references, never copy literally.

---

## What NOT to do

- Do not add Redux, MobX, or Context API for global state — Zustand is the standard here.
- Do not call Supabase directly from components or pages.
- Do not edit auto-generated files (`supabase/types.ts`, service worker files).
- Do not use `any` in TypeScript.
- Do not create cross-domain imports between feature folders
  (e.g. a `projects/` component should not import from `goals/`).
  Use shared types in `src/types/` and shared components in `src/components/common/`.
- Do not add UI libraries other than shadcn/ui without discussion.
