import { autoTopBrands, autoTotals, creditRows, currentIndicators, financingIndex, housingSales, sourceCatalog, topIndexDrivers } from "../lib/marketData";

const numberFormatter = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 });
const decimalFormatter = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 });

function formatNumber(value: number) {
  return numberFormatter.format(value);
}

function formatPercent(value: number) {
  return `${decimalFormatter.format(value)}%`;
}

function StatTile({ label, value, note, tone = "light" }: { label: string; value: string; note: string; tone?: "light" | "dark" | "green" }) {
  const styles = {
    light: "border-slate-200 bg-white text-slate-950",
    dark: "border-slate-800 bg-slate-950 text-white",
    green: "border-emerald-200 bg-emerald-50 text-emerald-950",
  };

  return (
    <article className={`rounded-[22px] border p-5 shadow-[0_14px_34px_rgba(15,23,42,0.06)] ${styles[tone]}`}>
      <span className={`text-xs font-black uppercase tracking-[0.16em] ${tone === "dark" ? "text-emerald-300" : "text-slate-500"}`}>{label}</span>
      <strong className="mt-3 block text-[clamp(25px,3vw,38px)] font-black leading-none tracking-[-0.07em]">{value}</strong>
      <p className={`mt-3 text-sm font-bold leading-6 ${tone === "dark" ? "text-slate-300" : "text-slate-500"}`}>{note}</p>
    </article>
  );
}

