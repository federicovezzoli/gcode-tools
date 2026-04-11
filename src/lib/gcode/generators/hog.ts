import type { UniversalParams } from '../types'

// top_hat: draws a top-hat shape from (xstart,ystart) to (xend,yend) with given height and brim
function top_hat(
  xstart: number,
  ystart: number,
  xend: number,
  yend: number,
  height: number,
  brim: number,
  zup: string,
  zdn: string,
  rapid: number,
  vertical: number,
  drawspeed: number,
): string {
  const dx = xend - xstart
  const dy = yend - ystart
  const oal = Math.sqrt(dx * dx + dy * dy)

  // unit vector in direction from start to end
  const xu = dx / oal
  const yu = dy / oal

  // unit vector to left (90 degrees counter-clockwise)
  const xl = -yu
  const yl = xu

  // intermediate points A, B, C, D
  // A = start + u*brim
  const xA = xstart + xu * brim
  const yA = ystart + yu * brim

  // B = A + l*height
  const xB = xA + xl * height
  const yB = yA + yl * height

  // D = end - u*brim
  const xD = xend - xu * brim
  const yD = yend - yu * brim

  // C = D + l*height
  const xC = xD + xl * height
  const yC = yD + yl * height

  const fspeed = ' F' + Math.round(drawspeed)

  let out = ''
  // move to x1, y1 and plunge to z depth
  out += 'G0' + zup + ' F' + vertical + '\n'
  out += 'G0 X' + xstart.toFixed(3) + ' Y' + ystart.toFixed(3) + ' F' + rapid + '\n'
  out += 'G1' + zdn + ' F' + vertical + '\n'

  // Travel to A, B, C, D, and end
  out += 'G1 X' + xA.toFixed(3) + ' Y' + yA.toFixed(3) + fspeed + '\n'
  out += 'G1 X' + xB.toFixed(3) + ' Y' + yB.toFixed(3) + fspeed + '\n'
  out += 'G1 X' + xC.toFixed(3) + ' Y' + yC.toFixed(3) + fspeed + '\n'
  out += 'G1 X' + xD.toFixed(3) + ' Y' + yD.toFixed(3) + fspeed + '\n'
  out += 'G1 X' + xend.toFixed(3) + ' Y' + yend.toFixed(3) + fspeed + '\n'

  // raise up
  out += 'G0' + zup + ' F' + vertical + '\n'
  return out
}

// top_hat_dbl: perform double top-hat — first pass with stock-to-leave offset, then finishing pass
function top_hat_dbl(
  xstart: number,
  ystart: number,
  xend: number,
  yend: number,
  height: number,
  brim: number,
  zup: string,
  zdn: string,
  rapid: number,
  vertical: number,
  drawspeed: number,
  offs: number,
): string {
  const dx = xend - xstart
  const dy = yend - ystart
  const oal = Math.sqrt(dx * dx + dy * dy)
  const xu = dx / oal
  const yu = dy / oal
  const xl = -yu
  const yl = xu

  // add offs * xl to first pass
  const xstart_off = xstart + xl * offs
  const ystart_off = ystart + yl * offs
  const xend_off = xend + xl * offs
  const yend_off = yend + yl * offs

  let out = ''
  out += '; top hat with stock to leave\n'
  out += top_hat(xstart_off, ystart_off, xend_off, yend_off, height, brim, zup, zdn, rapid, vertical, drawspeed)

  // second pass follows regular geometry
  out += '; top hat finishing\n'
  out += top_hat(xstart, ystart, xend, yend, height, brim, zup, zdn, rapid, vertical, drawspeed)
  return out
}

// full_speed_swipe: a single full-speed plunge-and-cut from start to end
function full_speed_swipe(
  xstart: number,
  ystart: number,
  xend: number,
  yend: number,
  zup: string,
  zdn: string,
  rapid: number,
  vertical: number,
  drawspeed: number,
): string {
  let out = ''
  out += '; full speed cut\n'
  out += 'G0' + zup + ' F' + vertical + '\n'
  out += 'G0 X' + xstart.toFixed(3) + ' Y' + ystart.toFixed(3) + ' F' + rapid + '\n'
  out += 'G1' + zdn + ' F' + vertical + '\n'
  out += 'G1 X' + xend.toFixed(3) + ' Y' + yend.toFixed(3) + ' F' + Math.round(drawspeed) + '\n'
  out += 'G0' + zup + ' F' + vertical + '\n'
  return out
}

