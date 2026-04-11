import type { Direction, UniversalParams } from '../types'

// gen_subdivided_line: subdivide a line into segments of ~1/5 second at drawspeed
function gen_subdivided_line(x0: number, y0: number, x1: number, y1: number, drawspeed: number): string {
  const fifth_second = drawspeed / 300 // how far do we go in 1/5th of a second
  const dist = Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0))
  const raw_segs = fifth_second > 0 ? Math.ceil(dist / fifth_second) + 1 : 1
  const stroke_segs = Math.min(raw_segs, 5000) // safety cap
  const dx = (x1 - x0) / stroke_segs
  const dy = (y1 - y0) / stroke_segs
  let out = ''
  for (let i = 1; i <= stroke_segs; i++) {
    const x = x0 + i * dx
    const y = y0 + i * dy
    out += 'G1 X' + x.toFixed(3) + ' Y' + y.toFixed(3) + ' F' + drawspeed + '\n'
  }
  return out
}

// surfacing_perim: trace the perimeter twice (once outer, once one stepover inward)
// to prevent tearout on the edges before filling
function surfacing_perim(
  xsize: number,
  ysize: number,
  stepover: number,
  direction: string,
  zup: string,
  zdn: string,
  rapid: number,
  vertical: number,
  drawspeed: number,
): string {
  const xstart = -2 * stepover
  const ystart = 4 * stepover
  const slow = Math.ceil(drawspeed / 4)
  let out = ''

  out += 'G0 ' + zup + ' F' + vertical + '\n' // raise to zup
  out += 'G0 X' + xstart + ' Y' + ystart + ' F' + rapid + '\n' // move to starting location where plunge occurs
  out += 'G1 ' + zdn + ' F' + vertical + '\n' // plunge to zdn
  out += 'G1 X0 Y' + ystart + ' F' + slow + '\n' // engage laterally but slowly
  out += gen_subdivided_line(0, ystart, 0, ysize, drawspeed) // run north along west edge
  out += gen_subdivided_line(0, ysize, xsize, ysize, drawspeed) // run east along north edge
  out += gen_subdivided_line(xsize, ysize, xsize, 0, drawspeed) // run south along east edge
  out += gen_subdivided_line(xsize, 0, 0, 0, drawspeed) // run west along south edge
  out += gen_subdivided_line(0, 0, 0, ystart, drawspeed) // north back to ystart

  // cut entire perimeter again, one stepover inward
  out += gen_subdivided_line(0, ystart, 0, 0, drawspeed)
  out += gen_subdivided_line(0, 0, stepover, 0, drawspeed)
  out += gen_subdivided_line(stepover, 0, stepover, ysize - stepover, drawspeed)
  out += gen_subdivided_line(stepover, ysize - stepover, xsize - stepover, ysize - stepover, drawspeed)
  out += gen_subdivided_line(xsize - stepover, ysize - stepover, xsize - stepover, stepover, drawspeed)
  out += gen_subdivided_line(xsize - stepover, stepover, stepover, stepover, drawspeed)
  out += gen_subdivided_line(stepover, stepover, 0, 0, drawspeed)

  out += 'G0 ' + zup + ' F' + vertical + '\n' // raise to zup
  return out
}

