import type { UniversalParams } from '../types'

// accel_pre: draw a 10mm reference segment before the acceleration test
function accel_pre(
  mode: string,
  i: number,
  zup: string,
  zdn: string,
  rapid: number,
  vertical: number,
  drawspeed: number,
): string {
  const xstart = mode === 'accel_x' ? 2 * i : 0
  const xend = mode === 'accel_x' ? 2 * i : 10
  const ystart = mode === 'accel_x' ? 0 : 2 * i
  const yend = mode === 'accel_x' ? 10 : 2 * i

  const xpre = xstart + 5
  const ypre = ystart + 5

  let out = ''
  // raise pen
  out += `G0${zup} F${vertical}\n`
  // move to xpre, ypre
  out += `G0 X${xpre.toFixed(3)} Y${ypre.toFixed(3)} F${rapid}\n`
  // move to xstart, ystart
  out += `G0 X${xstart.toFixed(3)} Y${ystart.toFixed(3)} F${rapid}\n`
  // lower pen
  out += `G1${zdn} F${vertical}\n`
  // move to xend, yend
  out += `G1 X${xend.toFixed(3)} Y${yend.toFixed(3)} F${drawspeed}\n`
  // raise pen
  out += `G0${zup} F${vertical}\n`
  return out
}

// accel_execute: ramp velocity up then back down across the extent, subdivided into 40 segments
function accel_execute(mode: string, i: number, extent: number, rapid: number): string {
  const subdiv = 40 // subdivide extent into this many smaller segments
  const xstart = mode === 'accel_x' ? 2 * i : 10
  const ystart = mode === 'accel_x' ? 10 : 2 * i
  const xstep = mode === 'accel_x' ? extent / subdiv : 0
  const ystep = mode === 'accel_x' ? 0 : extent / subdiv

  let out = ''
  for (let j = 1; j <= subdiv; j++) {
    const x = xstart + j * xstep
    const y = ystart + j * ystep
    const vel = rapid * Math.sqrt(j / subdiv)
    out += `G1 X${x.toFixed(3)} Y${y.toFixed(3)} F${Math.round(vel)}\n`
  }
  for (let j = subdiv - 1; j >= 0; j--) {
    const x = xstart + j * xstep
    const y = ystart + j * ystep
    const vel = rapid * Math.sqrt((j + 1) / subdiv)
    out += `G1 X${x.toFixed(3)} Y${y.toFixed(3)} F${Math.round(vel)}\n`
  }
  return out
}

// accel_post: draw a second 10mm reference segment after the acceleration test
function accel_post(
  mode: string,
  i: number,
  zup: string,
  zdn: string,
  rapid: number,
  vertical: number,
  drawspeed: number,
): string {
  const xstart = mode === 'accel_x' ? 2 * i : 11
  const xend = mode === 'accel_x' ? 2 * i : 21
  const ystart = mode === 'accel_x' ? 11 : 2 * i
  const yend = mode === 'accel_x' ? 21 : 2 * i

  const xpre = xstart + 5
  const ypre = ystart + 5

  let out = ''
  // raise pen
  out += `G0${zup} F${vertical}\n`
  // move to xpre, ypre
  out += `G0 X${xpre.toFixed(3)} Y${ypre.toFixed(3)} F${rapid}\n`
  // move to xstart, ystart
  out += `G0 X${xstart.toFixed(3)} Y${ystart.toFixed(3)} F${rapid}\n`
  // lower pen
  out += `G1${zdn} F${vertical}\n`
  // move to xend, yend
  out += `G1 X${xend.toFixed(3)} Y${yend.toFixed(3)} F${drawspeed}\n`
  // raise pen
  out += `G0${zup} F${vertical}\n`
  return out
}

export function generateAccel(
  axis: 'x' | 'y',
  accel_low: number,
  accel_high: number,
  accel_tests: number,
  u: UniversalParams,
): string {
  const { pen_d, pen_u, rapid, vertical, drawspeed, xsize, ysize } = u
  const zu = ` Z${pen_u}`
  const zd = ` Z${pen_d}`
  const mode = `accel_${axis}` // 'accel_x' or 'accel_y'

  let out = ''
  out += 'M501\n'

  const base_accel = 180
  const extent = axis === 'x' ? xsize : ysize
  const accel_incr = accel_tests === 1 ? 0 : (accel_high - accel_low) / (accel_tests - 1)

  for (let i = 0; i < accel_tests; i++) {
    out += accel_pre(mode, i, zu, zd, rapid, vertical, drawspeed)

    // Calculate acceleration value for this test and set it
    const accel_value = Math.round(accel_low + i * accel_incr)
    out += 'M400\n'
    if (axis === 'x') {
      out += `M201 X${accel_value}\n`
    } else {
      out += `M201 Y${accel_value}\n`
    }
    out += `M204 T${accel_value}\n`
    out += 'M400\n'

    out += accel_execute(mode, i, extent, rapid)

    // Set acceleration back to base value of 180
    out += 'M400\n'
    out += `M201 X${base_accel} Y${base_accel}\n`
    out += `M204 T${base_accel}\n`
    out += 'M400\n'

    out += accel_post(mode, i, zu, zd, rapid, vertical, drawspeed)
  }

  out += `G0${zu} F${vertical}\n`
  out += `G0 X0 Y0 F${rapid}\n`
  out += 'M501\n'

  return out
}
