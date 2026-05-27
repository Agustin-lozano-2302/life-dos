import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createNote as createNoteFn,
  updateNote as updateNoteFn,
  deleteNote as deleteNoteFn,
  addNoteLink as addNoteLinkFn,
  removeNoteLink as removeNoteLinkFn,
} from '@/lib/supabase/queries/notes'
import type { CreateNoteInput, UpdateNoteInput, NoteEntityType } from '@/types/notes'

export function useNoteMutations() {
  const queryClient = useQueryClient()

  const createNote = useMutation({
    mutationFn: (input: CreateNoteInput) => createNoteFn(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
  })

  const updateNote = useMutation({
    mutationFn: (input: UpdateNoteInput) => updateNoteFn(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
  })

  const deleteNote = useMutation({
    mutationFn: (id: string) => deleteNoteFn(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
  })

  const addNoteLink = useMutation({
    mutationFn: ({ noteId, entityType, entityId }: { noteId: string; entityType: NoteEntityType; entityId: string }) =>
      addNoteLinkFn(noteId, entityType, entityId),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: ['note-links', variables.noteId] }),
  })

  const removeNoteLink = useMutation({
    mutationFn: ({ noteId, entityId }: { noteId: string; entityId: string }) =>
      removeNoteLinkFn(noteId, entityId),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: ['note-links', variables.noteId] }),
  })

  return {
    createNote: createNote.mutate,
    updateNote: updateNote.mutate,
    deleteNote: deleteNote.mutate,
    addNoteLink: addNoteLink.mutate,
    removeNoteLink: removeNoteLink.mutate,
    isCreating: createNote.isPending,
    isUpdating: updateNote.isPending,
  }
}
