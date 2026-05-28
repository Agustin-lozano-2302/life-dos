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
