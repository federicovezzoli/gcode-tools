'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { GcodeOutput } from '@/components/gcode-output'
import { ModeDescription } from '@/components/mode-description'
import { ModeParamsForm } from '@/components/mode-params'
import { ModeSelector } from '@/components/mode-selector'
import { ToolpathPreview } from '@/components/toolpath-preview'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UniversalParamsForm } from '@/components/universal-params'
import { generateGcode, getFilename, type Mode, type UniversalParams } from '@/lib/gcode'

const BASE_UNIVERSAL: UniversalParams = {
  zero: false,
  zero_ref: 'bottom-left',
  pen_d: -0.5,
  pen_u: 0.5,
  rapid: 2000,
  vertical: 800,
  drawspeed: 1000,
  drawspeed_slow: 200,
  xsize: 100,
  ysize: 100,
}

const MODE_FEEDRATE_DEFAULTS: Partial<Record<Mode, Partial<UniversalParams>>> = {
  surfacing: { vertical: 300, drawspeed: 1000, pen_d: -1, pen_u: 10 },
}

const DEFAULT_MODE_PARAMS: Record<string, Record<string, any>> = {
  x: {},
  y: {},
  xy: {},
  perim: { direction: 'E' },
  squareness: { direction: 'E' },
  'ztest-corners': { zxsize: 14 },
  'ztest-grid': { zxsize: 14 },
  'dense-segments': { dense_minseg: 0.02, dense_maxseg: 0.5, dense_efficient: false, dense_diagonal: false },
  'accel-x': { accel_low: 100, accel_high: 1000, accel_tests: 10 },
  'accel-y': { accel_low: 100, accel_high: 1000, accel_tests: 10 },
  text: { text_input: '' },
  surfacing: { stepover: 27, direction: 'E', perimeter: false, bit_width: 35, passes: 1 },
  hog: { orientation: 'X', hog_count: 1, hog_offset: 10, final_feedrate: 1000, final_stepover: 3 },
}

interface ToolPageProps {
  mode: Mode
}

export function ToolPage({ mode }: ToolPageProps) {
  const router = useRouter()
  const [universal, setUniversal] = useState<UniversalParams>({
    ...BASE_UNIVERSAL,
    ...(MODE_FEEDRATE_DEFAULTS[mode] ?? {}),
  })
  const [modeParams, setModeParams] = useState<Record<string, any>>(DEFAULT_MODE_PARAMS[mode] ?? {})
  const [gcode, setGcode] = useState('')
  const [filename, setFilename] = useState('')
  const [isDirty, setIsDirty] = useState(false)

  function handleUniversalChange(params: UniversalParams) {
    setUniversal(params)
    setIsDirty(true)
  }

  function handleModeParamsChange(params: Record<string, any>) {
    setModeParams(params)
    setIsDirty(true)
  }

  function handleGenerate() {
    const code = generateGcode(mode, universal, modeParams as any)
    const fname = getFilename(mode, universal, modeParams)
    setGcode(code)
    setFilename(fname)
    setIsDirty(false)
  }

  return (
    <main className="container mx-auto px-4 py-6 max-w-5xl space-y-4">
      <ModeSelector value={mode} onChange={(m) => router.push(`/${m}`)} />
      <ModeDescription mode={mode} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UniversalParamsForm value={universal} onChange={handleUniversalChange} mode={mode} />
        <ModeParamsForm
          mode={mode}
          value={modeParams}
          onChange={handleModeParamsChange}
          xsize={universal.xsize}
          ysize={universal.ysize}
        />
      </div>

      <Button onClick={handleGenerate} className="w-full" size="lg">
        Generate G-Code
      </Button>

      <Tabs defaultValue="preview">
        <TabsList>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="gcode">G-Code</TabsTrigger>
        </TabsList>
        <TabsContent value="preview" className="mt-3">
          <ToolpathPreview gcode={isDirty ? '' : gcode} mode={mode} modeParams={modeParams} universal={universal} />
        </TabsContent>
        <TabsContent value="gcode" className="mt-3">
          <GcodeOutput gcode={gcode} filename={filename} />
        </TabsContent>
      </Tabs>
    </main>
  )
}
