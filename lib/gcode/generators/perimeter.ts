import { UniversalParams, Direction } from '../types'
import { fmt } from '../utils'

export function generatePerimeter(direction: Direction, u: UniversalParams): string {
  const { pen_d, pen_u, rapid, vertical, drawspeed, xsize, ysize } = u
  let out = `; Perimeter test - direction: ${direction}\n`

  // Define corners
  const corners = [
    [0, 0],
    [xsize, 0],
    [xsize, ysize],
    [0, ysize],
  ]

  // Determine start corner based on direction
  let startIdx = 0
  if (direction === 'N') startIdx = 3
  else if (direction === 'S') startIdx = 0
  else if (direction === 'E') startIdx = 1
  else if (direction === 'W') startIdx = 0

  out += `G0 X${fmt(corners[startIdx][0])} Y${fmt(corners[startIdx][1])} Z${fmt(pen_u)} F${fmt(rapid)}\n`
  out += `G1 Z${fmt(pen_d)} F${fmt(vertical)}\n`

  for (let i = 1; i <= 4; i++) {
    const idx = (startIdx + i) % 4
    out += `G1 X${fmt(corners[idx][0])} Y${fmt(corners[idx][1])} F${fmt(drawspeed)}\n`
  }

  out += `G1 Z${fmt(pen_u)} F${fmt(vertical)}\n`
  return out
}

export function generateSquareness(direction: Direction, u: UniversalParams): string {
  const { pen_d, pen_u, rapid, vertical, drawspeed, drawspeed_slow, xsize, ysize } = u
  let out = `; Squareness test - direction: ${direction}\n`

  // Draw diagonal lines to check squareness
  out += `G0 X0 Y0 Z${fmt(pen_u)} F${fmt(rapid)}\n`
  out += `G1 Z${fmt(pen_d)} F${fmt(vertical)}\n`
  out += `G1 X${fmt(xsize)} Y${fmt(ysize)} F${fmt(drawspeed_slow)}\n`
  out += `G1 Z${fmt(pen_u)} F${fmt(vertical)}\n`

  out += `G0 X${fmt(xsize)} Y0 Z${fmt(pen_u)} F${fmt(rapid)}\n`
  out += `G1 Z${fmt(pen_d)} F${fmt(vertical)}\n`
  out += `G1 X0 Y${fmt(ysize)} F${fmt(drawspeed_slow)}\n`
  out += `G1 Z${fmt(pen_u)} F${fmt(vertical)}\n`

  // Draw perimeter
  out += generatePerimeter(direction, u)
  return out
}
