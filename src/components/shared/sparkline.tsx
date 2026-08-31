export function Sparkline({
  data,
  width = 120,
  height = 36,
  color = "var(--color-accent)",
  targetLine,
}: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  targetLine?: number;
}) {
  const min = Math.min(...data, targetLine ?? Infinity);
  const max = Math.max(...data, targetLine ?? -Infinity);
  const range = max - min || 1;
  const pad = 4;
  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2);
    const y = height - pad - ((v - min) / range) * (height - pad * 2);
    return [x, y] as const;
  });
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const last = points[points.length - 1];

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      {targetLine !== undefined && (
        <line
          x1={pad}
          x2={width - pad}
          y1={height - pad - ((targetLine - min) / range) * (height - pad * 2)}
          y2={height - pad - ((targetLine - min) / range) * (height - pad * 2)}
          stroke="currentColor"
          strokeOpacity={0.15}
          strokeDasharray="2 3"
        />
      )}
      <path d={path} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r={2.5} fill={color} />
    </svg>
  );
}
