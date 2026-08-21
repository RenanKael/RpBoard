import { View, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { HANDLE_SIZE } from '../constants';

// The small "+" a user presses and drags from a note to draw a connection
// to another note. Lives on the UI thread for the whole drag (updates the
// shared screen-space coordinates ConnectOverlay reads) and only crosses
// back into JS once, on release, to hit-test and possibly create the link.
export default function ConnectHandle({
  sourceType,
  sourceId,
  canvasGesture,
  translateX,
  translateY,
  boardPageX,
  boardPageY,
  scale,
  connectActive,
  connectStartScreenX,
  connectStartScreenY,
  connectCurrentScreenX,
  connectCurrentScreenY,
  onRelease,
  onCreate,
  style,
  theme,
}) {
  // `absoluteX/Y` are window-relative (this handle is nested deep inside
  // the transformed world, so local view coordinates would be useless
  // here). Subtracting the Board viewport's own on-screen offset converts
  // them into the same Board-local space translateX/translateY live in —
  // otherwise everything ends up shifted by the sidebar's width.
  const pan = Gesture.Pan()
    .blocksExternalGesture(canvasGesture)
    .onBegin((e) => {
      connectActive.value = true;
      const localX = e.absoluteX - boardPageX.value;
      const localY = e.absoluteY - boardPageY.value;
      connectStartScreenX.value = localX;
      connectStartScreenY.value = localY;
      connectCurrentScreenX.value = localX;
      connectCurrentScreenY.value = localY;
    })
    .onUpdate((e) => {
      connectCurrentScreenX.value = e.absoluteX - boardPageX.value;
      connectCurrentScreenY.value = e.absoluteY - boardPageY.value;
    })
    .onEnd((e) => {
      const localX = e.absoluteX - boardPageX.value;
      const localY = e.absoluteY - boardPageY.value;
      const worldX = (localX - translateX.value) / scale.value;
      const worldY = (localY - translateY.value) / scale.value;
      runOnJS(onRelease)({ type: sourceType, id: sourceId }, worldX, worldY);
    })
    .onFinalize(() => {
      connectActive.value = false;
    });

  // A plain tap (no movement) on the "+" creates a new block instead of
  // starting a connection drag — Exclusive picks whichever gesture actually
  // recognizes, so a real drag still goes to `pan` untouched.
  const tap = Gesture.Tap()
    .blocksExternalGesture(canvasGesture)
    .onEnd(() => {
      runOnJS(onCreate)({ type: sourceType, id: sourceId });
    });

  const handleGesture = Gesture.Exclusive(tap, pan);

  return (
    <GestureDetector gesture={handleGesture}>
      <View style={[styles.handle, style, { backgroundColor: theme.activeText }]} hitSlop={8}>
        <View style={styles.barHorizontal} />
        <View style={styles.barVertical} />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  handle: {
    position: 'absolute',
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    borderRadius: HANDLE_SIZE / 2,
    backgroundColor: '#6c63ff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  barHorizontal: {
    position: 'absolute',
    width: 14,
    height: 2.5,
    backgroundColor: '#fff',
    borderRadius: 1.5,
  },
  barVertical: {
    position: 'absolute',
    width: 2.5,
    height: 14,
    backgroundColor: '#fff',
    borderRadius: 1.5,
  },
});
