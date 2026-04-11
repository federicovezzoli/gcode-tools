'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { Mode } from '@/lib/gcode'

interface ModeParamsFormProps {
  mode: Mode
  value: Record<string, any>
  onChange: (params: Record<string, any>) => void
  xsize?: number
  ysize?: number
}

function NumField({
  label,
  name,
  value,
  unit,
  step = 'any',
  min,
  onChange,
}: {
  label: string
  name: string
  value: number
  unit?: string
  step?: string
  min?: number
  onChange: (k: string, v: any) => void
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={name} className="text-xs">
        {label}
      </Label>
      <div className="flex items-center gap-1">
        <Input
          id={name}
          type="number"
          value={value}
          step={step}
          min={min}
          onChange={(e) => onChange(name, parseFloat(e.target.value) || 0)}
          className="h-8 text-sm"
        />
        {unit && <span className="text-xs text-muted-foreground w-16 shrink-0">{unit}</span>}
      </div>
    </div>
  )
}

function CheckField({
  label,
  name,
  value,
  onChange,
}: {
  label: string
  name: string
  value: boolean
  onChange: (k: string, v: any) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id={name} checked={value} onCheckedChange={(v) => onChange(name, !!v)} />
      <Label htmlFor={name} className="text-xs cursor-pointer">
        {label}
      </Label>
    </div>
  )
}

function DirSelect({ name, value, onChange }: { name: string; value: string; onChange: (k: string, v: any) => void }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">Direction</Label>
      <Select value={value} onValueChange={(v) => onChange(name, v)}>
        <SelectTrigger className="h-8 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {['N', 'S', 'E', 'W'].map((d) => (
            <SelectItem key={d} value={d}>
              {d === 'N' ? 'North' : d === 'S' ? 'South' : d === 'E' ? 'East' : 'West'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export function ModeParamsForm({ mode, value, onChange, xsize = 100, ysize = 100 }: ModeParamsFormProps) {
  const set = (k: string, v: any) => onChange({ ...value, [k]: v })

  const noParams = ['x', 'y', 'xy']
  if (noParams.includes(mode)) return null

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-md font-bold">Mode Parameters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {(mode === 'perim' || mode === 'squareness') && (
          <DirSelect name="direction" value={value.direction ?? 'E'} onChange={set} />
        )}

        {(mode === 'ztest_corners' || mode === 'ztest_grid') && (
          <NumField label="Mark Size" name="zxsize" value={value.zxsize ?? 14} unit="mm" onChange={set} />
        )}

        {mode === 'dense_segments' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <NumField
                label="Min Segment"
                name="dense_minseg"
                value={value.dense_minseg ?? 0.02}
                unit="mm"
                onChange={set}
              />
              <NumField
                label="Max Segment"
                name="dense_maxseg"
                value={value.dense_maxseg ?? 0.5}
                unit="mm"
                onChange={set}
              />
            </div>
            <CheckField
              label="Bandwidth optimization"
              name="dense_efficient"
              value={value.dense_efficient ?? false}
              onChange={set}
            />
            <CheckField
              label="Diagonal pattern"
              name="dense_diagonal"
              value={value.dense_diagonal ?? false}
              onChange={set}
            />
          </>
        )}

        {(mode === 'accel_x' || mode === 'accel_y') && (
          <div className="grid grid-cols-2 gap-3">
            <NumField label="Low Accel" name="accel_low" value={value.accel_low ?? 100} unit="mm/s²" onChange={set} />
            <NumField
              label="High Accel"
              name="accel_high"
              value={value.accel_high ?? 1000}
              unit="mm/s²"
              onChange={set}
            />
            <NumField label="Test Count" name="accel_tests" value={value.accel_tests ?? 10} step="1" onChange={set} />
          </div>
        )}

        {mode === 'text' && (
          <div className="space-y-1">
            <Label className="text-xs">Text to render</Label>
            <Textarea
              value={value.text_input ?? ''}
              onChange={(e) => set('text_input', e.target.value)}
              placeholder="Enter text (requires G5 Bezier firmware support)"
              className="text-sm resize-none h-20"
            />
          </div>
        )}

        {mode === 'surfacing' && (
          <>
            <NumField label="Bit Width" name="bit_width" value={value.bit_width ?? 25} unit="mm" onChange={set} />
            <div className="space-y-1">
              <NumField
                label="Stepover"
                name="stepover"
                value={value.stepover ?? 12}
                unit="mm"
                onChange={(k, v) => set(k, Math.max(0.1, v))}
              />
              {(() => {
                const bw = value.bit_width ?? 25
                const so = value.stepover ?? 12
                if (bw <= 0 || so <= 0)
                  return <p className="text-xs text-destructive">Bit width and stepover must be &gt; 0</p>
                const dir = value.direction ?? 'E'
                const extent = dir === 'N' || dir === 'S' ? ysize : xsize
                const nrows = Math.ceil(extent / so) + 1
                const rowstep = nrows > 1 ? extent / (nrows - 1) : extent
                if (rowstep > bw)
                  return (
                    <p className="text-xs text-destructive">
                      Stepover exceeds bit width — surface won&apos;t be fully covered
                    </p>
                  )
                const overlap = Math.round((1 - rowstep / bw) * 100)
                return (
                  <p className="text-xs text-muted-foreground">
                    {overlap}% overlap ({rowstep.toFixed(1)} mm actual spacing)
                  </p>
                )
              })()}
            </div>
            <NumField
              label="Passes"
              name="passes"
              value={value.passes ?? 1}
              step="1"
              min={1}
              onChange={(k, v) => set(k, Math.min(50, Math.max(1, Math.round(v))))}
            />
            <DirSelect name="direction" value={value.direction ?? 'E'} onChange={set} />
            <CheckField
              label="Include perimeter pass"
              name="perimeter"
              value={value.perimeter ?? false}
              onChange={set}
            />
          </>
        )}

        {mode === 'hog' && (
          <>
            <div className="space-y-1">
              <Label className="text-xs">Orientation</Label>
              <Select value={value.orientation ?? 'X'} onValueChange={(v) => set('orientation', v)}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="X">X axis</SelectItem>
                  <SelectItem value="Y">Y axis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumField label="Pass Count" name="hog_count" value={value.hog_count ?? 1} step="1" onChange={set} />
              <NumField label="Offset" name="hog_offset" value={value.hog_offset ?? 10} unit="mm" onChange={set} />
              <NumField
                label="Final Feedrate"
                name="final_feedrate"
                value={value.final_feedrate ?? 1000}
                unit="mm/min"
                onChange={set}
              />
              <NumField
                label="Final Stepover"
                name="final_stepover"
                value={value.final_stepover ?? 3}
                unit="mm"
                onChange={set}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
