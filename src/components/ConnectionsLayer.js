import { StyleSheet } from 'react-native';
import Svg, { Line, Circle, G } from 'react-native-svg';
import { NOTE_WIDTH, DEFAULT_NOTE_HEIGHT } from '../constants';
import { rectBorderPoint } from '../utils/geometry';

export default function ConnectionsLayer({
  events,
  connections,
  blockHeights,
  getBlockRect,
  selectedConnectionId,
  onSelectConnection,
  onDeleteConnection,
}) {
  return (
    // Without an explicit viewBox, `overflow: visible` on Android doesn't
    // actually let the SVG draw outside its own declared box — the native
    // canvas is genuinely bounded to it, no matter the style. `world`'s own
    // (0,0) sits right at the timeline, so lines to blocks above it (negative
    // y) were being hard-clipped away. A viewBox spanning well above and
    // below y=0 (matching the same oversized-canvas trick `timelineLine`
    // uses horizontally) fixes that for real, with child coordinates
    // unchanged since the viewBox keeps a 1:1 scale with world space.
    <Svg
      style={styles.svg}
      viewBox="-100000 -4000 200000 8000"
      pointerEvents="box-none"
    >
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
        return <Line key={ev.id} x1={ev.markerX} y1={0} x2={targetX} y2={targetY} stroke="#7c8089" strokeWidth={2} />;
      })}

      {connections.map((conn) => {
        const a = getBlockRect(conn.from);
        const b = getBlockRect(conn.to);
        if (!a || !b) return null;
        const aCenter = { x: a.x + NOTE_WIDTH / 2, y: a.y + a.height / 2 };
        const bCenter = { x: b.x + NOTE_WIDTH / 2, y: b.y + b.height / 2 };
        const p1 = rectBorderPoint(aCenter.x, aCenter.y, bCenter.x, bCenter.y, NOTE_WIDTH / 2, a.height / 2);
        const p2 = rectBorderPoint(bCenter.x, bCenter.y, aCenter.x, aCenter.y, NOTE_WIDTH / 2, b.height / 2);
        const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
        const isSelected = selectedConnectionId === conn.id;
        return (
          <G key={conn.id}>
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
          </G>
        );
      })}
    </Svg>
  );
}

const styles = StyleSheet.create({
  svg: {
    position: 'absolute',
    left: -100000,
    top: -4000,
    width: 200000,
    height: 8000,
  },
});
