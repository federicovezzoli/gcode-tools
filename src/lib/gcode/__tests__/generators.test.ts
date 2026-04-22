import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { generateGcode } from '../index'
import type { UniversalParams } from '../types'

const FIXTURES = join(import.meta.dirname, 'fixtures')

function fixture(name: string) {
  return readFileSync(join(FIXTURES, `${name}.gcode`), 'utf8')
}

const BASE: UniversalParams = {
  zero: false,
  pen_d: -0.5,
  pen_u: 0.5,
  rapid: 2000,
  vertical: 800,
  drawspeed: 1000,
  drawspeed_slow: 200,
  xsize: 100,
  ysize: 100,
}

describe('rulers', () => {
  it('x', () => expect(generateGcode('x', BASE, {})).toBe(fixture('x')))
  it('y', () => expect(generateGcode('y', BASE, {})).toBe(fixture('y')))
  it('xy', () => expect(generateGcode('xy', BASE, {})).toBe(fixture('xy')))
  it('perim', () => expect(generateGcode('perim', BASE, { direction: 'E' })).toBe(fixture('perim')))
})

describe('shape', () => {
  it('squareness', () => expect(generateGcode('squareness', BASE, { direction: 'E' })).toBe(fixture('squareness')))
})

describe('z-level', () => {
  it('ztest-corners', () => expect(generateGcode('ztest-corners', BASE, { zxsize: 14 })).toBe(fixture('ztest-corners')))
  it('ztest-grid', () => expect(generateGcode('ztest-grid', BASE, { zxsize: 14 })).toBe(fixture('ztest-grid')))
})

describe('dense segments', () => {
  it('default', () => {
    const mp = { dense_minseg: 0.02, dense_maxseg: 0.5, dense_efficient: false, dense_diagonal: false }
    expect(generateGcode('dense-segments', BASE, mp)).toBe(fixture('dense-segments'))
  })
  it('efficient', () => {
    const mp = { dense_minseg: 0.02, dense_maxseg: 0.5, dense_efficient: true, dense_diagonal: false }
    expect(generateGcode('dense-segments', BASE, mp)).toBe(fixture('dense-segments-efficient'))
  })
  it('diagonal', () => {
    const mp = { dense_minseg: 0.02, dense_maxseg: 0.5, dense_efficient: false, dense_diagonal: true }
    expect(generateGcode('dense-segments', BASE, mp)).toBe(fixture('dense-segments-diagonal'))
  })
})

describe('acceleration', () => {
  it('accel-x', () => {
    expect(generateGcode('accel-x', BASE, { accel_low: 100, accel_high: 1000, accel_tests: 10 })).toBe(
      fixture('accel-x'),
    )
  })
  it('accel-y', () => {
    expect(generateGcode('accel-y', BASE, { accel_low: 100, accel_high: 1000, accel_tests: 10 })).toBe(
      fixture('accel-y'),
    )
  })
  it('accel-x single test', () => {
    expect(generateGcode('accel-x', BASE, { accel_low: 500, accel_high: 500, accel_tests: 1 })).toBe(
      fixture('accel-x-single'),
    )
  })
})

describe('surfacing', () => {
  it('X climb no perimeter', () =>
    expect(generateGcode('surfacing', BASE, { stepover: 12, pass_axis: 'X', climb: true, perimeter: false })).toBe(
      fixture('surfacing_E'),
    ))
  it('Y climb no perimeter', () =>
    expect(generateGcode('surfacing', BASE, { stepover: 12, pass_axis: 'Y', climb: true, perimeter: false })).toBe(
      fixture('surfacing_N'),
    ))
  it('X conventional no perimeter', () =>
    expect(generateGcode('surfacing', BASE, { stepover: 12, pass_axis: 'X', climb: false, perimeter: false })).toBe(
      fixture('surfacing_W'),
    ))
  it('X climb with perimeter', () =>
    expect(generateGcode('surfacing', BASE, { stepover: 12, pass_axis: 'X', climb: true, perimeter: true })).toBe(
      fixture('surfacing_perim'),
    ))
  it('3-pass multipass', () =>
    expect(
      generateGcode('surfacing', BASE, { stepover: 12, pass_axis: 'X', climb: true, perimeter: false, passes: 3 }),
    ).toBe(fixture('surfacing_multipass')))
})

// Extract X,Y from all "G0 Xnnn Ynnn F{rapid}" rapid-move lines, excluding the
// final return-to-origin (X0 Y0) which is always present at the end of surfacing.
function plungeRapids(gcode: string, rapid: number): Array<{ x: number; y: number }> {
  const re = new RegExp(`^G0 X(-?[\\d.]+) Y(-?[\\d.]+) F${rapid}$`)
  return gcode
    .split('\n')
    .flatMap((line) => {
      const m = line.match(re)
      return m ? [{ x: parseFloat(m[1]), y: parseFloat(m[2]) }] : []
    })
    .filter((c) => !(c.x === 0 && c.y === 0)) // exclude final return to origin
}

