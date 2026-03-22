import { UniversalParams } from '../types'
import { fmt } from '../utils'

export function generateHog(
  orientation: 'X' | 'Y',
  hogCount: number, hogOffset: number,
  finalFeedrate: number, finalStepover: number,
  u: UniversalParams
): string {
  const { pen_d, pen_u, rapid, vertical, drawspeed, xsize, ysize } = u
  let out = `; Hog-out test - orientation: ${orientation} count: ${hogCount} offset: ${hogOffset}mm\n`

  for (let i = 0; i < hogCount; i++) {
    const feedrate = drawspeed + (finalFeedrate - drawspeed) * (i / (hogCount - 1 || 1))
    const offset = hogOffset * i

    out += `\n; Pass ${i + 1}: feedrate=${fmt(feedrate)}\n`

    if (orientation === 'X') {
      const y = offset
      out += `G0 X0 Y${fmt(y)} Z${fmt(pen_u)} F${fmt(rapid)}\n`
      out += `G1 Z${fmt(pen_d)} F${fmt(vertical)}\n`
      out += `G1 X${fmt(xsize)} F${fmt(feedrate)}\n`
      out += `G1 Z${fmt(pen_u)} F${fmt(vertical)}\n`

      // stepover passes
      for (let s = finalStepover; s <= xsize / 2; s += finalStepover) {
        out += `G0 X${fmt(s)} Y${fmt(y)} Z${fmt(pen_u)} F${fmt(rapid)}\n`
        out += `G1 Z${fmt(pen_d)} F${fmt(vertical)}\n`
        out += `G1 X${fmt(xsize - s)} F${fmt(feedrate)}\n`
        out += `G1 Z${fmt(pen_u)} F${fmt(vertical)}\n`
      }
    } else {
      const x = offset
      out += `G0 X${fmt(x)} Y0 Z${fmt(pen_u)} F${fmt(rapid)}\n`
      out += `G1 Z${fmt(pen_d)} F${fmt(vertical)}\n`
      out += `G1 Y${fmt(ysize)} F${fmt(feedrate)}\n`
      out += `G1 Z${fmt(pen_u)} F${fmt(vertical)}\n`
    }
  }
  return out
}
