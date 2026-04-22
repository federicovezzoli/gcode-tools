import type { Mode } from './gcode'

export const MODES: { value: Mode; label: string; group: string; description: string }[] = [
  {
    value: 'x',
    label: 'X Ruler',
    group: 'Rulers',
    description: 'Paired tick-mark rulers along X to detect steps/mm errors and backlash.',
  },
  {
    value: 'y',
    label: 'Y Ruler',
    group: 'Rulers',
    description: 'Paired tick-mark rulers along Y to detect steps/mm errors and backlash.',
  },
  { value: 'xy', label: 'XY Rulers', group: 'Rulers', description: 'Both X and Y rulers drawn in one pass.' },
  {
    value: 'perim',
    label: 'Perimeter',
    group: 'Rulers',
    description: 'Rulers along all four sides — useful for checking squareness via diagonals.',
  },
  {
    value: 'squareness',
    label: 'Squareness',
    group: 'Shape',
    description: 'L-shaped corner marks to verify the axes are perpendicular.',
  },
  {
    value: 'ztest-corners',
    label: 'Z Corners',
    group: 'Z-Level',
    description: 'Depth-amplified X marks at the four corners to reveal surface height errors.',
  },
  {
    value: 'ztest-grid',
    label: 'Z Grid',
    group: 'Z-Level',
    description: 'Same depth-amplified marks spread across an evenly-spaced grid.',
  },
  {
    value: 'accel-x',
    label: 'Accel X',
    group: 'Acceleration',
    description: 'Velocity ramp test to measure X-axis deflection across a range of accelerations.',
  },
  {
    value: 'accel-y',
    label: 'Accel Y',
    group: 'Acceleration',
    description: 'Velocity ramp test to measure Y-axis deflection across a range of accelerations.',
  },
  {
    value: 'dense-segments',
    label: 'Dense Segments',
    group: 'Advanced',
    description: 'Dense G1 segments to stress-test firmware parsing and communication speed.',
  },
  {
    value: 'text',
    label: 'Text',
    group: 'Advanced',
    description: 'ASCII text rendered via G5 Bézier curves. Requires firmware support.',
  },
  {
    value: 'surfacing',
    label: 'Surfacing',
    group: 'Milling',
    description: 'Unidirectional surfacing passes to flatten a spoil board or face a workpiece.',
  },
  {
    value: 'hog',
    label: 'Hog-out',
    group: 'Milling',
    description: 'Progressive feedrate test to measure deflection and find the maximum cutting speed.',
  },
]

export const GROUP_COLORS: Record<string, string> = {
  Rulers:
    'data-[active=true]:bg-blue-600 data-[active=true]:border-blue-600 data-[active=false]:hover:border-blue-400 data-[active=false]:hover:text-blue-600',
  Shape:
    'data-[active=true]:bg-green-600 data-[active=true]:border-green-600 data-[active=false]:hover:border-green-400 data-[active=false]:hover:text-green-600',
  'Z-Level':
    'data-[active=true]:bg-purple-600 data-[active=true]:border-purple-600 data-[active=false]:hover:border-purple-400 data-[active=false]:hover:text-purple-600',
  Acceleration:
    'data-[active=true]:bg-orange-600 data-[active=true]:border-orange-600 data-[active=false]:hover:border-orange-400 data-[active=false]:hover:text-orange-600',
  Advanced:
    'data-[active=true]:bg-pink-600 data-[active=true]:border-pink-600 data-[active=false]:hover:border-pink-400 data-[active=false]:hover:text-pink-600',
  Milling:
    'data-[active=true]:bg-yellow-600 data-[active=true]:border-yellow-600 data-[active=false]:hover:border-yellow-400 data-[active=false]:hover:text-yellow-600',
}

export const GROUP_LINK_COLORS: Record<string, string> = {
  Rulers: 'hover:border-blue-400 hover:text-blue-600',
  Shape: 'hover:border-green-400 hover:text-green-600',
  'Z-Level': 'hover:border-purple-400 hover:text-purple-600',
  Acceleration: 'hover:border-orange-400 hover:text-orange-600',
  Advanced: 'hover:border-pink-400 hover:text-pink-600',
  Milling: 'hover:border-yellow-400 hover:text-yellow-600',
}

export const GROUPS: Record<string, { description: string; accent: string; text: string }> = {
  Rulers: {
    description: 'Tick-mark rulers for detecting steps/mm errors and backlash across X, Y, or the full perimeter.',
    accent: 'border-blue-500',
    text: 'text-blue-600 dark:text-blue-400',
  },
  Shape: {
    description: 'L-shaped corner marks to verify axis squareness and check the extent of the work area.',
    accent: 'border-green-500',
    text: 'text-green-600 dark:text-green-400',
  },
  'Z-Level': {
    description: 'Depth-amplified X marks that reveal surface height variations across corners or a full grid.',
    accent: 'border-purple-500',
    text: 'text-purple-600 dark:text-purple-400',
  },
  Acceleration: {
    description: 'Velocity ramp tests that measure axis deflection at different acceleration settings.',
    accent: 'border-orange-500',
    text: 'text-orange-600 dark:text-orange-400',
  },
  Advanced: {
    description: 'Firmware stress tests: dense G1 segment parsing and G5 Bézier text rendering.',
    accent: 'border-pink-500',
    text: 'text-pink-600 dark:text-pink-400',
  },
  Milling: {
    description: 'Spoil board surfacing passes and feedrate-vs-deflection hog-out tests for real cuts.',
    accent: 'border-yellow-500',
    text: 'text-yellow-600 dark:text-yellow-400',
  },
}
