import { Mode, UniversalParams, ModeParams } from './types'
import { generateRuler } from './generators/ruler'
import { generateSquareness } from './generators/perimeter'
import { generateZTestCorners, generateZTestGrid } from './generators/ztest'
import { generateDenseSegments } from './generators/dense'
import { generateAccel } from './generators/accel'
import { generateText } from './generators/text'
import { generateSurfacing } from './generators/surfacing'
import { generateHog } from './generators/hog'
import { timestamp } from './utils'

export function generateGcode(mode: Mode, universal: UniversalParams, modeParams: ModeParams): string {
  const { pen_d, pen_u, rapid, vertical, drawspeed, drawspeed_slow, xsize, ysize, zero } = universal
  const p = modeParams as any

  let out = ''

  // Header comments — matches original output_append pattern
  out += '; mode: ' + mode + '\n'
  out += '; rapid feedrate: ' + rapid + ' mm/min\n'
  out += '; raise/lower feedrate: ' + vertical + ' mm/min\n'

  if (mode !== 'hog') {
    // all non-hog modes use the normal names and include xsize and ysize
    out += '; pen down z level: ' + pen_d + '\n'
    out += '; pen up z level: ' + pen_u + '\n'
    out += '; drawing feedrate: ' + drawspeed + ' mm/min\n'
    out += '; x extent: ' + xsize + '\n'
    out += '; y extent: ' + ysize + '\n'
  } else {
    out += '; z height of cut: ' + pen_d + '\n'
    out += '; clearance z height: ' + pen_u + '\n'
    out += '; cutting feedrate: ' + drawspeed + ' mm/min\n'
  }

  if (mode === 'ztest_corners' || mode === 'ztest_grid') {
    out += '; zxsize: ' + p.zxsize + '\n'
  }

  if (mode === 'dense_segments') {
    out += '; dense_minseg: ' + p.dense_minseg + '\n'
    out += '; dense_maxseg: ' + p.dense_maxseg + '\n'
    out += '; dense_efficient: ' + p.dense_efficient + '\n'
    out += '; dense_diagonal: ' + p.dense_diagonal + '\n'
  }

  if (mode === 'accel_x' || mode === 'accel_y') {
    out += '; number of accel tests: ' + p.accel_tests + '\n'
    out += '; high acceleration: ' + p.accel_high + ' mm/s^2\n'
    out += '; low acceleration: ' + p.accel_low + ' mm/s^2\n'
  }

  if (mode === 'surfacing') {
    out += '; stepover: ' + p.stepover + ' mm\n'
    out += '; direction: ' + p.direction + '\n'
    out += '; perimeter: ' + p.perimeter + '\n'
    out += '; passes: ' + (p.passes ?? 1) + '\n'
  }

  if (mode === 'hog') {
    out += '; slotting feedrate: ' + drawspeed_slow + ' mm/min\n'
    out += '; stepover: ' + (p.stepover ?? 1) + ' mm\n'
    out += '; orientation: ' + p.orientation + '\n'
  }

  if (zero) {
    out += 'G92 X0 Y0 Z0\n'
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
    out += generateSurfacing(p.stepover, p.direction, p.perimeter, p.passes ?? 1, universal)
  }

  if (mode === 'hog') {
    out += generateHog(p.orientation, p.hog_count, p.hog_offset, p.final_feedrate, p.final_stepover, p.stepover ?? 1, universal)
  }

  return out
}

export function getFilename(mode: Mode): string {
  return `${mode}-${timestamp()}.gcode`
}

export * from './types'
