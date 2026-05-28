# Attachments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add image + PDF attachments to Notes and Project Tasks using Supabase Storage, displayed as inline thumbnail strips with a fullscreen image lightbox.

**Architecture:** Polymorphic `attachments` table (same pattern as `note_links`) + Supabase Storage bucket. A shared `AttachmentStrip` component fetches its own data and handles upload/delete. An `ImageLightbox` portal handles fullscreen preview. Both are wired into `NoteSheet` and `ProjectTaskCard`.

**Tech Stack:** React + TypeScript + Tailwind v4 + Supabase (DB + Storage) + TanStack Query + Vitest + RTL

---

## File Map

### Created
| File | Responsibility |
|---|---|
| `src/types/attachments.ts` | `Attachment`, `AttachmentWithUrl`, `AttachmentEntityType`, `CreateAttachmentInput` |
| `src/lib/supabase/queries/attachments.ts` | `fetchAttachments`, `uploadFile`, `createAttachment`, `deleteAttachment` |
| `src/lib/supabase/queries/attachments.test.ts` | Query tests |
| `src/hooks/useAttachments.ts` | `useAttachments`, `useAttachmentMutations` |
| `src/components/common/ImageLightbox.tsx` | Fullscreen image overlay via portal |
| `src/components/common/ImageLightbox.test.tsx` | Tests |
| `src/components/common/AttachmentStrip.tsx` | Thumbnail strip + upload + delete |
| `src/components/common/AttachmentStrip.test.tsx` | Tests |

### Modified
| File | Change |
|---|---|
| `src/components/projects/ProjectTaskCard.tsx` | Add `<AttachmentStrip>` below description |
| `src/components/projects/ProjectTaskCard.test.tsx` | Add mock for `useAttachments` |
| `src/components/notes/NoteSheet.tsx` | Add "Adjuntos" section with `<AttachmentStrip>` |
| `src/components/notes/NoteSheet.test.tsx` | Add mock for `useAttachments` |

---

## Task 1: DB migration + Storage bucket

**Prerequisite:** The Supabase project ID is `ckrwpretboflbusecdde`. Use the MCP tool `mcp__claude_ai_Supabase__apply_migration` to apply the migration, and `mcp__claude_ai_Supabase__execute_sql` to create the storage bucket.

- [ ] **Step 1: Apply the attachments table migration**

Use `mcp__claude_ai_Supabase__apply_migration` with:
- `project_id`: `ckrwpretboflbusecdde`
- `name`: `create_attachments_table`
- `query`:
```sql
create table if not exists attachments (
  id           uuid        primary key default gen_random_uuid(),
  entity_type  text        not null check (entity_type in ('note', 'project_task')),
  entity_id    uuid        not null,
  storage_path text        not null,
  filename     text        not null,
  mime_type    text        not null,
  file_size    integer     not null,
  created_at   timestamptz default now(),
  user_id      uuid
);

alter table attachments enable row level security;

create policy "open_attachments" on attachments
  for all using (true);
```

- [ ] **Step 2: Create the storage bucket**

Use `mcp__claude_ai_Supabase__execute_sql` with:
- `project_id`: `ckrwpretboflbusecdde`
- `query`:
```sql
insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', false)
on conflict (id) do nothing;

create policy "open_attachments_storage" on storage.objects
  for all using (bucket_id = 'attachments');
```

- [ ] **Step 3: Verify the table exists**

Use `mcp__claude_ai_Supabase__execute_sql`:
```sql
select column_name, data_type
from information_schema.columns
where table_name = 'attachments'
order by ordinal_position;
```
Expected: rows for `id`, `entity_type`, `entity_id`, `storage_path`, `filename`, `mime_type`, `file_size`, `created_at`, `user_id`.

- [ ] **Step 4: Commit**

```
git add -A
git commit -m "Add attachments table migration + storage bucket"
```

---

## Task 2: TypeScript types

**Files:**
- Create: `src/types/attachments.ts`

- [ ] **Step 1: Write the types file**

```ts
// src/types/attachments.ts
export type AttachmentEntityType = 'note' | 'project_task'

export interface Attachment {
  id: string
  entity_type: AttachmentEntityType
  entity_id: string
  storage_path: string
  filename: string
  mime_type: string
  file_size: number
  created_at: string
}

export interface AttachmentWithUrl extends Attachment {
  signed_url: string
}

export interface CreateAttachmentInput {
  entity_type: AttachmentEntityType
  entity_id: string
  storage_path: string
  filename: string
  mime_type: string
  file_size: number
}
```

