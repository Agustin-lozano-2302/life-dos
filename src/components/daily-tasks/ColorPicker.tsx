import { useRef } from 'react'
import { cn } from '@/lib/utils'

const PRESETS = [
  '#7c3aed',
  '#2563eb',
  '#16a34a',
  '#dc2626',
  '#d97706',
  '#db2777',
  '#0891b2',
  '#65a30d',
] as const

interface ColorPickerProps {
  value: string | null
  onChange: (color: string | null) => void
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const isCustom = value !== null && !(PRESETS as readonly string[]).includes(value)

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onChange(null)}
        aria-label="No color"
        aria-pressed={value === null}
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded-full border-2 bg-muted text-xs text-muted-foreground transition-all',
          value === null
            ? 'border-primary ring-2 ring-primary ring-offset-1'
            : 'border-transparent',
        )}
      >
        ✕
      </button>

      {PRESETS.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          aria-label={color}
          aria-pressed={value === color}
          className={cn(
            'h-7 w-7 rounded-full border-2 transition-all',
            value === color
              ? 'border-primary ring-2 ring-primary ring-offset-1'
              : 'border-transparent',
          )}
          style={{ backgroundColor: color }}
        />
      ))}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label="Custom color"
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded-full border-2 border-dashed text-xs text-muted-foreground transition-all',
          isCustom
            ? 'border-primary ring-2 ring-primary ring-offset-1'
            : 'border-muted-foreground',
        )}
        style={isCustom ? { backgroundColor: value! } : undefined}
      >
        {!isCustom && '+'}
      </button>

      <input
        ref={inputRef}
        type="color"
        className="sr-only"
        value={isCustom ? value! : '#7c3aed'}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
