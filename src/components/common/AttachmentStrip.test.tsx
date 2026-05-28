import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AttachmentStrip } from './AttachmentStrip'
import type { AttachmentWithUrl } from '@/types/attachments'

const mockUpload = vi.fn()
const mockRemove = vi.fn()
let mockAttachments: AttachmentWithUrl[] = []

vi.mock('@/hooks/useAttachments', () => ({
  useAttachments: () => ({ attachments: mockAttachments }),
  useAttachmentMutations: () => ({
    upload: mockUpload,
    remove: mockRemove,
    isUploading: false,
  }),
}))

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
  return render(
    <QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>,
  )
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
    const bigFile = new File(['x'], 'big.png', { type: 'image/png' })
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
