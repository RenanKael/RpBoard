import Svg, { Line, Circle, G } from 'react-native-svg';
import { NOTE_WIDTH, DEFAULT_NOTE_HEIGHT } from '../constants';
import { rectBorderPoint } from '../utils/geometry';

// Each line gets its own small Svg sized just to its own bounding box,
// instead of one giant Svg covering the whole pannable world — a single
// Svg spanning the world's full extent (mirroring the oversized-canvas
// trick the plain `timelineLine` View uses) was crashing the app on mount:
// react-native-svg tries to rasterize it, and a canvas that large blows
// past Android's texture/bitmap size limits.
function boundsFor(x1, y1, x2, y2, padding) {
  const left = Math.min(x1, x2) - padding;
  const top = Math.min(y1, y2) - padding;
  const width = Math.abs(x2 - x1) + padding * 2;
  const height = Math.abs(y2 - y1) + padding * 2;
  return { left, top, width, height };
}

// MarkerShape is 18x18 and its container is translated by (-9,-9) to center
// it on the timeline, so the date label (which always sits just below the
// marker, regardless of which side the note itself is on) starts about 9px
// past the timeline. A fallback height covers the first render, before its
// real one lands from onLayout.
const MARKER_HALF = 9;
const DEFAULT_DATE_LABEL_HEIGHT = 15;
const LABEL_GAP_PADDING = 3;

// The label only ever crosses the marker→note line when the note is below
// the timeline too (above, the line heads the opposite way) — this splits
// that line around the label's box instead of running it behind the text.
function belowLineSegments(x1, targetX, targetY, gapTop, gapBottom) {
  const segments = [];
  const topEndY = Math.min(gapTop, targetY);
  if (topEndY > 0) {
    const t = topEndY / targetY;
    segments.push({ x1, y1: 0, x2: x1 + t * (targetX - x1), y2: topEndY });
  }
  if (targetY > gapBottom) {
    const t = gapBottom / targetY;
    segments.push({ x1: x1 + t * (targetX - x1), y1: gapBottom, x2: targetX, y2: targetY });
  }
  if (segments.length === 0) {
    segments.push({ x1, y1: 0, x2: targetX, y2: targetY });
  }
  return segments;
}

export default function ConnectionsLayer({
  events,
  connections,
  blockHeights,
  dateLabelHeights,
  getBlockRect,
  selectedConnectionId,
  onSelectConnection,
  onDeleteConnection,
}) {
  return (
    <>
      {events.map((ev) => {
        const h = blockHeights[`event:${ev.id}`] ?? DEFAULT_NOTE_HEIGHT;
        const above = ev.note.y < 0;
        // Clamped so the line always lands on the correct side of the
        // timeline (never crosses it) and overlaps a few px into the block
        // instead of stopping exactly at its edge — a height measurement
        // that's slightly off would otherwise make the line collapse to
        // nothing or fall just short of visibly touching the block.
        const targetY = above ? Math.min(ev.note.y + h - 4, -1) : Math.max(ev.note.y + 4, 1);
        const targetX = ev.note.x + NOTE_WIDTH / 2;
        const x1 = ev.markerX;
        const b = boundsFor(x1, 0, targetX, targetY, 20);

        const segments = above
          ? [{ x1, y1: 0, x2: targetX, y2: targetY }]
          : belowLineSegments(
              x1,
              targetX,
              targetY,
              MARKER_HALF,
              MARKER_HALF + (dateLabelHeights[ev.id] ?? DEFAULT_DATE_LABEL_HEIGHT) + LABEL_GAP_PADDING
            );

        return (
          <Svg
            key={ev.id}
            pointerEvents="none"
            style={{ position: 'absolute', left: b.left, top: b.top, width: b.width, height: b.height }}
            viewBox={`${b.left} ${b.top} ${b.width} ${b.height}`}
          >
            {segments.map((seg, i) => (
              <Line key={i} x1={seg.x1} y1={seg.y1} x2={seg.x2} y2={seg.y2} stroke="#7c8089" strokeWidth={2} />
            ))}
          </Svg>
        );
      })}

      {connections.map((conn) => {
        const a = getBlockRect(conn.from);
        const bBlock = getBlockRect(conn.to);
        if (!a || !bBlock) return null;
        const aCenter = { x: a.x + NOTE_WIDTH / 2, y: a.y + a.height / 2 };
        const bCenter = { x: bBlock.x + NOTE_WIDTH / 2, y: bBlock.y + bBlock.height / 2 };
        const p1 = rectBorderPoint(aCenter.x, aCenter.y, bCenter.x, bCenter.y, NOTE_WIDTH / 2, a.height / 2);
        const p2 = rectBorderPoint(bCenter.x, bCenter.y, aCenter.x, aCenter.y, NOTE_WIDTH / 2, bBlock.height / 2);
        const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
        const isSelected = selectedConnectionId === conn.id;
        const b = boundsFor(p1.x, p1.y, p2.x, p2.y, 24);
        return (
          <Svg
            key={conn.id}
            pointerEvents="box-none"
            style={{ position: 'absolute', left: b.left, top: b.top, width: b.width, height: b.height }}
            viewBox={`${b.left} ${b.top} ${b.width} ${b.height}`}
          >
            <Line
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke={isSelected ? '#4262ff' : '#6c63ff'}
              strokeWidth={isSelected ? 3 : 2}
              strokeDasharray="7 4"
            />
            <Line
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke="transparent"
              strokeWidth={20}
              onPress={() => onSelectConnection(conn.id)}
            />
            {isSelected && (
              <G onPress={() => onDeleteConnection(conn.id)}>
                <Circle cx={mid.x} cy={mid.y} r={10} fill="#fff" stroke="#e53935" strokeWidth={1.5} />
                <Line x1={mid.x - 4} y1={mid.y - 4} x2={mid.x + 4} y2={mid.y + 4} stroke="#e53935" strokeWidth={1.5} />
                <Line x1={mid.x - 4} y1={mid.y + 4} x2={mid.x + 4} y2={mid.y - 4} stroke="#e53935" strokeWidth={1.5} />
              </G>
            )}
          </Svg>
        );
      })}
    </>
  );
}
