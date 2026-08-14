import { useState } from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { useAnimatedReaction, runOnJS } from 'react-native-reanimated';
import { MIN_SCALE, MAX_SCALE } from '../constants';

export default function ZoomControl({ translateX, translateY, scale, viewportSize, onResetView }) {
  const [percent, setPercent] = useState(100);

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
    <View style={styles.control}>
      <Pressable style={styles.button} onPress={() => zoomBy(1 / 1.2)}>
        <Text style={styles.buttonText}>−</Text>
      </Pressable>
      <Pressable style={styles.resetButton} onPress={onResetView}>
        <Text style={styles.resetText}>{percent}%</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={() => zoomBy(1.2)}>
        <Text style={styles.buttonText}>+</Text>
      </Pressable>
    </View>
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
  button: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: '#45464c',
  },
  resetButton: {
    paddingHorizontal: 10,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetText: {
    fontSize: 12,
    color: '#45464c',
  },
});
