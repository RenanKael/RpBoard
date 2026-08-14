import Svg, { Defs, Pattern, Circle, Rect } from 'react-native-svg';

const SPACING = 24;
// Kept deliberately small: a large SVG canvas (the previous 6000 bound,
// 12000x12000 total) is a known crash/OOM risk for react-native-svg's
// pattern rasterization on Android. This is purely decorative, so a
// modest bound (the grid just stops rendering past it while panning) is
// the right trade-off over stability.
const BOUND = 2000;

// A bounded approximation of the web version's infinite CSS dot grid: one
// filled rect using a small repeating dot pattern (native-rendered, so the
// bound size doesn't cost per-dot overhead), positioned so it pans/scales
// for free as part of the same transformed "world" view as the notes.
export default function GridBackground() {
  return (
    <Svg
      width={BOUND * 2}
      height={BOUND * 2}
      style={{ position: 'absolute', left: -BOUND, top: -BOUND }}
    >
      <Defs>
        <Pattern id="grid-dots" patternUnits="userSpaceOnUse" width={SPACING} height={SPACING}>
          <Circle cx={SPACING / 2} cy={SPACING / 2} r={1.2} fill="#d7d7dc" />
        </Pattern>
      </Defs>
      <Rect x={0} y={0} width={BOUND * 2} height={BOUND * 2} fill="url(#grid-dots)" />
    </Svg>
  );
}
