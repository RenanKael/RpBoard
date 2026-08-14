import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue } from 'react-native-reanimated';
import StickyNote from './StickyNote';
import MarkerShape from './MarkerShape';
import { MARKER_SHAPES, MARKER_COLORS } from '../constants';

export default function EventItem({
  event,
  selected,
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
  onMoveMarker,
  onMoveNote,
  onDateLabelCommit,
  onTextCommit,
  onColorChange,
  onMarkerStyleChange,
  onDelete,
  onConnectRelease,
  onMeasure,
}) {
  const [editingDate, setEditingDate] = useState(false);
  const [dateDraft, setDateDraft] = useState(event.dateLabel);

  useEffect(() => {
    setDateDraft(event.dateLabel);
  }, [event.dateLabel]);

  const dragStartX = useSharedValue(event.markerX);

  const markerPan = Gesture.Pan()
    .minDistance(4)
    .blocksExternalGesture(canvasGesture)
    .onBegin(() => {
      runOnJS(onSelect)();
    })
    .onStart(() => {
      dragStartX.value = event.markerX;
      runOnJS(onDragStart)();
    })
    .onUpdate((e) => {
      const dx = e.translationX / scaleShared.value;
      runOnJS(onMoveMarker)(dragStartX.value + dx);
    });

  const dateDoubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(280)
    .onEnd(() => {
      runOnJS(setEditingDate)(true);
    });

  const markerGesture = Gesture.Race(dateDoubleTap, markerPan);

  function commitDate() {
    setEditingDate(false);
    if (dateDraft !== event.dateLabel) onDateLabelCommit(dateDraft);
  }

  const above = event.note.y < 0;

  return (
    <>
      <GestureDetector gesture={markerGesture}>
        <View style={[styles.marker, { left: event.markerX }, selected && styles.markerSelected]}>
          <MarkerShape shape={event.shape} color={event.color} />
          {editingDate ? (
            <TextInput autoFocus style={styles.dateInput} value={dateDraft} onChangeText={setDateDraft} onBlur={commitDate} />
          ) : (
            <Text style={styles.dateLabel}>{event.dateLabel}</Text>
          )}

          {selected && !editingDate && (
            <View style={styles.markerToolbar}>
              {MARKER_SHAPES.map((shape) => (
                <Pressable
                  key={shape}
                  style={[styles.shapeBtn, event.shape === shape && styles.shapeBtnActive]}
                  onPress={() => onMarkerStyleChange({ shape, color: event.color })}
                >
                  <MarkerShape shape={shape} color={event.color} size={14} />
                </Pressable>
              ))}
              <View style={styles.toolbarDivider} />
              {MARKER_COLORS.map((c) => (
                <Pressable
                  key={c}
                  style={[styles.swatch, { backgroundColor: c }]}
                  onPress={() => onMarkerStyleChange({ shape: event.shape, color: c })}
                />
              ))}
            </View>
          )}
        </View>
      </GestureDetector>

      <StickyNote
        type="event"
        id={event.id}
        x={event.note.x}
        y={event.note.y}
        text={event.note.text}
        color={event.note.color}
        selected={selected}
        above={above}
        canvasGesture={canvasGesture}
        scaleShared={scaleShared}
        translateXShared={translateXShared}
        translateYShared={translateYShared}
        boardPageXShared={boardPageXShared}
        boardPageYShared={boardPageYShared}
        connectActive={connectActive}
        connectStartScreenX={connectStartScreenX}
        connectStartScreenY={connectStartScreenY}
        connectCurrentScreenX={connectCurrentScreenX}
        connectCurrentScreenY={connectCurrentScreenY}
        onSelect={onSelect}
        onDragStart={onDragStart}
        onMove={onMoveNote}
        onTextCommit={onTextCommit}
        onColorChange={onColorChange}
        onDelete={onDelete}
        onConnectRelease={onConnectRelease}
        onMeasure={onMeasure}
      />
    </>
  );
}

const styles = StyleSheet.create({
  marker: {
    position: 'absolute',
    top: 0,
    alignItems: 'center',
    transform: [{ translateX: -9 }, { translateY: -9 }],
    paddingHorizontal: 4,
  },
  markerSelected: {
    borderRadius: 4,
  },
  dateLabel: {
    marginTop: 2,
    fontSize: 11,
    color: '#45464c',
    width: 70,
    textAlign: 'center',
  },
  dateInput: {
    marginTop: 2,
    fontSize: 11,
    color: '#45464c',
    width: 70,
    textAlign: 'center',
    padding: 0,
  },
  markerToolbar: {
    position: 'absolute',
    top: -42,
    left: -10,
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
  shapeBtn: {
    width: 22,
    height: 22,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shapeBtnActive: {
    backgroundColor: '#ebefff',
  },
  toolbarDivider: {
    width: 1,
    height: 18,
    backgroundColor: '#e5e4e7',
    marginHorizontal: 2,
  },
  swatch: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.15)',
  },
});