// hog_test_x: top_hat_dbl + full_speed_swipe along X axis
function hog_test_x(
  cornerx: number,
  cornery: number,
  stepover: number,
  zup: string,
  zdn: string,
  rapid: number,
  vertical: number,
  drawspeed_slow: number,
  drawspeed: number,
): string {
  const xstart = cornerx
  const ystart = cornery
  const xend = cornerx + 60
  const yend = cornery
  const height = stepover
  const brim = 15
  const stock_to_leave = 0.2 // first pass leaves this much

  let out = ''
  out += top_hat_dbl(
    xstart,
    ystart,
    xend,
    yend,
    height,
    brim,
    zup,
    zdn,
    rapid,
    vertical,
    drawspeed_slow,
    stock_to_leave,
  )
  out += full_speed_swipe(xstart, ystart, xend, yend, zup, zdn, rapid, vertical, drawspeed)
  return out
}

// hog_test_y: top_hat_dbl + full_speed_swipe along Y axis
function hog_test_y(
  cornerx: number,
  cornery: number,
  stepover: number,
  zup: string,
  zdn: string,
  rapid: number,
  vertical: number,
  drawspeed_slow: number,
  drawspeed: number,
): string {
  const xstart = cornerx
  const ystart = cornery + 60
  const xend = cornerx
  const yend = cornery
  const height = stepover
  const brim = 15
  const stock_to_leave = 0.2 // first pass leaves this much

  let out = ''
  out += top_hat_dbl(
    xstart,
    ystart,
    xend,
    yend,
    height,
    brim,
    zup,
    zdn,
    rapid,
    vertical,
    drawspeed_slow,
    stock_to_leave,
  )
  out += full_speed_swipe(xstart, ystart, xend, yend, zup, zdn, rapid, vertical, drawspeed)
  return out
}

export function generateHog(
  orientation: 'X' | 'Y',
  hog_count: number,
  hog_offset: number,
  final_feedrate: number,
  final_stepover: number,
  stepover: number,
  u: UniversalParams,
): string {
  const { pen_d, pen_u, rapid, vertical, drawspeed, drawspeed_slow } = u
  const zu = ' Z' + pen_u
  const zd = ' Z' + pen_d

  const speed_step = (final_feedrate - drawspeed) / (hog_count - 1) // may be NaN if hog_count is 1
  const stepover_step = (final_stepover - stepover) / (hog_count - 1)

  let out = ''

  // First print list of stepover, feedrate combinations attempted
  for (let i = 0; i < hog_count; i++) {
    if (i === 0) {
      const vol = -pen_d * drawspeed * stepover
      out +=
        '; feedrate ' +
        drawspeed +
        ' mm/min, stepover ' +
        stepover.toFixed(3) +
        ' mm, volumetric ' +
        Math.round(vol) +
        ' mm3 per sec\n'
    } else {
      const vol = -pen_d * (drawspeed + i * speed_step) * (stepover + i * stepover_step)
      out +=
        '; feedrate ' +
        Math.round(drawspeed + i * speed_step) +
        ' mm/min, stepover ' +
        (stepover + i * stepover_step).toFixed(3) +
        ' mm, volumetric ' +
        Math.round(vol) +
        ' mm3 per sec\n'
    }
  }

  if (orientation === 'X') {
    for (let i = 0; i < hog_count; i++) {
      if (i === 0) {
        out += hog_test_x(0, 0, stepover, zu, zd, rapid, vertical, drawspeed_slow, drawspeed)
      } else {
        out += hog_test_x(
          0,
          i * hog_offset,
          stepover + i * stepover_step,
          zu,
          zd,
          rapid,
          vertical,
          drawspeed_slow,
          drawspeed + i * speed_step,
        )
      }
    }
  } else {
    for (let i = 0; i < hog_count; i++) {
      if (i === 0) {
        out += hog_test_y(0, 0, stepover, zu, zd, rapid, vertical, drawspeed_slow, drawspeed)
      } else {
        out += hog_test_y(
          i * hog_offset,
          0,
          stepover + i * stepover_step,
          zu,
          zd,
          rapid,
          vertical,
          drawspeed_slow,
          drawspeed + i * speed_step,
        )
      }
    }
  }

  return out
}
