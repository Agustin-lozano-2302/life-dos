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
