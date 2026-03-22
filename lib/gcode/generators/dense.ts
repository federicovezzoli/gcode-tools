import { UniversalParams } from '../types'
import { fmt } from '../utils'

function genSubdividedLine(
  x1: number, y1: number,
  x2: number, y2: number,
  minSeg: number, maxSeg: number,
  z: number, f: number
): string {
  const dx = x2 - x1
  const dy = y2 - y1
  const dist = Math.sqrt(dx * dx + dy * dy)
  if (dist === 0) return ''

  let out = ''
  let remaining = dist
  let cx = x1
  let cy = y1

  while (remaining > 0) {
    const seg = Math.min(
      minSeg + Math.random() * (maxSeg - minSeg),
      remaining
    )
    const ratio = seg / dist
    cx += dx * ratio
    cy += dy * ratio
    remaining -= seg
    out += `G1 X${fmt(cx)} Y${fmt(cy)} Z${fmt(z)} F${fmt(f)}\n`
  }
  return out
}

export function generateDenseSegments(
  minSeg: number, maxSeg: number,
  efficient: boolean, diagonal: boolean,
  u: UniversalParams
): string {
  const { pen_d, pen_u, rapid, vertical, drawspeed, xsize, ysize } = u
  let out = `; Dense segments test - min: ${minSeg}mm max: ${maxSeg}mm\n`

  if (diagonal) {
    out += `G0 X0 Y0 Z${fmt(pen_u)} F${fmt(rapid)}\n`
    out += `G1 Z${fmt(pen_d)} F${fmt(vertical)}\n`
    out += genSubdividedLine(0, 0, xsize, ysize, minSeg, maxSeg, pen_d, drawspeed)
    out += `G1 Z${fmt(pen_u)} F${fmt(vertical)}\n`
  } else {
    const step = (maxSeg + minSeg) / 2 * 10
    for (let y = 0; y <= ysize; y += step) {
      out += `G0 X0 Y${fmt(y)} Z${fmt(pen_u)} F${fmt(rapid)}\n`
      out += `G1 Z${fmt(pen_d)} F${fmt(vertical)}\n`
      out += genSubdividedLine(0, y, xsize, y, minSeg, maxSeg, pen_d, drawspeed)
      out += `G1 Z${fmt(pen_u)} F${fmt(vertical)}\n`
    }
  }
  return out
}
