'use client'

import { useState } from 'react'
import { Mode, UniversalParams, generateGcode, getFilename } from '@/lib/gcode'
import { ModeSelector } from '@/components/mode-selector'
import { UniversalParamsForm } from '@/components/universal-params'
import { ModeParamsForm } from '@/components/mode-params'
import { GcodeOutput } from '@/components/gcode-output'
import { Button } from '@/components/ui/button'

const DEFAULT_UNIVERSAL: UniversalParams = {
  zero: false,
  pen_d: -0.5,
  pen_u: 0.5,
  rapid: 2000,
  vertical: 800,
  drawspeed: 1000,
  drawspeed_slow: 200,
  xsize: 100,
  ysize: 100,
}

const DEFAULT_MODE_PARAMS: Record<string, Record<string, any>> = {
  x: {},
  y: {},
  xy: {},
  perim: { direction: 'E' },
  squareness: { direction: 'E' },
  ztest_corners: { zxsize: 14 },
  ztest_grid: { zxsize: 14 },
  dense_segments: { dense_minseg: 0.02, dense_maxseg: 0.5, dense_efficient: false, dense_diagonal: false },
  accel_x: { accel_low: 100, accel_high: 1000, accel_tests: 10 },
  accel_y: { accel_low: 100, accel_high: 1000, accel_tests: 10 },
  text: { text_input: '' },
  surfacing: { stepover: 12, direction: 'E', perimeter: false },
  hog: { orientation: 'X', hog_count: 1, hog_offset: 10, final_feedrate: 1000, final_stepover: 3 },
}

export default function Home() {
  const [mode, setMode] = useState<Mode>('xy')
  const [universal, setUniversal] = useState<UniversalParams>(DEFAULT_UNIVERSAL)
  const [modeParamsMap, setModeParamsMap] = useState(DEFAULT_MODE_PARAMS)
  const [gcode, setGcode] = useState('')
  const [filename, setFilename] = useState('')

  const modeParams = modeParamsMap[mode] ?? {}

  function handleModeParamsChange(params: Record<string, any>) {
    setModeParamsMap(prev => ({ ...prev, [mode]: params }))
  }

  function handleGenerate() {
    const code = generateGcode(mode, universal, modeParams as any)
    const fname = getFilename(mode)
    setGcode(code)
    setFilename(fname)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight">G-Code Test Pattern Generator</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Generate diagnostic G-code patterns for CNC machine calibration
              </p>
            </div>
            <Button onClick={handleGenerate} size="default">
              Generate G-Code
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 h-[calc(100vh-140px)]">
          {/* Left panel: controls */}
          <div className="flex flex-col gap-4 overflow-y-auto pr-1">
            <ModeSelector value={mode} onChange={setMode} />
            <UniversalParamsForm value={universal} onChange={setUniversal} />
            <ModeParamsForm mode={mode} value={modeParams} onChange={handleModeParamsChange} />
            <Button onClick={handleGenerate} className="w-full" size="lg">
              Generate G-Code
            </Button>
          </div>

          {/* Right panel: output */}
          <div className="min-h-0">
            <GcodeOutput gcode={gcode} filename={filename} />
          </div>
        </div>
      </main>
    </div>
  )
}
