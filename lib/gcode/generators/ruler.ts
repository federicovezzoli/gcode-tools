import { UniversalParams } from '../types'
import { fmt, move, rapid as rapidMove } from '../utils'

function xRuler(u: UniversalParams): string {
  let out = ''
  const { pen_d, pen_u, rapid, vertical, drawspeed, xsize, ysize } = u
  // tick marks every 1mm along x axis
  for (let x = 0; x <= xsize; x++) {
    const tickLen = x % 10 === 0 ? 10 : (x % 5 === 0 ? 7 : 5)
    // rapid to start
    out += `G0 X${fmt(x)} Y${fmt(ysize / 2)} Z${fmt(pen_u)} F${fmt(rapid)}\n`
    // pen down
    out += `G1 Z${fmt(pen_d)} F${fmt(vertical)}\n`
    // draw tick
    out += `G1 Y${fmt(ysize / 2 + tickLen)} F${fmt(drawspeed)}\n`
    // pen up
    out += `G1 Z${fmt(pen_u)} F${fmt(vertical)}\n`
  }
  return out
}

function yRuler(u: UniversalParams): string {
  let out = ''
  const { pen_d, pen_u, rapid, vertical, drawspeed, xsize, ysize } = u
  for (let y = 0; y <= ysize; y++) {
    const tickLen = y % 10 === 0 ? 10 : (y % 5 === 0 ? 7 : 5)
    out += `G0 X${fmt(xsize / 2)} Y${fmt(y)} Z${fmt(pen_u)} F${fmt(rapid)}\n`
    out += `G1 Z${fmt(pen_d)} F${fmt(vertical)}\n`
    out += `G1 X${fmt(xsize / 2 + tickLen)} F${fmt(drawspeed)}\n`
    out += `G1 Z${fmt(pen_u)} F${fmt(vertical)}\n`
  }
  return out
}

export function generateRuler(mode: 'x' | 'y' | 'xy', u: UniversalParams): string {
  let out = `; Ruler test - mode: ${mode}\n`
  if (mode === 'x' || mode === 'xy') out += xRuler(u)
  if (mode === 'y' || mode === 'xy') out += yRuler(u)
  return out
}