- [ ] **Step 2: Typecheck**

```
pnpm typecheck
```
Expected: no errors.

- [ ] **Step 3: Commit**

```
git add src/types/attachments.ts
git commit -m "Add Attachment types"
```

---

## Task 3: Query layer

**Files:**
- Create: `src/lib/supabase/queries/attachments.ts`
- Create: `src/lib/supabase/queries/attachments.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// src/lib/supabase/queries/attachments.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import supabase from '@/lib/supabase/client'
import {
  fetchAttachments,
  uploadFile,
  createAttachment,
  deleteAttachment,
} from './attachments'
import type { Attachment } from '@/types/attachments'

vi.mock('@/lib/supabase/client', () => ({
  default: {
    from: vi.fn(),
    storage: { from: vi.fn() },
  },
}))

const mockFrom = vi.mocked(supabase.from)
const mockStorageFrom = vi.mocked(supabase.storage.from)

const mockAttachment: Attachment = {
  id: 'att-1',
  entity_type: 'note',
  entity_id: 'note-1',
  storage_path: 'note/note-1/uuid-photo.png',
  filename: 'photo.png',
  mime_type: 'image/png',
  file_size: 2048,
  created_at: '2026-01-01T00:00:00Z',
}

beforeEach(() => vi.clearAllMocks())

describe('fetchAttachments', () => {
  it('returns attachments with signed URLs', async () => {
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValueOnce({ data: [mockAttachment], error: null }),
    } as any)

    mockStorageFrom.mockReturnValueOnce({
      createSignedUrls: vi.fn().mockResolvedValueOnce({
        data: [{ signedUrl: 'https://example.com/signed/photo.png' }],
        error: null,
      }),
    } as any)

    const result = await fetchAttachments('note', 'note-1')
    expect(result).toHaveLength(1)
    expect(result[0].signed_url).toBe('https://example.com/signed/photo.png')
    expect(result[0].filename).toBe('photo.png')
  })

  it('returns empty array when no attachments', async () => {
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValueOnce({ data: [], error: null }),
    } as any)

    const result = await fetchAttachments('note', 'note-1')
    expect(result).toEqual([])
  })

  it('throws on DB error', async () => {
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValueOnce({ data: null, error: { message: 'db error' } }),
    } as any)

    await expect(fetchAttachments('note', 'note-1')).rejects.toEqual({ message: 'db error' })
  })
})

describe('uploadFile', () => {
  it('uploads file and returns storage path', async () => {
    const file = new File(['content'], 'photo.png', { type: 'image/png' })

    mockStorageFrom.mockReturnValueOnce({
      upload: vi.fn().mockResolvedValueOnce({ error: null }),
    } as any)

    const path = await uploadFile('note', 'note-1', file)
    expect(path).toMatch(/^note\/note-1\/.+-photo\.png$/)
  })

  it('throws on storage error', async () => {
    const file = new File(['content'], 'photo.png', { type: 'image/png' })

    mockStorageFrom.mockReturnValueOnce({
      upload: vi.fn().mockResolvedValueOnce({ error: { message: 'storage error' } }),
    } as any)

    await expect(uploadFile('note', 'note-1', file)).rejects.toEqual({ message: 'storage error' })
  })
})

describe('createAttachment', () => {
  it('inserts row and returns attachment', async () => {
    mockFrom.mockReturnValueOnce({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValueOnce({ data: mockAttachment, error: null }),
    } as any)

    const input = {
      entity_type: 'note' as const,
      entity_id: 'note-1',
      storage_path: 'note/note-1/uuid-photo.png',
      filename: 'photo.png',
      mime_type: 'image/png',
      file_size: 2048,
    }

    const result = await createAttachment(input)
    expect(result.id).toBe('att-1')
  })
})

describe('deleteAttachment', () => {
  it('removes storage file then deletes DB row', async () => {
    const removeMock = vi.fn().mockResolvedValueOnce({ error: null })
    mockStorageFrom.mockReturnValueOnce({ remove: removeMock } as any)

    mockFrom.mockReturnValueOnce({
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValueOnce({ error: null }),
    } as any)

    await deleteAttachment('att-1', 'note/note-1/uuid-photo.png')
    expect(removeMock).toHaveBeenCalledWith(['note/note-1/uuid-photo.png'])
  })

  it('throws if storage deletion fails without touching DB', async () => {
    mockStorageFrom.mockReturnValueOnce({
      remove: vi.fn().mockResolvedValueOnce({ error: { message: 'storage error' } }),
    } as any)

    await expect(deleteAttachment('att-1', 'some/path.png')).rejects.toEqual({ message: 'storage error' })
  })
})
```

