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
          'flex h-7 w-7 items-center justify-center rounded-full border-2 bg-white/[0.05] text-xs text-white/40 transition-all',
          value === null
            ? 'border-white/50 ring-2 ring-white/30 ring-offset-1 ring-offset-transparent'
            : 'border-white/[0.12]',
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
              ? 'border-white/50 ring-2 ring-white/30 ring-offset-1 ring-offset-transparent'
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
          'flex h-7 w-7 items-center justify-center rounded-full border-2 border-dashed text-xs text-white/40 transition-all',
          isCustom
            ? 'border-white/50 ring-2 ring-white/30 ring-offset-1 ring-offset-transparent'
            : 'border-white/[0.25]',
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
