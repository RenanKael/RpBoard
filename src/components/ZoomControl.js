import { useState } from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useAnimatedReaction, runOnJS } from 'react-native-reanimated';
import { MIN_SCALE, MAX_SCALE } from '../constants';

export default function ZoomControl({ translateX, translateY, scale, viewportSize, onResetView, canvasGesture, theme }) {
  const [percent, setPercent] = useState(100);
  const compact = viewportSize.width < 360 || viewportSize.height < 640;

  // Wraps the buttons in the underlying native touch responder so the
  // canvas pan/tap waits for it — otherwise a tap here could also pan or
  // deselect through to the board underneath.
  const controlsGesture = Gesture.Native().blocksExternalGesture(canvasGesture);

  useAnimatedReaction(
    () => Math.round(scale.value * 100),
    (value, prevValue) => {
      if (value !== prevValue) runOnJS(setPercent)(value);
    }
  );

  function zoomBy(factor) {
    const cx = viewportSize.width / 2;
    const cy = viewportSize.height / 2;
    const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale.value * factor));
    const worldX = (cx - translateX.value) / scale.value;
    const worldY = (cy - translateY.value) / scale.value;
    translateX.value = cx - worldX * newScale;
    translateY.value = cy - worldY * newScale;
    scale.value = newScale;
  }

  return (
    <GestureDetector gesture={controlsGesture}>
      <View style={[styles.control, { backgroundColor: theme.controlBackground }, compact && styles.controlCompact]}>
        <Pressable style={[styles.button, compact && styles.buttonCompact]} onPress={() => zoomBy(1 / 1.2)}>
          <Text style={[styles.buttonText, { color: theme.icon }, compact && styles.buttonTextCompact]}>−</Text>
        </Pressable>
        <Pressable style={[styles.resetButton, compact && styles.resetButtonCompact]} onPress={onResetView}>
          <Text style={[styles.resetText, { color: theme.icon }, compact && styles.resetTextCompact]}>{percent}%</Text>
        </Pressable>
        <Pressable style={[styles.button, compact && styles.buttonCompact]} onPress={() => zoomBy(1.2)}>
          <Text style={[styles.buttonText, { color: theme.icon }, compact && styles.buttonTextCompact]}>+</Text>
        </Pressable>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  control: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  controlCompact: {
    right: 10,
    bottom: 10,
  },
  button: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonCompact: {
    width: 32,
    height: 32,
  },
  buttonText: {
    fontSize: 18,
    color: '#45464c',
  },
  buttonTextCompact: {
    fontSize: 16,
  },
  resetButton: {
    paddingHorizontal: 10,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonCompact: {
    height: 32,
    paddingHorizontal: 8,
  },
  resetText: {
    fontSize: 12,
    color: '#45464c',
  },
  resetTextCompact: {
    fontSize: 11,
  },
});
