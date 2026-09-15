import { useEffect, useState } from "react";

export function DeliveryBarChart({
  data,
  width = 640,
  height = 200,
}: {
  data: { date: string; count: number }[];
  width?: number;
  height?: number;
}) {
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const max = Math.max(...data.map((d) => d.count), 1);
  const padX = 10;
  const padTop = 26;
  const padBottom = 22;
  const gap = 10;
  const barW = (width - padX * 2 - gap * (data.length - 1)) / data.length;
  const plotH = height - padTop - padBottom;
  const peakIndex = data.reduce((best, d, i) => (d.count > data[best].count ? i : best), 0);
  const lastIndex = data.length - 1;

  return (
    <div>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <line x1={padX} x2={width - padX} y1={height - padBottom} y2={height - padBottom} stroke="var(--color-border)" strokeWidth={1} />
        {data.map((d, i) => {
          const x = padX + i * (barW + gap);
          const targetH = (d.count / max) * plotH;
          const h = grown ? targetH : 0;
          const y = height - padBottom - h;
          const isPeak = i === peakIndex;
          const isLast = i === lastIndex;
          return (
            <g key={d.date}>
              {isPeak && (
                <text
                  x={x + barW / 2}
                  y={y - 8}
                  textAnchor="middle"
                  className="fill-ink text-[11px] font-semibold tabular-nums"
                  style={{ opacity: grown ? 1 : 0, transition: "opacity 200ms ease 550ms" }}
                >
                  {d.count}
                </text>
              )}
              <rect
                x={x}
                y={y}
                width={barW}
                height={h}
                rx={5}
                fill={isPeak ? "var(--color-accent)" : isLast ? "var(--color-brand-300)" : "var(--color-accent-border)"}
                style={{ transition: `height 650ms cubic-bezier(.2,.8,.2,1) ${i * 45}ms, y 650ms cubic-bezier(.2,.8,.2,1) ${i * 45}ms` }}
              />
              {!isPeak && (
                <text
                  x={x + barW / 2}
                  y={y - 8}
                  textAnchor="middle"
                  className="fill-ink-faint text-[10px] tabular-nums"
                  style={{ opacity: grown ? 1 : 0, transition: "opacity 200ms ease 550ms" }}
                >
                  {d.count}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex justify-between text-[10.5px] text-ink-faint">
        {data.map((d) => (
          <span key={d.date}>{d.date}</span>
        ))}
      </div>
    </div>
  );
}
