import { useQuery } from '@tanstack/react-query'
import { fetchNotes, fetchNoteLinks } from '@/lib/supabase/queries/notes'

export function useNotes() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['notes'],
    queryFn: fetchNotes,
  })
  return { notes: data ?? [], isLoading, isError }
}

export function useNoteLinks(noteId: string) {
  const { data, isLoading } = useQuery({
    queryKey: ['note-links', noteId],
    queryFn: () => fetchNoteLinks(noteId),
    enabled: Boolean(noteId),
  })
  return { links: data ?? [], isLoading }
}
