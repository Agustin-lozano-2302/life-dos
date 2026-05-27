import type { Suggestion } from '@/lib/suggestions'

interface SuggestionsSectionProps {
  suggestions: Suggestion[]
  dismissed: string[]
  onDismiss: (id: string) => void
}

export function SuggestionsSection({ suggestions, dismissed, onDismiss }: SuggestionsSectionProps) {
  const visible = suggestions.filter((s) => !dismissed.includes(s.id))
  if (visible.length === 0) return null

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Observations
      </h3>
      <div className="space-y-2">
        {visible.map((s) => (
          <div key={s.id} className="flex items-start gap-2">
            <p className="flex-1 text-sm text-muted-foreground">{s.text}</p>
            <button
              onClick={() => onDismiss(s.id)}
              aria-label={`Dismiss suggestion`}
              className="mt-0.5 shrink-0 rounded p-0.5 text-xs text-muted-foreground/60 hover:text-muted-foreground"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
