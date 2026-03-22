'use client'

import { Mode } from '@/lib/gcode'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const MODES: { value: Mode; label: string; description: string; group: string }[] = [
  { value: 'x', label: 'X Ruler', description: 'X-axis tick ruler', group: 'Rulers' },
  { value: 'y', label: 'Y Ruler', description: 'Y-axis tick ruler', group: 'Rulers' },
  { value: 'xy', label: 'XY Rulers', description: 'Both axis rulers', group: 'Rulers' },
  { value: 'perim', label: 'Perimeter', description: 'Perimeter rectangle', group: 'Shape' },
  { value: 'squareness', label: 'Squareness', description: 'Diagonal squareness check', group: 'Shape' },
  { value: 'ztest_corners', label: 'Z Corners', description: 'Z-level at corners', group: 'Z-Level' },
  { value: 'ztest_grid', label: 'Z Grid', description: 'Z-level grid pattern', group: 'Z-Level' },
  { value: 'dense_segments', label: 'Dense Segments', description: 'Parser speed test', group: 'Advanced' },
  { value: 'accel_x', label: 'Accel X', description: 'X acceleration test', group: 'Acceleration' },
  { value: 'accel_y', label: 'Accel Y', description: 'Y acceleration test', group: 'Acceleration' },
  { value: 'text', label: 'Text', description: 'Text via G5 Bezier', group: 'Advanced' },
  { value: 'surfacing', label: 'Surfacing', description: 'Surface milling passes', group: 'Milling' },
  { value: 'hog', label: 'Hog-out', description: 'Feedrate vs. deflection', group: 'Milling' },
]

const GROUP_COLORS: Record<string, string> = {
  Rulers: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  Shape: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'Z-Level': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  Acceleration: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  Advanced: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  Milling: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
}

interface ModeSelectorProps {
  value: Mode
  onChange: (mode: Mode) => void
}

export function ModeSelector({ value, onChange }: ModeSelectorProps) {
  const groups = Array.from(new Set(MODES.map(m => m.group)))

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Test Mode</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {groups.map(group => (
          <div key={group}>
            <p className="text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wide">{group}</p>
            <div className="grid grid-cols-2 gap-1.5">
              {MODES.filter(m => m.group === group).map(mode => (
                <button
                  key={mode.value}
                  onClick={() => onChange(mode.value)}
                  className={cn(
                    'text-left px-3 py-2 rounded-md border text-sm transition-colors',
                    value === mode.value
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <div className="font-medium leading-tight">{mode.label}</div>
                  <div className={cn(
                    'text-xs leading-tight mt-0.5',
                    value === mode.value ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  )}>
                    {mode.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
