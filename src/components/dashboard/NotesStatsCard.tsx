import type { Note } from '@/types/notes'

interface NotesStatsCardProps {
  notes: Note[]
}

export function NotesStatsCard({ notes }: NotesStatsCardProps) {
  const categoryCounts = notes.reduce<Record<string, number>>((acc, note) => {
    const cat = note.category ?? 'Uncategorized'
    acc[cat] = (acc[cat] ?? 0) + 1
    return acc
  }, {})

  const sorted = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notes</h3>
      <div className="mb-3">
        <p className="text-2xl font-bold">{notes.length}</p>
        <p className="text-xs text-muted-foreground">created this period</p>
      </div>
      {sorted.length > 0 && (
        <div className="space-y-3">
          {sorted.slice(0, 4).map(([cat, count]) => (
            <div key={cat} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{cat}</span>
              <span className="font-medium">{count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
