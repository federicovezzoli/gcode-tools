import { UniversalParams } from '../types'
import { fmt } from '../utils'

function zTestMark(x: number, y: number, size: number, u: UniversalParams): string {
  const { pen_d, pen_u, rapid, vertical, drawspeed } = u
  let out = ''
  const half = size / 2

  // Draw X shape: two diagonals with gradual Z descent then ascent
  // Diagonal 1: top-left to bottom-right
  out += `G0 X${fmt(x - half)} Y${fmt(y + half)} Z${fmt(pen_u)} F${fmt(rapid)}\n`
  out += `G1 Z${fmt((pen_d + pen_u) / 2)} F${fmt(vertical)}\n`
  out += `G1 X${fmt(x)} Y${fmt(y)} Z${fmt(pen_d)} F${fmt(drawspeed)}\n`
  out += `G1 X${fmt(x + half)} Y${fmt(y - half)} Z${fmt((pen_d + pen_u) / 2)} F${fmt(drawspeed)}\n`
  out += `G1 Z${fmt(pen_u)} F${fmt(vertical)}\n`

  // Diagonal 2: top-right to bottom-left
  out += `G0 X${fmt(x + half)} Y${fmt(y + half)} Z${fmt(pen_u)} F${fmt(rapid)}\n`
  out += `G1 Z${fmt((pen_d + pen_u) / 2)} F${fmt(vertical)}\n`
  out += `G1 X${fmt(x)} Y${fmt(y)} Z${fmt(pen_d)} F${fmt(drawspeed)}\n`
  out += `G1 X${fmt(x - half)} Y${fmt(y - half)} Z${fmt((pen_d + pen_u) / 2)} F${fmt(drawspeed)}\n`
  out += `G1 Z${fmt(pen_u)} F${fmt(vertical)}\n`

  return out
}

export function generateZTestCorners(zxsize: number, u: UniversalParams): string {
  const { xsize, ysize } = u
  let out = `; Z-test corners - mark size: ${zxsize}mm\n`

  const corners = [
    [0, 0],
    [xsize, 0],
    [xsize, ysize],
    [0, ysize],
    [xsize / 2, ysize / 2],
  ]

  for (const [x, y] of corners) {
    out += zTestMark(x, y, zxsize, u)
  }
  return out
}

export function generateZTestGrid(zxsize: number, u: UniversalParams): string {
  const { xsize, ysize } = u
  let out = `; Z-test grid - mark size: ${zxsize}mm\n`

  const cols = Math.floor(xsize / (zxsize * 2)) + 1
  const rows = Math.floor(ysize / (zxsize * 2)) + 1

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = (xsize / (cols - 1 || 1)) * c
      const y = (ysize / (rows - 1 || 1)) * r
      out += zTestMark(x, y, zxsize, u)
    }
  }
  return out
}
