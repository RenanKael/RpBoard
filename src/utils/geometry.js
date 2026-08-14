// Point where the line from (cx,cy) towards (tx,ty) crosses the border of
// the axis-aligned rectangle centered at (cx,cy) with the given half-size.
export function rectBorderPoint(cx, cy, tx, ty, halfW, halfH) {
  'worklet';
  const dx = tx - cx;
  const dy = ty - cy;
  if (dx === 0 && dy === 0) return { x: cx, y: cy };
  const scale = 1 / Math.max(Math.abs(dx) / halfW, Math.abs(dy) / halfH);
  return { x: cx + dx * scale, y: cy + dy * scale };
}

export function screenToWorld(screenX, screenY, translateX, translateY, scale) {
  'worklet';
  return {
    x: (screenX - translateX) / scale,
    y: (screenY - translateY) / scale,
  };
}
