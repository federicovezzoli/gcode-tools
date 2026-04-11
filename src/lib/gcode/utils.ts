import type { ZeroRef } from './types'

// Compute the G92 origin coordinates for a given zero reference point.
export function zeroRefToCoords(ref: ZeroRef, xsize: number, ysize: number): [number, number] {
  const col = ref.endsWith('left') ? 0 : ref.endsWith('right') ? 2 : 1
  const row = ref.startsWith('bottom') ? 0 : ref.startsWith('middle') ? 1 : 2
  return [(col / 2) * xsize, (row / 2) * ysize]
}

// Format a coordinate for G-code: integers stay clean (no decimals), others get 3 dp.
export function fmtCoord(n: number): string {
  return String(parseFloat(n.toFixed(3)))
}

export function timestamp(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
}

// Format Z string like the original: " Z{n}"
export function zup(pen_u: number): string {
  return ' Z' + pen_u
}

export function zdn(pen_d: number): string {
  return ' Z' + pen_d
}