- [ ] **Step 2: Run tests — expect failure**

```
pnpm test:run src/lib/supabase/queries/attachments.test.ts
```
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the query layer**

```ts
// src/lib/supabase/queries/attachments.ts
import supabase from '@/lib/supabase/client'
import type { Attachment, AttachmentWithUrl, AttachmentEntityType, CreateAttachmentInput } from '@/types/attachments'

export async function fetchAttachments(
  entityType: AttachmentEntityType,
  entityId: string,
): Promise<AttachmentWithUrl[]> {
  const { data, error } = await supabase
    .from('attachments')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: true })
  if (error) throw error

  const attachments = data as Attachment[]
  if (attachments.length === 0) return []

  const { data: urlData, error: urlError } = await supabase.storage
    .from('attachments')
    .createSignedUrls(
      attachments.map((a) => a.storage_path),
      3600,
    )
  if (urlError) throw urlError

  return attachments.map((a, i) => ({
    ...a,
    signed_url: urlData[i]?.signedUrl ?? '',
  }))
}

export async function uploadFile(
  entityType: AttachmentEntityType,
  entityId: string,
  file: File,
): Promise<string> {
  const uuid = crypto.randomUUID()
  const path = `${entityType}/${entityId}/${uuid}-${file.name}`
  const { error } = await supabase.storage
    .from('attachments')
    .upload(path, file, { contentType: file.type })
  if (error) throw error
  return path
}

export async function createAttachment(input: CreateAttachmentInput): Promise<Attachment> {
  const { data, error } = await supabase
    .from('attachments')
    .insert(input)
    .select()
    .single()
  if (error) throw error
  return data as Attachment
}

export async function deleteAttachment(id: string, storagePath: string): Promise<void> {
  const { error: storageError } = await supabase.storage
    .from('attachments')
    .remove([storagePath])
  if (storageError) throw storageError

  const { error } = await supabase
    .from('attachments')
    .delete()
    .eq('id', id)
  if (error) throw error
}
```

- [ ] **Step 4: Run tests — expect pass**

```
pnpm test:run src/lib/supabase/queries/attachments.test.ts
```
Expected: 7 passing.

- [ ] **Step 5: Run full suite**

```
pnpm test:run
```
Expected: all pass.

- [ ] **Step 6: Commit**

```
git add src/types/attachments.ts src/lib/supabase/queries/attachments.ts src/lib/supabase/queries/attachments.test.ts
git commit -m "Add attachments query layer"
```

---

## Task 4: Hook layer

**Files:**
- Create: `src/hooks/useAttachments.ts`

No separate test file — the hook is a thin wrapper over query functions; integration tests via `AttachmentStrip` tests cover behaviour.

- [ ] **Step 1: Implement the hook**

```ts
// src/hooks/useAttachments.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import supabase from '@/lib/supabase/client'
import { fetchAttachments, uploadFile, createAttachment, deleteAttachment } from '@/lib/supabase/queries/attachments'
import type { AttachmentEntityType, AttachmentWithUrl } from '@/types/attachments'

export function useAttachments(entityType: AttachmentEntityType, entityId: string) {
  const { data = [], ...rest } = useQuery({
    queryKey: ['attachments', entityType, entityId],
    queryFn: () => fetchAttachments(entityType, entityId),
    enabled: !!entityId,
    staleTime: 30 * 60 * 1000,
  })
  return { attachments: data as AttachmentWithUrl[], ...rest }
}

export function useAttachmentMutations(entityType: AttachmentEntityType, entityId: string) {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['attachments', entityType, entityId] })

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const storagePath = await uploadFile(entityType, entityId, file)
      try {
        return await createAttachment({
          entity_type: entityType,
          entity_id: entityId,
          storage_path: storagePath,
          filename: file.name,
          mime_type: file.type,
          file_size: file.size,
        })
      } catch (err) {
        await supabase.storage.from('attachments').remove([storagePath])
        throw err
      }
    },
    onSuccess: invalidate,
  })

  const removeMutation = useMutation({
    mutationFn: ({ id, storagePath }: { id: string; storagePath: string }) =>
      deleteAttachment(id, storagePath),
    onSuccess: invalidate,
  })

  return {
    upload: uploadMutation.mutate,
    remove: removeMutation.mutate,
    isUploading: uploadMutation.isPending,
  }
}
```

