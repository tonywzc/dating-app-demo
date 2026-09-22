/** iOS activity indicator. */
export function Spinner({ color = "#fff", size = 22 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="animate-[spin_0.9s_steps(8)_infinite]">
      {Array.from({ length: 8 }, (_, i) => (
        <rect
          key={i}
          x="11"
          y="2"
          width="2.4"
          height="6"
          rx="1.2"
          fill={color}
          opacity={0.25 + (i / 8) * 0.75}
          transform={`rotate(${i * 45} 12 12)`}
        />
      ))}
    </svg>
  );
}