function HeroIndex() {
  const score = financingIndex.score;
  const markerLeft = `${Math.max(6, Math.min(94, score))}%`;

  return (
    <section className="page-container pt-8">
      <div className="overflow-hidden rounded-[34px] border border-slate-200 bg-[#fbfaf5] shadow-[0_30px_90px_rgba(15,23,42,0.10)]">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative min-h-[520px] min-w-0 bg-slate-950 p-7 text-white md:p-10">
            <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:34px_34px]" />
            <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
            <div className="relative z-10 flex h-full flex-col justify-between gap-10">
              <div>
                <span className="inline-flex max-w-full rounded-full border border-emerald-300/25 bg-emerald-300/10 px-4 py-2 text-center text-xs font-black uppercase leading-5 tracking-[0.14em] text-emerald-200 md:tracking-[0.18em]">
                  Piyasada olmayan karar göstergesi
                </span>
                <h1 className="mt-8 max-w-[680px] break-words text-[clamp(44px,6.2vw,82px)] font-black leading-[0.92] tracking-[-0.08em]">
                  Konut ve taşıt için karar nabzı.
                </h1>
                <p className="mt-6 max-w-[560px] text-lg leading-8 text-slate-300">
                  Excel modelindeki kredi, risk, konut ve taşıt sinyallerini tek bir haftalık endekste topluyoruz. Detay merak uyandırır; karar sinyali ekranda net kalır.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="min-w-0 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Sezon</span>
                  <strong className="mt-2 block text-xl font-black text-white">{financingIndex.season}</strong>
                </div>
                <div className="min-w-0 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Veri hattı</span>
                  <strong className="mt-2 block text-xl font-black text-white">{sourceCatalog.length} kaynak</strong>
                </div>
                <div className="min-w-0 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Güncel set</span>
                  <strong className="mt-2 block text-xl font-black text-white">{currentIndicators.length} gösterge</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="relative min-w-0 p-7 md:p-10">
            <div className="mb-5 ml-auto w-fit rounded-full bg-[var(--green-soft)] px-4 py-2 text-sm font-black text-[var(--green-dark)] lg:absolute lg:right-8 lg:top-8 lg:mb-0">{financingIndex.updatedLabel}</div>
            <div className="flex min-h-[520px] flex-col justify-center">
              <div className="mx-auto w-full max-w-[520px] rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
                <div className="flex items-end justify-between">
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Genel endeks</span>
                  <span className="text-sm font-black text-slate-500">0 → 100</span>
                </div>
                <strong className="mt-4 block text-[96px] font-black leading-none tracking-[-0.1em] text-slate-950">{decimalFormatter.format(score)}</strong>
                <div className="relative mt-8 h-5 rounded-full bg-[linear-gradient(90deg,#059669_0%,#8fcf65_36%,#f0cf4f_50%,#ed8b49_68%,#e85a47_100%)]">
                  <span className="absolute top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-[7px] border-white bg-slate-950 shadow-xl" style={{ left: markerLeft }} />
                </div>
                <div className="mt-3 grid grid-cols-3 text-xs font-black uppercase tracking-[0.12em]">
                  <span className="text-emerald-700">Tasarruf</span>
                  <span className="text-center text-amber-600">Geçiş</span>
                  <span className="text-right text-red-600">Kredi</span>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {[
                    ["Kredi", financingIndex.creditScore],
                    ["Risk", financingIndex.riskScore],
                    ["Konut", financingIndex.housingScore],
                  ].map(([label, value]) => (
                    <div className="rounded-2xl bg-slate-50 p-4" key={label}>
                      <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{label}</span>
                      <strong className="mt-2 block text-2xl font-black tracking-[-0.05em] text-slate-950">{decimalFormatter.format(Number(value))}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <a className="mx-auto mt-6 inline-flex rounded-full bg-[var(--green)] px-7 py-3 text-sm font-black text-white shadow-[0_18px_36px_rgba(6,148,95,0.22)] transition hover:-translate-y-0.5 hover:bg-[var(--green-dark)] hover:shadow-[0_22px_44px_rgba(6,148,95,0.28)]" href="/#calculator">
                Bu sinyalle hesaplama yap
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DriverBoard() {
  const maxImpact = Math.max(...topIndexDrivers.map((driver) => driver.impact));

  return (
    <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.07)]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="form-label">Modelin iç sesi</p>
          <h2 className="text-3xl font-black tracking-[-0.06em] text-slate-950">Endeksi sürükleyen güçler</h2>
        </div>
        <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-600">Etki ağırlığına göre sıralı</span>
      </div>

      <div className="mt-7 grid gap-4">
        {topIndexDrivers.map((item, index) => (
          <article className="group grid gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-white hover:shadow-sm md:grid-cols-[42px_1fr_110px]" key={item.name}>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-sm font-black text-slate-500 shadow-sm">{String(index + 1).padStart(2, "0")}</span>
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <strong className="text-base font-black text-slate-950">{item.name}</strong>
                <span className={`rounded-full px-3 py-1 text-xs font-black ${item.comment === "Kredi lehine" ? "bg-red-50 text-red-700" : item.comment === "Tasarruf lehine" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                  {item.comment}
                </span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-slate-200">
                <div className="h-2 rounded-full bg-slate-950 transition-all group-hover:bg-[var(--green)]" style={{ width: `${Math.max(9, (item.impact / maxImpact) * 100)}%` }} />
              </div>
              <p className="mt-2 text-sm font-bold text-slate-500">
                {item.group} grubu · ham skor {decimalFormatter.format(item.rawScore)} · ağırlık {decimalFormatter.format(item.weight * 100)}%
              </p>
            </div>
            <strong className="self-center text-right text-3xl font-black tracking-[-0.07em] text-slate-950">{decimalFormatter.format(item.impact)}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}

function IndicatorRail() {
  const visible = currentIndicators.slice(0, 15);

  return (
    <section className="rounded-[30px] border border-slate-800 bg-slate-950 p-6 text-white shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">Güncel veri paneli</p>
      <h2 className="mt-3 text-3xl font-black tracking-[-0.06em]">Canlı pano hissi, manuel kontrol.</h2>
      <p className="mt-3 text-sm leading-6 text-slate-300">
        Haftalık ve aylık güncellemelerde tek dosyadan beslenen karar yüzeyi.
      </p>

      <div className="mt-6 grid gap-3">
        {visible.map((item, index) => (
          <div className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-white/10 pb-3 last:border-0 last:pb-0" key={item.name}>
            <div>
              <span className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">{String(index + 1).padStart(2, "0")} · {item.description}</span>
              <p className="mt-1 text-sm font-bold text-slate-200">{item.name}</p>
            </div>
            <strong className="text-right text-xl font-black tracking-[-0.05em]">
              {decimalFormatter.format(item.value)} {item.unit}
            </strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function MarketEvidence() {
  const latestHousing = housingSales[0];
  const housingCredit = creditRows.find((row) => row.name === "Konut");
  const vehicleCredit = creditRows.find((row) => row.name === "Taşıt");

  return (
    <section className="page-container mt-8">
      <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
        <div className="grid gap-4">
          <StatTile label="Konut satışı" value={formatNumber(latestHousing.total)} note={`${latestHousing.period} toplam adet`} tone="green" />
          <StatTile label="İpotekli pay" value={formatPercent(latestHousing.mortgagedShare)} note="TÜİK son ay, finansman talebi proxy'si" />
          <StatTile label="Otomobil pazarı" value={formatNumber(autoTotals.q1_2026)} note={`Q1 pazar, yıllık ${formatPercent(autoTotals.change)}`} tone="dark" />
        </div>

        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.07)]">
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="form-label">Konut satış ritmi</p>
              <h2 className="text-3xl font-black tracking-[-0.06em] text-slate-950">Son aylar aynı ekranda.</h2>
              <div className="mt-6 grid gap-3">
                {housingSales.slice(0, 6).map((row) => (
                  <div className="grid grid-cols-[74px_1fr_auto] items-center gap-4" key={row.period}>
                    <strong className="text-sm font-black text-slate-500">{row.period}</strong>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-3 rounded-full bg-[var(--green)]" style={{ width: `${Math.max(18, (row.total / 270000) * 100)}%` }} />
                    </div>
                    <span className="text-sm font-black text-slate-950">{formatNumber(row.total)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] bg-slate-50 p-5">
              <p className="form-label">Kredi hacmi</p>
              <div className="mt-4 grid gap-3">
                {[
                  ["Konut", housingCredit?.latest || 0, housingCredit?.ytd || 0],
                  ["Taşıt", vehicleCredit?.latest || 0, vehicleCredit?.ytd || 0],
                ].map(([label, value, change]) => (
                  <div className="rounded-2xl bg-white p-4 shadow-sm" key={label}>
                    <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{label}</span>
                    <strong className="mt-2 block text-2xl font-black tracking-[-0.05em] text-slate-950">{formatNumber(Number(value))} mn TL</strong>
                    <p className={`mt-1 text-sm font-black ${Number(change) < 0 ? "text-red-600" : "text-emerald-700"}`}>Yılbaşı: {formatPercent(Number(change))}</p>
                  </div>
                ))}
              </div>
              <a className="mt-5 inline-flex rounded-full bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:text-[var(--green-dark)]" href="/#calculator">
                Kredi kıyası hesapla
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AutoAndSources() {
  return (
    <section className="page-container mt-8 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
      <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.07)]">
        <p className="form-label">Taşıt ana sektör</p>
        <h2 className="text-3xl font-black tracking-[-0.06em] text-slate-950">ODMD marka momentumu</h2>
        <div className="mt-6 grid gap-3">
          {autoTopBrands.map((brand) => (
            <div className="grid grid-cols-[86px_1fr_68px] items-center gap-3" key={brand.brand}>
              <strong className="truncate text-sm font-black text-slate-950">{brand.brand}</strong>
              <div className="h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-slate-950" style={{ width: `${Math.max(8, (brand.q1_2026 / 35000) * 100)}%` }} />
              </div>
              <span className={`text-right text-sm font-black ${brand.change < 0 ? "text-red-600" : "text-emerald-700"}`}>{formatPercent(brand.change)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[30px] border border-slate-200 bg-[#fbfaf5] p-6 shadow-[0_18px_55px_rgba(15,23,42,0.07)]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="form-label">Kaynak haritası</p>
            <h2 className="text-3xl font-black tracking-[-0.06em] text-slate-950">Veri nereden geliyor?</h2>
          </div>
          <span className="text-sm font-black text-slate-500">{sourceCatalog.length} hat</span>
        </div>
        <div className="mt-6 grid max-h-[540px] gap-2 overflow-auto pr-2">
          {sourceCatalog.map((source, index) => (
            <a
              className="grid gap-3 rounded-2xl border border-slate-200 bg-white/80 p-4 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-white hover:shadow-sm md:grid-cols-[38px_1fr_auto]"
              href={source.url || "#"}
              key={`${source.name}-${source.period}`}
              rel="noreferrer"
              target={source.url ? "_blank" : undefined}
            >
              <span className="text-sm font-black text-slate-400">{String(index + 1).padStart(2, "0")}</span>
              <span>
                <strong className="block text-sm font-black text-slate-950">{source.name}</strong>
                <span className="mt-1 block text-sm leading-6 text-slate-600">{source.note}</span>
              </span>
              <span className="h-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                {source.institution} · {source.period}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export function DataHubSection() {
  return (
    <main className="overflow-hidden bg-[#eef2ef] pb-16">
      <HeroIndex />
      <section className="page-container mt-8 grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
        <DriverBoard />
        <IndicatorRail />
      </section>
      <MarketEvidence />
      <AutoAndSources />
    </main>
  );
}
