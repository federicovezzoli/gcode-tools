import type { UniversalParams } from '../types'

// z_test: draws an X shape at (x, y) with given size.
// Pen descends to zdn at center of each diagonal, rises back to zup at corners.
function z_test(
  x: number,
  y: number,
  size: number,
  zup: string,
  zdn: string,
  rapid: number,
  drawspeed: number,
): string {
  const x0 = (x - size / 2).toFixed(3)
  const x1 = (x + size / 2).toFixed(3)
  const y0 = (y - size / 2).toFixed(3)
  const y1 = (y + size / 2).toFixed(3)
  const xc = x.toFixed(3)
  const yc = y.toFixed(3)

  let out = ''
  out += 'G0 X' + x0 + ' Y' + y0 + zup + ' F' + rapid + '\n'
  out += 'G1 X' + xc + ' Y' + yc + zdn + ' F' + drawspeed + '\n'
  out += 'G1 X' + x1 + ' Y' + y1 + zup + ' F' + drawspeed + '\n'
  out += 'G0 X' + x0 + ' Y' + y1 + zup + ' F' + rapid + '\n'
  out += 'G1 X' + xc + ' Y' + yc + zdn + ' F' + drawspeed + '\n'
  out += 'G1 X' + x1 + ' Y' + y0 + zup + ' F' + drawspeed + '\n'
  return out
}

export function generateZTestCorners(zxsize: number, u: UniversalParams): string {
  const { pen_d, pen_u, rapid, drawspeed, xsize, ysize, vertical } = u
  const zu = ' Z' + pen_u
  const zd = ' Z' + pen_d
  let out = ''

  out += 'G0' + zu + ' F' + vertical + '\n'
  out += z_test(zxsize / 2, zxsize / 2, zxsize, zu, zd, rapid, drawspeed)
  out += z_test(xsize - zxsize / 2, zxsize / 2, zxsize, zu, zd, rapid, drawspeed)
  out += z_test(xsize - zxsize / 2, ysize - zxsize / 2, zxsize, zu, zd, rapid, drawspeed)
  out += z_test(zxsize / 2, ysize - zxsize / 2, zxsize, zu, zd, rapid, drawspeed)

  return out
}

export function generateZTestGrid(zxsize: number, u: UniversalParams): string {
  const { pen_d, pen_u, rapid, drawspeed, xsize, ysize, vertical } = u
  const zu = ' Z' + pen_u
  const zd = ' Z' + pen_d
  let out = ''

  out += 'G0' + zu + ' F' + vertical + '\n'

  // minimum 1 mm space between X marks: N*zxsize+(N-1)*space <= xsize (or ysize)
  const space = 1
  const num_x = Math.floor((xsize + space) / (zxsize + space))
  const num_y = Math.floor((ysize + space) / (zxsize + space))

  if (num_x < 2 || num_y < 2) {
    out += '; not enough room for grid\n'
  } else {
    const step_x = (xsize - zxsize) / (num_x - 1)
    const step_y = (ysize - zxsize) / (num_y - 1)
    for (let iy = 0; iy < num_y; iy++) {
      if (iy % 2 === 0) {
        for (let ix = 0; ix < num_x; ix++) {
          out += z_test(zxsize / 2 + ix * step_x, zxsize / 2 + iy * step_y, zxsize, zu, zd, rapid, drawspeed)
        }
      } else {
        for (let ix = num_x - 1; ix >= 0; ix--) {
          out += z_test(zxsize / 2 + ix * step_x, zxsize / 2 + iy * step_y, zxsize, zu, zd, rapid, drawspeed)
        }
      }
    }
  }

  return out
}
