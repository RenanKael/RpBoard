import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue } from 'react-native-reanimated';
import ConnectHandle from './ConnectHandle';
import { NOTE_WIDTH, NOTE_COLORS, DEFAULT_NOTE_HEIGHT, HANDLE_SIZE } from '../constants';

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

  const notePan = Gesture.Pan()
    .minDistance(4)
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

      {selected && !editing && (
        <View style={[styles.toolbar, { backgroundColor: theme.surface }]}>
          {NOTE_COLORS.map((c) => (
            <Pressable key={c} style={[styles.swatch, { backgroundColor: c }]} onPress={() => onColorChange(c)} />
          ))}
          <Pressable style={styles.deleteBtn} onPress={onDelete} accessibilityLabel="Excluir nota">
            <Text style={[styles.deleteText, { color: theme.icon }]}>✕</Text>
          </Pressable>
        </View>
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
