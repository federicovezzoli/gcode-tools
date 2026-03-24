'use client'

import { useMemo } from 'react'
import { parseGcode, type Segment } from '@/lib/gcode/parser'
import type { Mode, SurfacingParams } from '@/lib/gcode'

// Merge consecutive collinear connected segments into single strokes
function mergeStrokes(segments: Segment[]): Segment[] {
  if (segments.length === 0) return []
  const out: Segment[] = []
  let cur = { ...segments[0] }
  for (let i = 1; i < segments.length; i++) {
    const s = segments[i]
    const connected = Math.abs(s.x1 - cur.x2) < 0.01 && Math.abs(s.y1 - cur.y2) < 0.01
    // collinearity: cross product of direction vectors ≈ 0
    const dx1 = cur.x2 - cur.x1, dy1 = cur.y2 - cur.y1
    const dx2 = s.x2 - s.x1, dy2 = s.y2 - s.y1
    const collinear = Math.abs(dx1 * dy2 - dy1 * dx2) < 0.01
    if (connected && collinear) {
      cur.x2 = s.x2
      cur.y2 = s.y2
    } else {
      out.push(cur)
      cur = { ...s }
    }
  }
  out.push(cur)
  return out
}

const PAD = 24 // SVG padding in px
const W = 600
const H = 400

interface ToolpathPreviewProps {
  gcode: string
  mode?: Mode
  modeParams?: Partial<SurfacingParams> & Record<string, unknown>
}

export function ToolpathPreview({ gcode, mode, modeParams }: ToolpathPreviewProps) {
  const passes = mode === 'surfacing' ? (modeParams?.passes ?? 1) : 1
  const gcodeForPreview = useMemo(() => {
    if (passes <= 1) return gcode
    const m0 = gcode.indexOf('\nM0')
    return m0 !== -1 ? gcode.slice(0, m0) : gcode
  }, [gcode, passes])
  const { segments, bounds } = useMemo(() => parseGcode(gcodeForPreview), [gcodeForPreview])

  if (!gcode || segments.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center rounded-md border border-dashed text-muted-foreground text-sm">
        Generate G-code to see a preview
      </div>
    )
  }

  const { minX, maxX, minY, maxY } = bounds
  const rangeX = maxX - minX || 1
  const rangeY = maxY - minY || 1

  // Fit into drawable area keeping aspect ratio
  const drawW = W - PAD * 2
  const drawH = H - PAD * 2
  const scale = Math.min(drawW / rangeX, drawH / rangeY)

  // Center in the viewport
  const offsetX = PAD + (drawW - rangeX * scale) / 2
  const offsetY = PAD + (drawH - rangeY * scale) / 2

  const tx = (x: number) => offsetX + (x - minX) * scale
  // Flip Y: G-code Y+ is up, SVG Y+ is down
  const ty = (y: number) => offsetY + (maxY - y) * scale

  // Separate into layers
  const rapids = segments.filter(s => s.isRapid)
  const rawCuts = segments.filter(s => !s.isRapid && s.z < 0)
  const cuts = mode === 'surfacing' ? mergeStrokes(rawCuts) : rawCuts
  const clearance = segments.filter(s => !s.isRapid && s.z >= 0)

  const cutCount = cuts.length
  const rapidCount = rapids.length

  return (
    <div className="space-y-2">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full rounded-md border bg-muted/20"
        style={{ aspectRatio: `${W}/${H}` }}
      >
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width={scale} height={scale} patternUnits="userSpaceOnUse"
            x={offsetX - (minX % 1) * scale} y={offsetY - (maxY % 1) * scale}>
            <path d={`M ${scale} 0 L 0 0 0 ${scale}`} fill="none"
              className="stroke-border" strokeWidth="0.3" />
          </pattern>
        </defs>
        <rect x={offsetX} y={offsetY} width={rangeX * scale} height={rangeY * scale}
          fill="url(#grid)" />

        {/* Bounding box */}
        <rect x={offsetX} y={offsetY} width={rangeX * scale} height={rangeY * scale}
          fill="none" className="stroke-border" strokeWidth="1" />

        {/* Rapid moves */}
        {rapids.map((s, i) => (
          <line key={`r${i}`}
            x1={tx(s.x1)} y1={ty(s.y1)} x2={tx(s.x2)} y2={ty(s.y2)}
            className="stroke-muted-foreground/30"
            strokeWidth="0.8"
            strokeDasharray="4 3"
          />
        ))}

        {/* Clearance moves (G1 with Z >= 0) */}
        {clearance.map((s, i) => (
          <line key={`c${i}`}
            x1={tx(s.x1)} y1={ty(s.y1)} x2={tx(s.x2)} y2={ty(s.y2)}
            className="stroke-muted-foreground/20"
            strokeWidth="0.6"
          />
        ))}

        {/* Cutting moves */}
        {mode === 'surfacing' && (modeParams?.bit_width ?? 0) > 0
          ? cuts.map((s, i) => {
              const isAxisAligned = Math.abs(s.x1 - s.x2) < 0.001 || Math.abs(s.y1 - s.y2) < 0.001
              return isAxisAligned
                ? <line key={`cut${i}`}
                    x1={tx(s.x1)} y1={ty(s.y1)} x2={tx(s.x2)} y2={ty(s.y2)}
                    stroke="hsl(10 80% 55%)"
                    strokeOpacity={0.45}
                    strokeWidth={(modeParams?.bit_width ?? 0) * scale}
                    strokeLinecap="round"
                  />
                : <line key={`cut${i}`}
                    x1={tx(s.x1)} y1={ty(s.y1)} x2={tx(s.x2)} y2={ty(s.y2)}
                    stroke="hsl(10 80% 55%)"
                    strokeOpacity={0.6}
                    strokeWidth={1.2}
                    strokeLinecap="round"
                  />
            })
          : cuts.map((s, i) => (
              <line key={`cut${i}`}
                x1={tx(s.x1)} y1={ty(s.y1)} x2={tx(s.x2)} y2={ty(s.y2)}
                className="stroke-primary"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            ))
        }

        {/* Origin dot */}
        <circle cx={tx(0)} cy={ty(0)} r="3" className="fill-primary/50" />

        {/* Dimension labels */}
        <text x={W / 2} y={H - 4} textAnchor="middle"
          className="fill-muted-foreground" fontSize="10">
          {rangeX.toFixed(1)} mm
        </text>
        <text x={6} y={H / 2} textAnchor="middle"
          className="fill-muted-foreground" fontSize="10"
          transform={`rotate(-90, 6, ${H / 2})`}>
          {rangeY.toFixed(1)} mm
        </text>
      </svg>

      {/* Stats */}
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span>
          <span className="inline-block w-3 h-0.5 bg-primary rounded mr-1 translate-y-[-1px]" />
          {cutCount} cut moves
        </span>
        <span>
          <span className="inline-block w-3 h-0.5 bg-muted-foreground/30 rounded mr-1 translate-y-[-1px]" />
          {rapidCount} rapids
        </span>
        {passes > 1 && (
          <span className="text-muted-foreground/70 italic">pass 1 of {passes} shown</span>
        )}
        <span className="ml-auto">
          {(maxX - minX).toFixed(1)} × {(maxY - minY).toFixed(1)} mm
        </span>
      </div>
    </div>
  )
}
