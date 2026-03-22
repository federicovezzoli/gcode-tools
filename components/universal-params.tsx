'use client'

import { UniversalParams } from '@/lib/gcode'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

interface UniversalParamsFormProps {
  value: UniversalParams
  onChange: (params: UniversalParams) => void
}

function NumField({
  label, name, value, unit, onChange
}: {
  label: string, name: keyof UniversalParams, value: number, unit?: string
  onChange: (k: keyof UniversalParams, v: number) => void
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={String(name)} className="text-xs">{label}</Label>
      <div className="flex items-center gap-1">
        <Input
          id={String(name)}
          type="number"
          value={value}
          step="any"
          onChange={e => onChange(name, parseFloat(e.target.value) || 0)}
          className="h-8 text-sm"
        />
        {unit && <span className="text-xs text-muted-foreground w-12 shrink-0">{unit}</span>}
      </div>
    </div>
  )
}

export function UniversalParamsForm({ value, onChange }: UniversalParamsFormProps) {
  const set = (k: keyof UniversalParams, v: number | boolean) =>
    onChange({ ...value, [k]: v })

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Universal Parameters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="zero"
            checked={value.zero}
            onCheckedChange={v => set('zero', !!v)}
          />
          <Label htmlFor="zero" className="text-xs cursor-pointer">
            Enable G92 (set current position as origin)
          </Label>
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
            <NumField label="Pen Down" name="pen_d" value={value.pen_d} unit="mm" onChange={set} />
            <NumField label="Pen Up" name="pen_u" value={value.pen_u} unit="mm" onChange={set} />
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Feedrates</p>
          <div className="grid grid-cols-2 gap-3">
            <NumField label="Rapid" name="rapid" value={value.rapid} unit="mm/min" onChange={set} />
            <NumField label="Vertical" name="vertical" value={value.vertical} unit="mm/min" onChange={set} />
            <NumField label="Draw" name="drawspeed" value={value.drawspeed} unit="mm/min" onChange={set} />
            <NumField label="Draw (slow)" name="drawspeed_slow" value={value.drawspeed_slow} unit="mm/min" onChange={set} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
