import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useNotes } from './useNotes'
import * as queries from '@/lib/supabase/queries/notes'
import type { Note } from '@/types/notes'

vi.mock('@/lib/supabase/queries/notes')

const mockNote: Note = {
  id: 'note-1',
  title: 'Meeting notes',
  content: null,
  category: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

beforeEach(() => { vi.clearAllMocks() })

describe('useNotes', () => {
  it('returns notes when loaded', async () => {
    vi.mocked(queries.fetchNotes).mockResolvedValue([mockNote])
    const { result } = renderHook(() => useNotes(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.notes).toEqual([mockNote])
  })

  it('returns empty array while loading', () => {
    vi.mocked(queries.fetchNotes).mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useNotes(), { wrapper: makeWrapper() })
    expect(result.current.notes).toEqual([])
    expect(result.current.isLoading).toBe(true)
  })
})
