import { generateAccel } from './generators/accel'
import { generateDenseSegments } from './generators/dense'
import { generateHog } from './generators/hog'
import { generateSquareness } from './generators/perimeter'
import { generateRuler } from './generators/ruler'
import { generateSurfacing } from './generators/surfacing'
import { generateText } from './generators/text'
import { generateZTestCorners, generateZTestGrid } from './generators/ztest'
import type { Mode, ModeParams, UniversalParams } from './types'
import { datestamp, fmtCoord, timestamp, zeroRefToCoords } from './utils'

export function generateGcode(mode: Mode, universal: UniversalParams, modeParams: ModeParams): string {
  const { pen_d, pen_u, rapid, vertical, drawspeed, drawspeed_slow, xsize, ysize, zero } = universal
  const p = modeParams as any

  let out = ''

  // Header comments — matches original output_append pattern
  out += `; mode: ${mode}\n`
  out += `; rapid feedrate: ${rapid} mm/min\n`
  out += `; raise/lower feedrate: ${vertical} mm/min\n`

  if (mode !== 'hog') {
    // all non-hog modes use the normal names and include xsize and ysize
    out += `; pen down z level: ${pen_d}\n`
    out += `; pen up z level: ${pen_u}\n`
    out += `; drawing feedrate: ${drawspeed} mm/min\n`
    out += `; x extent: ${xsize}\n`
    out += `; y extent: ${ysize}\n`
  } else {
    out += `; z height of cut: ${pen_d}\n`
    out += `; clearance z height: ${pen_u}\n`
    out += `; cutting feedrate: ${drawspeed} mm/min\n`
  }

  if (mode === 'ztest_corners' || mode === 'ztest_grid') {
    out += `; zxsize: ${p.zxsize}\n`
  }

  if (mode === 'dense_segments') {
    out += `; dense_minseg: ${p.dense_minseg}\n`
    out += `; dense_maxseg: ${p.dense_maxseg}\n`
    out += `; dense_efficient: ${p.dense_efficient}\n`
    out += `; dense_diagonal: ${p.dense_diagonal}\n`
  }

  if (mode === 'accel_x' || mode === 'accel_y') {
    out += `; number of accel tests: ${p.accel_tests}\n`
    out += `; high acceleration: ${p.accel_high} mm/s^2\n`
    out += `; low acceleration: ${p.accel_low} mm/s^2\n`
  }

  if (mode === 'surfacing') {
    out += `; stepover: ${p.stepover} mm\n`
    out += `; direction: ${p.direction}\n`
    out += `; perimeter: ${p.perimeter}\n`
    const rawPasses = p.passes
    const passes = typeof rawPasses === 'number' && Number.isFinite(rawPasses) ? Math.max(1, Math.floor(rawPasses)) : 1
    if (passes > 1) out += `; passes: ${passes}\n`
    if (p.horizontal_entry) {
      const bw = typeof p.bit_width === 'number' && p.bit_width > 0 ? p.bit_width : 35
      const slack = typeof p.entry_slack === 'number' && p.entry_slack >= 0 ? p.entry_slack : 2
      out += `; horizontal entry: enabled (offset ${(bw / 2 + slack).toFixed(1)} mm outside stock)\n`
    }
  }

  if (mode === 'hog') {
    out += `; slotting feedrate: ${drawspeed_slow} mm/min\n`
    out += `; stepover: ${p.stepover ?? 1} mm\n`
    out += `; orientation: ${p.orientation}\n`
  }

  if (zero) {
    const [rx, ry] = zeroRefToCoords(universal.zero_ref ?? 'bottom-left', xsize, ysize)
    out += `G92 X${fmtCoord(rx)} Y${fmtCoord(ry)} Z0\n`
  }

  // Mode dispatch — matches exactly the original generate() function
  if (mode === 'x' || mode === 'xy' || mode === 'perim') {
    out += generateRuler('x', universal)
  }

  if (mode === 'y' || mode === 'xy' || mode === 'perim') {
    out += generateRuler('y', universal)
  }

  if (mode === 'perim') {
    out += generateRuler('perim', universal)
  }

  if (mode === 'squareness') {
    out += generateSquareness(universal)
  }

  if (mode === 'ztest_corners') {
    out += generateZTestCorners(p.zxsize, universal)
  }

  if (mode === 'ztest_grid') {
    out += generateZTestGrid(p.zxsize, universal)
  }

  if (mode === 'dense_segments') {
    out += generateDenseSegments(p.dense_minseg, p.dense_maxseg, p.dense_efficient, p.dense_diagonal, universal)
  }

  if (mode === 'accel_x') {
    out += generateAccel('x', p.accel_low, p.accel_high, p.accel_tests, universal)
  }

  if (mode === 'accel_y') {
    out += generateAccel('y', p.accel_low, p.accel_high, p.accel_tests, universal)
  }

  if (mode === 'text') {
    out += generateText(p.text_input, universal)
  }

  if (mode === 'surfacing') {
    const rawP = p.passes
    const safePasses = typeof rawP === 'number' && Number.isFinite(rawP) ? Math.max(1, Math.floor(rawP)) : 1
    const rawPE = p.pause_every
    const safePauseEvery = typeof rawPE === 'number' && Number.isFinite(rawPE) ? Math.max(0, Math.floor(rawPE)) : 1
    const safeBitWidth = typeof p.bit_width === 'number' && p.bit_width > 0 ? p.bit_width : 35
    const safeEntrySlack = typeof p.entry_slack === 'number' && p.entry_slack >= 0 ? p.entry_slack : 2
    out += generateSurfacing(
      p.stepover,
      p.direction,
      p.perimeter,
      safePasses,
      safePauseEvery,
      safeBitWidth,
      !!p.horizontal_entry,
      safeEntrySlack,
      universal,
    )
  }

  if (mode === 'hog') {
    out += generateHog(
      p.orientation,
      p.hog_count,
      p.hog_offset,
      p.final_feedrate,
      p.final_stepover,
      p.stepover ?? 1,
      universal,
    )
  }

  return out
}

export function getFilename(mode: Mode, universal?: UniversalParams, modeParams?: Record<string, any>): string {
  if (mode === 'surfacing' && universal && modeParams) {
    const { xsize, ysize, zero, zero_ref } = universal
    const passes = modeParams.passes ?? 1
    const passStr = `${passes}${passes === 1 ? 'pass' : 'passes'}`
    const perimStr = modeParams.perimeter ? '-perim' : ''
    const zeroStr = zero && zero_ref ? `-${zero_ref}` : ''
    return `surfacing-${xsize}x${ysize}mm-${passStr}${perimStr}${zeroStr}-${datestamp()}.gcode`
  }
  return `${mode}-${timestamp()}.gcode`
}

export * from './types'
