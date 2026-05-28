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
