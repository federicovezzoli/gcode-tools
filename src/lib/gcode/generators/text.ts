import type { UniversalParams } from '../types'

export function generateText(textInput: string, u: UniversalParams): string {
  // The original gcode_tpgen uses an external char_render.js dependency (render_text function)
  // for character-level G-code rendering. That dependency is not available in this port.
  // To use text rendering, the original HTML tool at:
  //   https://github.com/vector76/gcode_tpgen
  // should be used directly, as it loads char_render.js from the same directory.
  let out = ''
  out += '; Text mode requires the char_render.js dependency from the original gcode_tpgen project.\n'
  out += '; This feature is not available in the TypeScript port.\n'
  out += '; Please use the original tool at https://github.com/vector76/gcode_tpgen for text generation.\n'
  return out
}
