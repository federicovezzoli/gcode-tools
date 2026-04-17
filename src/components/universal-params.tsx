'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Mode, UniversalParams, ZeroRef } from '@/lib/gcode'

interface UniversalParamsFormProps {
  value: UniversalParams
  onChange: (params: UniversalParams) => void
  mode?: Mode
}

function NumField({
  label,
  name,
  value,
  unit,
  onChange,
}: {
  label: string
  name: keyof UniversalParams
  value: number
  unit?: string
  onChange: (k: keyof UniversalParams, v: number) => void
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={String(name)} className="text-xs">
        {label}
      </Label>
      <div className="flex items-center gap-1">
        <Input
          id={String(name)}
          type="number"
          value={value}
          step="any"
          onChange={(e) => onChange(name, parseFloat(e.target.value) || 0)}
          className="h-8 text-sm"
        />
        {unit && <span className="text-xs text-muted-foreground w-12 shrink-0">{unit}</span>}
      </div>
    </div>
  )
}

const ZERO_REF_GRID: { ref: ZeroRef; label: string }[][] = [
  [
    { ref: 'top-left', label: 'Top left' },
    { ref: 'top-center', label: 'Top center' },
    { ref: 'top-right', label: 'Top right' },
  ],
  [
    { ref: 'middle-left', label: 'Middle left' },
    { ref: 'middle-center', label: 'Middle center' },
    { ref: 'middle-right', label: 'Middle right' },
  ],
  [
    { ref: 'bottom-left', label: 'Bottom left' },
    { ref: 'bottom-center', label: 'Bottom center' },
    { ref: 'bottom-right', label: 'Bottom right' },
  ],
]

function ZeroRefGrid({ value, onChange }: { value: ZeroRef; onChange: (ref: ZeroRef) => void }) {
  return (
    <fieldset className="space-y-1.5 border-0 p-0 m-0">
      <legend className="text-xs text-muted-foreground mb-1.5">Workpiece zero reference point</legend>
      <div className="inline-grid grid-cols-3 gap-1 border rounded p-1">
        {ZERO_REF_GRID.map((row) =>
          row.map(({ ref, label }) => (
            <button
              key={ref}
              type="button"
              aria-pressed={value === ref}
              onClick={() => onChange(ref)}
              className={[
                'h-8 px-2 rounded text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                value === ref
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/70',
              ].join(' ')}
            >
              {label}
            </button>
          )),
        )}
      </div>
    </fieldset>
  )
}

export function UniversalParamsForm({ value, onChange, mode }: UniversalParamsFormProps) {
  const set = (k: keyof UniversalParams, v: number | boolean) => onChange({ ...value, [k]: v })

  const isSurfacing = mode === 'surfacing'
  const isHog = mode === 'hog'

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-md font-bold">Universal Parameters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox id="zero" checked={value.zero} onCheckedChange={(v) => set('zero', !!v)} />
            <Label htmlFor="zero" className="text-xs cursor-pointer">
              Enable G92 (set current position as origin)
            </Label>
          </div>
          {value.zero && (
            <ZeroRefGrid
              value={value.zero_ref ?? 'bottom-left'}
              onChange={(ref) => onChange({ ...value, zero_ref: ref })}
            />
          )}
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Dimensions</p>
          <div className="grid grid-cols-2 gap-3">
            <NumField label="X Size" name="xsize" value={value.xsize} unit="mm" onChange={set} />
            <NumField label="Y Size" name="ysize" value={value.ysize} unit="mm" onChange={set} />
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Z Levels</p>
          <div className="grid grid-cols-2 gap-3">
            <NumField
              label={isSurfacing || isHog ? 'Cut Depth' : 'Pen Down'}
              name="pen_d"
              value={value.pen_d}
              unit="mm"
              onChange={set}
            />
            <NumField
              label={isSurfacing || isHog ? 'Clearance' : 'Pen Up'}
              name="pen_u"
              value={value.pen_u}
              unit="mm"
              onChange={set}
            />
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Feedrates</p>
          <div className="grid grid-cols-2 gap-3">
            <NumField label="Rapid" name="rapid" value={value.rapid} unit="mm/min" onChange={set} />
            <NumField
              label={isSurfacing || isHog ? 'Plunge Rate' : 'Vertical'}
              name="vertical"
              value={value.vertical}
              unit="mm/min"
              onChange={set}
            />
            <NumField
              label={isSurfacing || isHog ? 'Feedrate' : 'Draw'}
              name="drawspeed"
              value={value.drawspeed}
              unit="mm/min"
              onChange={set}
            />
            {!isSurfacing && (
              <NumField
                label={isHog ? 'Slotting Feedrate' : 'Draw (slow)'}
                name="drawspeed_slow"
                value={value.drawspeed_slow}
                unit="mm/min"
                onChange={set}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
