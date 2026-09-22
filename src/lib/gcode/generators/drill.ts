import type { UniversalParams } from '../types'
import { zdn, zup } from '../utils'

// drill_point: rapid to (x, y) at clearance height, plunge to depth, retract.
function drill_point(x: number, y: number, zu: string, zd: string, rapid: number, vertical: number): string {
  let out = ''
  out += `G0${zu} F${vertical}\n`
  out += `G0 X${x.toFixed(3)} Y${y.toFixed(3)} F${rapid}\n`
  out += `G1${zd} F${vertical}\n`
  out += `G0${zu} F${vertical}\n`
  return out
}

// generateDrillGrid: a rectangular grid of drill points spaced spacing_x/spacing_y
// apart, centered within the X/Y extent, visited in serpentine order.
export function generateDrillGrid(spacing_x: number, spacing_y: number, u: UniversalParams): string {
  const { pen_d, pen_u, rapid, vertical, xsize, ysize } = u
  const zu = zup(pen_u)
  const zd = zdn(pen_d)
  let out = ''

  if (spacing_x <= 0 || spacing_y <= 0) {
    out += '; invalid hole spacing\n'
    return out
  }

  const num_x = Math.max(1, Math.floor(xsize / spacing_x) + 1)
  const num_y = Math.max(1, Math.floor(ysize / spacing_y) + 1)
  const margin_x = (xsize - (num_x - 1) * spacing_x) / 2
  const margin_y = (ysize - (num_y - 1) * spacing_y) / 2

  for (let iy = 0; iy < num_y; iy++) {
    const y = margin_y + iy * spacing_y
    if (iy % 2 === 0) {
      for (let ix = 0; ix < num_x; ix++) {
        out += drill_point(margin_x + ix * spacing_x, y, zu, zd, rapid, vertical)
      }
    } else {
      for (let ix = num_x - 1; ix >= 0; ix--) {
        out += drill_point(margin_x + ix * spacing_x, y, zu, zd, rapid, vertical)
      }
    }
  }

  return out
}