- [ ] **Step 2: Typecheck**

```
pnpm typecheck
```
Expected: no errors.

- [ ] **Step 3: Commit**

```
git add src/hooks/useAttachments.ts
git commit -m "Add useAttachments + useAttachmentMutations hooks"
```

---

## Task 5: ImageLightbox component

**Files:**
- Create: `src/components/common/ImageLightbox.tsx`
- Create: `src/components/common/ImageLightbox.test.tsx`

- [ ] **Step 1: Write failing tests**

```tsx
// src/components/common/ImageLightbox.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ImageLightbox } from './ImageLightbox'

describe('ImageLightbox', () => {
  it('renders nothing when src is null', () => {
    render(<ImageLightbox src={null} alt="photo" onClose={vi.fn()} />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('renders image when src is provided', () => {
    render(<ImageLightbox src="https://example.com/photo.png" alt="A photo" onClose={vi.fn()} />)
    expect(screen.getByRole('img', { name: 'A photo' })).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<ImageLightbox src="https://example.com/photo.png" alt="photo" onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: /close/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when backdrop is clicked', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    const { container } = render(
      <ImageLightbox src="https://example.com/photo.png" alt="photo" onClose={onClose} />,
    )
    const backdrop = container.querySelector('.fixed') as HTMLElement
    await user.click(backdrop)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose on Escape key', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<ImageLightbox src="https://example.com/photo.png" alt="photo" onClose={onClose} />)
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: Run tests — expect failure**

```
pnpm test:run src/components/common/ImageLightbox.test.tsx
```

- [ ] **Step 3: Implement ImageLightbox**

```tsx
// src/components/common/ImageLightbox.tsx
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface ImageLightboxProps {
  src: string | null
  alt: string
  onClose: () => void
}

export function ImageLightbox({ src, alt, onClose }: ImageLightboxProps) {
  useEffect(() => {
    if (!src) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [src, onClose])

  if (!src) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
      >
        <X size={20} />
      </button>
      <img
        src={src}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] max-w-[90vw] rounded-[12px] object-contain shadow-[0_0_80px_rgba(0,0,0,0.8)]"
      />
    </div>,
    document.body,
  )
}
```

- [ ] **Step 4: Run tests — expect pass**

```
pnpm test:run src/components/common/ImageLightbox.test.tsx
```
Expected: 5 passing.

- [ ] **Step 5: Commit**

```
git add src/components/common/ImageLightbox.tsx src/components/common/ImageLightbox.test.tsx
git commit -m "Add ImageLightbox component"
```

---

## Task 6: AttachmentStrip component

**Files:**
- Create: `src/components/common/AttachmentStrip.tsx`
- Create: `src/components/common/AttachmentStrip.test.tsx`

- [ ] **Step 1: Write failing tests**

```tsx
// src/components/common/AttachmentStrip.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AttachmentStrip } from './AttachmentStrip'
import type { AttachmentWithUrl } from '@/types/attachments'

const mockUpload = vi.fn()
const mockRemove = vi.fn()

vi.mock('@/hooks/useAttachments', () => ({
  useAttachments: () => ({ attachments: mockAttachments }),
  useAttachmentMutations: () => ({
    upload: mockUpload,
    remove: mockRemove,
    isUploading: false,
  }),
}))

let mockAttachments: AttachmentWithUrl[] = []

const imageAttachment: AttachmentWithUrl = {
  id: 'att-1',
  entity_type: 'note',
  entity_id: 'note-1',
  storage_path: 'note/note-1/uuid-photo.png',
  filename: 'photo.png',
  mime_type: 'image/png',
  file_size: 2048,
  created_at: '2026-01-01T00:00:00Z',
  signed_url: 'https://example.com/signed/photo.png',
}

const pdfAttachment: AttachmentWithUrl = {
  id: 'att-2',
  entity_type: 'note',
  entity_id: 'note-1',
  storage_path: 'note/note-1/uuid-doc.pdf',
  filename: 'document.pdf',
  mime_type: 'application/pdf',
  file_size: 102400,
  created_at: '2026-01-01T00:00:00Z',
  signed_url: 'https://example.com/signed/doc.pdf',
}

