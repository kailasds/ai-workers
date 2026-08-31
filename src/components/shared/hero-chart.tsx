export function HeroChart({
  data,
  labels,
  width = 640,
  height = 200,
  suffix = "",
}: {
  data: number[];
  labels: string[];
  width?: number;
  height?: number;
  suffix?: string;
}) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padX = 8;
  const padY = 16;

  const points = data.map((v, i) => {
    const x = padX + (i / (data.length - 1)) * (width - padX * 2);
    const y = height - padY - ((v - min) / range) * (height - padY * 2);
    return [x, y] as const;
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1][0]},${height} L${points[0][0]},${height} Z`;
  const last = points[points.length - 1];

  return (
    <div className="relative">
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible">
        <defs>
          <linearGradient id="hero-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.16" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1={padX} x2={width - padX} y1={height - padY} y2={height - padY} stroke="var(--color-border-strong)" strokeWidth={1} />
        <path d={areaPath} fill="url(#hero-fade)" />
        <path d={linePath} fill="none" stroke="var(--color-accent)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r={i === points.length - 1 ? 3.5 : 0} fill="var(--color-accent)" />
        ))}
      </svg>
      <div
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-full flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-semibold text-ink shadow-pill tabular-nums"
        style={{ left: `${(last[0] / width) * 100}%`, top: `${(last[1] / height) * 100}%`, marginTop: -8 }}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        {data[data.length - 1]}
        {suffix}
      </div>
      <div className="mt-2 flex justify-between text-[10.5px] text-ink-faint">
        {labels.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
    </div>
  );
}
