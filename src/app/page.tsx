'use client'

import { useState } from 'react'
import { GcodeOutput } from '@/components/gcode-output'
import { ModeDescription } from '@/components/mode-description'
import { ModeParamsForm } from '@/components/mode-params'
import { ModeSelector } from '@/components/mode-selector'
import { ThemeToggle } from '@/components/theme-toggle'
import { ToolpathPreview } from '@/components/toolpath-preview'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UniversalParamsForm } from '@/components/universal-params'
import { generateGcode, getFilename, type Mode, type UniversalParams } from '@/lib/gcode'

// Base feedrate defaults for drawing/diagnostic modes
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

// Per-mode feedrate overrides (applied on mode switch)
const MODE_FEEDRATE_DEFAULTS: Partial<Record<Mode, Partial<UniversalParams>>> = {
  surfacing: { vertical: 300, drawspeed: 600, pen_u: 10 },  // 5000 µm/s plunge, 10000 µm/s feedrate, 10mm clearance
}

const DEFAULT_UNIVERSAL: UniversalParams = {
  ...BASE_UNIVERSAL,
  ...(MODE_FEEDRATE_DEFAULTS['surfacing'] ?? {}),  // surfacing is the default mode
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
  surfacing: { stepover: 20, direction: 'E', perimeter: false, bit_width: 35, passes: 1 },
  hog: { orientation: 'X', hog_count: 1, hog_offset: 10, final_feedrate: 1000, final_stepover: 3 },
}

export default function Home() {
  const [mode, setMode] = useState<Mode>('surfacing')
  const [universal, setUniversal] = useState<UniversalParams>(DEFAULT_UNIVERSAL)
  const [modeParamsMap, setModeParamsMap] = useState(DEFAULT_MODE_PARAMS)
  const [gcode, setGcode] = useState('')
  const [filename, setFilename] = useState('')

  const modeParams = modeParamsMap[mode] ?? {}

  function handleModeChange(newMode: Mode) {
    setMode(newMode)
    const feedrateDefaults = MODE_FEEDRATE_DEFAULTS[newMode]
    setUniversal(prev => ({
      ...prev,
      ...(feedrateDefaults ?? { vertical: BASE_UNIVERSAL.vertical, drawspeed: BASE_UNIVERSAL.drawspeed }),
    }))
  }

  function handleModeParamsChange(params: Record<string, any>) {
    setModeParamsMap((prev) => ({ ...prev, [mode]: params }))
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
        <div className="container mx-auto px-4 py-4 max-w-5xl flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">G-Code Patterns Generator</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Generate diagnostic G-code patterns & more for CNC machines
            </p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-5xl space-y-4">
        {/* 1. Mode selector — full width */}
        <ModeSelector value={mode} onChange={handleModeChange} />

        {/* 2. Mode description */}
        <ModeDescription mode={mode} />

        {/* 3. Parameters — two columns on md+ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UniversalParamsForm value={universal} onChange={setUniversal} />
          <ModeParamsForm
            mode={mode}
            value={modeParams}
            onChange={handleModeParamsChange}
            xsize={universal.xsize}
            ysize={universal.ysize}
          />
        </div>

        {/* 4. Generate button */}
        <Button onClick={handleGenerate} className="w-full" size="lg">
          Generate G-Code
        </Button>

        {/* 5. Output */}
        <Tabs defaultValue="preview">
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="gcode">G-Code</TabsTrigger>
          </TabsList>
          <TabsContent value="preview" className="mt-3">
            <ToolpathPreview gcode={gcode} mode={mode} modeParams={modeParams} universal={universal} />
          </TabsContent>
          <TabsContent value="gcode" className="mt-3">
            <GcodeOutput gcode={gcode} filename={filename} />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-4 max-w-5xl flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>
            Made by{' '}
            <a
              href="https://federicovezzoli.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-foreground transition-colors"
            >
              Federico Vezzoli
            </a>
          </span>
          <span>·</span>
          <span>
            Forked from{' '}
            <a
              href="https://github.com/vector76/gcode_tpgen"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-foreground transition-colors"
            >
              vector76/gcode_tpgen
            </a>
          </span>
          <span>·</span>
          <span>v{process.env.NEXT_PUBLIC_APP_VERSION}</span>
        </div>
      </footer>
    </div>
  )
}
