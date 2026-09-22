# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Next.js web app that generates diagnostic G-code patterns for calibrating CNC machines, routers, and plotters (steps/mm rulers, squareness marks, Z-height tests, acceleration/deflection tests, surfacing and hog-out milling passes). It's a rewrite of [vector76/gcode_tpgen](https://github.com/vector76/gcode_tpgen); the G-code generation algorithms are ported faithfully from that original JS source, so behavior parity with the original matters more than idiomatic rewriting when touching generator logic.

Static-exported (`out/`) and deployed to GitHub Pages via `.github/workflows/deploy.yml` on push to `main`. Releases are automated with semantic-release, driven by conventional commit messages (`feat:` → minor, `fix:`/`perf:` → patch, `breaking: true` → major) — see `.releaserc.json`.

## Commands

```bash
npm run dev              # dev server (localhost:3000)
npm run build             # production build (static export to out/)
npm test                  # run all tests once (vitest run)
npm run test:watch        # vitest watch mode
npm run check              # biome lint + format, writes fixes
npm run lint               # biome lint only
npm run format              # biome format only
```

Run a single test file: `npx vitest run src/lib/gcode/__tests__/generators.test.ts`
Run a single test by name: `npx vitest run -t "surfacing"`

CI (`deploy.yml`) runs `npm test` before releasing/building — keep fixture tests passing before pushing to `main`.

## Architecture

**Generation pipeline**: `generateGcode(mode, universal, modeParams)` in [src/lib/gcode/index.ts](src/lib/gcode/index.ts) is the single entry point. It writes the header comment block (varies per mode — note the `hog` mode uses different field names/units than everything else), optionally emits a `G92` origin-setting line based on `zero`/`zero_ref`, then dispatches to one generator function per mode under `src/lib/gcode/generators/`. Each generator takes its own typed params plus `UniversalParams` and returns a raw G-code string (no React/DOM dependency — pure string generation, testable in isolation).

**Adding a new mode** touches several places that must stay in sync:
1. `Mode` union and a `*Params` interface in [src/lib/gcode/types.ts](src/lib/gcode/types.ts)
2. A generator function under `src/lib/gcode/generators/`
3. Dispatch + header-comment cases in [src/lib/gcode/index.ts](src/lib/gcode/index.ts) (`generateGcode`, and `getFilename` if the mode needs custom filename logic)
4. An entry in `MODES` (and its `group`) in [src/lib/modes.ts](src/lib/modes.ts) — this drives the home page grid, the mode selector, and `generateStaticParams()` for the `/[mode]` route
5. Default mode params in `DEFAULT_MODE_PARAMS` (and any universal-param overrides in `MODE_FEEDRATE_DEFAULTS`) in [src/components/toolpage.tsx](src/components/toolpage.tsx)
6. A params form branch in `src/components/mode-params.tsx` and a description in `src/components/mode-description.tsx`
7. A fixture file under `src/lib/gcode/__tests__/fixtures/` and a case in `src/lib/gcode/__tests__/generators.test.ts`

Note: `generateText`/G5-Bézier text mode ([src/lib/gcode/generators/text.ts](src/lib/gcode/generators/text.ts)) exists as a stub only — it is **not** in the `Mode` type or `MODES`, and isn't reachable from the UI.

**Testing strategy**: generator tests in `src/lib/gcode/__tests__/generators.test.ts` are golden-file/fixture tests — each mode's output is compared byte-for-byte against a `.gcode` fixture. When intentionally changing generator output, regenerate the corresponding fixture rather than hand-editing it, and diff it carefully since these encode the ported original tool's exact behavior.

**UI flow**: `/` ([src/app/page.tsx](src/app/page.tsx)) lists modes grouped by category (colors/descriptions from `GROUPS`/`GROUP_COLORS` in `modes.ts`). `/[mode]` ([src/app/[mode]/page.tsx](src/app/[mode]/page.tsx)) is statically generated per mode and renders `ToolPage` ([src/components/toolpage.tsx](src/components/toolpage.tsx)), which owns all form state (`UniversalParams` + mode-specific params), calls `generateGcode`/`getFilename` on demand (not on every keystroke — output is only refreshed by clicking Generate, tracked via `isDirty`), and renders the G-code text output alongside an SVG toolpath preview (parsed from the generated G-code via `src/lib/gcode/parser.ts`, not derived directly from params).

**UI components** under `src/components/ui/` are shadcn/ui primitives (Base UI + Tailwind v4) — treat as generated/vendored; the `noLabelWithoutControl` a11y lint rule is disabled specifically for that directory.
