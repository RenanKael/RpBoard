import { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import StickyNote from './StickyNote';
import EventItem from './EventItem';
import ConnectionsLayer from './ConnectionsLayer';
import ConnectOverlay from './ConnectOverlay';
import ZoomControl from './ZoomControl';
import { NOTE_WIDTH, DEFAULT_NOTE_HEIGHT, MIN_SCALE, MAX_SCALE } from '../constants';

export default function Board({
  content,
  tool,
  setTool,
  selected,
  onSelect,
  onAddFreeNote,
  onAddEvent,
  onMoveFreeNote,
  onMoveEventMarker,
  onMoveEventNote,
  onSnapshot,
  onUpdateFreeNoteText,
  onUpdateFreeNoteColor,
  onDeleteFreeNote,
  onUpdateEventText,
  onUpdateEventDateLabel,
  onUpdateEventNoteColor,
  onUpdateEventMarkerStyle,
  onDeleteEvent,
  onAddConnection,
  onDeleteConnection,
  onCreateBlock,
  translations,
  theme,
}) {
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [blockHeights, setBlockHeights] = useState({});
  const viewedOnce = useRef(false);
  const { width } = useWindowDimensions();
  const compact = width < 360;

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const startTX = useSharedValue(0);
  const startTY = useSharedValue(0);
  const startScale = useSharedValue(1);
  // The Board viewport's own on-screen offset (e.g. past the sidebar).
  // ConnectHandle's gesture is attached to a view nested deep inside the
  // transformed world, so it can only report window-absolute coordinates;
  // this lets it convert those back into the same Board-local space
  // translateX/translateY live in.
  const boardPageX = useSharedValue(0);
  const boardPageY = useSharedValue(0);

  const connectActive = useSharedValue(false);
  const connectStartScreenX = useSharedValue(0);
  const connectStartScreenY = useSharedValue(0);
  const connectCurrentScreenX = useSharedValue(0);
  const connectCurrentScreenY = useSharedValue(0);

  function centerView(width, height) {
    translateX.value = width / 2;
    translateY.value = height * 0.4;
  }

  function resetView() {
    scale.value = 1;
    centerView(viewportSize.width, viewportSize.height);
  }

  function measureBlock(type, id, height) {
    const key = `${type}:${id}`;
    setBlockHeights((prev) => (prev[key] === height ? prev : { ...prev, [key]: height }));
  }

  function getBlockRect(ref) {
    if (ref.type === 'freeNote') {
      const n = content.freeNotes.find((x) => x.id === ref.id);
      if (!n) return null;
      return { x: n.x, y: n.y, height: blockHeights[`freeNote:${n.id}`] ?? DEFAULT_NOTE_HEIGHT };
    }
    const ev = content.events.find((x) => x.id === ref.id);
    if (!ev) return null;
    return { x: ev.note.x, y: ev.note.y, height: blockHeights[`event:${ev.id}`] ?? DEFAULT_NOTE_HEIGHT };
  }

  function findBlockAt(worldX, worldY) {
    for (const n of content.freeNotes) {
      const h = blockHeights[`freeNote:${n.id}`] ?? DEFAULT_NOTE_HEIGHT;
      if (worldX >= n.x && worldX <= n.x + NOTE_WIDTH && worldY >= n.y && worldY <= n.y + h) {
        return { type: 'freeNote', id: n.id };
      }
    }
    for (const ev of content.events) {
      const h = blockHeights[`event:${ev.id}`] ?? DEFAULT_NOTE_HEIGHT;
      const n = ev.note;
      if (worldX >= n.x && worldX <= n.x + NOTE_WIDTH && worldY >= n.y && worldY <= n.y + h) {
        return { type: 'event', id: ev.id };
      }
    }
    return null;
  }

  function handleConnectRelease(source, worldX, worldY) {
    const hit = findBlockAt(worldX, worldY);
    if (!hit) return;
    if (hit.type === source.type && hit.id === source.id) return;
    onAddConnection(source, hit);
  }

  const handleBackgroundTap = useCallback(
    (screenX, screenY) => {
      if (tool === 'note' || tool === 'event') {
        const worldX = (screenX - translateX.value) / scale.value;
        const worldY = (screenY - translateY.value) / scale.value;
        if (tool === 'note') onAddFreeNote({ x: worldX, y: worldY });
        else onAddEvent({ x: worldX, y: worldY });
        setTool('select');
      } else {
        onSelect(null);
      }
    },
    [tool, onAddFreeNote, onAddEvent, onSelect, setTool, translateX, translateY, scale]
  );

  // Memoized so its identity survives re-renders (Board re-renders on every
  // drag frame). Every block's `blocksExternalGesture(canvasGesture)` needs
  // to keep pointing at the *same* gesture instance for that priority
  // relation to hold reliably mid-drag — recreating canvasGesture each
  // render was making that relation flaky exactly when a block was moving.
  //
  // Pan/pinch are also fully disabled while a block is selected — with a
  // block selected the only thing a drag should ever do is move it, never
  // the camera. Tapping empty space (which clears selection) is handled by
  // backgroundTap below, which stays enabled so you can get back to panning.
  const canvasPan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(!selected)
        .minPointers(1)
        .maxPointers(1)
        .minDistance(4)
        .onStart(() => {
          startTX.value = translateX.value;
          startTY.value = translateY.value;
        })
        .onUpdate((e) => {
          translateX.value = startTX.value + e.translationX;
          translateY.value = startTY.value + e.translationY;
        }),
    [selected]
  );

  const canvasPinch = useMemo(
    () =>
      Gesture.Pinch()
        .enabled(!selected)
        .onStart(() => {
          startScale.value = scale.value;
        })
        .onUpdate((e) => {
          const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, startScale.value * e.scale));
          const worldX = (e.focalX - translateX.value) / scale.value;
          const worldY = (e.focalY - translateY.value) / scale.value;
          translateX.value = e.focalX - worldX * newScale;
          translateY.value = e.focalY - worldY * newScale;
          scale.value = newScale;
        }),
    [selected]
  );

  const backgroundTap = useMemo(
    () =>
      Gesture.Tap().onEnd((e) => {
        // `x`/`y` (not `absoluteX`/`absoluteY`) since this gesture is attached
        // directly to the Board viewport itself — already in the same
        // Board-local coordinate space as translateX/translateY.
        runOnJS(handleBackgroundTap)(e.x, e.y);
      }),
    [handleBackgroundTap]
  );

  const canvasGesture = useMemo(
    () => Gesture.Race(backgroundTap, Gesture.Simultaneous(canvasPan, canvasPinch)),
    [backgroundTap, canvasPan, canvasPinch]
  );

  const worldStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { scale: scale.value }],
  }));

  const isEmpty = content.freeNotes.length === 0 && content.events.length === 0;

  return (
    <GestureDetector gesture={canvasGesture}>
      <View
        style={[styles.viewport, { backgroundColor: theme.appBackground }]}
        onLayout={(e) => {
          const { x, y, width, height } = e.nativeEvent.layout;
          boardPageX.value = x;
          boardPageY.value = y;
          setViewportSize({ width, height });
          if (!viewedOnce.current) {
            viewedOnce.current = true;
            centerView(width, height);
          }
        }}
      >
        <Animated.View style={[styles.world, { transformOrigin: [0, 0, 0] }, worldStyle]}>
          <View style={styles.timelineLine} />

          <ConnectionsLayer
            events={content.events}
            connections={content.connections}
            blockHeights={blockHeights}
            getBlockRect={getBlockRect}
            selectedConnectionId={selected?.type === 'connection' ? selected.id : null}
            onSelectConnection={(id) => onSelect({ type: 'connection', id })}
            onDeleteConnection={onDeleteConnection}
          />

          {content.events.map((ev) => (
            <EventItem
              key={ev.id}
              event={ev}
              selected={selected?.type === 'event' && selected.id === ev.id}
              canvasGesture={canvasGesture}
              scaleShared={scale}
              translateXShared={translateX}
              translateYShared={translateY}
              boardPageXShared={boardPageX}
              boardPageYShared={boardPageY}
              connectActive={connectActive}
              connectStartScreenX={connectStartScreenX}
              connectStartScreenY={connectStartScreenY}
              connectCurrentScreenX={connectCurrentScreenX}
              connectCurrentScreenY={connectCurrentScreenY}
              onSelect={() => onSelect({ type: 'event', id: ev.id })}
              onDragStart={onSnapshot}
              onMoveMarker={(x) => onMoveEventMarker(ev.id, x)}
              onMoveNote={(x, y) => onMoveEventNote(ev.id, x, y)}
              onDateLabelCommit={(text) => onUpdateEventDateLabel(ev.id, text)}
              onTextCommit={(text) => onUpdateEventText(ev.id, text)}
              onColorChange={(color) => onUpdateEventNoteColor(ev.id, color)}
              onMarkerStyleChange={(style) => onUpdateEventMarkerStyle(ev.id, style)}
              onDelete={() => onDeleteEvent(ev.id)}
              onConnectRelease={handleConnectRelease}
              onCreateBlock={onCreateBlock}
              onMeasure={(h) => measureBlock('event', ev.id, h)}
              theme={theme}
            />
          ))}

          {content.freeNotes.map((note) => (
            <StickyNote
              key={note.id}
              type="freeNote"
              id={note.id}
              x={note.x}
              y={note.y}
              text={note.text}
              color={note.color}
              selected={selected?.type === 'freeNote' && selected.id === note.id}
              canvasGesture={canvasGesture}
              scaleShared={scale}
              translateXShared={translateX}
              translateYShared={translateY}
              boardPageXShared={boardPageX}
              boardPageYShared={boardPageY}
              connectActive={connectActive}
              connectStartScreenX={connectStartScreenX}
              connectStartScreenY={connectStartScreenY}
              connectCurrentScreenX={connectCurrentScreenX}
              connectCurrentScreenY={connectCurrentScreenY}
              onSelect={() => onSelect({ type: 'freeNote', id: note.id })}
              onDragStart={onSnapshot}
              onMove={(x, y) => onMoveFreeNote(note.id, x, y)}
              onTextCommit={(text) => onUpdateFreeNoteText(note.id, text)}
              onColorChange={(color) => onUpdateFreeNoteColor(note.id, color)}
              onDelete={() => onDeleteFreeNote(note.id)}
              onConnectRelease={handleConnectRelease}
              onCreateBlock={onCreateBlock}
              onMeasure={(h) => measureBlock('freeNote', note.id, h)}
              theme={theme}
            />
          ))}
        </Animated.View>

        <ConnectOverlay
          connectActive={connectActive}
          connectStartScreenX={connectStartScreenX}
          connectStartScreenY={connectStartScreenY}
          connectCurrentScreenX={connectCurrentScreenX}
          connectCurrentScreenY={connectCurrentScreenY}
        />

        {isEmpty && (
          <View style={styles.emptyHint} pointerEvents="none">
            <Text style={[styles.emptyHintText, { color: theme.hint }, compact && styles.emptyHintTextCompact]}>
              {translations.boardHint}
            </Text>
          </View>
        )}

        <ZoomControl
          translateX={translateX}
          translateY={translateY}
          scale={scale}
          viewportSize={viewportSize}
          onResetView={resetView}
          canvasGesture={canvasGesture}
          theme={theme}
        />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  viewport: {
    flex: 1,
    overflow: 'hidden',
  },
  world: {
    // Deliberately sized to fill the viewport (not 0x0, which the original
    // web CSS used as a zero-footprint transform-origin anchor) — on
    // Android specifically, a zero-sized parent can fail to render or hit-
    // test absolutely-positioned children that extend beyond it. `viewport`
    // still clips the actual visible area via `overflow: hidden`, so giving
    // `world` a real size here doesn't change what's visible.
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  timelineLine: {
    position: 'absolute',
    left: -100000,
    top: -1,
    width: 200000,
    height: 2,
    backgroundColor: '#b0b3ba',
  },
  emptyHint: {
    position: 'absolute',
    top: '50%',
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  emptyHintText: {
    color: '#9a9aa2',
    fontSize: 15,
    textAlign: 'center',
  },
  emptyHintTextCompact: {
    fontSize: 13,
  },
});
