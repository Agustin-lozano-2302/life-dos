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
