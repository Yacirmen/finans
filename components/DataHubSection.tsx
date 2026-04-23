import { autoTopBrands, autoTotals, creditRows, currentIndicators, financingIndex, housingSales, sourceCatalog, topIndexDrivers } from "../lib/marketData";
import type { ReactNode } from "react";

const numberFormatter = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 });
const decimalFormatter = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 });

function formatNumber(value: number) {
  return numberFormatter.format(value);
}

function formatPercent(value: number) {
  return `${decimalFormatter.format(value)}%`;
}

function Gauge() {
  const score = financingIndex.score;
  const rotation = -90 + score * 1.8;

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="form-label">Piyasa Endeksi</p>
          <h1 className="max-w-[560px] text-4xl font-black leading-tight tracking-[-0.05em] text-slate-950 md:text-5xl">
            Konut & taşıt karar termometresi
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
            Excel modelinden üretilen haftalık sinyal. 0 tasarruf finansmanı lehine, 100 konut kredisi lehine okur.
          </p>
        </div>
        <span className="rounded-full bg-[var(--green-soft)] px-4 py-2 text-sm font-black text-[var(--green-dark)]">{financingIndex.updatedLabel}</span>
      </div>

      <div className="mt-8 grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="mx-auto w-full max-w-[420px]">
          <div
            className="relative aspect-[2/1] overflow-hidden rounded-t-full border border-b-0 border-slate-200 bg-[conic-gradient(from_270deg_at_50%_100%,#059669_0deg,#f0cf4f_72deg,#e85a47_108deg,#e85a47_180deg,transparent_180deg)]"
            aria-label={`Endeks skoru ${decimalFormatter.format(score)}`}
          >
            <div className="absolute inset-[14%] bottom-0 rounded-t-full bg-white" />
            <div className="absolute bottom-0 left-1/2 h-[46%] w-1 origin-bottom rounded-full bg-slate-950 shadow-lg" style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }} />
            <div className="absolute bottom-0 left-1/2 h-5 w-5 -translate-x-1/2 rounded-full bg-slate-950 ring-8 ring-white" />
            <strong className="absolute bottom-7 left-1/2 -translate-x-1/2 text-5xl font-black tracking-[-0.06em] text-slate-950">{decimalFormatter.format(score)}</strong>
          </div>
          <div className="grid grid-cols-3 rounded-b-2xl border border-t-0 border-slate-200 bg-slate-50 text-center text-xs font-black uppercase tracking-[0.1em] text-slate-500">
            <span className="py-3 text-emerald-700">Tasarruf</span>
            <span className="py-3 text-amber-600">Geçiş</span>
            <span className="py-3 text-red-600">Kredi</span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["Sezon", financingIndex.season],
            ["Kredi Skoru", decimalFormatter.format(financingIndex.creditScore)],
            ["Risk Skoru", decimalFormatter.format(financingIndex.riskScore)],
            ["Konut Skoru", decimalFormatter.format(financingIndex.housingScore)],
            ["Güncel Veri", `${currentIndicators.length} gösterge`],
            ["Kaynak", `${sourceCatalog.length} veri hattı`],
          ].map(([label, value]) => (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4" key={label}>
              <span className="text-xs font-black uppercase tracking-[0.1em] text-slate-500">{label}</span>
              <strong className="mt-2 block text-xl font-black tracking-[-0.03em] text-slate-950">{value}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricTable({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
      <h2 className="text-xl font-black tracking-[-0.04em] text-slate-950">{title}</h2>
      <div className="mt-4 overflow-x-auto">{children}</div>
    </section>
  );
}

export function DataHubSection() {
  const latestHousing = housingSales[0];
  const housingCredit = creditRows.find((row) => row.name === "Konut");
  const vehicleCredit = creditRows.find((row) => row.name === "Taşıt");

  return (
    <main className="bg-[#f6f8fb] pb-16">
      <section className="page-container pt-8">
        <Gauge />
      </section>

      <section className="page-container mt-6 grid gap-4 md:grid-cols-4">
        {[
          ["Konut satışı", formatNumber(latestHousing.total), `${latestHousing.period} toplam adet`],
          ["İpotekli pay", formatPercent(latestHousing.mortgagedShare), "TÜİK son ay"],
          ["Konut kredi hacmi", `${formatNumber(housingCredit?.latest || 0)} mn TL`, `YB ${formatPercent(housingCredit?.ytd || 0)}`],
          ["Taşıt kredi hacmi", `${formatNumber(vehicleCredit?.latest || 0)} mn TL`, `YB ${formatPercent(vehicleCredit?.ytd || 0)}`],
        ].map(([label, value, note]) => (
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={label}>
            <span className="text-xs font-black uppercase tracking-[0.1em] text-slate-500">{label}</span>
            <strong className="mt-2 block text-2xl font-black tracking-[-0.05em] text-slate-950">{value}</strong>
            <p className="mt-2 text-sm font-bold text-slate-500">{note}</p>
          </article>
        ))}
      </section>

      <section className="page-container mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <MetricTable title="Endeksi Sürükleyen Göstergeler">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.1em] text-slate-500">
              <tr>
                <th className="pb-3">Gösterge</th>
                <th className="pb-3">Grup</th>
                <th className="pb-3">Ham Skor</th>
                <th className="pb-3">Etki</th>
                <th className="pb-3">Yorum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topIndexDrivers.map((item) => (
                <tr key={item.name}>
                  <td className="py-3 font-black text-slate-900">{item.name}</td>
                  <td className="py-3 text-slate-600">{item.group}</td>
                  <td className="py-3 text-slate-600">{decimalFormatter.format(item.rawScore)}</td>
                  <td className="py-3 font-black text-slate-900">{decimalFormatter.format(item.impact)}</td>
                  <td className="py-3 text-slate-600">{item.comment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </MetricTable>

        <MetricTable title="Güncel Veri Paneli">
          <div className="grid max-h-[430px] gap-3 overflow-auto pr-2 sm:grid-cols-2">
            {currentIndicators.map((item) => (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4" key={item.name}>
                <span className="text-xs font-black uppercase tracking-[0.08em] text-slate-500">{item.description}</span>
                <strong className="mt-2 block text-lg font-black text-slate-950">
                  {decimalFormatter.format(item.value)} {item.unit}
                </strong>
                <p className="mt-1 text-sm font-bold text-slate-600">{item.name}</p>
              </div>
            ))}
          </div>
        </MetricTable>
      </section>

      <section className="page-container mt-6 grid gap-6 lg:grid-cols-2">
        <MetricTable title="TÜİK Konut Satışları">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.1em] text-slate-500">
              <tr>
                <th className="pb-3">Dönem</th>
                <th className="pb-3">Toplam</th>
                <th className="pb-3">İlk El</th>
                <th className="pb-3">İkinci El</th>
                <th className="pb-3">İpotekli</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {housingSales.map((row) => (
                <tr key={row.period}>
                  <td className="py-3 font-black">{row.period}</td>
                  <td className="py-3">{formatNumber(row.total)}</td>
                  <td className="py-3">{formatNumber(row.firstHand)}</td>
                  <td className="py-3">{formatNumber(row.secondHand)}</td>
                  <td className="py-3">{formatNumber(row.mortgaged)} / {formatPercent(row.mortgagedShare)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </MetricTable>

        <MetricTable title="BDDK Konut & Taşıt Kredi Hacmi">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.1em] text-slate-500">
              <tr>
                <th className="pb-3">Başlık</th>
                <th className="pb-3">Güncel</th>
                <th className="pb-3">Haftalık</th>
                <th className="pb-3">Yılbaşı</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {creditRows.map((row) => (
                <tr key={row.name}>
                  <td className="py-3 font-black">{row.name}</td>
                  <td className="py-3">{formatNumber(row.latest)}</td>
                  <td className={`py-3 font-bold ${row.weekly < 0 ? "text-red-600" : "text-emerald-700"}`}>{formatPercent(row.weekly)}</td>
                  <td className={`py-3 font-bold ${row.ytd < 0 ? "text-red-600" : "text-emerald-700"}`}>{formatPercent(row.ytd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </MetricTable>
      </section>

      <section className="page-container mt-6 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <MetricTable title="ODMD Otomobil Pazarı">
          <div className="rounded-2xl bg-slate-950 p-5 text-white">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-emerald-300">Q1 toplam pazar</span>
            <strong className="mt-3 block text-4xl font-black tracking-[-0.06em]">{formatNumber(autoTotals.q1_2026)}</strong>
            <p className={`mt-2 text-sm font-black ${autoTotals.change < 0 ? "text-red-300" : "text-emerald-300"}`}>
              2025 Q1'e göre {formatPercent(autoTotals.change)}
            </p>
          </div>
          <div className="mt-4 grid gap-2">
            {autoTopBrands.map((brand) => (
              <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm" key={brand.brand}>
                <strong className="text-slate-950">{brand.brand}</strong>
                <span className="font-bold text-slate-600">{formatNumber(brand.q1_2026)}</span>
                <span className={`font-black ${brand.change < 0 ? "text-red-600" : "text-emerald-700"}`}>{formatPercent(brand.change)}</span>
              </div>
            ))}
          </div>
        </MetricTable>

        <MetricTable title="Kaynak Haritası">
          <div className="grid gap-3">
            {sourceCatalog.map((source) => (
              <a
                className="grid gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-white hover:shadow-sm md:grid-cols-[1fr_auto]"
                href={source.url || "#"}
                key={`${source.name}-${source.period}`}
                rel="noreferrer"
                target={source.url ? "_blank" : undefined}
              >
                <span>
                  <strong className="block text-sm font-black text-slate-950">{source.name}</strong>
                  <span className="mt-1 block text-sm text-slate-600">{source.note}</span>
                </span>
                <span className="h-fit rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                  {source.institution} · {source.period}
                </span>
              </a>
            ))}
          </div>
        </MetricTable>
      </section>
    </main>
  );
}
