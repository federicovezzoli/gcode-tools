# G-Code Tools

A modern web app for generating diagnostic G-code patterns to calibrate and test CNC machines, routers, and plotters.

> **Forked from [vector76/gcode_tpgen](https://github.com/vector76/gcode_tpgen)** — this project is a full rewrite of the original single-file tool, rebuilt with a modern stack and responsive UI while keeping the original G-code generation logic faithful to the source.

---

## What it does

Select a test mode, configure the parameters, hit **Generate** — you get ready-to-run G-code plus an SVG toolpath preview. Download the `.gcode` file and run it on your machine.

### Test modes

| Mode | Purpose |
|---|---|
| X / Y / XY Ruler | Tick marks every 1 mm to detect steps/mm errors and backlash |
| Perimeter Ruler | Rulers along all four sides of the work area |
| Squareness Marks | L-shaped corner marks to check axis squareness |
| Z-Test Corners | X-shaped marks at corners to amplify surface height errors |
| Z-Test Grid | Same, distributed across a grid |
| Dense Segments | Tests firmware parsing speed with configurable segment lengths |
| Accel X / Y | Acceleration ramp test using M201/M204, measures deflection |
| Text | ASCII text via G5 Bézier curves (requires firmware support) |
| Surfacing | Unidirectional surface milling passes |
| Hog-Out | Feedrate vs. deflection test using top-hat profiles |

---

## Stack

- [Next.js 16](https://nextjs.org/) — App Router, TypeScript
- [shadcn/ui](https://ui.shadcn.com/) — component library
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Biome](https://biomejs.dev/) — linting and formatting
- [next-themes](https://github.com/pacocoursey/next-themes) — dark mode

---

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build
npm run check   # biome lint + format
```

---

## Credits

Original tool by **[vector76](https://github.com/vector76/gcode_tpgen)** — all G-code generation algorithms are faithfully ported from the original JavaScript source.

Rewrite by [Federico Vezzoli](https://federicovezzoli.com).
