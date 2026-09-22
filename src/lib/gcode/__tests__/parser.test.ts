import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { parseGcode } from '../parser'

const FIXTURES = join(import.meta.dirname, 'fixtures')

function fixture(name: string) {
  return readFileSync(join(FIXTURES, `${name}.gcode`), 'utf8')
}

describe('parseGcode — plunge points', () => {
  it('detects one point per hole in a drill grid, at the correct XY', () => {
    const { points } = parseGcode(fixture('drill-grid'))
    expect(points.length).toBe(9) // 3x3 grid
    const coords = new Set(points.map((p) => `${p.x},${p.y}`))
    for (const x of [0, 50, 100]) {
      for (const y of [0, 50, 100]) {
        expect(coords.has(`${x},${y}`)).toBe(true)
      }
    }
  })

  it('does not report points for pure XY moves', () => {
    const { points } = parseGcode('G0 X10 Y10 F2000\nG1 X20 Y20 F1000\n')
    expect(points.length).toBe(0)
  })

  it('does not report a point on retract (Z moving up)', () => {
    const { points } = parseGcode('G0 Z0.5 F800\nG0 X10 Y10 F2000\nG1 Z-0.5 F800\nG0 Z0.5 F800\n')
    expect(points.length).toBe(1)
    expect(points[0]).toEqual({ x: 10, y: 10 })
  })
})