function wrap(ui: React.ReactElement) {
  const qc = new QueryClient()
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>)
}

beforeEach(() => {
  mockAttachments = []
  vi.clearAllMocks()
})

describe('AttachmentStrip', () => {
  it('renders the upload button', () => {
    wrap(<AttachmentStrip entityType="note" entityId="note-1" />)
    expect(screen.getByRole('button', { name: /adjuntar archivo/i })).toBeInTheDocument()
  })

  it('renders image thumbnails for image attachments', () => {
    mockAttachments = [imageAttachment]
    wrap(<AttachmentStrip entityType="note" entityId="note-1" />)
    expect(screen.getByRole('img', { name: 'photo.png' })).toBeInTheDocument()
  })

  it('renders PDF rows for PDF attachments', () => {
    mockAttachments = [pdfAttachment]
    wrap(<AttachmentStrip entityType="note" entityId="note-1" />)
    expect(screen.getByText('document.pdf')).toBeInTheDocument()
  })

  it('calls upload when a valid file is selected', async () => {
    wrap(<AttachmentStrip entityType="note" entityId="note-1" />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['data'], 'photo.png', { type: 'image/png' })
    await userEvent.upload(input, file)
    expect(mockUpload).toHaveBeenCalledWith(file)
  })

  it('shows error for oversized file without uploading', async () => {
    wrap(<AttachmentStrip entityType="note" entityId="note-1" />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const bigFile = new File(['x'.repeat(1)], 'big.png', { type: 'image/png' })
    Object.defineProperty(bigFile, 'size', { value: 11 * 1024 * 1024 })
    await userEvent.upload(input, bigFile)
    expect(screen.getByText(/10 MB/i)).toBeInTheDocument()
    expect(mockUpload).not.toHaveBeenCalled()
  })

  it('calls remove after confirming delete on an attachment', async () => {
    mockAttachments = [imageAttachment]
    vi.spyOn(window, 'confirm').mockReturnValueOnce(true)
    const user = userEvent.setup()
    wrap(<AttachmentStrip entityType="note" entityId="note-1" />)
    await user.click(screen.getByRole('button', { name: /eliminar photo\.png/i }))
    expect(mockRemove).toHaveBeenCalledWith({ id: 'att-1', storagePath: 'note/note-1/uuid-photo.png' })
  })

  it('does not call remove when confirm is cancelled', async () => {
    mockAttachments = [imageAttachment]
    vi.spyOn(window, 'confirm').mockReturnValueOnce(false)
    const user = userEvent.setup()
    wrap(<AttachmentStrip entityType="note" entityId="note-1" />)
    await user.click(screen.getByRole('button', { name: /eliminar photo\.png/i }))
    expect(mockRemove).not.toHaveBeenCalled()
  })

  it('disables upload button when at 10-file limit', () => {
    mockAttachments = Array.from({ length: 10 }, (_, i) => ({
      ...imageAttachment,
      id: `att-${i}`,
      filename: `photo-${i}.png`,
    }))
    wrap(<AttachmentStrip entityType="note" entityId="note-1" />)
    expect(screen.getByRole('button', { name: /adjuntar archivo/i })).toBeDisabled()
  })
})
```

- [ ] **Step 2: Run tests — expect failure**

```
pnpm test:run src/components/common/AttachmentStrip.test.tsx
```

- [ ] **Step 3: Implement AttachmentStrip**

```tsx
// src/components/common/AttachmentStrip.tsx
import { useRef, useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { useAttachments, useAttachmentMutations } from '@/hooks/useAttachments'
import { ImageLightbox } from './ImageLightbox'
import type { AttachmentEntityType, AttachmentWithUrl } from '@/types/attachments'

const MAX_FILES = 10
const MAX_SIZE = 10 * 1024 * 1024
const ACCEPTED_MIME = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'application/pdf']

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface AttachmentStripProps {
  entityType: AttachmentEntityType
  entityId: string
}

export function AttachmentStrip({ entityType, entityId }: AttachmentStripProps) {
  const { attachments } = useAttachments(entityType, entityId)
  const { upload, remove, isUploading } = useAttachmentMutations(entityType, entityId)
  const inputRef = useRef<HTMLInputElement>(null)
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)
  const [lightboxAlt, setLightboxAlt] = useState('')
  const [uploadError, setUploadError] = useState<string | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setUploadError(null)

    if (!ACCEPTED_MIME.includes(file.type)) {
      setUploadError('Tipo de archivo no soportado. Solo imágenes y PDFs.')
      return
    }
    if (file.size > MAX_SIZE) {
      setUploadError('El archivo supera el límite de 10 MB.')
      return
    }
    if (attachments.length >= MAX_FILES) {
      setUploadError('Límite de 10 archivos alcanzado.')
      return
    }

    upload(file)
  }

  function handleDelete(att: AttachmentWithUrl) {
    if (!window.confirm(`¿Eliminar "${att.filename}"?`)) return
    remove({ id: att.id, storagePath: att.storage_path })
  }

  const isImage = (mime: string) => mime.startsWith('image/')

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {attachments.map((att) =>
          isImage(att.mime_type) ? (
            <div key={att.id} className="relative">
              <button
                onClick={() => { setLightboxSrc(att.signed_url); setLightboxAlt(att.filename) }}
                className="h-12 w-12 overflow-hidden rounded-[8px] border border-white/[0.12] bg-white/[0.05]"
              >
                <img src={att.signed_url} alt={att.filename} className="h-full w-full object-cover" />
              </button>
              <button
                onClick={() => handleDelete(att)}
                aria-label={`Eliminar ${att.filename}`}
                className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-black/70 text-[10px] text-white/60 hover:text-red-400"
              >
                ×
              </button>
            </div>
          ) : (
            <div key={att.id} className="relative flex items-center gap-1.5 rounded-[8px] border border-white/[0.12] bg-white/[0.05] px-2 py-1.5">
              <a
                href={att.signed_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white"
              >
                <span role="img" aria-label="PDF">📄</span>
                <span className="max-w-[80px] truncate">{att.filename}</span>
                <span className="text-white/30">{formatBytes(att.file_size)}</span>
              </a>
              <button
                onClick={() => handleDelete(att)}
                aria-label={`Eliminar ${att.filename}`}
                className="ml-0.5 text-[10px] text-white/30 hover:text-red-400"
              >
                ×
              </button>
            </div>
          ),
        )}

        <button
          onClick={() => inputRef.current?.click()}
          disabled={isUploading || attachments.length >= MAX_FILES}
          aria-label="Adjuntar archivo"
          className="flex h-12 w-12 items-center justify-center rounded-[8px] border border-dashed border-white/[0.15] text-white/30 transition-colors hover:border-white/30 hover:text-white/60 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {uploadError && (
        <p className="mt-1.5 text-[11px] text-rose-400">{uploadError}</p>
      )}

      <ImageLightbox
        src={lightboxSrc}
        alt={lightboxAlt}
        onClose={() => setLightboxSrc(null)}
      />
    </div>
  )
}
```

- [ ] **Step 4: Run tests — expect pass**

```
pnpm test:run src/components/common/AttachmentStrip.test.tsx
```
Expected: 7 passing.

- [ ] **Step 5: Run full suite**

```
pnpm test:run
```

- [ ] **Step 6: Commit**

```
git add src/components/common/AttachmentStrip.tsx src/components/common/AttachmentStrip.test.tsx
git commit -m "Add AttachmentStrip + ImageLightbox components"
```

---

## Task 7: Wire into ProjectTaskCard

**Files:**
- Modify: `src/components/projects/ProjectTaskCard.tsx`
- Modify: `src/components/projects/ProjectTaskCard.test.tsx`

- [ ] **Step 1: Update ProjectTaskCard.tsx**

Read `src/components/projects/ProjectTaskCard.tsx` first. Then add the import and the strip.

Add at the top:
```tsx
import { AttachmentStrip } from '@/components/common/AttachmentStrip'
```

Add after the `{task.description && ...}` block, before the closing `</GlassCard>`:
```tsx
<div className="mt-2">
  <AttachmentStrip entityType="project_task" entityId={task.id} />
