import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import ConnectHandle from './ConnectHandle';
import { NOTE_WIDTH, NOTE_COLORS, DEFAULT_NOTE_HEIGHT, HANDLE_SIZE } from '../constants';

function IconMove({ color, size = 13 }) {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 3v18M3 12h18" />
      <Path d="M12 3l-3 3M12 3l3 3M12 21l-3-3M12 21l3-3M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3" />
    </Svg>
  );
}

// `above` is only meaningful for event notes (tied to the timeline):
// true = note sits above the line, false = below, undefined = a free
// note with no timeline relationship at all.
export default function StickyNote({
  type,
  id,
  x,
  y,
  text,
  color,
  selected,
  above,
  canvasGesture,
  scaleShared,
  translateXShared,
  translateYShared,
  boardPageXShared,
  boardPageYShared,
  connectActive,
  connectStartScreenX,
  connectStartScreenY,
  connectCurrentScreenX,
  connectCurrentScreenY,
  onSelect,
  onDragStart,
  onMove,
  onTextCommit,
  onColorChange,
  onDelete,
  onConnectRelease,
  onCreateBlock,
  onMeasure,
  theme,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(text);
  const [height, setHeight] = useState(DEFAULT_NOTE_HEIGHT);

  useEffect(() => {
    setDraft(text);
  }, [text]);

  const dragStartX = useSharedValue(x);
  const dragStartY = useSharedValue(y);

  // Only the already-selected block hijacks the drag from the canvas —
  // dragging over an unselected block (or anywhere else) pans the canvas
  // instead. Tap-to-select first, then drag to move.
  const notePan = Gesture.Pan()
    .enabled(selected)
    .minDistance(4)
    .blocksExternalGesture(canvasGesture)
    .onStart(() => {
      dragStartX.value = x;
      dragStartY.value = y;
      runOnJS(onDragStart)();
    })
    .onUpdate((e) => {
      const dx = e.translationX / scaleShared.value;
      const dy = e.translationY / scaleShared.value;
      runOnJS(onMove)(dragStartX.value + dx, dragStartY.value + dy);
    });

  // The corner move button always drags the block, selected or not — it's
  // a dedicated grab handle, unlike the card body which only drags once
  // the block is already selected (see notePan above).
  const moveHandlePan = Gesture.Pan()
    .hitSlop(14)
    .blocksExternalGesture(canvasGesture)
    .onBegin(() => {
      runOnJS(onSelect)();
    })
    .onStart(() => {
      dragStartX.value = x;
      dragStartY.value = y;
      runOnJS(onDragStart)();
    })
    .onUpdate((e) => {
      const dx = e.translationX / scaleShared.value;
      const dy = e.translationY / scaleShared.value;
      runOnJS(onMove)(dragStartX.value + dx, dragStartY.value + dy);
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(280)
    .blocksExternalGesture(canvasGesture)
    .onEnd(() => {
      runOnJS(setEditing)(true);
    });

  const singleTap = Gesture.Tap()
    .blocksExternalGesture(canvasGesture)
    .onEnd(() => {
      runOnJS(onSelect)();
    });

  const noteGesture = Gesture.Exclusive(doubleTap, singleTap, notePan);

  // Wraps the toolbar's native buttons so the canvas pan/tap waits for
  // them — otherwise tapping a swatch or delete could also pan or
  // deselect through to the board underneath.
  const toolbarGesture = Gesture.Native().blocksExternalGesture(canvasGesture);

  function commit() {
    setEditing(false);
    if (draft !== text) onTextCommit(draft);
  }

  const handleStyle =
    above === true
      ? { top: -42 - HANDLE_SIZE - 8, left: NOTE_WIDTH / 2 - HANDLE_SIZE / 2 }
      : above === false
        ? { top: height + 8, left: NOTE_WIDTH / 2 - HANDLE_SIZE / 2 }
        : { right: -HANDLE_SIZE / 2, bottom: -HANDLE_SIZE / 2 };

  return (
    <View
      style={[styles.note, { left: x, top: y, backgroundColor: color }, selected && styles.selected]}
      onLayout={(e) => {
        const h = e.nativeEvent.layout.height;
        setHeight(h);
        onMeasure?.(h);
      }}
    >
      <GestureDetector gesture={noteGesture}>
        <View style={styles.dragSurface}>
          {editing ? (
            <TextInput
              autoFocus
              multiline
              style={[styles.input, { color: theme.text }]}
              value={draft}
              onChangeText={setDraft}
              onBlur={commit}
            />
          ) : (
            <Text style={styles.text}>{text}</Text>
          )}
        </View>
      </GestureDetector>

      <GestureDetector gesture={moveHandlePan}>
        <View style={[styles.moveHandle, { backgroundColor: theme.surface, borderColor: theme.border }]} hitSlop={14}>
          <IconMove color={theme.icon} />
        </View>
      </GestureDetector>

      {selected && !editing && (
        <GestureDetector gesture={toolbarGesture}>
          <View style={[styles.toolbar, { backgroundColor: theme.surface }]}>
            {NOTE_COLORS.map((c) => (
              <Pressable key={c} style={[styles.swatch, { backgroundColor: c }]} onPress={() => onColorChange(c)} />
            ))}
            <Pressable style={styles.deleteBtn} onPress={onDelete} accessibilityLabel="Excluir nota">
              <Text style={[styles.deleteText, { color: theme.icon }]}>✕</Text>
            </Pressable>
          </View>
        </GestureDetector>
      )}

      <ConnectHandle
        sourceType={type}
        sourceId={id}
        canvasGesture={canvasGesture}
        translateX={translateXShared}
        translateY={translateYShared}
        boardPageX={boardPageXShared}
        boardPageY={boardPageYShared}
        scale={scaleShared}
        connectActive={connectActive}
        connectStartScreenX={connectStartScreenX}
        connectStartScreenY={connectStartScreenY}
        connectCurrentScreenX={connectCurrentScreenX}
        connectCurrentScreenY={connectCurrentScreenY}
        onRelease={onConnectRelease}
        onCreate={onCreateBlock}
        style={handleStyle}
        theme={theme}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  note: {
    position: 'absolute',
    minHeight: 90,
    width: NOTE_WIDTH,
    borderRadius: 4,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  selected: {
    borderWidth: 2,
    borderColor: '#4262ff',
  },
  dragSurface: {
    minHeight: 60,
  },
  moveHandle: {
    position: 'absolute',
    top: -12,
    right: -12,
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: '#26262b',
  },
  input: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: '#26262b',
    minHeight: 60,
    padding: 0,
  },
  toolbar: {
    position: 'absolute',
    top: -42,
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 5,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  swatch: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.15)',
  },
  deleteBtn: {
    width: 22,
    height: 22,
    borderRadius: 5,
    marginLeft: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    fontSize: 12,
    color: '#6b6375',
  },
});
