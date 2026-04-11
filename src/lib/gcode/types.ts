export type Mode =
  | 'x'
  | 'y'
  | 'xy'
  | 'perim'
  | 'squareness'
  | 'ztest_corners'
  | 'ztest_grid'
  | 'dense_segments'
  | 'accel_x'
  | 'accel_y'
  | 'text'
  | 'surfacing'
  | 'hog'

export type Direction = 'N' | 'S' | 'E' | 'W'

export type ZeroRef =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'middle-left'
  | 'middle-center'
  | 'middle-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'

export interface UniversalParams {
  zero: boolean
  zero_ref?: ZeroRef // which point on the workpiece is the G92 origin; defaults to 'bottom-left'
  pen_d: number
  pen_u: number
  rapid: number
  vertical: number
  drawspeed: number
  drawspeed_slow: number
  xsize: number
  ysize: number
}

export interface RulerParams {
  mode: 'x' | 'y' | 'xy'
}

export interface PerimParams {
  direction: Direction
}

export interface ZTestParams {
  zxsize: number
}

export interface DenseParams {
  dense_minseg: number
  dense_maxseg: number
  dense_efficient: boolean
  dense_diagonal: boolean
}

export interface AccelParams {
  accel_low: number
  accel_high: number
  accel_tests: number
}

export interface TextParams {
  text_input: string
}

export interface SurfacingParams {
  stepover: number
  direction: Direction
  perimeter: boolean
  bit_width: number
  passes: number
}

export interface HogParams {
  orientation: 'X' | 'Y'
  hog_count: number
  hog_offset: number
  final_feedrate: number
  final_stepover: number
}

export type ModeParams =
  | RulerParams
  | PerimParams
  | ZTestParams
  | DenseParams
  | AccelParams
  | TextParams
  | SurfacingParams
  | HogParams