</div>
```

The final JSX inside `<GlassCard tint="indigo" className="p-3">` should be:
```tsx
<GlassCard tint="indigo" className="p-3">
  <div className="mb-2 flex items-start justify-between gap-2">
    <p className="flex-1 text-sm font-medium leading-snug text-white">{task.title}</p>
    <DotMenu items={menuItems} />
  </div>
  {task.description && (
    <p className="text-xs text-white/40 line-clamp-2">{task.description}</p>
  )}
  <div className="mt-2">
    <AttachmentStrip entityType="project_task" entityId={task.id} />
  </div>
</GlassCard>
```

- [ ] **Step 2: Update ProjectTaskCard.test.tsx**

Read `src/components/projects/ProjectTaskCard.test.tsx`. Add this mock at the top (after the existing imports):

```tsx
vi.mock('@/hooks/useAttachments', () => ({
  useAttachments: () => ({ attachments: [] }),
  useAttachmentMutations: () => ({ upload: vi.fn(), remove: vi.fn(), isUploading: false }),
}))
```

Also add a `QueryClient` wrapper to the existing render calls, since `AttachmentStrip` uses TanStack Query internally:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

function wrap(ui: React.ReactElement) {
  return render(
    <QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>,
  )
}
```

Update the three `render(...)` calls to `wrap(...)`.

