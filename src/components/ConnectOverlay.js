import { StyleSheet } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import Animated, { useAnimatedProps } from 'react-native-reanimated';

const AnimatedLine = Animated.createAnimatedComponent(Line);

// The live line drawn while dragging from a note's "+" handle. Rendered in
// plain screen space (a sibling of the pannable/zoomable world, not inside
// it) and driven entirely by shared values so it tracks the finger at full
// frame rate with no React re-renders.
export default function ConnectOverlay({
  connectActive,
  connectStartScreenX,
  connectStartScreenY,
  connectCurrentScreenX,
  connectCurrentScreenY,
}) {
  const animatedProps = useAnimatedProps(() => ({
    x1: connectStartScreenX.value,
    y1: connectStartScreenY.value,
    x2: connectCurrentScreenX.value,
    y2: connectCurrentScreenY.value,
    opacity: connectActive.value ? 1 : 0,
  }));

  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <AnimatedLine animatedProps={animatedProps} stroke="#6c63ff" strokeWidth={2.5} strokeDasharray="7 4" strokeLinecap="round" />
    </Svg>
  );
}
