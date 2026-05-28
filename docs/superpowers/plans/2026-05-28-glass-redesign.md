# Glass Redesign + Notes Relations — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform every screen to an immersive Apple-glass dark aesthetic with domain-coloured radial blobs and glassmorphism cards, rename Focus → Hábitos, and add universal notes-to-entity linking from both directions.

**Architecture:** Build 4 glass primitives first (GlassCard, GlassBlobs, DotMenu, GlassSheet); wire dark theme + shell; apply per-domain glass page by page; finish with NoteSheet, RelationChips, and LinkPicker for the universal notes relations layer.

**Tech Stack:** React + TypeScript + Tailwind v4 (arbitrary value syntax for glass CSS) + Vitest + React Testing Library + `@testing-library/user-event`

---

## File Map

### Created
| File | Responsibility |
|------|---------------|
| `src/components/common/GlassCard.tsx` | Glass card primitive (neutral + domain tints + custom hex) |
| `src/components/common/GlassCard.test.tsx` | Unit tests |
| `src/components/common/GlassBlobs.tsx` | Domain-coloured radial blur blobs, absolutely positioned |
| `src/components/common/GlassBlobs.test.tsx` | Unit tests |
| `src/components/common/DotMenu.tsx` | `···` trigger + floating glass popup with item list |
| `src/components/common/DotMenu.test.tsx` | Unit tests |
| `src/components/common/GlassSheet.tsx` | Right-side slide panel with blur backdrop |
| `src/components/common/GlassSheet.test.tsx` | Unit tests |
| `src/components/common/RelationChips.tsx` | Coloured entity chips + "+ Vincular" button |
| `src/components/common/RelationChips.test.tsx` | Unit tests |
| `src/components/common/LinkPicker.tsx` | Global entity search + select modal |
| `src/components/common/LinkPicker.test.tsx` | Unit tests |
| `src/components/notes/NoteSheet.tsx` | Note detail + inline edit inside GlassSheet |
| `src/components/notes/NoteSheet.test.tsx` | Unit tests |
| `src/pages/HabitosPage.tsx` | Renamed FocusPage + glass treatment |
| `src/pages/HabitosGestionarPage.tsx` | Renamed TasksManagePage + glass treatment |

### Modified
| File | Change |
|------|--------|
| `src/main.tsx` | Force `dark` class on `<html>` unconditionally |
| `src/index.css` | Override dark theme vars for glass palette |
| `src/App.tsx` | Routes `/focus` → `/habitos`, `/focus/manage` → `/habitos/gestionar` |
| `src/components/common/AppLayout.tsx` | Gradient bg + `<GlassBlobs>` by active route |
| `src/components/common/AppHeader.tsx` | Remove border-b and theme toggle |
| `src/components/common/BottomNav.tsx` | Glass style + `/focus`→`/habitos` + label "Hábitos" |
| `src/components/common/BottomNav.test.tsx` | Update to match new label/route |
| `src/components/daily-tasks/TaskCard.tsx` | Add `DotMenu` replacing no-op (toggle stays) |
| `src/components/daily-tasks/TaskCard.test.tsx` | Update |
| `src/components/goals/GoalCard.tsx` | Replace inline Edit/✕ with `DotMenu`; wrap in `GlassCard` |
| `src/components/goals/GoalCard.test.tsx` | Update |
| `src/components/projects/ProjectCard.tsx` | Wrap in `GlassCard`; add `DotMenu` via `onEdit`/`onDelete` props |
| `src/components/projects/ProjectCard.test.tsx` | Update |
| `src/components/projects/ProjectTaskCard.tsx` | Replace Trash2 + arrows with `DotMenu`; wrap in `GlassCard` |
| `src/components/projects/ProjectTaskCard.test.tsx` | Update |
| `src/components/notes/NoteCard.tsx` | Add `DotMenu`, click body → NoteSheet; wrap in `GlassCard` |
| `src/components/notes/NoteCard.test.tsx` | Update |
| `src/pages/NotesPage.tsx` | Replace edit-mode navigation with NoteSheet overlay |
| `src/pages/GoalsPage.tsx` | Glass page wrapper (blobs now in AppLayout — just update typography) |
| `src/pages/ProjectsPage.tsx` | Glass page wrapper |
| `src/pages/ProjectBoardPage.tsx` | Glass column/card treatment |
| `src/pages/DashboardPage.tsx` | Glass stat cards |
| `src/types/notes.ts` | Add `'project_task'` to `NoteEntityType` |
| `src/lib/supabase/queries/notes.ts` | Add `fetchNoteLinksForEntity` |
| `src/lib/supabase/queries/notes.test.ts` | Test new query |

---

## Task 1: GlassCard primitive

**Files:**
- Create: `src/components/common/GlassCard.tsx`
- Create: `src/components/common/GlassCard.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/common/GlassCard.test.tsx
import { render, screen } from '@testing-library/react'
import { GlassCard } from './GlassCard'

describe('GlassCard', () => {
  it('renders children', () => {
    render(<GlassCard>hello</GlassCard>)
    expect(screen.getByText('hello')).toBeInTheDocument()
  })

  it('applies neutral glass classes by default', () => {
    const { container } = render(<GlassCard>x</GlassCard>)
    const el = container.firstChild as HTMLElement
    expect(el.className).toMatch(/backdrop-blur/)
    expect(el.className).toMatch(/rounded/)
  })

  it('merges extra className', () => {
    const { container } = render(<GlassCard className="p-4">x</GlassCard>)
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain('p-4')
  })

  it('applies custom hex style when tint=custom', () => {
    const { container } = render(<GlassCard tint="custom" hex="#6366f1">x</GlassCard>)
    const el = container.firstChild as HTMLElement
    expect(el.style.backgroundColor).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run test — expect failure**

```
pnpm test:run src/components/common/GlassCard.test.tsx
```
Expected: FAIL — "GlassCard" not found.

- [ ] **Step 3: Implement GlassCard**

```tsx
// src/components/common/GlassCard.tsx
import { cn } from '@/lib/utils'

const TINT_CLASSES: Record<string, { bg: string; border: string }> = {
  neutral: { bg: 'bg-white/7',              border: 'border-white/[0.12]' },
  orange:  { bg: 'bg-orange-500/[0.10]',    border: 'border-orange-400/[0.22]' },
  indigo:  { bg: 'bg-indigo-500/[0.10]',    border: 'border-indigo-400/[0.22]' },
  emerald: { bg: 'bg-emerald-500/[0.10]',   border: 'border-emerald-400/[0.22]' },
  violet:  { bg: 'bg-violet-500/[0.10]',    border: 'border-violet-400/[0.22]' },
  sky:     { bg: 'bg-sky-500/[0.10]',       border: 'border-sky-400/[0.22]' },
}

export type GlassTint = keyof typeof TINT_CLASSES | 'custom'

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  tint?: GlassTint
  hex?: string
}

