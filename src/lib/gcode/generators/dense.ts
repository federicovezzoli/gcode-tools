import { UniversalParams } from '../types'

// dense_x_segments: draw a line from xstart to xend at height y,
// subdivided into nsegs segments of given seglength.
// efficient=true omits redundant Z/F parameters.
// diag=true draws diagonal segments.
function dense_x_segments(
  seglength: number, xstart: number, xend: number, y: number,
  zup: string, zdn: string, rapid: number, vertical: number, drawspeed: number,
  efficient: boolean, diag: boolean
): string {
  const nsegs = Math.floor(Math.abs(xend - xstart) / seglength)
  const xdir = (xend > xstart) ? 1 : -1
  let out = ''

  out += 'G0 X' + xstart + ' Y' + y + zup + ' F' + rapid + '\n'
  out += 'G1' + zdn + ' F' + vertical + '\n'

  if (diag) {
    const dlength = seglength * Math.sqrt(0.5)
    for (let i = 1; i < nsegs; i++) {
      const x = (xstart + i * dlength * xdir).toFixed(4)
      const yy = (y + i * dlength).toFixed(4)
      if (efficient) {
        if (i === 1) {
          out += 'G1 X' + x + ' Y' + yy + ' F' + drawspeed + '\n'  // no need to repeat Z position
        } else {
          out += 'G1 X' + x + ' Y' + yy + '\n'  // no need to repeat Z position or feedrate
        }
      } else {
        out += 'G1 X' + x + ' Y' + yy + zdn + ' F' + drawspeed + '\n'
      }
    }
  } else {
    for (let i = 1; i < nsegs; i++) {
      const x = (xstart + i * seglength * xdir).toFixed(4)
      if (efficient) {
        // bare minimum to save bandwidth
        if (i === 1) {
          out += 'G1 X' + x + ' F' + drawspeed + '\n'
        } else {
          out += 'G1 X' + x + '\n'
        }
      } else {
        out += 'G1 X' + x + ' Y' + y + zdn + ' F' + drawspeed + '\n'
      }
    }
  }

  out += 'G0' + zup + ' F' + vertical + '\n'
  return out
}

export function generateDenseSegments(
  dense_minseg: number, dense_maxseg: number,
  dense_efficient: boolean, dense_diagonal: boolean,
  u: UniversalParams
): string {
  const { pen_d, pen_u, rapid, vertical, drawspeed, xsize, ysize } = u
  const zu = ' Z' + pen_u
  const zd = ' Z' + pen_d
  let out = ''

  out += 'G0' + zu + ' F' + vertical + '\n'
  const ylines = Math.floor(ysize) + 1
  for (let y = 0; y < ylines; y++) {
    const seglength = dense_minseg + (dense_maxseg - dense_minseg) * y / (ylines - 1)
    out += '; drawing segments of length ' + seglength + '\n'
    out += dense_x_segments(seglength, 0, xsize, y, zu, zd, rapid, vertical, drawspeed, dense_efficient, dense_diagonal)
  }

  return out
}
