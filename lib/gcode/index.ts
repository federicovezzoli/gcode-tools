import { Mode, UniversalParams, ModeParams } from './types'
import { generateRuler } from './generators/ruler'
import { generatePerimeter, generateSquareness } from './generators/perimeter'
import { generateZTestCorners, generateZTestGrid } from './generators/ztest'
import { generateDenseSegments } from './generators/dense'
import { generateAccel } from './generators/accel'
import { generateText } from './generators/text'
import { generateSurfacing } from './generators/surfacing'
import { generateHog } from './generators/hog'
import { timestamp } from './utils'

export function generateGcode(mode: Mode, universal: UniversalParams, modeParams: ModeParams): string {
  const { pen_d, pen_u, rapid, vertical, drawspeed, drawspeed_slow, xsize, ysize, zero } = universal

  let header = `; G-Code Test Pattern Generator\n`
  header += `; Mode: ${mode}\n`
  header += `; Generated: ${new Date().toISOString()}\n`
  header += `; X: ${xsize}mm  Y: ${ysize}mm\n`
  header += `; Pen down: ${pen_d}mm  Pen up: ${pen_u}mm\n`
  header += `; Rapid: ${rapid}mm/min  Vertical: ${vertical}mm/min\n`
  header += `; Draw: ${drawspeed}mm/min  Slow: ${drawspeed_slow}mm/min\n`
  header += `\n`

  if (zero) {
    header += `G92 X0 Y0 Z0 ; Set current position as origin\n\n`
  }

  let body = ''

  switch (mode) {
    case 'x':
    case 'y':
    case 'xy':
      body = generateRuler(mode, universal)
      break
    case 'perim':
      body = generatePerimeter((modeParams as any).direction, universal)
      break
    case 'squareness':
      body = generateSquareness((modeParams as any).direction, universal)
      break
    case 'ztest_corners':
      body = generateZTestCorners((modeParams as any).zxsize, universal)
      break
    case 'ztest_grid':
      body = generateZTestGrid((modeParams as any).zxsize, universal)
      break
    case 'dense_segments':
      body = generateDenseSegments(
        (modeParams as any).dense_minseg,
        (modeParams as any).dense_maxseg,
        (modeParams as any).dense_efficient,
        (modeParams as any).dense_diagonal,
        universal
      )
      break
    case 'accel_x':
      body = generateAccel('x', (modeParams as any).accel_low, (modeParams as any).accel_high, (modeParams as any).accel_tests, universal)
      break
    case 'accel_y':
      body = generateAccel('y', (modeParams as any).accel_low, (modeParams as any).accel_high, (modeParams as any).accel_tests, universal)
      break
    case 'text':
      body = generateText((modeParams as any).text_input, universal)
      break
    case 'surfacing':
      body = generateSurfacing(
        (modeParams as any).stepover,
        (modeParams as any).direction,
        (modeParams as any).perimeter,
        universal
      )
      break
    case 'hog':
      body = generateHog(
        (modeParams as any).orientation,
        (modeParams as any).hog_count,
        (modeParams as any).hog_offset,
        (modeParams as any).final_feedrate,
        (modeParams as any).final_stepover,
        universal
      )
      break
  }

  const footer = `\n; End of program\nG0 Z${pen_u.toFixed(3)} ; Lift pen\n`

  return header + body + footer
}

export function getFilename(mode: Mode): string {
  return `${mode}-${timestamp()}.gcode`
}

export * from './types'
