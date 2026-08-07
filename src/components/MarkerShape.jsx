export default function MarkerShape({ shape, color, size = 18 }) {
  switch (shape) {
    case 'star':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <path
            d="M12 2.5l2.9 6.1 6.6.6-5 4.5 1.5 6.5-6-3.6-6 3.6 1.5-6.5-5-4.5 6.6-.6z"
            fill={color}
          />
        </svg>
      );
    case 'circle':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9.5" fill={color} />
        </svg>
      );
    case 'square':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <rect x="3.5" y="3.5" width="17" height="17" rx="3" fill={color} />
        </svg>
      );
    case 'diamond':
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <rect x="5" y="5" width="14" height="14" rx="2" fill={color} transform="rotate(45 12 12)" />
        </svg>
      );
  }
}
