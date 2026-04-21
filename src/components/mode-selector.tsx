'use client'

import type { Mode } from '@/lib/gcode'
import { cn } from '@/lib/utils'

const MODES: { value: Mode; label: string; group: string }[] = [
  { value: 'x', label: 'X Ruler', group: 'Rulers' },
  { value: 'y', label: 'Y Ruler', group: 'Rulers' },
  { value: 'xy', label: 'XY Rulers', group: 'Rulers' },
  { value: 'perim', label: 'Perimeter', group: 'Rulers' },
  { value: 'squareness', label: 'Squareness', group: 'Shape' },
  { value: 'ztest-corners', label: 'Z Corners', group: 'Z-Level' },
  { value: 'ztest-grid', label: 'Z Grid', group: 'Z-Level' },
  { value: 'accel-x', label: 'Accel X', group: 'Acceleration' },
  { value: 'accel-y', label: 'Accel Y', group: 'Acceleration' },
  { value: 'dense-segments', label: 'Dense Segments', group: 'Advanced' },
  { value: 'text', label: 'Text', group: 'Advanced' },
  { value: 'surfacing', label: 'Surfacing', group: 'Milling' },
  { value: 'hog', label: 'Hog-out', group: 'Milling' },
]

const GROUP_COLORS: Record<string, string> = {
  Rulers:
    'data-[active=true]:bg-blue-600 data-[active=true]:border-blue-600 data-[active=false]:hover:border-blue-400 data-[active=false]:hover:text-blue-600',
  Shape:
    'data-[active=true]:bg-green-600 data-[active=true]:border-green-600 data-[active=false]:hover:border-green-400 data-[active=false]:hover:text-green-600',
  'Z-Level':
    'data-[active=true]:bg-purple-600 data-[active=true]:border-purple-600 data-[active=false]:hover:border-purple-400 data-[active=false]:hover:text-purple-600',
  Acceleration:
    'data-[active=true]:bg-orange-600 data-[active=true]:border-orange-600 data-[active=false]:hover:border-orange-400 data-[active=false]:hover:text-orange-600',
  Advanced:
    'data-[active=true]:bg-pink-600 data-[active=true]:border-pink-600 data-[active=false]:hover:border-pink-400 data-[active=false]:hover:text-pink-600',
  Milling:
    'data-[active=true]:bg-yellow-600 data-[active=true]:border-yellow-600 data-[active=false]:hover:border-yellow-400 data-[active=false]:hover:text-yellow-600',
}

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
