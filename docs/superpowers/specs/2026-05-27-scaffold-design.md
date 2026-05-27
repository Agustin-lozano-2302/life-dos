# Life Do's — Scaffold Design

**Date:** 2026-05-27  
**Sub-project:** 1 of 6 — Project scaffold  
**Status:** Approved

---

## Overview

Bootstrap the full project skeleton for Life Do's: a personal productivity PWA that unifies daily habits, projects, goals, and notes. This spec covers the scaffold only — no feature logic. The output is a running dev server with 4 navigable tab stubs, dark/light theme toggle, and all libraries wired up.

Build order for the full app:
1. **Scaffold** ← this spec
2. Daily Tasks
3. Projects (kanban)
4. Goals
5. Notes
6. Dashboard

---

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| App name | Life Do's | As specified by user |
| Framework | React + Vite + TypeScript | Per CLAUDE.md |
| Routing | React Router v6 | Standard, battle-tested |
| Desktop layout | Bottom tabs everywhere | Consistent PWA-first feel, same as mobile |
| Dark mode strategy | Tailwind `class` + localStorage | Manual toggle, default dark |
| Scaffold approach | Full setup in one pass | Stack is fully decided, no discovery needed |

---

## Section 1 — Dependencies

### Runtime
```
react-router-dom          # routing
@tanstack/react-query     # server state
zustand                   # global UI state
@supabase/supabase-js     # DB client
recharts                  # dashboard charts
lucide-react              # icons
clsx                      # conditional classes
tailwind-merge            # merge Tailwind classes without conflicts
vite-plugin-pwa           # PWA / service worker
```

### Dev
```
tailwindcss
autoprefixer
postcss
@types/node               # for path alias resolution
```

### shadcn/ui
Initialized via `npx shadcn@latest init` after Tailwind is configured. Generates `src/components/ui/`, `src/lib/utils.ts`, and the CSS variable theme in `src/index.css`.

---

## Section 2 — Routing & Layout Architecture

### Route tree
```
/           → redirect to /focus
/focus      → FocusPage
/projects   → ProjectsPage
/goals      → GoalsPage
/notes      → NotesPage
```

### Component tree
```
main.tsx
  └─ QueryClientProvider
       └─ BrowserRouter
            └─ App.tsx
                 └─ Routes
                      └─ AppLayout (parent route)
                           ├─ AppHeader (app name + theme toggle)
                           ├─ <Outlet /> (flex-1, overflow-y-auto)
                           └─ BottomNav (fixed, ~56px)
```

### AppLayout
- `h-dvh` full height, flex column
- Header: "Life Do's" title left, theme toggle button right
- Content area: a `<div className="flex-1 overflow-y-auto"><div className="max-w-2xl mx-auto px-4">{outlet}</div></div>` — the `max-w-2xl` wrapper lives here in AppLayout, not in individual pages
- Bottom nav: sticky at bottom, never scrolls away

### BottomNav
4 tabs with lucide icons:

| Tab | Route | Icon |
|---|---|---|
| Focus | `/focus` | `Zap` |
| Projects | `/projects` | `LayoutGrid` |
| Goals | `/goals` | `Target` |
| Notes | `/notes` | `FileText` |

Active tab: filled violet-600 pill background (`bg-violet-600 text-white`).  
Inactive tabs: muted foreground.  
Same component renders on both mobile and desktop.

### Pages (stubs)
Each page file (`FocusPage.tsx`, `ProjectsPage.tsx`, `GoalsPage.tsx`, `NotesPage.tsx`) is a placeholder `<div>` with the page title. Feature logic is added in subsequent sub-projects.

---

## Section 3 — Theme System

### Tailwind config
```js
// tailwind.config.ts
darkMode: 'class'
```

### Flash prevention (synchronous, before React mounts)
```html
<!-- index.html, inside <head> -->
<script>
  if (localStorage.getItem('theme') !== 'light') {
    document.documentElement.classList.add('dark')
  }
</script>
```

### Zustand theme store (`src/store/theme.ts`)
```ts
interface ThemeStore {
  theme: 'dark' | 'light'
  toggle: () => void
}
```
- Initializes by reading `localStorage.getItem('theme')`, defaults to `'dark'`
- `toggle()`: flips theme, persists to localStorage, updates `document.documentElement.classList`

### CSS variables (`src/index.css`)
Two blocks: `:root` (light palette) and `.dark` override (dark palette). Colors use the violet/purple accent from the design references (`violet-600` / `#7c3aed` as primary).

### Toggle UI
Sun/moon icon button (`Sun` / `Moon` from lucide-react) in `AppHeader`, calls `useThemeStore().toggle()`.

---

## Section 4 — PWA & Supabase Stubs

### vite-plugin-pwa config
```ts
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: "Life Do's",
    short_name: "Life Do's",
    theme_color: '#7c3aed',
    background_color: '#0f0f14',
    display: 'standalone',
    start_url: '/',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
    ]
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
  }
})
```
Placeholder icons: simple violet square SVGs converted to PNG. Real icons in a future polish pass.  
**Important:** test PWA with `pnpm preview`, not `pnpm dev`.

### Supabase client (`src/lib/supabase/client.ts`)
```ts
import { createClient } from '@supabase/supabase-js'
export default createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

### `.env.local`
```
VITE_SUPABASE_URL=https://placeholder.supabase.co
VITE_SUPABASE_ANON_KEY=placeholder-anon-key
```
Placeholder values prevent startup crash. Real values come from the Supabase project dashboard.

### `src/lib/supabase/types.ts`
Empty placeholder. Auto-generated by `pnpm supabase:types` once schema exists. Never edit manually.

---

## Directory Structure

Full `src/` tree created by this scaffold:

```
src/
  assets/
  components/
    ui/                   # shadcn/ui primitives (CLI-generated)
    common/
      AppLayout.tsx
      AppHeader.tsx
      BottomNav.tsx
  hooks/                  # (empty, ready for custom hooks)
  lib/
    utils.ts              # shadcn/ui cn() utility (CLI-generated)
    supabase/
      client.ts
      types.ts            # placeholder
      queries/            # (empty, one file per domain later)
  pages/
    FocusPage.tsx
    ProjectsPage.tsx
    GoalsPage.tsx
    NotesPage.tsx
  store/
    theme.ts
  types/                  # (empty, app-level TS types)
  utils/                  # (empty, pure utility functions)
  App.tsx
  main.tsx
  index.css
public/
  icons/
    icon-192.png
    icon-512.png
.env.local
```

---

## Acceptance Criteria

- [ ] `pnpm dev` starts without errors
- [ ] `pnpm typecheck` passes with zero errors
- [ ] Navigating between `/focus`, `/projects`, `/goals`, `/notes` works; bottom nav highlights the active tab
- [ ] Theme toggle switches between dark and light; preference survives a page refresh
- [ ] `pnpm preview` registers a service worker (PWA installable)
- [ ] No direct Supabase calls from components (client only in `src/lib/supabase/`)
