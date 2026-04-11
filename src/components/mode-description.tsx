import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Mode } from '@/lib/gcode'

const descriptions: Record<string, React.ReactNode> = {
  ruler: (
    <>
      <p>
        This mode draws many short (~10 mm) segments 1 mm apart, with the end result resembling a ruler. These rulers
        are drawn in pairs, with two rulers drawn next to each other, but drawn in opposite directions.
      </p>
      <p>
        These are potentially useful for identifying errors in steps per mm, not only for uniform spacing error, but
        also for nonuniform errors in spacing. By drawing two rulers in opposite directions, backlash (or other similar
        effects) can be detected. The &quot;perimeter ruler&quot; can also be used to determine whether the machine is
        square by comparing the diagonals.
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>X ruler</strong> draws a pair of adjacent rulers along the positive X axis. The &quot;X Extent&quot;
          setting determines the length.
        </li>
        <li>
          <strong>Y ruler</strong> draws a pair of adjacent rulers along the positive Y axis.
        </li>
        <li>
          <strong>X and Y ruler</strong> draws both of the above.
        </li>
        <li>
          <strong>Perimeter ruler</strong> draws four pairs of rulers around the perimeter within a rectangle defined by
          X and Y extent.
        </li>
      </ul>
    </>
  ),

  squareness: (
    <p>
      Draws four &quot;L&quot; shape marks in the corners of the specified X and Y extent. These marks are useful for
      indicating the extent of the workspace and for testing squareness.
    </p>
  ),

  ztest: (
    <>
      <p>
        These modes check whether the work surface is level and flat. They work by drawing &quot;X&quot; shaped marks,
        where the pen descends at a shallow angle as it approaches the center, then slowly rises as it moves away.
      </p>
      <p>
        Small differences in surface height create longer or shorter pen marks, effectively amplifying surface height
        errors to be more easily visible. With a Z travel of 1 mm (from +0.5 to −0.5) the slope is about 1:10 — a Z
        displacement is reflected in segment length amplified by a factor of 20.
      </p>
      <p>
        For <strong>Z-Test grid</strong> mode, as many &quot;X&quot; shapes as possible are fit, evenly spaced, within
        the specified X and Y extent.
      </p>
    </>
  ),

  dense_segments: (
    <>
      <p>
        To test parsing and communication speed, this generates line segments drawn using a large number of very short
        G1 segments end-to-end in the same direction.
      </p>
      <p>
        Multiple subdivision lengths are tested, each offset by 1 mm in the Y direction. The Y Extent determines the
        number of subdivision lengths tested. The G-code also contains comments showing the subdivision lengths before
        each line is drawn.
      </p>
      <p>
        The <strong>Save bandwidth</strong> option generates the same toolpath but omits redundant Z, Y, or F values to
        test the influence of bandwidth on processing speed.
      </p>
      <div className="aspect-video w-full max-w-lg">
        <iframe
          className="w-full h-full rounded-md"
          src="https://www.youtube.com/embed/FYIWPjkD5JY"
          title="Dense Segments demo"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </>
  ),

  accel: (
    <>
      <p>
        Generates G-code to test acceleration. Assumes junction deviation is being used, in which case &quot;jerk&quot;
        should not be in effect. The generated G-code issues <code>M501</code> at the beginning and end to avoid leaving
        the machine in a modified acceleration state.
      </p>
      <div className="aspect-video w-full max-w-lg">
        <iframe
          className="w-full h-full rounded-md"
          src="https://www.youtube.com/embed/RIHGWwliisE"
          title="Acceleration Test demo"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <p>The basic idea (for X acceleration):</p>
      <ol className="list-decimal pl-5 space-y-1">
        <li>Draw a short segment in the positive Y direction</li>
        <li>
          Set high acceleration using <code>M204</code> and <code>M201</code>
        </li>
        <li>Move slowly ramping up speed in +X, then change direction suddenly to −X and gradually slow to a stop</li>
        <li>Reset acceleration back to default</li>
        <li>Draw a short segment directly above the line from step 1</li>
        <li>Move over in +X and repeat</li>
      </ol>
    </>
  ),

  text: (
    <>
      <p>Generates toolpaths from text using a fixed-width font, potentially useful for ASCII art and labelling.</p>
      <p className="text-destructive font-medium">
        This requires firmware support for G5 (Bezier splines). This is not enabled by default in MPCNC firmware, but it
        is fairly straightforward to enable.
      </p>
      <p>
        The text is stretched to fill a rectangle defined by X Extent and Y Extent. Check the G-code comments for the X
        pitch, Y pitch, and aspect ratio to verify the output will be the size and proportion you want.
      </p>
    </>
  ),

  surfacing: (
    <>
      <p>
        Generates strokes at a given depth traveling in only one direction. If the router is not quite perpendicular,
        one side will cut slightly deeper — this is amplified for large-diameter bits.
      </p>
      <p>
        The cutting strategy lifts the bit between cuts to ensure only radial (not axial) cutting. The cutting direction
        must be N, S, E, or W (+Y, −Y, +X, −X respectively). As an added feature, toolpath segments are kept relatively
        short to allow dynamic feedrate adjustment via OctoPrint or LCD.
      </p>
      <p className="text-destructive font-medium">
        Recommended feedrates for surfacing are much slower than for drawing and must be chosen manually — the defaults
        are unlikely to work well.
      </p>
      <p>
        The <strong>perimeter</strong> option is for endgrain cutting boards or other tearout-prone situations. The tool
        traces the perimeter clockwise (twice) before surfacing, ensuring the perimeter is cut into the workpiece rather
        than out of it.
      </p>
      <div className="aspect-video w-full max-w-lg">
        <iframe
          className="w-full h-full rounded-md"
          src="https://www.youtube.com/embed/WHqcnfb_Bm0"
          title="Surfacing demo"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </>
  ),

  hog: (
    <>
      <p>
        Intended to answer: for a given material and tool/stepover/depth combination, how does feedrate affect accuracy
        (deflection), and how high a feedrate is possible? Knowing the behavior at high speeds allows a more informed
        choice of speeds without wasting material.
      </p>
      <p>
        The test first prepares a &quot;top-hat&quot; shape at low speed (slotting cut + finishing pass), then cuts
        through it at progressively higher speeds. Deflection due to cutting load can be measured directly. Higher
        speeds produce higher loads and higher deflection.
      </p>
      <p className="font-medium">Recommended starting values for wood with 1/8&quot; bit:</p>
      <ul className="list-disc pl-5 space-y-0.5 font-mono text-xs">
        <li>Z height of cut: −6 mm</li>
        <li>Z clearance: 0.5 mm</li>
        <li>Rapid feedrate: 2000 mm/min</li>
        <li>Raise/lower feedrate: 180 mm/min</li>
        <li>Cutting feedrate: 600 mm/min</li>
        <li>Slotting feedrate (slow): 300 mm/min</li>
        <li>Stepover: 1.5 mm</li>
      </ul>
      <div className="aspect-video w-full max-w-lg">
        <iframe
          className="w-full h-full rounded-md"
          src="https://www.youtube.com/embed/_ABgu-GGs90"
          title="Hog-Out demo"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </>
  ),
}

