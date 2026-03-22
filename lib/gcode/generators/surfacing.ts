import { UniversalParams, Direction } from '../types'
import { fmt } from '../utils'

export function generateSurfacing(
  stepover: number, direction: Direction, includePerim: boolean,
  u: UniversalParams
): string {
  const { pen_d, pen_u, rapid, vertical, drawspeed, xsize, ysize } = u
  let out = `; Surfacing - stepover: ${stepover}mm direction: ${direction}\n`

  const isNS = direction === 'N' || direction === 'S'
  const isReverse = direction === 'S' || direction === 'W'

  if (includePerim) {
    out += `; Perimeter pass\n`
    out += `G0 X0 Y0 Z${fmt(pen_u)} F${fmt(rapid)}\n`
    out += `G1 Z${fmt(pen_d)} F${fmt(vertical)}\n`
    out += `G1 X${fmt(xsize)} Y0 F${fmt(drawspeed)}\n`
    out += `G1 X${fmt(xsize)} Y${fmt(ysize)} F${fmt(drawspeed)}\n`
    out += `G1 X0 Y${fmt(ysize)} F${fmt(drawspeed)}\n`
    out += `G1 X0 Y0 F${fmt(drawspeed)}\n`
    out += `G1 Z${fmt(pen_u)} F${fmt(vertical)}\n`
  }

  out += `\n; Fill passes\n`

  if (isNS) {
    // Sweep along X, cut along Y
    let x = 0
    let pass = 0
    while (x <= xsize) {
      const startY = isReverse ? ysize : 0
      const endY = isReverse ? 0 : ysize
      out += `G0 X${fmt(x)} Y${fmt(startY)} Z${fmt(pen_u)} F${fmt(rapid)}\n`
      out += `G1 Z${fmt(pen_d)} F${fmt(vertical)}\n`
      out += `G1 Y${fmt(endY)} F${fmt(drawspeed)}\n`
      out += `G1 Z${fmt(pen_u)} F${fmt(vertical)}\n`
      x += stepover
      pass++
    }
  } else {
    // Sweep along Y, cut along X
    let y = 0
    while (y <= ysize) {
      const startX = isReverse ? xsize : 0
      const endX = isReverse ? 0 : xsize
      out += `G0 X${fmt(startX)} Y${fmt(y)} Z${fmt(pen_u)} F${fmt(rapid)}\n`
      out += `G1 Z${fmt(pen_d)} F${fmt(vertical)}\n`
      out += `G1 X${fmt(endX)} F${fmt(drawspeed)}\n`
      out += `G1 Z${fmt(pen_u)} F${fmt(vertical)}\n`
      y += stepover
    }
  }
  return out
}
