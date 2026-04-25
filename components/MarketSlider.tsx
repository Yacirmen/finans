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
  if (points.length < 2) return "M0 22 L120 22";

  const width = 120;
  const height = 38;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  return points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * width;
      const y = height - ((point - min) / range) * (height - 8) - 4;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

function MarketCard({ item }: { item: MarketItem }) {
  const isUp = item.direction === "up";
  const isDown = item.direction === "down";
  const toneClass = isUp ? "text-emerald-300" : isDown ? "text-rose-300" : "text-slate-300";
  const stroke = isUp ? "#6ee7b7" : isDown ? "#fda4af" : "#cbd5e1";

  return (
    <article className="market-slider-card">
      <div>
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">{item.label}</span>
        <strong className="mt-1 block text-[20px] font-black tracking-[-0.04em] text-white">{item.value}</strong>
        <span className={`mt-1 inline-flex text-xs font-bold ${toneClass}`}>
          {isUp ? "▲" : isDown ? "▼" : "•"} {item.change}
        </span>
      </div>
      <svg viewBox="0 0 120 42" aria-hidden="true" className="h-[42px] w-[120px]">
        <path d={buildSparkline(item.sparkline)} fill="none" stroke={stroke} strokeLinecap="round" strokeWidth="3" />
      </svg>
    </article>
  );
}

export function MarketSlider() {
  const items = marketData as MarketItem[];
  const duplicated = [...items, ...items];

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