const MODE_TO_DESC: Record<Mode, keyof typeof descriptions> = {
  x: 'ruler',
  y: 'ruler',
  xy: 'ruler',
  perim: 'ruler',
  squareness: 'squareness',
  ztest_corners: 'ztest',
  ztest_grid: 'ztest',
  dense_segments: 'dense_segments',
  accel_x: 'accel',
  accel_y: 'accel',
  text: 'text',
  surfacing: 'surfacing',
  hog: 'hog',
}

const MODE_TITLES: Record<Mode, string> = {
  x: 'Ruler Mode',
  y: 'Ruler Mode',
  xy: 'Ruler Mode',
  perim: 'Ruler Mode',
  squareness: 'Squareness Marks',
  ztest_corners: 'Z-Test Mode',
  ztest_grid: 'Z-Test Mode',
  dense_segments: 'Dense Segments',
  accel_x: 'Acceleration Test',
  accel_y: 'Acceleration Test',
  text: 'Text Generation',
  surfacing: 'Spoil Board Surfacing',
  hog: 'Hog-Out Optimization',
}

interface ModeDescriptionProps {
  mode: Mode
}

export function ModeDescription({ mode }: ModeDescriptionProps) {
  const key = MODE_TO_DESC[mode]
  const content = descriptions[key]

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">{MODE_TITLES[mode]}</CardTitle>
      </CardHeader>
      <CardContent className="prose prose-sm dark:prose-invert max-w-none text-sm text-muted-foreground space-y-3 [&_strong]:text-foreground [&_code]:text-foreground [&_code]:bg-muted [&_code]:px-1 [&_code]:rounded [&_p]:leading-relaxed">
        {content}
      </CardContent>
    </Card>
  )
}
