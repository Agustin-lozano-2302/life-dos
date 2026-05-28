# UI Redesign + Universal Notes Relations — Design Spec
**Date:** 2026-05-27  
**Sub-projects:** 1 (UI Redesign + Naming) + 2 (Universal Notes Relations)  
**Approach:** B — rediseño + relaciones dominio por dominio

---

## 1. Visual System

### Background
Every screen shares the same immersive dark base with coloured gradient blobs that reflect the active section's domain colour. The background is not flat — it has depth via a layered gradient plus 2–3 radial blobs filtered with `blur(70px)` and low opacity (0.2–0.4).

```
Base: linear-gradient(150deg, #0d0c22 0%, #070710 55%, #080614 100%)
Blobs: position: absolute, border-radius: 50%, filter: blur(70px)
```

### Domain colour palette
Each section owns a primary colour used for blob tints, glass card tints, chips, and accent elements:

| Domain     | Colour      | Tailwind token   | Hex       |
|------------|-------------|------------------|-----------|
| Hábitos    | Orange      | `orange-400/500` | `#f97316` |
| Proyectos  | Indigo      | `indigo-400/500` | `#6366f1` |
| Goals      | Emerald     | `emerald-400/500`| `#10b981` |
| Notas      | Violet      | `violet-400/500` | `#8b5cf6` |
| Dashboard  | Sky         | `sky-400/500`    | `#0ea5e9` |

Individual habits keep their user-assigned colour (orange, cyan, yellow, purple, green, etc.) for their own glass card tint.

### GlassCard primitive
All cards across the app use one of two glass variants:

**Neutral glass** (hero sections, stats, modals):
```css
background: rgba(255,255,255, 0.07);
backdrop-filter: blur(24px) saturate(180%);
border: 1px solid rgba(255,255,255, 0.12);
box-shadow: 0 8px 32px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.14);
border-radius: 18px;
```

**Tinted glass** (domain/habit cards — colour varies per entity):
```css
background: rgba(R,G,B, 0.09–0.12);
backdrop-filter: blur(24px) saturate(180%);
border: 1px solid rgba(R,G,B, 0.20–0.25);
box-shadow: 0 6px 28px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.12);
border-radius: 18px;
```

React component: `<GlassCard tint="orange" | "indigo" | "emerald" | "violet" | "neutral" | "custom" hex="#..." />`  
Implemented with Tailwind arbitrary values + a small lookup map. No external CSS file needed.

### DotMenu component
Replaces all inline action buttons (delete icon, edit icon) throughout the app. Renders a `···` trigger button; on click shows a floating glass popup anchored to the trigger.

- Trigger: 32×32px, `border-radius: 10px`, neutral glass
- Popup: `border-radius: 16px`, deep glass (`rgba(18,15,35,.95)`), `backdrop-filter: blur(28px)`, rich shadow
- Rows: icon + label + optional keyboard shortcut, separated by `rgba(255,255,255,.05)` borders
- Last row (destructive action): red tint `#f87171`
- Closes on outside click or Escape

Actions vary per entity type:
- **Hábito:** Editar · Ver historial · Vincular nota · Eliminar  
- **Proyecto:** Editar · Vincular nota · Archivar · Eliminar  
- **Tarea de proyecto:** Editar · Vincular nota · Eliminar  
- **Goal:** Editar · Vincular nota · Eliminar  
- **Nota:** Editar · Vincular a... · Eliminar  

### GlassSheet (slide panel)
Used for note detail view. Slides in from the right over a `backdrop-filter: blur(4px)` overlay.

- Width: 72% of screen on mobile, 420px on desktop
- Background: `rgba(12,10,28,.92)` + `backdrop-filter: blur(32px) saturate(200%)`
- Left border: `1px solid rgba(255,255,255,.10)` + inner shadow
- Contains: title, content (read mode), category chip, relation chips, Edit/Close actions
- Edit mode opens inline within the panel (no page navigation)

### Typography
- Font: system font stack `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif`
- Page titles: `font-size: 22px, font-weight: 800, letter-spacing: -0.4px, color: #fff`
- Section labels: `10px, font-weight: 700, letter-spacing: .08em, text-transform: uppercase, color: rgba(255,255,255,.28)`
- Body text: `13px, font-weight: 500/600, color: rgba(255,255,255,.85)`
- Secondary: `11px, color: rgba(255,255,255,.40)`

### Bottom nav
Same 5 tabs. Style: `background: rgba(8,6,20,.85)`, `backdrop-filter: blur(20px)`, `border-top: 1px solid rgba(255,255,255,.07)`. Active tab: `color: #fff`. Inactive: `color: rgba(255,255,255,.30)`.

---

## 2. Naming changes

| Old | New | Scope |
|-----|-----|-------|
| "Focus" (UI label) | "Hábitos" | BottomNav, page title, AppHeader context |
| `/focus` (route) | `/habitos` | App.tsx, all `<Link>` and `navigate()` calls |
| `/focus/manage` | `/habitos/gestionar` | Route + NavLink in FocusPage/TasksManagePage |
| `FocusPage` (component) | `HabitosPage` | File rename + import update |
| `TasksManagePage` | `HabitosGestionarPage` | File rename + import update |

All other internal names (hooks, store keys, query keys) stay in English (`useAllTasks`, `useTodayTasks`, etc.) — only user-facing strings and routes change.

---

## 3. Notes system

