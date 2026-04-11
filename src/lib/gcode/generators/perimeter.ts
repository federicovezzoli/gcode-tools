import type { UniversalParams } from '../types'

// double_line: move to first point, pen down, draw to second then third point, pen up
function double_line(
  sixcoords: number[],
  zup: string,
  zdn: string,
  vertical: number,
  rapid: number,
  drawspeed: number,
): string {
  let out = ''
  out += 'G0 X' + sixcoords[0] + ' Y' + sixcoords[1] + ' F' + rapid + '\n'
  out += 'G1' + zdn + ' F' + vertical + '\n'
  out += 'G1 X' + sixcoords[2] + ' Y' + sixcoords[3] + ' F' + drawspeed + '\n'
  out += 'G1 X' + sixcoords[4] + ' Y' + sixcoords[5] + ' F' + drawspeed + '\n'
  out += 'G0' + zup + ' F' + vertical + '\n'
  return out
}

export function generateSquareness(u: UniversalParams): string {
  const { pen_d, pen_u, rapid, vertical, drawspeed, xsize, ysize } = u
  const zu = ' Z' + pen_u
  const zd = ' Z' + pen_d
  let out = ''

  out += 'G0' + zu + ' F' + vertical + '\n'
  // Four L-shapes in corners
  out += double_line([0, 10, 0, 0, 10, 0], zu, zd, vertical, rapid, drawspeed)
  out += double_line([xsize - 10, 0, xsize, 0, xsize, 10], zu, zd, vertical, rapid, drawspeed)
  out += double_line([xsize, ysize - 10, xsize, ysize, xsize - 10, ysize], zu, zd, vertical, rapid, drawspeed)
  out += double_line([10, ysize, 0, ysize, 0, ysize - 10], zu, zd, vertical, rapid, drawspeed)
  // after last 'L' shape pen is up
  out += 'G0 X0 Y0 F' + rapid + '\n'

  return out
}
