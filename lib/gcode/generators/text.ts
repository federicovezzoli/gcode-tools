import { UniversalParams } from '../types'
import { fmt } from '../utils'

export function generateText(textInput: string, u: UniversalParams): string {
  const { pen_d, pen_u, rapid, vertical, drawspeed, xsize, ysize } = u
  let out = `; Text rendering (requires G5 Bezier firmware support)\n`
  out += `; Text: "${textInput}"\n`
  out += `; Note: This uses G5 Bezier curves - ensure your firmware supports it\n\n`

  if (!textInput.trim()) {
    out += `; No text provided\n`
    return out
  }

  // Basic text rendering: position each character proportionally
  const chars = textInput.split('')
  const charWidth = xsize / chars.length
  const charHeight = ysize

  chars.forEach((char, i) => {
    const x = charWidth * i
    const midX = x + charWidth / 2
    const charCode = char.charCodeAt(0)

    out += `; Character: '${char}' (${charCode})\n`
    out += `G0 X${fmt(x)} Y0 Z${fmt(pen_u)} F${fmt(rapid)}\n`
    out += `G1 Z${fmt(pen_d)} F${fmt(vertical)}\n`

    // Simplified: draw character outline using G5 bezier
    // G5 I J P Q X Y (control points and end point)
    out += `G5 I${fmt(charWidth * 0.1)} J${fmt(charHeight * 0.5)} P${fmt(charWidth * 0.9)} Q${fmt(charHeight * 0.5)} X${fmt(midX)} Y${fmt(charHeight)} F${fmt(drawspeed)}\n`
    out += `G1 Z${fmt(pen_u)} F${fmt(vertical)}\n`
  })

  return out
}