### 3a. Note card (NoteCard)
**Before:** clicking the card immediately opens edit mode; single delete icon visible.  
**After:**
- Card is a read-only glass card showing title, 2-line preview, category chip, relation chips (up to 2 visible + count overflow)
- `···` button in top-right corner opens DotMenu with: Editar · Vincular a... · Eliminar
- Clicking anywhere on the card body (not the `···`) opens the GlassSheet detail view
- Relation chips are colour-coded by domain and navigable on click

### 3b. GlassSheet detail view (NoteSheet)
Slide panel triggered by clicking a NoteCard body. Contains:
- **Header:** note title (editable inline on click) + `×` close + `···` DotMenu
- **Body:** full note content in read mode; tap to enter edit mode (textarea replaces the text)
- **Category:** chip below title, editable via dropdown
- **Relations section:** all linked entities as coloured chips; `+ Vincular` button opens the link picker
- **Footer:** "Última edición hace X" timestamp

### 3c. Universal relations

**DB change:** extend `note_links.entity_type` to support `'project_task'` in addition to existing `'daily_task' | 'project' | 'goal'`. No migration needed for the constraint (it's a text column); just update the TypeScript type.

Update `src/types/notes.ts`:
```ts
export type NoteEntityType = 'daily_task' | 'project' | 'project_task' | 'goal'
```

**Link picker (LinkPicker component):**  
Global search modal triggered by "Vincular a..." from any DotMenu or from NoteSheet. Searches across all entity types in real time. Results grouped by domain with domain colour. Selecting an entity calls `addNoteLink(noteId, entityType, entityId)`.

**Back-references on entities:**  
Each entity card/detail shows a "Notas vinculadas" section (collapsed by default, expandable). Clicking a linked note chip opens its GlassSheet.

- **Habit task card:** shows linked note count badge on the `···` menu
- **ProjectTaskCard:** shows note chips in an expanded detail area
- **GoalCard:** shows note chips inline below the progress bar
- **ProjectCard:** shows note count in the card footer

---

## 4. Per-domain glass treatment

### Hábitos (HabitosPage)
- Blobs: orange + violet (+ cyan at bottom)
- Hero: neutral glass ring with completion % + streak
- Pending tasks: individual tinted glass cards using each habit's assigned colour
- Completed tasks: same cards at 50% opacity + strikethrough
- Manage route (`/habitos/gestionar`): same background treatment, cards for each habit

### Notas (NotesPage)
- Blobs: violet + indigo
- Each note card: tinted by the colour of its **primary linked entity** (e.g. a note linked to the "Morning run" habit uses that habit's orange tint; a note linked to a project uses indigo). If the note has no links, it defaults to violet (notes domain colour).
- Relation chips visible on cards (primary linked entity shown)
- Search bar: neutral glass input at top

### Goals (GoalsPage)
- Blobs: emerald (dominant) + violet secondary
- Each goal: glass card with gradient progress bar matching domain colour
- Overdue indicator: red tint on the deadline chip
- Linked habit/project shown as small chip below the bar

### Proyectos (ProjectsPage + ProjectBoardPage)
- List view blobs: indigo + purple
- Board view: same blobs, column headers as neutral glass, task cards as tinted glass
- Status badge: glass pill coloured by status (active=indigo, paused=slate, done=emerald)

### Dashboard (DashboardPage)
- Blobs: sky + violet
- All stat cards: neutral glass
- Heatmap: same glass card wrapper
- Period selector: glass segmented control

---

## 5. Component architecture

### New components
| Component | Location | Purpose |
|-----------|----------|---------|
| `GlassCard` | `components/common/GlassCard.tsx` | Base glass card primitive, accepts `tint` + `hex` props |
| `GlassBlobs` | `components/common/GlassBlobs.tsx` | Renders 2–3 blobs for a given domain colour, absolutely positioned |
| `DotMenu` | `components/common/DotMenu.tsx` | `···` trigger + floating glass popup, accepts `items` array |
| `GlassSheet` | `components/common/GlassSheet.tsx` | Slide panel overlay with blur backdrop |
| `LinkPicker` | `components/common/LinkPicker.tsx` | Global entity search + select modal |
| `NoteSheet` | `components/notes/NoteSheet.tsx` | Note detail inside GlassSheet |
| `RelationChips` | `components/common/RelationChips.tsx` | Renders coloured entity chips + `+ Vincular` button |

### Modified components
- `NoteCard` — remove delete button, add `···` DotMenu, click body → NoteSheet
- `AppLayout` — add `<GlassBlobs>` layer, remove border-b from AppHeader on glass screens
- `BottomNav` — updated glass style
- `GoalCard`, `ProjectCard`, `ProjectTaskCard` — add `···` DotMenu, add `RelationChips`
- `TaskCard` (daily) — add `···` DotMenu

### Routing (no new routes for sub-projects 1+2)
`/focus` → `/habitos`, `/focus/manage` → `/habitos/gestionar`. All other routes unchanged.

---

## 6. What is NOT in scope (Sub-project 3)

- Detail page for an individual habit (history/stats)
- Detail page for a project task
- Detail page for a goal
- Dashboard improvements beyond glass styling

These will be designed separately after sub-projects 1+2 ship.

---

## Success criteria

- Every screen has the immersive glass look with domain-coloured blobs
- No inline delete/edit buttons remain — all actions go through `···` DotMenu
- Clicking a note card body opens the GlassSheet detail view
- Notes can be linked to habits, projects, project tasks, and goals from both directions (from note AND from entity via DotMenu)
- All user-facing references to "Focus" read "Hábitos"
- All existing tests pass; new components have test coverage