- [ ] **Step 3: Run ProjectTaskCard tests**

```
pnpm test:run src/components/projects/ProjectTaskCard.test.tsx
```
Expected: 3 passing.

- [ ] **Step 4: Run full suite**

```
pnpm test:run
```

- [ ] **Step 5: Commit**

```
git add src/components/projects/ProjectTaskCard.tsx src/components/projects/ProjectTaskCard.test.tsx
git commit -m "Wire AttachmentStrip into ProjectTaskCard"
```

---

## Task 8: Wire into NoteSheet

**Files:**
- Modify: `src/components/notes/NoteSheet.tsx`
- Modify: `src/components/notes/NoteSheet.test.tsx`

- [ ] **Step 1: Update NoteSheet.tsx**

Read `src/components/notes/NoteSheet.tsx` first. Then:

Add import at the top:
```tsx
import { AttachmentStrip } from '@/components/common/AttachmentStrip'
```

In the JSX body, add the "Adjuntos" section between the content body `</div>` and the "Vínculos" section (the `{!editing && ...}` block that renders `<RelationChips>`). Insert:

```tsx
{/* Adjuntos */}
{!editing && (
  <div className="border-t border-white/[0.08] px-4 py-3">
    <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/25">
      Adjuntos
    </p>
    <AttachmentStrip entityType="note" entityId={note.id} />
  </div>
)}
```

- [ ] **Step 2: Update NoteSheet.test.tsx**

Read `src/components/notes/NoteSheet.test.tsx`. Add the `useAttachments` mock alongside the existing mocks:

```tsx
vi.mock('@/hooks/useAttachments', () => ({
  useAttachments: () => ({ attachments: [] }),
  useAttachmentMutations: () => ({ upload: vi.fn(), remove: vi.fn(), isUploading: false }),
}))
```

Add one test verifying the section renders in read mode:

```tsx
it('shows Adjuntos section in read mode', () => {
  wrap(<NoteSheet note={note} onClose={vi.fn()} onDelete={vi.fn()} />)
  expect(screen.getByText('Adjuntos')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /adjuntar archivo/i })).toBeInTheDocument()
})
```

- [ ] **Step 3: Run NoteSheet tests**

```
pnpm test:run src/components/notes/NoteSheet.test.tsx
```
Expected: 6 passing (existing 5 + new 1).

- [ ] **Step 4: Run full suite + typecheck**

```
pnpm test:run
pnpm typecheck
```
Expected: all pass, no errors.

- [ ] **Step 5: Commit**

```
git add src/components/notes/NoteSheet.tsx src/components/notes/NoteSheet.test.tsx
git commit -m "Wire AttachmentStrip into NoteSheet"
```

---

## Task 9: Final verification

- [ ] **Step 1: Run full test suite**

```
pnpm test:run
```
Expected: all files passing, no failures.

- [ ] **Step 2: Typecheck**

```
pnpm typecheck
```
Expected: clean.

- [ ] **Step 3: Manual smoke test**

```
pnpm dev
```

Verify:
- Open a note → NoteSheet → "Adjuntos" section shows with `+` button
- Upload a PNG → thumbnail appears
- Click thumbnail → fullscreen lightbox opens, Escape closes it
- Upload a PDF → file row appears, click opens new tab
- Click `×` on attachment → confirm dialog → attachment disappears
- Open a project board → task card shows attachment strip with `+` button
- Upload to a task → thumbnail appears on the kanban card

- [ ] **Step 4: Final commit**

```
git add -A
git commit -m "Attachments complete: images + PDFs on notes and project tasks"
```
