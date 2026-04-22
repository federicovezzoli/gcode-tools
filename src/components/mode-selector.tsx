'use client'

import type { Mode } from '@/lib/gcode'
import { GROUP_COLORS, MODES } from '@/lib/modes'
import { cn } from '@/lib/utils'

interface ModeSelectorProps {
  value: Mode
  onChange: (mode: Mode) => void
}

export function ModeSelector({ value, onChange }: ModeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {MODES.map((mode) => {
        const active = value === mode.value
        return (
          <button
            key={mode.value}
            type="button"
            data-active={active}
            onClick={() => onChange(mode.value)}
            className={cn(
              'px-3 py-1.5 rounded-full border text-sm font-medium transition-colors',
              'data-[active=false]:border-border data-[active=false]:text-muted-foreground',
              'data-[active=true]:text-white data-[active=true]:border-transparent',
              GROUP_COLORS[mode.group],
            )}
          >
            {mode.label}
          </button>
        )
      })}
    </div>
  )
}
