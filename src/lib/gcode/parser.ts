export interface Segment {
  x1: number
  y1: number
  x2: number
  y2: number
  z: number
  isRapid: boolean
}

// A point where the tool plunges straight down at a fixed XY (e.g. a drilled hole) —
// pure Z moves have no XY extent, so they never show up as a Segment.
export interface PlungePoint {
  x: number
  y: number
}

export interface ParsedToolpath {
  segments: Segment[]
  points: PlungePoint[]
  bounds: { minX: number; maxX: number; minY: number; maxY: number }
}

export function parseGcode(gcode: string): ParsedToolpath {
  const segments: Segment[] = []
  const points: PlungePoint[] = []
  let x = 0,
    y = 0,
    z = 0

  for (const raw of gcode.split('\n')) {
    const line = raw.split(';')[0].trim().toUpperCase()
    if (!line) continue

    const isG0 = line.startsWith('G0 ') || line === 'G0'
    const isG1 = line.startsWith('G1 ') || line === 'G1'
    if (!isG0 && !isG1) continue

    const parse = (axis: string) => {
      const m = line.match(new RegExp(`${axis}([+-]?\\d*\\.?\\d+)`))
      return m ? parseFloat(m[1]) : null
    }

    const nx = parse('X') ?? x
    const ny = parse('Y') ?? y
    const nz = parse('Z') ?? z

    if (nx !== x || ny !== y) {
      // Moves in XY
      segments.push({ x1: x, y1: y, x2: nx, y2: ny, z: nz, isRapid: isG0 })
    } else if (isG1 && nz < z) {
      // Pure Z plunge at a fixed XY — mark it as a drill/plunge point
      points.push({ x, y })
    }

    x = nx
    y = ny
    z = nz
  }

  if (segments.length === 0 && points.length === 0) {
    return { segments, points, bounds: { minX: 0, maxX: 100, minY: 0, maxY: 100 } }
  }

  const xs = [...segments.flatMap((s) => [s.x1, s.x2]), ...points.map((p) => p.x)]
  const ys = [...segments.flatMap((s) => [s.y1, s.y2]), ...points.map((p) => p.y)]
  return {
    segments,
    points,
    bounds: {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys),
    },
  }
}
