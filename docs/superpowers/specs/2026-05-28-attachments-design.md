# Attachments — Design Spec
**Date:** 2026-05-28
**Scope:** Images (PNG/JPG/GIF/WebP) + PDFs on Notes and Project Tasks

---

## 1. Overview

A polymorphic attachment system that lets users attach images and PDFs to notes and project tasks. Files are stored in Supabase Storage; metadata is tracked in an `attachments` table following the same pattern as `note_links`. Attachments are displayed as thumbnail strips inline on each entity. Tapping an image opens a fullscreen lightbox; tapping a PDF opens it in a new tab.

---

## 2. Data model

### 2a. Supabase table — `attachments`

```sql
create table attachments (
  id          uuid        primary key default gen_random_uuid(),
  entity_type text        not null check (entity_type in ('note', 'project_task')),
  entity_id   uuid        not null,
  storage_path text       not null,
  filename    text        not null,
  mime_type   text        not null,
  file_size   integer     not null,
  created_at  timestamptz default now(),
  user_id     uuid
);

alter table attachments enable row level security;
create policy "open_attachments" on attachments for all using (true);
```

### 2b. Supabase Storage bucket

- Bucket name: `attachments`
- Access: private (files served via `createSignedUrl`)
- Path pattern: `{entity_type}/{entity_id}/{uuid}-{original_filename}`
- This scopes files to their owner entity and avoids name collisions

### 2c. TypeScript types — `src/types/attachments.ts`

```ts
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

export interface CreateAttachmentInput {
  entity_type: AttachmentEntityType
  entity_id: string
  storage_path: string
  filename: string
  mime_type: string
  file_size: number
}
```

---

## 3. Query layer — `src/lib/supabase/queries/attachments.ts`

Four functions:

| Function | Description |
|---|---|
| `fetchAttachments(entityType, entityId)` | Returns all `Attachment[]` for an entity, ordered by `created_at asc` |
| `uploadFile(entityType, entityId, file)` | Uploads file to Storage, returns `storage_path` |
| `createAttachment(input)` | Inserts a row in `attachments`, returns the created `Attachment` |
| `deleteAttachment(id, storagePath)` | Deletes the Storage file first, then the DB row |

`uploadFile` + `createAttachment` are called sequentially in the mutation hook. If `createAttachment` fails after a successful upload, the storage file is removed to avoid orphans.

Signed URLs for display: call `supabase.storage.from('attachments').createSignedUrl(storagePath, 3600)` to generate temporary display URLs (1-hour TTL). This is done inside `fetchAttachments` — the returned `Attachment` objects include a `signed_url` field (not persisted, computed at fetch time).

Updated type for display:
```ts
export interface AttachmentWithUrl extends Attachment {
  signed_url: string
}
```

---

## 4. Hook layer — `src/hooks/useAttachments.ts`

```ts
// useAttachments(entityType, entityId): { attachments: AttachmentWithUrl[], isLoading }
// queryKey: ['attachments', entityType, entityId]
// enabled when !!entityId
// staleTime: 30 minutes (keeps signed URLs fresh; URLs expire at 1h)

// useAttachmentMutations(entityType, entityId)
// returns: { upload, remove, isUploading }
// upload(file: File) — runs uploadFile + createAttachment, invalidates query on success
// remove(id, storagePath) — runs deleteAttachment, invalidates query on success
```

---

## 5. UI components

### 5a. `AttachmentStrip` — `src/components/common/AttachmentStrip.tsx`

Props: `{ entityType, entityId }` — fetches its own data via `useAttachments`.

Renders:
- **Image thumbnails** — 48×48px, `rounded-[8px]`, `object-fit: cover`. Tap → `ImageLightbox`.
- **PDF rows** — 📄 icon + truncated filename + human-readable file size. Tap → `window.open(signedUrl, '_blank')`.
- **Upload button** (`+`) — at the end of the strip, always visible. Wraps a hidden `<input type="file" accept="image/*,.pdf">`. Shows a spinner while uploading.
- **Delete** — small `×` always visible on each thumbnail and PDF row (PWA-friendly, no hover dependency). Triggers a `window.confirm` before calling `remove`.

Constraints enforced before upload:
- Max file size: 10MB (1024 × 1024 × 10 bytes)
- Max count: 10 attachments per entity
- Accepted MIME types: `image/png`, `image/jpeg`, `image/gif`, `image/webp`, `application/pdf`

### 5b. `ImageLightbox` — `src/components/common/ImageLightbox.tsx`

Props: `{ src: string | null, alt: string, onClose: () => void }`.

- Renders `null` when `src` is null
- Fixed fullscreen overlay (`z-[10000]`), dark backdrop (`bg-black/80`), centred `<img>`
- Close on backdrop click or Escape key
- Close button (`×`) top-right corner
- No zoom (YAGNI)

---

## 6. Integration points

### 6a. `ProjectTaskCard.tsx`

Add `<AttachmentStrip entityType="project_task" entityId={task.id} />` below the description line. The strip is always rendered (shows only the `+` button when empty).

### 6b. `NoteSheet.tsx`

Add a new "Adjuntos" section between the note content area and the "Vínculos" (RelationChips) section. Visible in both read and edit mode.

```tsx
<div className="border-t border-white/[0.08] px-4 py-3">
  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/25">
    Adjuntos
  </p>
  <AttachmentStrip entityType="note" entityId={note.id} />
</div>
```

---

## 7. Constraints & limits

| Constraint | Value | Enforcement |
|---|---|---|
| Max file size | 10 MB | Client-side, before upload |
| Max files per entity | 10 | Client-side, checked against current count |
| Accepted types | image/*, application/pdf | `<input accept>` + MIME check |
| Signed URL TTL | 1 hour | Generated at fetch time, cache invalidated on refetch |

---

## 8. Edge cases

- **Upload fails** — if Storage upload succeeds but DB insert fails, the storage file is deleted to prevent orphans.
- **Entity deleted** — attachment rows and storage files are not cascade-deleted (acceptable for now; orphan cleanup can be added later via a Supabase function).
- **Wrong file type selected** — rejected client-side with an inline error message before any upload attempt.
- **Over limit** — if entity already has 10 attachments, the `+` button is disabled and shows a tooltip.

---

## 9. Out of scope

- Drag-and-drop upload
- Image compression / resizing
- Attachment reordering
- Inline image embedding in note body text (attachments live in a separate section)
- Attachments on Goals or Hábitos (can be added later by extending the `entity_type` check constraint)
- Attachment previews for PDFs (thumbnail generation)
