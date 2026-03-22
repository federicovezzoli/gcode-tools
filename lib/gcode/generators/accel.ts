import { UniversalParams } from '../types'
import { fmt } from '../utils'

export function generateAccel(
  axis: 'x' | 'y',
  accelLow: number, accelHigh: number, accelTests: number,
  u: UniversalParams
): string {
  const { pen_d, pen_u, rapid, vertical, drawspeed, xsize, ysize } = u
  let out = `; Acceleration test - axis: ${axis.toUpperCase()}, low: ${accelLow} high: ${accelHigh} tests: ${accelTests}\n`
  out += `M400 ; wait for moves to finish\n`

  const lineLen = axis === 'x' ? xsize : ysize
  const spacing = (axis === 'x' ? ysize : xsize) / (accelTests + 1)

  for (let i = 0; i < accelTests; i++) {
    const accel = accelLow + (accelHigh - accelLow) * (i / (accelTests - 1 || 1))
    const velocity = rapid * Math.sqrt((i + 1) / accelTests)

    out += `\n; Test ${i + 1}: accel=${fmt(accel)} mm/s2, velocity=${fmt(velocity)} mm/min\n`
    out += `M201 ${axis.toUpperCase()}${fmt(accel)}\n`
    out += `M204 T${fmt(accel)} S${fmt(accel)}\n`

    const perpPos = spacing * (i + 1)
    const startX = axis === 'x' ? 0 : perpPos
    const startY = axis === 'y' ? 0 : perpPos
    const endX = axis === 'x' ? lineLen : perpPos
    const endY = axis === 'y' ? lineLen : perpPos

    out += `G0 X${fmt(startX)} Y${fmt(startY)} Z${fmt(pen_u)} F${fmt(rapid)}\n`
    out += `G1 Z${fmt(pen_d)} F${fmt(vertical)}\n`
    out += `G1 X${fmt(endX)} Y${fmt(endY)} F${fmt(velocity)}\n`
    out += `G1 Z${fmt(pen_u)} F${fmt(vertical)}\n`
  }

  out += `\n; Restore acceleration\nM501 ; load EEPROM\n`
  return out
}
