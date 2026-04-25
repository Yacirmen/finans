import marketData from "../data/market-data.json";

type Direction = "up" | "down" | "flat";

type MarketItem = {
  label: string;
  value: string;
  change: string;
  direction: Direction;
  type: string;
  sparkline?: number[];
};

function buildSparkline(points: number[] = []) {
  if (points.length < 2) return "0,28 140,28";

  const width = 140;
  const height = 46;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  return points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * width;
      const y = height - ((point - min) / range) * (height - 12) - 6;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function MarketCard({ item }: { item: MarketItem }) {
  const isUp = item.direction === "up";
  const isDown = item.direction === "down";
  const color = isUp ? "#16a05a" : isDown ? "#ef4444" : "#64748b";
  const fillId = `spark-${item.label.replace(/[^a-zA-Z0-9]/g, "")}-${item.direction}`;

  return (
    <article className="market-slider-card">
      <div className="min-w-0">
        <span className="block text-[12px] font-black uppercase tracking-[0.12em] text-[#64748b]">{item.label}</span>
        <strong className="mt-1 block text-[24px] font-black leading-none tracking-[-0.055em] text-[#0f172a]">
          {item.value}
        </strong>
        <span className="mt-2 inline-flex items-center gap-1 text-[12px] font-black" style={{ color }}>
          {isUp ? "▲" : isDown ? "▼" : "•"} {item.change}
        </span>
      </div>

      <svg viewBox="0 0 140 50" aria-hidden="true" className="h-[50px] w-[140px] shrink-0">
        <defs>
          <linearGradient id={fillId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline
          fill="none"
          points={buildSparkline(item.sparkline)}
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
        />
        <polygon fill={`url(#${fillId})`} points={`0,50 ${buildSparkline(item.sparkline)} 140,50`} />
      </svg>
    </article>
  );
}

export function MarketSlider() {
  const items = marketData as MarketItem[];
  const duplicated = [...items, ...items, ...items];

  return (
    <section className="market-slider" aria-label="Piyasa göstergeleri">
      <div className="market-slider-track">
        {duplicated.map((item, index) => (
          <MarketCard item={item} key={`${item.label}-${index}`} />
        ))}
      </div>
    </section>
  );
}
