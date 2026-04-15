import type { UniversalParams } from '../types'

// x_zig: tick marks drawn below ymid, going from xstart to xend (ascending)
function x_zig(
  xstart: number,
  xend: number,
  ymid: number,
  zup: string,
  zdn: string,
  rapid: number,
  vertical: number,
  drawspeed: number,
): string {
  let out = ''
  for (let x = xstart; x <= xend; x++) {
    const yend = ymid - 0.5
    let ystart = yend - 5.5 // most draw from ymid-5.5 to ymid-0.5
    if (x % 5 === 0) {
      ystart = ystart - 2
    }
    if (x % 10 === 0) {
      ystart = ystart - 2
    }
    out += `G0 X${x} Y${ystart}${zup} F${rapid}\n`
    out += `G1 X${x} Y${ystart}${zdn} F${vertical}\n`
    out += `G1 X${x} Y${yend}${zdn} F${drawspeed}\n`
    out += `G0 X${x} Y${yend}${zup} F${vertical}\n`
  }
  return out
}

// x_zag: tick marks drawn above ymid, going from xend to xstart (descending)
function x_zag(
  xstart: number,
  xend: number,
  ymid: number,
  zup: string,
  zdn: string,
  rapid: number,
  vertical: number,
  drawspeed: number,
): string {
  let out = ''
  for (let x = xend; x >= xstart; x--) {
    const ystart = ymid + 0.5
    let yend = ystart + 5.5 // most go from ymid+0.5 to ymid+6
    if (x % 5 === 0) {
      yend = yend + 2 // 5 and 10 mm go from ymid+0.5 to ymid+8
    }
    if (x % 10 === 0) {
      yend = yend + 2 // 10 mm goes from ymid+0.5 to ymid+10
    }
    out += `G0 X${x} Y${ystart}${zup} F${rapid}\n`
    out += `G1 X${x} Y${ystart}${zdn} F${vertical}\n`
    out += `G1 X${x} Y${yend}${zdn} F${drawspeed}\n`
    out += `G0 X${x} Y${yend}${zup} F${vertical}\n`
  }
  return out
}

// y_zig: tick marks drawn left of xmid, going from ystart to yend (ascending)
function y_zig(
  xmid: number,
  ystart: number,
  yend: number,
  zup: string,
  zdn: string,
  rapid: number,
  vertical: number,
  drawspeed: number,
): string {
  let out = ''
  for (let y = ystart; y <= yend; y++) {
    const xend = xmid - 0.5
    let xstart = xend - 5.5
    if (y % 5 === 0) {
      xstart = xstart - 2
    }
    if (y % 10 === 0) {
      xstart = xstart - 2
    }
    out += `G0 X${xstart} Y${y}${zup} F${rapid}\n`
    out += `G1 X${xstart} Y${y}${zdn} F${vertical}\n`
    out += `G1 X${xend} Y${y}${zdn} F${drawspeed}\n`
    out += `G0 X${xend} Y${y}${zup} F${vertical}\n`
  }
  return out
}

// y_zag: tick marks drawn right of xmid, going from yend to ystart (descending)
function y_zag(
  xmid: number,
  ystart: number,
  yend: number,
  zup: string,
  zdn: string,
  rapid: number,
  vertical: number,
  drawspeed: number,
): string {
  let out = ''
  for (let y = yend; y >= ystart; y--) {
    const xstart = xmid + 0.5
    let xend = xstart + 5.5
    if (y % 5 === 0) {
      xend = xend + 2
    }
    if (y % 10 === 0) {
      xend = xend + 2
    }
    out += `G0 X${xstart} Y${y}${zup} F${rapid}\n`
    out += `G1 X${xstart} Y${y}${zdn} F${vertical}\n`
    out += `G1 X${xend} Y${y}${zdn} F${drawspeed}\n`
    out += `G0 X${xend} Y${y}${zup} F${vertical}\n`
  }
  return out
}

// generateRuler is called by index.ts in three ways matching the original:
//   'x'    → x_zig + x_zag at ymid=10  (the bottom X ruler)
//   'y'    → y_zig + y_zag at xmid=10  (the left Y ruler)
//   'perim'→ the two additional rulers for perim mode:
//            x_zig + x_zag at ymid=ysize-10  (top X ruler)
//            y_zig + y_zag at xmid=xsize-10  (right Y ruler)
export function generateRuler(mode: 'x' | 'y' | 'perim', u: UniversalParams): string {
  const { pen_d, pen_u, rapid, vertical, drawspeed, xsize, ysize } = u
  const zu = ` Z${pen_u}`
  const zd = ` Z${pen_d}`
  let out = ''

  if (mode === 'x') {
    out += x_zig(0, xsize, 10, zu, zd, rapid, vertical, drawspeed)
    out += x_zag(0, xsize, 10, zu, zd, rapid, vertical, drawspeed)
  }

  if (mode === 'y') {
    out += y_zig(10, 0, ysize, zu, zd, rapid, vertical, drawspeed)
    out += y_zag(10, 0, ysize, zu, zd, rapid, vertical, drawspeed)
  }

  if (mode === 'perim') {
    // additional two rulers for perimeter mode (top X + right Y)
    out += x_zig(0, xsize, ysize - 10, zu, zd, rapid, vertical, drawspeed)
    out += x_zag(0, xsize, ysize - 10, zu, zd, rapid, vertical, drawspeed)
    out += y_zig(xsize - 10, 0, ysize, zu, zd, rapid, vertical, drawspeed)
    out += y_zag(xsize - 10, 0, ysize, zu, zd, rapid, vertical, drawspeed)
  }

  return out
}
