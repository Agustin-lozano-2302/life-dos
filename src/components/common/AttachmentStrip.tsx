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
                onClick={() => {
                  setLightboxSrc(att.signed_url)
                  setLightboxAlt(att.filename)
                }}
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
            <div
              key={att.id}
              className="relative flex items-center gap-1.5 rounded-[8px] border border-white/[0.12] bg-white/[0.05] px-2 py-1.5"
            >
              <a
                href={att.signed_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white"
              >
                <span role="img" aria-label="PDF">
                  📄
                </span>
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

      {uploadError && <p className="mt-1.5 text-[11px] text-rose-400">{uploadError}</p>}

      <ImageLightbox src={lightboxSrc} alt={lightboxAlt} onClose={() => setLightboxSrc(null)} />
    </div>
  )
}