describe('surfacing – horizontal entry', () => {
  // bit_width=35, entry_slack=2 → entryOffset = 35/2 + 2 = 19.5 mm
  const ENTRY_OFFSET = 35 / 2 + 2
  const MP = { stepover: 12, bit_width: 35, entry_slack: 2, perimeter: false, horizontal_entry: true }

  it('X climb: every stroke plunges left of X=0 by entry_offset', () => {
    const gcode = generateGcode('surfacing', BASE, { ...MP, pass_axis: 'X', climb: true })
    const rapids = plungeRapids(gcode, BASE.rapid)
    expect(rapids.length).toBeGreaterThan(0)
    for (const { x } of rapids) expect(x).toBeCloseTo(-ENTRY_OFFSET, 3)
  })

  it('X conventional: every stroke plunges left of X=0 by entry_offset', () => {
    const gcode = generateGcode('surfacing', BASE, { ...MP, pass_axis: 'X', climb: false })
    const rapids = plungeRapids(gcode, BASE.rapid)
    expect(rapids.length).toBeGreaterThan(0)
    for (const { x } of rapids) expect(x).toBeCloseTo(-ENTRY_OFFSET, 3)
  })

  it('Y climb: every stroke plunges below Y=0 by entry_offset', () => {
    const gcode = generateGcode('surfacing', BASE, { ...MP, pass_axis: 'Y', climb: true })
    const rapids = plungeRapids(gcode, BASE.rapid)
    expect(rapids.length).toBeGreaterThan(0)
    for (const { y } of rapids) expect(y).toBeCloseTo(-ENTRY_OFFSET, 3)
  })

  it('Y conventional: every stroke plunges below Y=0 by entry_offset', () => {
    const gcode = generateGcode('surfacing', BASE, { ...MP, pass_axis: 'Y', climb: false })
    const rapids = plungeRapids(gcode, BASE.rapid)
    expect(rapids.length).toBeGreaterThan(0)
    for (const { y } of rapids) expect(y).toBeCloseTo(-ENTRY_OFFSET, 3)
  })

  it('entry_slack=0 → offset equals exactly bit radius', () => {
    const gcode = generateGcode('surfacing', BASE, { ...MP, pass_axis: 'X', climb: true, entry_slack: 0 })
    const rapids = plungeRapids(gcode, BASE.rapid)
    for (const { x } of rapids) expect(x).toBeCloseTo(-(35 / 2), 3)
  })

  it('disabled → output is identical to baseline (no change to existing behavior)', () => {
    const withEntry = generateGcode('surfacing', BASE, { ...MP, pass_axis: 'X', climb: true, horizontal_entry: false })
    const baseline = generateGcode('surfacing', BASE, { stepover: 12, pass_axis: 'X', climb: true, perimeter: false })
    expect(withEntry).toBe(baseline)
  })

  it('header comment shows entry offset when enabled', () => {
    const gcode = generateGcode('surfacing', BASE, { ...MP, pass_axis: 'X', climb: true })
    expect(gcode).toContain('; horizontal entry: enabled (offset 19.5 mm outside stock)')
  })

  it('header comment absent when disabled', () => {
    const gcode = generateGcode('surfacing', BASE, { ...MP, pass_axis: 'X', climb: true, horizontal_entry: false })
    expect(gcode).not.toContain('; horizontal entry:')
  })

  it('strokes still reach the far stock edge (X climb: last G1 per row ends at X=xmax)', () => {
    const gcode = generateGcode('surfacing', BASE, { ...MP, pass_axis: 'X', climb: true })
    // collect all G1 X... Y... lines (cutting moves), group by Y row, last X per row = xmax
    const re = /^G1 X([\d.]+) Y([\d.]+) F\d+$/
    const cuts = gcode.split('\n').flatMap((line) => {
      const m = line.match(re)
      return m ? [{ x: parseFloat(m[1]), y: parseFloat(m[2]) }] : []
    })
    // group by Y
    const byY = new Map<number, number[]>()
    for (const { x, y } of cuts) {
      const key = Math.round(y * 1000) // round to avoid float key collisions
      const arr = byY.get(key) ?? []
      arr.push(x)
      byY.set(key, arr)
    }
    for (const xs of byY.values()) {
      expect(Math.max(...xs)).toBeCloseTo(BASE.xsize, 2)
    }
  })
})

describe('hog', () => {
  it('X single pass', () => {
    expect(
      generateGcode('hog', BASE, {
        orientation: 'X',
        hog_count: 1,
        hog_offset: 10,
        final_feedrate: 1000,
        final_stepover: 3,
        stepover: 12,
      }),
    ).toBe(fixture('hog_X'))
  })
  it('Y single pass', () => {
    expect(
      generateGcode('hog', BASE, {
        orientation: 'Y',
        hog_count: 1,
        hog_offset: 10,
        final_feedrate: 1000,
        final_stepover: 3,
        stepover: 12,
      }),
    ).toBe(fixture('hog_Y'))
  })
  it('X multi pass', () => {
    expect(
      generateGcode('hog', BASE, {
        orientation: 'X',
        hog_count: 3,
        hog_offset: 10,
        final_feedrate: 2000,
        final_stepover: 6,
        stepover: 12,
      }),
    ).toBe(fixture('hog_multi'))
  })
})

describe('zero flag', () => {
  it('bottom-left (default)', () =>
    expect(generateGcode('x', { ...BASE, zero: true, zero_ref: 'bottom-left' }, {})).toBe(fixture('x_zero')))
  it('middle-center -> G92 X50 Y50', () =>
    expect(generateGcode('x', { ...BASE, zero: true, zero_ref: 'middle-center' }, {})).toBe(fixture('x_zero_center')))

  it.each([
    ['bottom-left', 'G92 X0 Y0 Z0'],
    ['bottom-center', 'G92 X50 Y0 Z0'],
    ['bottom-right', 'G92 X100 Y0 Z0'],
    ['middle-left', 'G92 X0 Y50 Z0'],
    ['middle-center', 'G92 X50 Y50 Z0'],
    ['middle-right', 'G92 X100 Y50 Z0'],
    ['top-left', 'G92 X0 Y100 Z0'],
    ['top-center', 'G92 X50 Y100 Z0'],
    ['top-right', 'G92 X100 Y100 Z0'],
  ] as const)('zero_ref %s emits %s', (zero_ref, expected) =>
    expect(generateGcode('x', { ...BASE, zero: true, zero_ref }, {})).toContain(expected))
})