export function GlassCard({
  tint = 'neutral',
  hex,
  className,
  style,
  children,
  ...props
}: GlassCardProps) {
  const isCustom = tint === 'custom' && !!hex
  const tintEntry = isCustom ? null : (TINT_CLASSES[tint] ?? TINT_CLASSES.neutral)

  const customStyle: React.CSSProperties = isCustom
    ? { backgroundColor: `${hex}1a`, borderColor: `${hex}40`, ...style }
    : { ...style }

  return (
    <div
      className={cn(
        'rounded-[18px] border backdrop-blur-2xl backdrop-saturate-[180%]',
        'shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.14)]',
        tintEntry?.bg,
        tintEntry?.border,
        className,
      )}
      style={customStyle}
      {...props}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 4: Run test — expect pass**

```
pnpm test:run src/components/common/GlassCard.test.tsx
```
Expected: 4 passing.

- [ ] **Step 5: Commit**

```
git add src/components/common/GlassCard.tsx src/components/common/GlassCard.test.tsx
git commit -m "Add GlassCard primitive"
```

---

## Task 2: GlassBlobs primitive

**Files:**
- Create: `src/components/common/GlassBlobs.tsx`
- Create: `src/components/common/GlassBlobs.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/common/GlassBlobs.test.tsx
import { render, container } from '@testing-library/react'
import { GlassBlobs } from './GlassBlobs'

describe('GlassBlobs', () => {
  it('renders without crashing for every domain', () => {
    const domains = ['habitos', 'projects', 'goals', 'notes', 'dashboard'] as const
    for (const domain of domains) {
      const { unmount } = render(<GlassBlobs domain={domain} />)
      unmount()
    }
  })

  it('is aria-hidden', () => {
    const { container } = render(<GlassBlobs domain="habitos" />)
    expect(container.firstChild).toHaveAttribute('aria-hidden')
  })

  it('renders blob elements', () => {
    const { container } = render(<GlassBlobs domain="goals" />)
    const blobs = container.querySelectorAll('.rounded-full')
    expect(blobs.length).toBeGreaterThanOrEqual(2)
  })
})
```

- [ ] **Step 2: Run test — expect failure**

```
pnpm test:run src/components/common/GlassBlobs.test.tsx
```

- [ ] **Step 3: Implement GlassBlobs**

```tsx
// src/components/common/GlassBlobs.tsx
export type BlobDomain = 'habitos' | 'projects' | 'goals' | 'notes' | 'dashboard'

type BlobConfig = { color: string; size: string; top: string; left: string; opacity: string }

const BLOBS: Record<BlobDomain, BlobConfig[]> = {
  habitos: [
    { color: '#f97316', size: '420px', top: '-10%', left: '-5%',  opacity: '0.30' },
    { color: '#8b5cf6', size: '350px', top: '40%',  left: '60%',  opacity: '0.20' },
    { color: '#06b6d4', size: '280px', top: '70%',  left: '10%',  opacity: '0.18' },
  ],
  projects: [
    { color: '#6366f1', size: '450px', top: '-15%', left: '20%',  opacity: '0.28' },
    { color: '#a855f7', size: '360px', top: '50%',  left: '-10%', opacity: '0.20' },
  ],
  goals: [
    { color: '#10b981', size: '420px', top: '-10%', left: '30%',  opacity: '0.28' },
    { color: '#8b5cf6', size: '300px', top: '55%',  left: '60%',  opacity: '0.20' },
  ],
  notes: [
    { color: '#8b5cf6', size: '420px', top: '-5%',  left: '-10%', opacity: '0.30' },
    { color: '#6366f1', size: '350px', top: '50%',  left: '55%',  opacity: '0.20' },
  ],
  dashboard: [
    { color: '#0ea5e9', size: '420px', top: '-10%', left: '10%',  opacity: '0.28' },
    { color: '#8b5cf6', size: '350px', top: '50%',  left: '55%',  opacity: '0.20' },
  ],
}

export function GlassBlobs({ domain }: { domain: BlobDomain }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {BLOBS[domain].map((b, i) => (
        <div
          key={i}
          className="absolute rounded-full blur-[70px]"
          style={{
            backgroundColor: b.color,
            width: b.size,
            height: b.size,
            top: b.top,
            left: b.left,
            opacity: b.opacity,
          }}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Run test — expect pass**

```
pnpm test:run src/components/common/GlassBlobs.test.tsx
```

- [ ] **Step 5: Commit**

```
git add src/components/common/GlassBlobs.tsx src/components/common/GlassBlobs.test.tsx
git commit -m "Add GlassBlobs primitive"
```

---

## Task 3: DotMenu primitive

**Files:**
- Create: `src/components/common/DotMenu.tsx`
- Create: `src/components/common/DotMenu.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/common/DotMenu.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DotMenu } from './DotMenu'
import type { DotMenuItem } from './DotMenu'

const items: DotMenuItem[] = [
  { label: 'Editar', onClick: vi.fn() },
  { label: 'Eliminar', destructive: true, onClick: vi.fn() },
]

describe('DotMenu', () => {
  beforeEach(() => {
    items.forEach((i) => vi.clearAllMocks())
  })

  it('renders trigger button', () => {
    render(<DotMenu items={items} />)
    expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument()
  })

  it('menu is hidden initially', () => {
    render(<DotMenu items={items} />)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('shows menu on trigger click', async () => {
    const user = userEvent.setup()
    render(<DotMenu items={items} />)
    await user.click(screen.getByRole('button', { name: /open menu/i }))
    expect(screen.getByRole('menu')).toBeInTheDocument()
    expect(screen.getByText('Editar')).toBeInTheDocument()
    expect(screen.getByText('Eliminar')).toBeInTheDocument()
  })

  it('calls item onClick and closes menu', async () => {
    const user = userEvent.setup()
    render(<DotMenu items={items} />)
    await user.click(screen.getByRole('button', { name: /open menu/i }))
    await user.click(screen.getByRole('menuitem', { name: 'Editar' }))
    expect(items[0].onClick).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('closes menu on Escape key', async () => {
    const user = userEvent.setup()
    render(<DotMenu items={items} />)
    await user.click(screen.getByRole('button', { name: /open menu/i }))
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('applies destructive styling to destructive items', async () => {
    const user = userEvent.setup()
    render(<DotMenu items={items} />)
    await user.click(screen.getByRole('button', { name: /open menu/i }))
    const deleteBtn = screen.getByRole('menuitem', { name: 'Eliminar' })
    expect(deleteBtn.className).toMatch(/text-red/)
  })
})
```

- [ ] **Step 2: Run test — expect failure**

```
pnpm test:run src/components/common/DotMenu.test.tsx
```

- [ ] **Step 3: Implement DotMenu**

```tsx
// src/components/common/DotMenu.tsx
import { useRef, useEffect, useState } from 'react'
import { MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DotMenuItem {
  label: string
  icon?: React.ReactNode
  shortcut?: string
  destructive?: boolean
  onClick: () => void
}

interface DotMenuProps {
  items: DotMenuItem[]
  align?: 'left' | 'right'
}

export function DotMenu({ items, align = 'right' }: DotMenuProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    function onOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onOutside)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onOutside)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}
        aria-label="Open menu"
        aria-expanded={open}
        className="flex h-8 w-8 items-center justify-center rounded-[10px] border border-white/[0.12] bg-white/7 text-white/60 transition-colors hover:text-white"
      >
        <MoreHorizontal size={16} />
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            'absolute z-50 mt-1 min-w-[160px] overflow-hidden rounded-[16px] border border-white/[0.10] py-1',
            'bg-[rgba(18,15,35,0.95)] shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-[28px]',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          {items.map((item, i) => (
            <button
              key={i}
              role="menuitem"
              type="button"
              onClick={(e) => { e.stopPropagation(); item.onClick(); setOpen(false) }}
              className={cn(
                'flex w-full items-center gap-2.5 px-3 py-2 text-sm font-medium transition-colors hover:bg-white/[0.06]',
                item.destructive ? 'text-red-400' : 'text-white/85',
                i > 0 && 'border-t border-white/[0.05]',
              )}
            >
              {item.icon && <span className="shrink-0">{item.icon}</span>}
              <span className="flex-1 text-left">{item.label}</span>
              {item.shortcut && (
                <span className="text-xs text-white/30">{item.shortcut}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run test — expect pass**

```
pnpm test:run src/components/common/DotMenu.test.tsx
```

- [ ] **Step 5: Commit**

```
git add src/components/common/DotMenu.tsx src/components/common/DotMenu.test.tsx
git commit -m "Add DotMenu primitive"
```

---

## Task 4: GlassSheet primitive

**Files:**
- Create: `src/components/common/GlassSheet.tsx`
- Create: `src/components/common/GlassSheet.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/common/GlassSheet.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GlassSheet } from './GlassSheet'

describe('GlassSheet', () => {
  it('does not render when closed', () => {
    render(<GlassSheet open={false} onClose={vi.fn()}>content</GlassSheet>)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders children when open', () => {
    render(<GlassSheet open={true} onClose={vi.fn()}>panel content</GlassSheet>)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('panel content')).toBeInTheDocument()
  })

  it('calls onClose when Escape is pressed', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<GlassSheet open={true} onClose={onClose}>x</GlassSheet>)
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when backdrop is clicked', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    const { container } = render(<GlassSheet open={true} onClose={onClose}>x</GlassSheet>)
    // The backdrop is the first child of the fixed container
    const backdrop = container.querySelector('[aria-hidden]') as HTMLElement
    await user.click(backdrop)
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: Run test — expect failure**

```
pnpm test:run src/components/common/GlassSheet.test.tsx
```

- [ ] **Step 3: Implement GlassSheet**

```tsx
// src/components/common/GlassSheet.tsx
import { useEffect } from 'react'
import { cn } from '@/lib/utils'

interface GlassSheetProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}

export function GlassSheet({ open, onClose, children, className }: GlassSheetProps) {
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-40">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/30 backdrop-blur-[4px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'absolute bottom-0 right-0 top-0 z-10 flex flex-col',
          'w-[72%] max-w-[420px]',
          'border-l border-white/[0.10] bg-[rgba(12,10,28,0.92)]',
          'shadow-[-8px_0_40px_rgba(0,0,0,0.4)] backdrop-blur-[32px] backdrop-saturate-200',
          className,
        )}
      >
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test — expect pass**

```
pnpm test:run src/components/common/GlassSheet.test.tsx
```

- [ ] **Step 5: Commit**

```
git add src/components/common/GlassSheet.tsx src/components/common/GlassSheet.test.tsx
git commit -m "Add GlassSheet slide panel primitive"
```

---

## Task 5: Dark theme + AppLayout + AppHeader + BottomNav glass shell

**Files:**
- Modify: `src/main.tsx`
- Modify: `src/index.css`
- Modify: `src/components/common/AppLayout.tsx`
- Modify: `src/components/common/AppHeader.tsx`
- Modify: `src/components/common/BottomNav.tsx`
- Modify: `src/components/common/BottomNav.test.tsx`
- Modify: `src/components/common/AppLayout.test.tsx`
- Modify: `src/components/common/AppHeader.test.tsx`

- [ ] **Step 1: Force dark mode in main.tsx**

In `src/main.tsx`, add one line before `createRoot(...)`:

```tsx
// src/main.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

document.documentElement.classList.add('dark')

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
```

- [ ] **Step 2: Update dark theme CSS vars to glass palette**

Replace the `.dark` block in `src/index.css`:

```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 4%;
    --card: 0 0% 98%;
    --card-foreground: 240 10% 4%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 4%;
    --primary: 263 70% 58%;
    --primary-foreground: 0 0% 100%;
    --secondary: 240 5% 92%;
    --secondary-foreground: 240 6% 10%;
    --muted: 240 5% 92%;
    --muted-foreground: 240 4% 46%;
    --accent: 263 70% 95%;
    --accent-foreground: 263 70% 30%;
    --destructive: 0 72% 51%;
    --destructive-foreground: 0 0% 100%;
    --border: 240 6% 90%;
    --input: 240 6% 90%;
    --ring: 263 70% 58%;
    --radius: 0.625rem;
  }

  .dark {
    --background: 240 56% 5%;
    --foreground: 0 0% 100%;
    --card: 240 30% 10%;
    --card-foreground: 0 0% 100%;
    --popover: 240 30% 10%;
    --popover-foreground: 0 0% 100%;
    --primary: 263 70% 58%;
    --primary-foreground: 0 0% 100%;
    --secondary: 240 20% 18%;
    --secondary-foreground: 0 0% 88%;
    --muted: 240 20% 18%;
    --muted-foreground: 240 10% 55%;
    --accent: 263 70% 20%;
    --accent-foreground: 263 70% 80%;
    --destructive: 0 63% 50%;
    --destructive-foreground: 0 0% 100%;
    --border: 240 20% 20%;
    --input: 240 20% 20%;
    --ring: 263 70% 58%;
  }

  * {
    border-color: hsl(var(--border));
  }

  body {
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
  }
}
```

- [ ] **Step 3: Update AppLayout to gradient + GlassBlobs**

```tsx
// src/components/common/AppLayout.tsx
import { Outlet, useLocation } from 'react-router-dom'
import { AppHeader } from './AppHeader'
import { BottomNav } from './BottomNav'
import { GlassBlobs, type BlobDomain } from './GlassBlobs'

function routeToDomain(pathname: string): BlobDomain {
  if (pathname.startsWith('/habitos')) return 'habitos'
  if (pathname.startsWith('/projects')) return 'projects'
  if (pathname.startsWith('/goals')) return 'goals'
  if (pathname.startsWith('/notes')) return 'notes'
  return 'dashboard'
}

export function AppLayout() {
  const { pathname } = useLocation()
  const domain = routeToDomain(pathname)

  return (
    <div
      className="relative flex h-dvh flex-col overflow-hidden text-white"
      style={{ background: 'linear-gradient(150deg, #0d0c22 0%, #070710 55%, #080614 100%)' }}
    >
      <GlassBlobs domain={domain} />
      <AppHeader />
      <main className="relative z-10 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
```

- [ ] **Step 4: Update AppHeader — remove border-b and theme toggle**

```tsx
// src/components/common/AppHeader.tsx
import { LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { signOut } from '@/lib/supabase/auth'

export function AppHeader() {
  const user = useAuthStore((s) => s.user)

  return (
    <header className="relative z-10 flex items-center justify-between px-4 py-3">
      <span className="text-[22px] font-extrabold tracking-[-0.4px] text-white">
        Life Do's
      </span>
      {user && (
        <button
          onClick={() => signOut()}
          aria-label="Sign out"
          className="rounded-md p-2 text-white/40 transition-colors hover:text-white"
        >
          <LogOut size={18} />
        </button>
      )}
    </header>
  )
}
```

- [ ] **Step 5: Update BottomNav glass style + /habitos tab**

```tsx
// src/components/common/BottomNav.tsx
import { BarChart2, FileText, LayoutGrid, Target, Zap } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

const tabs = [
  { to: '/habitos',   label: 'Hábitos',   Icon: Zap },
  { to: '/projects',  label: 'Projects',  Icon: LayoutGrid },
  { to: '/goals',     label: 'Goals',     Icon: Target },
  { to: '/notes',     label: 'Notes',     Icon: FileText },
  { to: '/dashboard', label: 'Dashboard', Icon: BarChart2 },
] as const

export function BottomNav() {
  return (
    <nav
      className="relative z-10 flex border-t border-white/[0.07]"
      style={{ background: 'rgba(8,6,20,0.85)', backdropFilter: 'blur(20px)' }}
    >
      {tabs.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors',
              isActive ? 'text-white' : 'text-white/30 hover:text-white/70',
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={20} className={isActive ? 'fill-white stroke-white' : ''} />
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
```

- [ ] **Step 6: Update BottomNav tests**

```tsx
// src/components/common/BottomNav.test.tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { BottomNav } from './BottomNav'

function renderNav(path = '/habitos') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <BottomNav />
    </MemoryRouter>,
  )
}

describe('BottomNav', () => {
  it('renders all five tab labels', () => {
    renderNav()
    expect(screen.getByText('Hábitos')).toBeInTheDocument()
    expect(screen.getByText('Projects')).toBeInTheDocument()
    expect(screen.getByText('Goals')).toBeInTheDocument()
    expect(screen.getByText('Notes')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('each tab links to the correct route', () => {
    renderNav()
    expect(screen.getByText('Hábitos').closest('a')).toHaveAttribute('href', '/habitos')
    expect(screen.getByText('Projects').closest('a')).toHaveAttribute('href', '/projects')
    expect(screen.getByText('Goals').closest('a')).toHaveAttribute('href', '/goals')
    expect(screen.getByText('Notes').closest('a')).toHaveAttribute('href', '/notes')
  })

  it('marks the current route with aria-current="page"', () => {
    renderNav('/projects')
    expect(screen.getByText('Projects').closest('a')).toHaveAttribute('aria-current', 'page')
  })

  it('does not mark inactive tabs with aria-current', () => {
    renderNav('/projects')
    expect(screen.getByText('Hábitos').closest('a')).not.toHaveAttribute('aria-current', 'page')
  })
})
```

- [ ] **Step 7: Update AppLayout test (route → /habitos)**

Open `src/components/common/AppLayout.test.tsx`. Find any reference to `/focus` or `FocusPage` and update to `/habitos` / `HabitosPage`. If the test just checks that `<Outlet>` renders children, it may not need changes — read it first.

- [ ] **Step 8: Update AppHeader test — remove theme-toggle assertions**

Open `src/components/common/AppHeader.test.tsx`. Remove any test that clicks the moon/sun toggle or checks `aria-label="Toggle theme"`. Keep sign-out test.

- [ ] **Step 9: Run all updated tests**

```
pnpm test:run
```
Expected: all pass. Fix any failures before moving on.

- [ ] **Step 10: Commit**

```
git add src/main.tsx src/index.css src/components/common/AppLayout.tsx src/components/common/AppHeader.tsx src/components/common/BottomNav.tsx src/components/common/BottomNav.test.tsx src/components/common/AppLayout.test.tsx src/components/common/AppHeader.test.tsx
git commit -m "Apply glass shell: dark theme, gradient bg, blobs, glass nav"
```

---

## Task 6: Rename Focus → Hábitos (routes + files)

**Files:**
- Create: `src/pages/HabitosPage.tsx`
- Create: `src/pages/HabitosGestionarPage.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create HabitosPage.tsx** (copy of FocusPage with updated strings)

```tsx
// src/pages/HabitosPage.tsx
import { Link } from 'react-router-dom'
import { useTodayTasks } from '@/hooks/useTodayTasks'
import { useTaskMutations } from '@/hooks/useTaskMutations'
import { TaskList } from '@/components/daily-tasks/TaskList'
import { DoneSection } from '@/components/daily-tasks/DoneSection'

export default function HabitosPage() {
  const { tasks, completions, isLoading } = useTodayTasks()
  const { toggleCompletion } = useTaskMutations()

  if (isLoading) {
    return <div className="py-8 text-center text-sm text-white/40">Loading…</div>
  }

  return (
    <div className="py-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-[22px] font-extrabold tracking-[-0.4px] text-white">Hoy</h1>
        <Link to="/habitos/gestionar" className="text-sm text-white/40 hover:text-white">
          Gestionar →
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

- [ ] **Step 2: Create HabitosGestionarPage.tsx** (copy of TasksManagePage with updated nav)

```tsx
// src/pages/HabitosGestionarPage.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAllTasks } from '@/hooks/useAllTasks'
import { useTaskMutations } from '@/hooks/useTaskMutations'
import { TaskForm } from '@/components/daily-tasks/TaskForm'
import { DotMenu } from '@/components/common/DotMenu'
import type { DailyTask, CreateTaskInput, UpdateTaskInput } from '@/types/daily-tasks'

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export default function HabitosGestionarPage() {
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
    if (!window.confirm(`¿Eliminar "${title}"?`)) return
    deleteTask(id)
  }

  if (isLoading) {
    return <div className="py-8 text-center text-sm text-white/40">Loading…</div>
  }

  return (
    <div className="py-4">
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="text-white/40 hover:text-white"
          aria-label="Go back"
        >
          ←
        </button>
        <h1 className="text-[22px] font-extrabold tracking-[-0.4px] text-white">Hábitos</h1>
      </div>

      {showCreate ? (
        <TaskForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} isPending={isCreating} />
      ) : (
        <button
          onClick={() => { setEditing(null); setShowCreate(true) }}
          className="mb-4 w-full rounded-[18px] border border-dashed border-white/[0.15] py-3 text-sm text-white/40 transition-colors hover:border-white/30 hover:text-white/70"
        >
          + Nuevo hábito
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
              className="flex items-center gap-3 rounded-[18px] border border-white/[0.12] bg-white/7 p-3 backdrop-blur-2xl"
            >
              <div
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: task.color ?? '#6366f1' }}
              />
              <button
                className="min-w-0 flex-1 text-left"
                onClick={() => { setShowCreate(false); setEditing(task) }}
              >
                <p className="text-sm font-medium text-white">{task.title}</p>
                <div className="mt-0.5 flex gap-1">
                  {DAY_LABELS.map((label, i) => (
                    <span
                      key={i}
                      className={`text-[10px] font-medium ${
                        task.days_of_week.includes(i) ? 'text-white/70' : 'text-white/20'
                      }`}
                    >
                      {label}
                    </span>
                  ))}
                </div>
                {task.category && <p className="text-xs text-white/40">{task.category}</p>}
              </button>
              <DotMenu
                items={[
                  { label: 'Editar', onClick: () => { setShowCreate(false); setEditing(task) } },
                  { label: 'Eliminar', destructive: true, onClick: () => handleDelete(task.id, task.title) },
                ]}
              />
            </div>
          ),
        )}
        {tasks.length === 0 && !showCreate && (
          <p className="py-6 text-center text-sm text-white/40">Sin hábitos. Agrega uno arriba.</p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Update App.tsx routes**

```tsx
// src/App.tsx
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/common/AppLayout'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import HabitosPage from '@/pages/HabitosPage'
import HabitosGestionarPage from '@/pages/HabitosGestionarPage'
import GoalsPage from '@/pages/GoalsPage'
import NotesPage from '@/pages/NotesPage'
import ProjectsPage from '@/pages/ProjectsPage'
import ProjectBoardPage from '@/pages/ProjectBoardPage'

export default function App() {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/habitos" replace />} />
          <Route path="habitos" element={<HabitosPage />} />
          <Route path="habitos/gestionar" element={<HabitosGestionarPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:id" element={<ProjectBoardPage />} />
          <Route path="goals" element={<GoalsPage />} />
          <Route path="notes" element={<NotesPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
```

- [ ] **Step 4: Run tests**

```
pnpm test:run
```
Expected: all pass. Fix any snapshot or reference to `/focus` in existing tests (check `src/components/common/AppLayout.test.tsx`).

- [ ] **Step 5: Commit**

```
git add src/pages/HabitosPage.tsx src/pages/HabitosGestionarPage.tsx src/App.tsx
git commit -m "Rename Focus → Hábitos: new pages, updated routes"
```

---

## Task 7: GoalCard glass + DotMenu

**Files:**
- Modify: `src/components/goals/GoalCard.tsx`
- Modify: `src/components/goals/GoalCard.test.tsx`

- [ ] **Step 1: Update GoalCard.test.tsx to expect DotMenu instead of inline buttons**

```tsx
// src/components/goals/GoalCard.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GoalCard } from './GoalCard'
import type { Goal } from '@/types/goals'

const goal: Goal = {
  id: 'g1',
  title: 'Run 100km',
  target_value: 100,
  current_value: 42,
  unit: 'km',
  deadline: null,
  linked_daily_task_id: null,
  linked_project_id: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

describe('GoalCard', () => {
  it('renders goal title', () => {
    render(<GoalCard goal={goal} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Run 100km')).toBeInTheDocument()
  })

  it('renders progress percentage', () => {
    render(<GoalCard goal={goal} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('42%')).toBeInTheDocument()
  })

  it('calls onEdit when Editar menu item is clicked', async () => {
    const onEdit = vi.fn()
    const user = userEvent.setup()
    render(<GoalCard goal={goal} onEdit={onEdit} onDelete={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /open menu/i }))
    await user.click(screen.getByRole('menuitem', { name: 'Editar' }))
    expect(onEdit).toHaveBeenCalledWith(goal)
  })

  it('calls onDelete when Eliminar menu item is clicked', async () => {
    const onDelete = vi.fn()
    const user = userEvent.setup()
    render(<GoalCard goal={goal} onEdit={vi.fn()} onDelete={onDelete} />)
    await user.click(screen.getByRole('button', { name: /open menu/i }))
    await user.click(screen.getByRole('menuitem', { name: 'Eliminar' }))
    expect(onDelete).toHaveBeenCalledWith('g1')
  })

  it('shows overdue chip when deadline is in the past', () => {
    render(<GoalCard goal={{ ...goal, deadline: '2020-01-01' }} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Overdue')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test — expect failures on DotMenu assertions**

```
pnpm test:run src/components/goals/GoalCard.test.tsx
```

- [ ] **Step 3: Rewrite GoalCard with GlassCard + DotMenu**

```tsx
// src/components/goals/GoalCard.tsx
import { cn } from '@/lib/utils'
import { GlassCard } from '@/components/common/GlassCard'
import { DotMenu } from '@/components/common/DotMenu'
import type { Goal } from '@/types/goals'

function progressColor(pct: number): string {
  if (pct >= 100) return 'bg-emerald-400'
  if (pct >= 60) return 'bg-sky-400'
  if (pct >= 30) return 'bg-amber-400'
  return 'bg-rose-400'
}

function daysLeft(deadline: string | null): string | null {
  if (!deadline) return null
  const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000)
  if (diff < 0) return 'Overdue'
  if (diff === 0) return 'Due today'
  return `${diff}d left`
}

interface GoalCardProps {
  goal: Goal
  onEdit: (goal: Goal) => void
  onDelete: (id: string) => void
  linkedTaskTitle?: string
  linkedProjectTitle?: string
}

export function GoalCard({
  goal,
  onEdit,
  onDelete,
  linkedTaskTitle,
  linkedProjectTitle,
}: GoalCardProps) {
  const pct = Math.min(100, Math.round((goal.current_value / goal.target_value) * 100))
  const deadline = daysLeft(goal.deadline)
  const isOverdue = deadline === 'Overdue'

  return (
    <GlassCard tint="emerald" className="p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold leading-tight text-white">{goal.title}</h3>
          {(linkedTaskTitle || linkedProjectTitle) && (
            <p className="mt-0.5 text-xs text-white/40">
              {linkedTaskTitle && `↳ ${linkedTaskTitle}`}
              {linkedProjectTitle && `↳ ${linkedProjectTitle}`}
            </p>
          )}
        </div>
        <DotMenu
          items={[
            { label: 'Editar', onClick: () => onEdit(goal) },
            { label: 'Eliminar', destructive: true, onClick: () => onDelete(goal.id) },
          ]}
        />
      </div>

      <div className="mb-2 flex items-end justify-between text-sm">
        <span className="font-semibold text-white">
          {goal.current_value} / {goal.target_value}{' '}
          <span className="text-xs font-normal text-white/40">{goal.unit}</span>
        </span>
        <span className={cn('text-xs font-medium', isOverdue ? 'text-rose-400' : 'text-white/40')}>
          {deadline ?? ''}
        </span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={cn('h-full rounded-full transition-all', progressColor(pct))}
          style={{ width: `${pct}%` }}
          aria-label={`${pct}% complete`}
        />
      </div>
      <p className="mt-1 text-right text-xs text-white/40">{pct}%</p>
    </GlassCard>
  )
}
```

- [ ] **Step 4: Run tests — expect pass**

```
pnpm test:run src/components/goals/GoalCard.test.tsx
```

- [ ] **Step 5: Commit**

```
git add src/components/goals/GoalCard.tsx src/components/goals/GoalCard.test.tsx
git commit -m "GoalCard: GlassCard + DotMenu"
```

---

## Task 8: ProjectCard + ProjectTaskCard glass + DotMenu

**Files:**
- Modify: `src/components/projects/ProjectCard.tsx`
- Modify: `src/components/projects/ProjectCard.test.tsx`
- Modify: `src/components/projects/ProjectTaskCard.tsx`
- Modify: `src/components/projects/ProjectTaskCard.test.tsx`

- [ ] **Step 1: Update ProjectCard.test.tsx**

```tsx
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
```

- [ ] **Step 2: Rewrite ProjectCard**

```tsx
// src/components/projects/ProjectCard.tsx
import { Link } from 'react-router-dom'
import { CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlassCard } from '@/components/common/GlassCard'
import type { Project } from '@/types/projects'

const STATUS_STYLES: Record<Project['status'], string> = {
  active:    'bg-indigo-500/20 text-indigo-300',
  paused:    'bg-amber-500/20 text-amber-300',
  completed: 'bg-emerald-500/20 text-emerald-300',
  archived:  'bg-white/10 text-white/40',
}

const STATUS_LABELS: Record<Project['status'], string> = {
  active:    'Active',
  paused:    'Paused',
  completed: 'Completed',
  archived:  'Archived',
}

interface ProjectCardProps {
  project: Project
  taskCount?: number
  doneCount?: number
}

export function ProjectCard({ project, taskCount = 0, doneCount = 0 }: ProjectCardProps) {
  const progress = taskCount > 0 ? Math.round((doneCount / taskCount) * 100) : 0

  return (
    <Link to={`/projects/${project.id}`} className="block">
      <GlassCard tint="indigo" className="p-4 transition-opacity hover:opacity-90">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight text-white">{project.title}</h3>
          <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-xs font-medium', STATUS_STYLES[project.status])}>
            {STATUS_LABELS[project.status]}
          </span>
        </div>

        {project.description && (
          <p className="mb-3 line-clamp-2 text-sm text-white/50">{project.description}</p>
        )}

        <div className="flex items-center justify-between gap-3 text-xs text-white/40">
          <span>{taskCount} task{taskCount !== 1 ? 's' : ''} · {doneCount} done</span>
          {project.due_date && (
            <span className="flex items-center gap-1">
              <CalendarDays size={12} />
              {project.due_date}
            </span>
          )}
        </div>

        {taskCount > 0 && (
          <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-indigo-400 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </GlassCard>
    </Link>
  )
}
```

- [ ] **Step 3: Update ProjectTaskCard.test.tsx**

```tsx
// src/components/projects/ProjectTaskCard.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProjectTaskCard } from './ProjectTaskCard'
import type { ProjectTask } from '@/types/projects'

const task: ProjectTask = {
  id: 't1',
  project_id: 'p1',
  title: 'Fix the bug',
  description: null,
  status: 'in_progress',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

describe('ProjectTaskCard', () => {
  it('renders task title', () => {
    render(<ProjectTaskCard task={task} onMove={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Fix the bug')).toBeInTheDocument()
  })

  it('calls onMove left when move left menu item is clicked', async () => {
    const onMove = vi.fn()
    const user = userEvent.setup()
    render(<ProjectTaskCard task={task} onMove={onMove} onDelete={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /open menu/i }))
    await user.click(screen.getByRole('menuitem', { name: /mover atrás/i }))
    expect(onMove).toHaveBeenCalledWith('t1', 'todo')
  })

  it('calls onDelete when Eliminar menu item is clicked', async () => {
    const onDelete = vi.fn()
    const user = userEvent.setup()
    render(<ProjectTaskCard task={task} onMove={vi.fn()} onDelete={onDelete} />)
    await user.click(screen.getByRole('button', { name: /open menu/i }))
    await user.click(screen.getByRole('menuitem', { name: 'Eliminar' }))
    expect(onDelete).toHaveBeenCalledWith('t1')
  })
})
```

- [ ] **Step 4: Run test — expect failures on DotMenu assertions**

```
pnpm test:run src/components/projects/ProjectTaskCard.test.tsx
```

- [ ] **Step 5: Rewrite ProjectTaskCard**

```tsx
// src/components/projects/ProjectTaskCard.tsx
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { GlassCard } from '@/components/common/GlassCard'
import { DotMenu } from '@/components/common/DotMenu'
import type { ProjectTask, ProjectTaskStatus } from '@/types/projects'

const STATUS_ORDER: ProjectTaskStatus[] = ['todo', 'in_progress', 'review', 'done']

interface ProjectTaskCardProps {
  task: ProjectTask
  onMove: (taskId: string, newStatus: ProjectTaskStatus) => void
  onDelete: (taskId: string) => void
}

export function ProjectTaskCard({ task, onMove, onDelete }: ProjectTaskCardProps) {
  const currentIndex = STATUS_ORDER.indexOf(task.status as ProjectTaskStatus)
  const canMoveLeft = currentIndex > 0
  const canMoveRight = currentIndex < STATUS_ORDER.length - 1

  const menuItems = [
    ...(canMoveLeft ? [{ label: 'Mover atrás', icon: <ChevronLeft size={14} />, onClick: () => onMove(task.id, STATUS_ORDER[currentIndex - 1]) }] : []),
    ...(canMoveRight ? [{ label: 'Mover adelante', icon: <ChevronRight size={14} />, onClick: () => onMove(task.id, STATUS_ORDER[currentIndex + 1]) }] : []),
    { label: 'Eliminar', destructive: true, onClick: () => onDelete(task.id) },
  ]

  return (
    <GlassCard tint="indigo" className="p-3">
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="flex-1 text-sm font-medium leading-snug text-white">{task.title}</p>
        <DotMenu items={menuItems} />
      </div>
      {task.description && (
        <p className="text-xs text-white/40 line-clamp-2">{task.description}</p>
      )}
    </GlassCard>
  )
}
```

- [ ] **Step 6: Run all project tests**

```
pnpm test:run src/components/projects/
```
Expected: all pass.

- [ ] **Step 7: Commit**

```
git add src/components/projects/ProjectCard.tsx src/components/projects/ProjectCard.test.tsx src/components/projects/ProjectTaskCard.tsx src/components/projects/ProjectTaskCard.test.tsx
git commit -m "ProjectCard + ProjectTaskCard: GlassCard + DotMenu"
```

---

## Task 9: NoteCard glass + DotMenu (prep for NoteSheet)

**Files:**
- Modify: `src/components/notes/NoteCard.tsx`
- Modify: `src/components/notes/NoteCard.test.tsx`

NoteCard's new interface: `onClick` (opens NoteSheet), `onDelete`. DotMenu has Editar (same as `onClick`), Eliminar.

- [ ] **Step 1: Update NoteCard.test.tsx**

```tsx
// src/components/notes/NoteCard.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NoteCard } from './NoteCard'
import type { Note } from '@/types/notes'

const note: Note = {
  id: 'note-1',
  title: 'Meeting notes',
  content: 'We discussed the roadmap for Q3.',
  category: 'Work',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
}

describe('NoteCard', () => {
  it('renders the note title', () => {
    render(<NoteCard note={note} onClick={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Meeting notes')).toBeInTheDocument()
  })

  it('renders a preview of the content', () => {
    render(<NoteCard note={note} onClick={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText(/We discussed the roadmap/)).toBeInTheDocument()
  })

  it('renders the category badge', () => {
    render(<NoteCard note={note} onClick={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Work')).toBeInTheDocument()
  })

  it('calls onClick when card body is clicked', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    render(<NoteCard note={note} onClick={onClick} onDelete={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /open meeting notes/i }))
    expect(onClick).toHaveBeenCalledWith(note)
  })

  it('calls onDelete when Eliminar menu item is clicked', async () => {
    const onDelete = vi.fn()
    const user = userEvent.setup()
    render(<NoteCard note={note} onClick={vi.fn()} onDelete={onDelete} />)
    await user.click(screen.getByRole('button', { name: /open menu/i }))
    await user.click(screen.getByRole('menuitem', { name: 'Eliminar' }))
    expect(onDelete).toHaveBeenCalledWith('note-1')
    expect(vi.fn()).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test — expect failures**

```
pnpm test:run src/components/notes/NoteCard.test.tsx
```

- [ ] **Step 3: Rewrite NoteCard**

```tsx
// src/components/notes/NoteCard.tsx
import { GlassCard } from '@/components/common/GlassCard'
import { DotMenu } from '@/components/common/DotMenu'
import type { Note } from '@/types/notes'

interface NoteCardProps {
  note: Note
  onClick: (note: Note) => void
  onDelete: (id: string) => void
}

export function NoteCard({ note, onClick, onDelete }: NoteCardProps) {
  const preview = note.content?.slice(0, 120)

  return (
    <GlassCard tint="violet" className="p-4">
      <div className="flex items-start gap-2">
        <button
          onClick={() => onClick(note)}
          aria-label={`Open ${note.title}`}
          className="min-w-0 flex-1 text-left"
        >
          <h3 className="font-semibold leading-tight text-white">{note.title}</h3>
          {preview && (
            <p className="mt-1 line-clamp-2 text-sm text-white/50">{preview}</p>
          )}
          <p className="mt-2 text-xs text-white/30">
            {new Date(note.updated_at).toLocaleDateString()}
          </p>
        </button>

        <div className="flex shrink-0 flex-col items-end gap-2">
          {note.category && (
            <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-xs text-violet-300">
              {note.category}
            </span>
          )}
          <DotMenu
            items={[
              { label: 'Editar', onClick: () => onClick(note) },
              { label: 'Eliminar', destructive: true, onClick: () => onDelete(note.id) },
            ]}
          />
        </div>
      </div>
    </GlassCard>
  )
}
```

- [ ] **Step 4: Run tests**

```
pnpm test:run src/components/notes/NoteCard.test.tsx
```

- [ ] **Step 5: Commit**

```
git add src/components/notes/NoteCard.tsx src/components/notes/NoteCard.test.tsx
git commit -m "NoteCard: GlassCard + DotMenu, onClick replaces onOpen"
```

---

## Task 10: TaskCard DotMenu (Hábitos page)

**Files:**
- Modify: `src/components/daily-tasks/TaskCard.tsx`
- Modify: `src/components/daily-tasks/TaskCard.test.tsx`

TaskCard keeps the toggle button for its main action. DotMenu provides secondary actions (for now: none beyond toggle, but the spec calls for "Ver historial · Vincular nota" in the future — add a stub "Vincular nota" item pointing to a no-op for now).

- [ ] **Step 1: Update TaskCard test**

```tsx
// src/components/daily-tasks/TaskCard.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskCard } from './TaskCard'
import type { DailyTask, TaskCompletion } from '@/types/daily-tasks'

const task: DailyTask = {
  id: 'task-1',
  title: 'Morning run',
  days_of_week: [1, 2, 3, 4, 5],
  category: 'Health',
  color: '#f97316',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

describe('TaskCard', () => {
  it('renders task title', () => {
    render(<TaskCard task={task} completion={undefined} onToggle={vi.fn()} />)
    expect(screen.getByText('Morning run')).toBeInTheDocument()
  })

  it('calls onToggle when toggle button is clicked', async () => {
    const onToggle = vi.fn()
    const user = userEvent.setup()
    render(<TaskCard task={task} completion={undefined} onToggle={onToggle} />)
    await user.click(screen.getByRole('button', { name: /mark as done/i }))
    expect(onToggle).toHaveBeenCalledWith('task-1', false)
  })

  it('shows DotMenu trigger', () => {
    render(<TaskCard task={task} completion={undefined} onToggle={vi.fn()} />)
    expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument()
  })

  it('applies opacity when completed', () => {
    const completion: TaskCompletion = { id: 'c1', task_id: 'task-1', date: '2026-05-28', created_at: '' }
    const { container } = render(<TaskCard task={task} completion={completion} onToggle={vi.fn()} />)
    expect(container.firstChild).toHaveClass('opacity-40')
  })
})
```

- [ ] **Step 2: Run test — expect failure on DotMenu assertion**

```
pnpm test:run src/components/daily-tasks/TaskCard.test.tsx
```

- [ ] **Step 3: Update TaskCard**

```tsx
// src/components/daily-tasks/TaskCard.tsx
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DotMenu } from '@/components/common/DotMenu'
import type { DailyTask, TaskCompletion } from '@/types/daily-tasks'

interface TaskCardProps {
  task: DailyTask
  completion: TaskCompletion | undefined
  onToggle: (taskId: string, isCompleted: boolean) => void
}

export function TaskCard({ task, completion, onToggle }: TaskCardProps) {
  const isCompleted = completion !== undefined

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-[18px] border border-white/[0.12] bg-white/7 p-3 backdrop-blur-2xl transition-opacity',
        isCompleted && 'opacity-40',
      )}
      style={{ borderColor: `${task.color ?? '#6366f1'}33` }}
    >
      <div
        className="h-3 w-3 shrink-0 rounded-full"
        style={{ backgroundColor: task.color ?? '#6366f1' }}
      />
      <div className="min-w-0 flex-1">
        <p className={cn('text-sm font-medium text-white', isCompleted && 'line-through text-white/50')}>
          {task.title}
        </p>
        {task.category && <p className="text-xs text-white/40">{task.category}</p>}
      </div>
      <DotMenu
        items={[
          { label: 'Vincular nota', onClick: () => {} },
        ]}
      />
      <button
        type="button"
        onClick={() => onToggle(task.id, isCompleted)}
        aria-label={isCompleted ? 'Mark as pending' : 'Mark as done'}
        className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
          isCompleted
            ? 'border-white/60 bg-white/60 text-black'
            : 'border-white/30 hover:border-white/60',
        )}
      >
        {isCompleted && <Check size={12} />}
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Run tests**

```
pnpm test:run src/components/daily-tasks/TaskCard.test.tsx
```

- [ ] **Step 5: Commit**

```
git add src/components/daily-tasks/TaskCard.tsx src/components/daily-tasks/TaskCard.test.tsx
git commit -m "TaskCard: glass style + DotMenu"
```

---

## Task 11: Page glass typography (Goals, Projects, Notes, Dashboard)

Apply spec page title typography and glass "new" buttons to GoalsPage, ProjectsPage, NotesPage, and DashboardPage. The blobs are already rendered by AppLayout — no blob changes needed per page.

**Files:**
- Modify: `src/pages/GoalsPage.tsx`
- Modify: `src/pages/ProjectsPage.tsx`
- Modify: `src/pages/NotesPage.tsx` (partial — NoteSheet wiring comes in Task 12)
- Modify: `src/pages/DashboardPage.tsx`

- [ ] **Step 1: Update GoalsPage typography + glass button**

In `GoalsPage.tsx`, replace:
```tsx
<h1 className="text-lg font-semibold">Goals</h1>
```
with:
```tsx
<h1 className="text-[22px] font-extrabold tracking-[-0.4px] text-white">Goals</h1>
```

Replace the dashed new-goal button className:
```tsx
className="mb-4 w-full rounded-xl border border-dashed border-border py-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
```
with:
```tsx
className="mb-4 w-full rounded-[18px] border border-dashed border-white/[0.15] py-3 text-sm text-white/40 transition-colors hover:border-white/30 hover:text-white/70"
```

Replace the loading spinner text color:
```tsx
className="py-8 text-center text-sm text-muted-foreground"
```
with:
```tsx
className="py-8 text-center text-sm text-white/40"
```

- [ ] **Step 2: Update ProjectsPage typography**

Open `src/pages/ProjectsPage.tsx`. Replace `text-muted-foreground` → `text-white/40`, `text-lg font-semibold` → `text-[22px] font-extrabold tracking-[-0.4px] text-white`, border-dashed button class same as Step 1.

- [ ] **Step 3: Update NotesPage typography (page title + search bar)**

In `src/pages/NotesPage.tsx`, replace:
```tsx
<h1 className="text-lg font-semibold">Notes</h1>
```
with:
```tsx
<h1 className="text-[22px] font-extrabold tracking-[-0.4px] text-white">Notas</h1>
```

Replace search input className:
```tsx
className="mb-4 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
```
with:
```tsx
className="mb-4 w-full rounded-[18px] border border-white/[0.12] bg-white/7 px-3 py-2 text-sm text-white placeholder-white/30 outline-none backdrop-blur-2xl focus:border-violet-400/40"
```

Change `onOpen={handleOpen}` prop to `onClick={handleOpen}` to match the new NoteCard interface. Also change `onOpen` in the `handleOpen` function — it stays the same logic for now (opens edit mode), but in Task 12 we'll replace it with NoteSheet.

- [ ] **Step 4: Update DashboardPage glass styling**

Open `src/pages/DashboardPage.tsx`. Replace any `bg-card rounded-xl border border-border` card wrappers with `<GlassCard tint="neutral">`. Update the page title to use the glass typography. Replace `text-muted-foreground` → `text-white/40`.

- [ ] **Step 5: Run all tests**

```
pnpm test:run
```
Fix any failures — these are mostly string/class changes, tests shouldn't break unless they assert class names directly.

- [ ] **Step 6: Commit**

```
git add src/pages/GoalsPage.tsx src/pages/ProjectsPage.tsx src/pages/NotesPage.tsx src/pages/DashboardPage.tsx
git commit -m "Apply glass page typography to Goals, Projects, Notes, Dashboard"
```

---

## Task 12: NoteSheet — slide panel for note detail + inline edit

**Files:**
- Create: `src/components/notes/NoteSheet.tsx`
- Create: `src/components/notes/NoteSheet.test.tsx`
- Modify: `src/pages/NotesPage.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/notes/NoteSheet.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NoteSheet } from './NoteSheet'
import type { Note } from '@/types/notes'

vi.mock('@/hooks/useNoteMutations', () => ({
  useNoteMutations: () => ({
    updateNote: vi.fn(),
    deleteNote: vi.fn(),
    isUpdating: false,
  }),
}))

const note: Note = {
  id: 'note-1',
  title: 'Stand-up notes',
  content: 'Discussed sprint goals.',
  category: 'Work',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
}

describe('NoteSheet', () => {
  it('does not render when note is null', () => {
    render(<NoteSheet note={null} onClose={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders note title and content when open', () => {
    render(<NoteSheet note={note} onClose={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Stand-up notes')).toBeInTheDocument()
    expect(screen.getByText('Discussed sprint goals.')).toBeInTheDocument()
  })

  it('calls onClose when × is clicked', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<NoteSheet note={note} onClose={onClose} onDelete={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /close/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('switches to edit mode when Editar DotMenu item is clicked', async () => {
    const user = userEvent.setup()
    render(<NoteSheet note={note} onClose={vi.fn()} onDelete={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /open menu/i }))
    await user.click(screen.getByRole('menuitem', { name: 'Editar' }))
    expect(screen.getByRole('textbox', { name: /title/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test — expect failure**

```
pnpm test:run src/components/notes/NoteSheet.test.tsx
```

- [ ] **Step 3: Implement NoteSheet**

```tsx
// src/components/notes/NoteSheet.tsx
import { useState } from 'react'
import { X } from 'lucide-react'
import { GlassSheet } from '@/components/common/GlassSheet'
import { DotMenu } from '@/components/common/DotMenu'
import { useNoteMutations } from '@/hooks/useNoteMutations'
import type { Note, UpdateNoteInput } from '@/types/notes'

interface NoteSheetProps {
  note: Note | null
  onClose: () => void
  onDelete: (id: string) => void
}

export function NoteSheet({ note, onClose, onDelete }: NoteSheetProps) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const { updateNote, isUpdating } = useNoteMutations()

  function openEdit() {
    if (!note) return
    setTitle(note.title)
    setContent(note.content ?? '')
    setEditing(true)
  }

  function handleSave() {
    if (!note) return
    const input: UpdateNoteInput = { id: note.id, title, content: content || null }
    updateNote(input, { onSuccess: () => setEditing(false) })
  }

  function handleClose() {
    setEditing(false)
    onClose()
  }

  return (
    <GlassSheet open={!!note} onClose={handleClose}>
      {note && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
            {editing ? (
              <input
                aria-label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex-1 bg-transparent text-base font-semibold text-white outline-none"
              />
            ) : (
              <h2 className="flex-1 text-base font-semibold text-white">{note.title}</h2>
            )}
            <div className="flex items-center gap-1">
              <DotMenu
                items={[
                  { label: 'Editar', onClick: openEdit },
                  { label: 'Eliminar', destructive: true, onClick: () => { onDelete(note.id); handleClose() } },
                ]}
              />
              <button
                onClick={handleClose}
                aria-label="Close"
                className="ml-1 flex h-8 w-8 items-center justify-center rounded-[10px] text-white/40 transition-colors hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4">
            {note.category && (
              <span className="mb-3 inline-block rounded-full bg-violet-500/20 px-2 py-0.5 text-xs text-violet-300">
                {note.category}
              </span>
            )}

            {editing ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full resize-none bg-transparent text-sm text-white/80 outline-none"
                rows={12}
                placeholder="Contenido de la nota…"
              />
            ) : (
              <p className="whitespace-pre-wrap text-sm text-white/80">
                {note.content ?? <span className="text-white/30">Sin contenido.</span>}
              </p>
            )}
          </div>

          {/* Footer */}
          {editing ? (
            <div className="flex gap-2 border-t border-white/[0.08] p-3">
              <button
                onClick={handleSave}
                disabled={isUpdating}
                className="flex-1 rounded-[14px] bg-violet-500/30 py-2 text-sm font-medium text-violet-200 transition-colors hover:bg-violet-500/40 disabled:opacity-50"
              >
                Guardar
              </button>
              <button
                onClick={() => setEditing(false)}
                className="flex-1 rounded-[14px] bg-white/7 py-2 text-sm font-medium text-white/60 transition-colors hover:bg-white/10"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <div className="border-t border-white/[0.08] px-4 py-2">
              <p className="text-xs text-white/25">
                Última edición {new Date(note.updated_at).toLocaleDateString()}
              </p>
            </div>
          )}
        </>
      )}
    </GlassSheet>
  )
}
```

- [ ] **Step 4: Run NoteSheet tests**

```
pnpm test:run src/components/notes/NoteSheet.test.tsx
```
Expected: all pass.

- [ ] **Step 5: Wire NoteSheet into NotesPage**

Replace the entire `src/pages/NotesPage.tsx`:

```tsx
// src/pages/NotesPage.tsx
import { useState } from 'react'
import { useNotes } from '@/hooks/useNotes'
import { useNoteMutations } from '@/hooks/useNoteMutations'
import { NoteCard } from '@/components/notes/NoteCard'
import { NoteEditor } from '@/components/notes/NoteEditor'
import { NoteSheet } from '@/components/notes/NoteSheet'
import type { Note, CreateNoteInput } from '@/types/notes'

export default function NotesPage() {
  const { notes, isLoading } = useNotes()
  const { createNote, deleteNote, isCreating } = useNoteMutations()

  const [mode, setMode] = useState<'list' | 'create'>('list')
  const [activeNote, setActiveNote] = useState<Note | null>(null)
  const [search, setSearch] = useState('')

  function handleCreate(data: CreateNoteInput) {
    createNote(data, { onSuccess: () => setMode('list') })
  }

  function handleDelete(id: string) {
    if (!window.confirm('¿Eliminar esta nota?')) return
    deleteNote(id)
  }

  const filtered = search.trim()
    ? notes.filter((n) =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.content?.toLowerCase().includes(search.toLowerCase()) ||
        n.category?.toLowerCase().includes(search.toLowerCase()),
      )
    : notes

  if (isLoading) {
    return <div className="py-8 text-center text-sm text-white/40">Loading…</div>
  }

  if (mode === 'create') {
    return (
      <div className="py-4">
        <div className="mb-4 flex items-center gap-2">
          <button onClick={() => setMode('list')} className="text-white/40 hover:text-white">←</button>
          <h1 className="text-[22px] font-extrabold tracking-[-0.4px] text-white">Nueva nota</h1>
        </div>
        <NoteEditor onSubmit={(d) => handleCreate(d as CreateNoteInput)} onCancel={() => setMode('list')} isPending={isCreating} />
      </div>
    )
  }

  return (
    <div className="py-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-[22px] font-extrabold tracking-[-0.4px] text-white">Notas</h1>
        <button
          onClick={() => setMode('create')}
          className="rounded-[14px] bg-violet-500/20 px-3 py-1.5 text-sm font-medium text-violet-200 transition-colors hover:bg-violet-500/30"
        >
          + Nueva
        </button>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar notas…"
        aria-label="Search notes"
        className="mb-4 w-full rounded-[18px] border border-white/[0.12] bg-white/7 px-3 py-2 text-sm text-white placeholder-white/30 outline-none backdrop-blur-2xl focus:border-violet-400/40"
      />

      <div className="space-y-3">
        {filtered.map((note) => (
          <NoteCard key={note.id} note={note} onClick={setActiveNote} onDelete={handleDelete} />
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-white/40">
            {search ? 'No hay notas que coincidan.' : 'Sin notas. Crea una arriba.'}
          </p>
        )}
      </div>

      <NoteSheet
        note={activeNote}
        onClose={() => setActiveNote(null)}
        onDelete={(id) => { handleDelete(id); setActiveNote(null) }}
      />
    </div>
  )
}
```

- [ ] **Step 6: Run all tests**

```
pnpm test:run
```

- [ ] **Step 7: Commit**

```
git add src/components/notes/NoteSheet.tsx src/components/notes/NoteSheet.test.tsx src/pages/NotesPage.tsx
git commit -m "Add NoteSheet slide panel; wire into NotesPage"
```

---

## Task 13: NoteEntityType extension + RelationChips

**Files:**
- Modify: `src/types/notes.ts`
- Modify: `src/lib/supabase/queries/notes.ts`
- Modify: `src/lib/supabase/queries/notes.test.ts`
- Create: `src/components/common/RelationChips.tsx`
- Create: `src/components/common/RelationChips.test.tsx`

- [ ] **Step 1: Extend NoteEntityType**

In `src/types/notes.ts`, change line 1:

```ts
export type NoteEntityType = 'daily_task' | 'project' | 'project_task' | 'goal'
```

(No other changes needed — `note_links` table stores this as text, no DB migration required.)

- [ ] **Step 2: Add fetchNoteLinksForEntity query**

In `src/lib/supabase/queries/notes.ts`, add at the end:

```ts
export async function fetchNoteLinksForEntity(
  entityType: NoteEntityType,
  entityId: string,
): Promise<NoteLink[]> {
  const { data, error } = await supabase
    .from('note_links')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
  if (error) throw error
  return data as NoteLink[]
}
```

- [ ] **Step 3: Add test for fetchNoteLinksForEntity**

Open `src/lib/supabase/queries/notes.test.ts`. Add at the end of the describe block:

```ts
describe('fetchNoteLinksForEntity', () => {
  it('queries by entity_type and entity_id', async () => {
    const mockLinks = [{ id: 'l1', note_id: 'n1', entity_type: 'goal', entity_id: 'g1', created_at: '' }]
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    }
    // Final eq returns the data
    mockSupabase.eq.mockReturnValueOnce(mockSupabase).mockResolvedValueOnce({ data: mockLinks, error: null })
    vi.mocked(supabaseClient).from = mockSupabase.from
    const result = await fetchNoteLinksForEntity('goal', 'g1')
    expect(result).toEqual(mockLinks)
  })
})
```

Note: look at the existing test file pattern for how the Supabase mock is set up before adding this test.

- [ ] **Step 4: Write RelationChips test**

```tsx
// src/components/common/RelationChips.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RelationChips } from './RelationChips'
import type { NoteEntityType } from '@/types/notes'

const relations = [
  { id: 'r1', entityType: 'goal' as NoteEntityType, entityId: 'g1', label: 'Run 100km' },
  { id: 'r2', entityType: 'daily_task' as NoteEntityType, entityId: 't1', label: 'Morning run' },
]

describe('RelationChips', () => {
  it('renders a chip for each relation', () => {
    render(<RelationChips relations={relations} onAddLink={vi.fn()} onRemoveLink={vi.fn()} />)
    expect(screen.getByText('Run 100km')).toBeInTheDocument()
    expect(screen.getByText('Morning run')).toBeInTheDocument()
  })

  it('shows "+ Vincular" button', () => {
    render(<RelationChips relations={[]} onAddLink={vi.fn()} onRemoveLink={vi.fn()} />)
    expect(screen.getByRole('button', { name: /vincular/i })).toBeInTheDocument()
  })

  it('calls onAddLink when "+ Vincular" is clicked', async () => {
    const onAddLink = vi.fn()
    const user = userEvent.setup()
    render(<RelationChips relations={[]} onAddLink={onAddLink} onRemoveLink={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /vincular/i }))
    expect(onAddLink).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 5: Run test — expect failure**

```
pnpm test:run src/components/common/RelationChips.test.tsx
```

- [ ] **Step 6: Implement RelationChips**

```tsx
// src/components/common/RelationChips.tsx
import { cn } from '@/lib/utils'
import type { NoteEntityType } from '@/types/notes'

const DOMAIN_COLORS: Record<NoteEntityType, { bg: string; text: string }> = {
  daily_task:   { bg: 'bg-orange-500/20',  text: 'text-orange-300' },
  project:      { bg: 'bg-indigo-500/20',  text: 'text-indigo-300' },
  project_task: { bg: 'bg-indigo-500/15',  text: 'text-indigo-200' },
  goal:         { bg: 'bg-emerald-500/20', text: 'text-emerald-300' },
}

export interface Relation {
  id: string
  entityType: NoteEntityType
  entityId: string
  label: string
}

interface RelationChipsProps {
  relations: Relation[]
  onAddLink: () => void
  onRemoveLink: (relationId: string) => void
}

export function RelationChips({ relations, onAddLink, onRemoveLink }: RelationChipsProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {relations.map((rel) => {
        const colors = DOMAIN_COLORS[rel.entityType]
        return (
          <span
            key={rel.id}
            className={cn(
              'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
              colors.bg,
              colors.text,
            )}
          >
            {rel.label}
            <button
              onClick={() => onRemoveLink(rel.id)}
              aria-label={`Remove link to ${rel.label}`}
              className="ml-0.5 opacity-60 hover:opacity-100"
            >
              ×
            </button>
          </span>
        )
      })}
      <button
        onClick={onAddLink}
        aria-label="Vincular"
        className="rounded-full border border-white/[0.12] px-2 py-0.5 text-xs text-white/40 transition-colors hover:border-white/25 hover:text-white/70"
      >
        + Vincular
      </button>
    </div>
  )
}
```

- [ ] **Step 7: Run tests**

```
pnpm test:run src/components/common/RelationChips.test.tsx src/types/ src/lib/supabase/queries/notes.test.ts
```

- [ ] **Step 8: Commit**

```
git add src/types/notes.ts src/lib/supabase/queries/notes.ts src/lib/supabase/queries/notes.test.ts src/components/common/RelationChips.tsx src/components/common/RelationChips.test.tsx
git commit -m "Add project_task to NoteEntityType; add RelationChips; add fetchNoteLinksForEntity"
```

---

## Task 14: LinkPicker — global entity search modal

**Files:**
- Create: `src/components/common/LinkPicker.tsx`
- Create: `src/components/common/LinkPicker.test.tsx`

LinkPicker opens over the UI, shows a search input, returns results grouped by domain (all loaded client-side from React Query caches), and calls `onSelect` with the chosen entity.

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/common/LinkPicker.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LinkPicker } from './LinkPicker'
import type { NoteEntityType } from '@/types/notes'

vi.mock('@/hooks/useAllTasks', () => ({
  useAllTasks: () => ({ tasks: [{ id: 't1', title: 'Morning run' }] }),
}))
vi.mock('@/hooks/useProjects', () => ({
  useProjects: () => ({ projects: [{ id: 'p1', title: 'My Project' }] }),
}))
vi.mock('@/hooks/useGoals', () => ({
  useGoals: () => ({ goals: [{ id: 'g1', title: 'Run 100km' }] }),
}))

function wrap(ui: React.ReactElement) {
  const qc = new QueryClient()
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>)
}

describe('LinkPicker', () => {
  it('does not render when closed', () => {
    wrap(<LinkPicker open={false} onClose={vi.fn()} onSelect={vi.fn()} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows search input when open', () => {
    wrap(<LinkPicker open={true} onClose={vi.fn()} onSelect={vi.fn()} />)
    expect(screen.getByPlaceholderText(/buscar/i)).toBeInTheDocument()
  })

  it('shows all entities when search is empty', () => {
    wrap(<LinkPicker open={true} onClose={vi.fn()} onSelect={vi.fn()} />)
    expect(screen.getByText('Morning run')).toBeInTheDocument()
    expect(screen.getByText('My Project')).toBeInTheDocument()
    expect(screen.getByText('Run 100km')).toBeInTheDocument()
  })

  it('filters results on input', async () => {
    const user = userEvent.setup()
    wrap(<LinkPicker open={true} onClose={vi.fn()} onSelect={vi.fn()} />)
    await user.type(screen.getByPlaceholderText(/buscar/i), 'run')
    expect(screen.getByText('Morning run')).toBeInTheDocument()
    expect(screen.getByText('Run 100km')).toBeInTheDocument()
    expect(screen.queryByText('My Project')).not.toBeInTheDocument()
  })

  it('calls onSelect with entity info when item clicked', async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    wrap(<LinkPicker open={true} onClose={vi.fn()} onSelect={onSelect} />)
    await user.click(screen.getByText('Run 100km'))
    expect(onSelect).toHaveBeenCalledWith({ entityType: 'goal' as NoteEntityType, entityId: 'g1', label: 'Run 100km' })
  })

  it('closes on Escape', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    wrap(<LinkPicker open={true} onClose={onClose} onSelect={vi.fn()} />)
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: Run test — expect failure**

```
pnpm test:run src/components/common/LinkPicker.test.tsx
```

- [ ] **Step 3: Implement LinkPicker**

```tsx
// src/components/common/LinkPicker.tsx
import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { useAllTasks } from '@/hooks/useAllTasks'
import { useProjects } from '@/hooks/useProjects'
import { useGoals } from '@/hooks/useGoals'
import type { NoteEntityType } from '@/types/notes'

export interface LinkSelection {
  entityType: NoteEntityType
  entityId: string
  label: string
}

interface LinkPickerProps {
  open: boolean
  onClose: () => void
  onSelect: (selection: LinkSelection) => void
}

interface EntityEntry {
  entityType: NoteEntityType
  entityId: string
  label: string
  group: string
}

const GROUP_COLORS: Record<string, string> = {
  'Hábitos':   'text-orange-300',
  'Proyectos': 'text-indigo-300',
  'Goals':     'text-emerald-300',
}

export function LinkPicker({ open, onClose, onSelect }: LinkPickerProps) {
  const [query, setQuery] = useState('')
  const { tasks } = useAllTasks()
  const { projects } = useProjects()
  const { goals } = useGoals()

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  if (!open) return null

  const all: EntityEntry[] = [
    ...tasks.map((t) => ({ entityType: 'daily_task' as NoteEntityType, entityId: t.id, label: t.title, group: 'Hábitos' })),
    ...projects.map((p) => ({ entityType: 'project' as NoteEntityType, entityId: p.id, label: p.title, group: 'Proyectos' })),
    ...goals.map((g) => ({ entityType: 'goal' as NoteEntityType, entityId: g.id, label: g.title, group: 'Goals' })),
  ]

  const filtered = query.trim()
    ? all.filter((e) => e.label.toLowerCase().includes(query.toLowerCase()))
    : all

  const groups = Array.from(new Set(filtered.map((e) => e.group)))

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/50 backdrop-blur-[6px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Vincular a entidad"
        className="relative z-10 w-full max-w-md overflow-hidden rounded-[20px] border border-white/[0.12] bg-[rgba(12,10,28,0.95)] shadow-[0_16px_48px_rgba(0,0,0,0.6)] backdrop-blur-[32px]"
      >
        {/* Search bar */}
        <div className="flex items-center gap-2 border-b border-white/[0.08] px-4 py-3">
          <Search size={16} className="shrink-0 text-white/30" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar hábitos, proyectos, goals…"
            className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
          />
          <button onClick={onClose} aria-label="Close" className="text-white/30 hover:text-white">
            <X size={16} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto p-2">
          {filtered.length === 0 && (
            <p className="px-3 py-4 text-center text-sm text-white/30">Sin resultados.</p>
          )}
          {groups.map((group) => (
            <div key={group} className="mb-2">
              <p className={`px-3 pb-1 text-[10px] font-bold uppercase tracking-widest ${GROUP_COLORS[group] ?? 'text-white/30'}`}>
                {group}
              </p>
              {filtered
                .filter((e) => e.group === group)
                .map((e) => (
                  <button
                    key={e.entityId}
                    onClick={() => { onSelect({ entityType: e.entityType, entityId: e.entityId, label: e.label }); onClose() }}
                    className="w-full rounded-[10px] px-3 py-2 text-left text-sm text-white/80 transition-colors hover:bg-white/[0.06]"
                  >
                    {e.label}
                  </button>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests**

```
pnpm test:run src/components/common/LinkPicker.test.tsx
```

- [ ] **Step 5: Commit**

```
git add src/components/common/LinkPicker.tsx src/components/common/LinkPicker.test.tsx
git commit -m "Add LinkPicker global entity search modal"
```

---

## Task 15: Wire relations — NoteSheet + GoalCard + back-references

Wire `RelationChips` and `LinkPicker` into the UI so notes can be linked from both directions.

**Files:**
- Modify: `src/components/notes/NoteSheet.tsx`
- Modify: `src/components/goals/GoalCard.tsx`
- Modify: `src/components/projects/ProjectCard.tsx`
- Modify: `src/components/daily-tasks/TaskCard.tsx`
- Add hooks for fetching note links per entity

- [ ] **Step 1: Add useNoteLinks hook**

Create `src/hooks/useNoteLinks.ts`:

```ts
// src/hooks/useNoteLinks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchNoteLinks, fetchNoteLinksForEntity, addNoteLink, removeNoteLink } from '@/lib/supabase/queries/notes'
import type { NoteEntityType } from '@/types/notes'

export function useNoteLinks(noteId: string) {
  return useQuery({
    queryKey: ['note-links', noteId],
    queryFn: () => fetchNoteLinks(noteId),
    enabled: !!noteId,
  })
}

export function useNoteLinksForEntity(entityType: NoteEntityType, entityId: string) {
  return useQuery({
    queryKey: ['note-links-entity', entityType, entityId],
    queryFn: () => fetchNoteLinksForEntity(entityType, entityId),
    enabled: !!entityId,
  })
}

export function useNoteLinkMutations(noteId: string) {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['note-links', noteId] })

  const add = useMutation({
    mutationFn: ({ entityType, entityId }: { entityType: NoteEntityType; entityId: string }) =>
      addNoteLink(noteId, entityType, entityId),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: ({ entityId }: { entityId: string }) => removeNoteLink(noteId, entityId),
    onSuccess: invalidate,
  })

  return { addLink: add.mutate, removeLink: remove.mutate }
}
```

- [ ] **Step 2: Wire RelationChips + LinkPicker into NoteSheet**

In `src/components/notes/NoteSheet.tsx`, add imports and a Relations section below the content body (in read mode):

```tsx
// Additional imports at top:
import { useState } from 'react'  // already present
import { X } from 'lucide-react'  // already present
import { RelationChips } from '@/components/common/RelationChips'
import { LinkPicker } from '@/components/common/LinkPicker'
import { useNoteLinks, useNoteLinkMutations } from '@/hooks/useNoteLinks'
import type { LinkSelection } from '@/components/common/LinkPicker'
```

Inside the NoteSheet component body, after the `useNoteMutations` line, add:

```tsx
const { data: noteLinks = [] } = useNoteLinks(note?.id ?? '')
const { addLink, removeLink } = useNoteLinkMutations(note?.id ?? '')
const [pickerOpen, setPickerOpen] = useState(false)

const relations = noteLinks.map((nl) => ({
  id: nl.id,
  entityType: nl.entity_type,
  entityId: nl.entity_id,
  label: nl.entity_id, // TODO: resolve label from entity cache — for now shows ID
}))

function handleAddLink(selection: LinkSelection) {
  addLink({ entityType: selection.entityType, entityId: selection.entityId })
}
```

In the Body section of JSX, add after the content area (in read mode, before the footer):

```tsx
{!editing && (
  <div className="border-t border-white/[0.08] px-4 py-3">
    <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/25">Vínculos</p>
    <RelationChips
      relations={relations}
      onAddLink={() => setPickerOpen(true)}
      onRemoveLink={(relId) => {
        const link = noteLinks.find((l) => l.id === relId)
        if (link) removeLink({ entityId: link.entity_id })
      }}
    />
  </div>
)}
<LinkPicker
  open={pickerOpen}
  onClose={() => setPickerOpen(false)}
  onSelect={handleAddLink}
/>
```

- [ ] **Step 3: Run full test suite**

```
pnpm test:run
```
Fix any failures. The relation chips section uses real hooks — mock `useNoteLinks` and `useNoteLinkMutations` in `NoteSheet.test.tsx` if they cause issues:

```tsx
vi.mock('@/hooks/useNoteLinks', () => ({
  useNoteLinks: () => ({ data: [] }),
  useNoteLinkMutations: () => ({ addLink: vi.fn(), removeLink: vi.fn() }),
}))
```

- [ ] **Step 4: Typecheck**

```
pnpm typecheck
```
Fix any type errors.

- [ ] **Step 5: Commit**

```
git add src/hooks/useNoteLinks.ts src/components/notes/NoteSheet.tsx
git commit -m "Wire RelationChips + LinkPicker into NoteSheet"
```

---

## Task 16: Final verification

- [ ] **Step 1: Run full test suite**

```
pnpm test:run
```
Expected: all tests pass.

- [ ] **Step 2: Type check**

```
pnpm typecheck
```
Expected: no errors.

- [ ] **Step 3: Start dev server and verify visually**

```
pnpm dev
```

Check each route:
- `/habitos` — gradient bg, orange blobs, glass task cards, DotMenu on each card
- `/habitos/gestionar` — glass habit rows, DotMenu with Editar/Eliminar
- `/projects` — indigo blobs, glass ProjectCards
- `/projects/:id` — glass kanban columns and task cards
- `/goals` — emerald blobs, glass GoalCards with DotMenu
- `/notes` — violet blobs, glass NoteCards; click a card → NoteSheet slides in; Editar in DotMenu → edit mode; Vincular → LinkPicker opens
- `/dashboard` — sky blobs, glass stat cards
- BottomNav: glass bar, "Hábitos" tab, correct active highlighting

- [ ] **Step 4: Final commit**

```
git add -A
git commit -m "Glass redesign complete: all primitives, per-domain treatment, NoteSheet, relations"
```
