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
