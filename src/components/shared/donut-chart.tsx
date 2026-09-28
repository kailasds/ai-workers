import { useEffect, useState } from "react";

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

export function DonutChart({
  data,
  size = 128,
  thickness = 16,
  centerValue,
  centerLabel,
}: {
  data: DonutSegment[];
  size?: number;
  thickness?: number;
  centerValue?: React.ReactNode;
  centerLabel?: string;
}) {
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const cumulative = data.reduce<number[]>((acc, _d, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + data[i - 1].value / total);
    return acc;
  }, []);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-card-sunken)" strokeWidth={thickness} />
        {data.map((d, i) => {
          const frac = d.value / total;
          const dash = grown ? Math.max(frac * c - 2, 0) : 0;
          const gapStart = cumulative[i];
          return (
            <circle
              key={d.label}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={d.color}
              strokeWidth={thickness}
              strokeLinecap="round"
              strokeDasharray={`${dash} ${c - dash}`}
              strokeDashoffset={-gapStart * c}
              style={{ transition: `stroke-dasharray 700ms cubic-bezier(.2,.8,.2,1) ${i * 90}ms` }}
            />
          );
        })}
      </svg>
      {(centerValue !== undefined || centerLabel) && (
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            {centerValue !== undefined && (
              <p className="text-[20px] font-bold leading-none tracking-[-0.01em] tabular-nums text-ink font-display">{centerValue}</p>
            )}
            {centerLabel && <p className="mt-1 text-[10px] text-ink-mute">{centerLabel}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export function DonutLegend({ data }: { data: DonutSegment[] }) {
  return (
    <div className="space-y-2">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-2 text-[11.5px]">
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
          <span className="min-w-0 flex-1 truncate text-ink-soft">{d.label}</span>
          <span className="shrink-0 font-semibold tabular-nums text-ink">{d.value}</span>
        </div>
      ))}
    </div>
  );
}
