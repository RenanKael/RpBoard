import Svg, { Path, Circle, Rect } from 'react-native-svg';

export default function MarkerShape({ shape, color, size = 18 }) {
  switch (shape) {
    case 'star':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path
            d="M12 2.5l2.9 6.1 6.6.6-5 4.5 1.5 6.5-6-3.6-6 3.6 1.5-6.5-5-4.5 6.6-.6z"
            fill={color}
          />
        </Svg>
      );
    case 'circle':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx="12" cy="12" r="9.5" fill={color} />
        </Svg>
      );
    case 'square':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect x="3.5" y="3.5" width="17" height="17" rx="3" fill={color} />
        </Svg>
      );
    case 'diamond':
    default:
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect x="5" y="5" width="14" height="14" rx="2" fill={color} transform="rotate(45 12 12)" />
        </Svg>
      );
  }
}
