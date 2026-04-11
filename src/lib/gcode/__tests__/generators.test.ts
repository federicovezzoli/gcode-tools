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
  it('ztest_corners', () => expect(generateGcode('ztest_corners', BASE, { zxsize: 14 })).toBe(fixture('ztest_corners')))
  it('ztest_grid', () => expect(generateGcode('ztest_grid', BASE, { zxsize: 14 })).toBe(fixture('ztest_grid')))
})

describe('dense segments', () => {
  it('default', () => {
    const mp = { dense_minseg: 0.02, dense_maxseg: 0.5, dense_efficient: false, dense_diagonal: false }
    expect(generateGcode('dense_segments', BASE, mp)).toBe(fixture('dense_segments'))
  })
  it('efficient', () => {
    const mp = { dense_minseg: 0.02, dense_maxseg: 0.5, dense_efficient: true, dense_diagonal: false }
    expect(generateGcode('dense_segments', BASE, mp)).toBe(fixture('dense_segments_efficient'))
  })
  it('diagonal', () => {
    const mp = { dense_minseg: 0.02, dense_maxseg: 0.5, dense_efficient: false, dense_diagonal: true }
    expect(generateGcode('dense_segments', BASE, mp)).toBe(fixture('dense_segments_diagonal'))
  })
})

describe('acceleration', () => {
  it('accel_x', () => {
    expect(generateGcode('accel_x', BASE, { accel_low: 100, accel_high: 1000, accel_tests: 10 })).toBe(
      fixture('accel_x'),
    )
  })
  it('accel_y', () => {
    expect(generateGcode('accel_y', BASE, { accel_low: 100, accel_high: 1000, accel_tests: 10 })).toBe(
      fixture('accel_y'),
    )
  })
  it('accel_x single test', () => {
    expect(generateGcode('accel_x', BASE, { accel_low: 500, accel_high: 500, accel_tests: 1 })).toBe(
      fixture('accel_x_single'),
    )
  })
})

describe('surfacing', () => {
  it('E no perimeter', () =>
    expect(generateGcode('surfacing', BASE, { stepover: 12, direction: 'E', perimeter: false })).toBe(
      fixture('surfacing_E'),
    ))
  it('N no perimeter', () =>
    expect(generateGcode('surfacing', BASE, { stepover: 12, direction: 'N', perimeter: false })).toBe(
      fixture('surfacing_N'),
    ))
  it('W no perimeter', () =>
    expect(generateGcode('surfacing', BASE, { stepover: 12, direction: 'W', perimeter: false })).toBe(
      fixture('surfacing_W'),
    ))
  it('E with perimeter', () =>
    expect(generateGcode('surfacing', BASE, { stepover: 12, direction: 'E', perimeter: true })).toBe(
      fixture('surfacing_perim'),
    ))
  it('3-pass multipass', () =>
    expect(generateGcode('surfacing', BASE, { stepover: 12, direction: 'E', perimeter: false, passes: 3 })).toBe(
      fixture('surfacing_multipass'),
    ))
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