// surfacing: fill rectangle xmin,ymin to xmax,ymax with parallel strokes
function surfacing(
  xmin: number,
  ymin: number,
  xmax: number,
  ymax: number,
  stepover: number,
  direction: string,
  zup: string,
  zdn: string,
  rapid: number,
  vertical: number,
  drawspeed: number,
): string {
  let strokestart: number, strokeend: number, rowstart: number, rowend: number, horiz: boolean

  // orient so that we're always climb milling
  if (direction === 'E') {
    // left to right, top to bottom
    strokestart = xmin
    strokeend = xmax
    rowstart = ymax
    rowend = ymin
    horiz = true
  } else if (direction === 'W') {
    // right to left, bottom to top
    strokestart = xmax
    strokeend = xmin
    rowstart = ymin
    rowend = ymax
    horiz = true
  } else if (direction === 'N') {
    // bottom to top, left to right
    strokestart = ymin
    strokeend = ymax
    rowstart = xmin
    rowend = xmax
    horiz = false
  } else {
    // 'S'
    // top to bottom, right to left
    strokestart = ymax
    strokeend = ymin
    rowstart = xmax
    rowend = xmin
    horiz = false
  }

  if (stepover <= 0) return ''
  const nrows = Math.ceil(Math.abs(rowend - rowstart) / stepover) + 1
  // stepover is a guideline but we adjust so each row is equally spaced
  const rowstep = (rowend - rowstart) / (nrows - 1)

  let out = ''
  for (let row = 0; row < nrows; row++) {
    const rowcoord = rowstart + row * rowstep
    if (horiz) {
      out += 'G0 ' + zup + ' F' + vertical + '\n' // raise to zup
      out += 'G0 X' + strokestart + ' Y' + rowcoord.toFixed(3) + ' F' + rapid + '\n' // rapid move
      out += 'G1 ' + zdn + ' F' + vertical + '\n' // plunge to zdn
      out += gen_subdivided_line(strokestart, rowcoord, strokeend, rowcoord, drawspeed)
    } else {
      out += 'G0 ' + zup + ' F' + vertical + '\n' // raise to zup
      out += 'G0 X' + rowcoord.toFixed(3) + ' Y' + strokestart + ' F' + rapid + '\n' // rapid move
      out += 'G1 ' + zdn + ' F' + vertical + '\n' // plunge to zdn
      out += gen_subdivided_line(rowcoord, strokestart, rowcoord, strokeend, drawspeed)
    }
  }
  out += 'G0 ' + zup + ' F' + vertical + '\n' // raise to zup
  out += 'G0 X0 Y0 F' + rapid + '\n' // rapid move to 0,0
  return out
}

export function generateSurfacing(
  stepover: number,
  direction: Direction,
  perimeter: boolean,
  passes: number,
  u: UniversalParams,
): string {
  const { pen_d, pen_u, rapid, vertical, drawspeed, xsize, ysize } = u
  const zu = ' Z' + pen_u
  const dir = direction.toUpperCase()
  let out = ''

  if (passes <= 1) {
    const zd = ' Z' + pen_d
    if (perimeter) {
      out += surfacing_perim(xsize, ysize, stepover, dir, zu, zd, rapid, vertical, drawspeed)
      if (dir === 'E' || dir === 'W') {
        out += surfacing(
          0,
          2 * stepover,
          xsize,
          ysize - 2 * stepover,
          stepover,
          dir,
          zu,
          zd,
          rapid,
          vertical,
          drawspeed,
        )
      } else {
        out += surfacing(
          2 * stepover,
          0,
          xsize - 2 * stepover,
          ysize,
          stepover,
          dir,
          zu,
          zd,
          rapid,
          vertical,
          drawspeed,
        )
      }
    } else {
      out += surfacing(0, 0, xsize, ysize, stepover, dir, zu, zd, rapid, vertical, drawspeed)
    }
  } else {
    for (let pass = 1; pass <= passes; pass++) {
      const zd = ' Z' + (pen_d * pass).toFixed(3)

      if (pass > 1) {
        out += `; --- Pass ${pass} of ${passes} ---\n`
      }

      if (perimeter) {
        out += surfacing_perim(xsize, ysize, stepover, dir, zu, zd, rapid, vertical, drawspeed)
        if (dir === 'E' || dir === 'W') {
          out += surfacing(
            0,
            2 * stepover,
            xsize,
            ysize - 2 * stepover,
            stepover,
            dir,
            zu,
            zd,
            rapid,
            vertical,
            drawspeed,
          )
        } else {
          out += surfacing(
            2 * stepover,
            0,
            xsize - 2 * stepover,
            ysize,
            stepover,
            dir,
            zu,
            zd,
            rapid,
            vertical,
            drawspeed,
          )
        }
      } else {
        out += surfacing(0, 0, xsize, ysize, stepover, dir, zu, zd, rapid, vertical, drawspeed)
      }

      if (pass < passes) {
        out += `G0${zu} F${vertical}\n`
        out += `M0 ; Pass ${pass} of ${passes} complete - press cycle start to continue\n`
      }
    }
  }

  return out
}
