"use client";

import { useMemo, useRef, useState } from "react";
import {
  compareOfferScenarios,
  defaultScenarioA,
  defaultScenarioB,
  type OfferScenarioInput,
} from "../lib/calculations/offerComparison";
import {
  formatNumberTr,
  formatPercentTr,
  formatTry,
  parseLocaleNumber,
} from "../lib/formatters";
import { withBasePath } from "../lib/sitePaths";

type ScenarioKey = "a" | "b";

function ScenarioField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="form-label">{label}</span>
      <input
        className="form-control !h-[46px] !rounded-[14px] !bg-white !font-medium"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function ResultLine({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "good" | "bad";
}) {
  const color =
    tone === "good"
      ? "text-[#0b7a45]"
      : tone === "bad"
        ? "text-[#b42318]"
        : "text-[#081b3a]";

  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#dde5ef] py-3 last:border-b-0">
      <span className="text-[14px] text-[#43536a]">{label}</span>
      <b className={`text-[15px] font-bold ${color}`}>{value}</b>
    </div>
  );
}

function ComparisonCard({
  title,
  tag,
  highlighted,
  form,
  onChange,
  result,
}: {
  title: string;
  tag: string;
  highlighted: boolean;
  form: Record<keyof OfferScenarioInput, string>;
  onChange: (field: keyof OfferScenarioInput, value: string) => void;
  result: ReturnType<typeof compareOfferScenarios>["scenarioA"];
}) {
  return (
    <article
      className={`rounded-[20px] border bg-white shadow-[0_10px_30px_rgba(8,27,58,0.08)] ${
        highlighted ? "border-[#f4c514] ring-1 ring-[#f4c514]" : "border-[#dde5ef]"
      }`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-[#dde5ef] px-5 py-4">
        <h2 className="text-[28px] font-bold tracking-[-0.04em] text-[#172133]">{title}</h2>
        <span
          className={`rounded-full px-3 py-1 text-[12px] font-extrabold ${
            highlighted ? "bg-[#078759] text-white" : "bg-[#1d74f5] text-white"
          }`}
        >
          {tag}
        </span>
      </div>
      <div className="p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <ScenarioField label="Ev Değeri (TL)" value={form.home} onChange={(value) => onChange("home", value)} />
          <ScenarioField
            label="Peşinat Tutarı (TL)"
            value={form.down}
            onChange={(value) => onChange("down", value)}
          />
          <ScenarioField
            label="Organizasyon / Sistem Giriş Ücreti Oranı (%)"
            value={form.orgRate}
            onChange={(value) => onChange("orgRate", value)}
          />
          <ScenarioField label="Vade (Ay)" value={form.term} onChange={(value) => onChange("term", value)} />
          <ScenarioField
            label="Aylık İskonto Oranı (%)"
            value={form.discount}
            onChange={(value) => onChange("discount", value)}
          />
          <ScenarioField
            label="Teslim Öncesi Kira (TL)"
            value={form.rent}
            onChange={(value) => onChange("rent", value)}
          />
        </div>

        <div className="mt-4 rounded-[16px] border border-[#dde5ef] bg-[#f8fbff] p-4">
          <ResultLine label="NPV Hesaplaması" value={formatTry(result.npv)} tone="good" />
          <ResultLine label="Toplam Maliyet" value={formatTry(result.totalCost)} />
          <ResultLine label="Teslim Zamanı" value={`${result.delivery}. ay`} />
        </div>

        <div className="mt-4 border-t border-[#dde5ef]">
          <ResultLine
            label="Peşinat Oranı (ilk taksit ile)"
            value={formatPercentTr(result.downRateFirst * 100)}
          />
          <ResultLine
            label="Peşinat Oranı (teslimata kadar ödeme)"
            value={formatPercentTr(result.downRateDelivery * 100)}
          />
          <ResultLine label="Organizasyon / Sistem Giriş Ücreti" value={formatTry(result.orgFee)} />
          <ResultLine label="Toplam Başlangıç Çıkışı" value={formatTry(result.initial)} />
          <ResultLine label="Finansman Tutarı" value={formatTry(result.finance)} />
          <ResultLine label="Vade %40 Süre" value={`${formatNumberTr(result.term40)} ay`} />
          <ResultLine label="Aylık Taksit" value={formatTry(result.installment)} />
          <ResultLine label="Toplam Geri Ödeme" value={formatTry(result.totalPay)} />
        </div>
      </div>
    </article>
  );
}

export function OfferComparisonPage() {
  const summaryRef = useRef<HTMLElement | null>(null);
  const [formA, setFormA] = useState<Record<keyof OfferScenarioInput, string>>({
    home: formatNumberTr(defaultScenarioA.home, 0),
    down: formatNumberTr(defaultScenarioA.down, 0),
    orgRate: formatNumberTr(defaultScenarioA.orgRate),
    term: formatNumberTr(defaultScenarioA.term, 0),
    discount: formatNumberTr(defaultScenarioA.discount),
    rent: formatNumberTr(defaultScenarioA.rent, 0),
  });
  const [formB, setFormB] = useState<Record<keyof OfferScenarioInput, string>>({
    home: formatNumberTr(defaultScenarioB.home, 0),
    down: formatNumberTr(defaultScenarioB.down, 0),
    orgRate: formatNumberTr(defaultScenarioB.orgRate),
    term: formatNumberTr(defaultScenarioB.term, 0),
    discount: formatNumberTr(defaultScenarioB.discount),
    rent: formatNumberTr(defaultScenarioB.rent, 0),
  });

  const scenarioA = useMemo<OfferScenarioInput>(
    () => ({
      home: parseLocaleNumber(formA.home),
      down: parseLocaleNumber(formA.down),
      orgRate: parseLocaleNumber(formA.orgRate),
      term: parseLocaleNumber(formA.term),
      discount: parseLocaleNumber(formA.discount),
      rent: parseLocaleNumber(formA.rent),
    }),
    [formA],
  );

  const scenarioB = useMemo<OfferScenarioInput>(
    () => ({
      home: parseLocaleNumber(formB.home),
      down: parseLocaleNumber(formB.down),
      orgRate: parseLocaleNumber(formB.orgRate),
      term: parseLocaleNumber(formB.term),
      discount: parseLocaleNumber(formB.discount),
      rent: parseLocaleNumber(formB.rent),
    }),
    [formB],
  );

  const comparison = useMemo(() => compareOfferScenarios(scenarioA, scenarioB), [scenarioA, scenarioB]);

  const resetDefaults = () => {
    setFormA({
      home: formatNumberTr(defaultScenarioA.home, 0),
      down: formatNumberTr(defaultScenarioA.down, 0),
      orgRate: formatNumberTr(defaultScenarioA.orgRate),
      term: formatNumberTr(defaultScenarioA.term, 0),
      discount: formatNumberTr(defaultScenarioA.discount),
      rent: formatNumberTr(defaultScenarioA.rent, 0),
    });
    setFormB({
      home: formatNumberTr(defaultScenarioB.home, 0),
      down: formatNumberTr(defaultScenarioB.down, 0),
      orgRate: formatNumberTr(defaultScenarioB.orgRate),
      term: formatNumberTr(defaultScenarioB.term, 0),
      discount: formatNumberTr(defaultScenarioB.discount),
      rent: formatNumberTr(defaultScenarioB.rent, 0),
    });
  };

  const bestScenario =
    comparison.winner === "A" ? "Senaryo A" : comparison.winner === "B" ? "Senaryo B" : "Dengede";

  const updateScenario = (scenario: ScenarioKey, field: keyof OfferScenarioInput, value: string) => {
    if (scenario === "a") {
      setFormA((current) => ({ ...current, [field]: value }));
      return;
    }

    setFormB((current) => ({ ...current, [field]: value }));
  };

  const scrollToSummary = () => {
    summaryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="page-container py-8">
      <section className="rounded-[24px] border border-[#dce7e2] bg-white p-5 shadow-[0_14px_34px_rgba(31,43,37,0.06)] md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[30px] font-bold tracking-[-0.04em] text-[#172133]">Teklifleri Karşılaştır</h1>
            <p className="mt-3 max-w-[900px] text-[14px] leading-7 text-[#6f7d94]">
              İki evim sistemi senaryosunu aynı zeminde kıyaslayın; NPV, toplam maliyet, teslim zamanı ve
              peşinat dengesini tek ekranda okuyun.
            </p>
          </div>
          <a
            href={withBasePath("/kredi-test")}
            className="rounded-[12px] bg-[#eaf1fb] px-4 py-3 text-[14px] font-semibold text-[#1c4e98]"
          >
            Kredi Testi
          </a>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-[18px] border border-[#dde5ef] bg-white px-5 py-4 shadow-[0_10px_30px_rgba(8,27,58,0.08)]">
          <span className="block text-[12px] font-semibold uppercase tracking-[0.14em] text-[#74829a]">
            Daha Mantıklı Senaryo
          </span>
          <strong className="mt-2 block text-[26px] font-bold tracking-[-0.04em] text-[#172133]">
            {bestScenario}
          </strong>
        </div>
        <div className="rounded-[18px] border border-[#dde5ef] bg-white px-5 py-4 shadow-[0_10px_30px_rgba(8,27,58,0.08)]">
          <span className="block text-[12px] font-semibold uppercase tracking-[0.14em] text-[#74829a]">
            NPV Farkı
          </span>
          <strong
            className={`mt-2 block text-[26px] font-bold tracking-[-0.04em] ${
              comparison.npvDifference >= 0 ? "text-[#0b7a45]" : "text-[#b42318]"
            }`}
          >
            {formatTry(Math.abs(comparison.npvDifference))}
          </strong>
        </div>
        <div className="rounded-[18px] border border-[#dde5ef] bg-white px-5 py-4 shadow-[0_10px_30px_rgba(8,27,58,0.08)]">
          <span className="block text-[12px] font-semibold uppercase tracking-[0.14em] text-[#74829a]">
            Toplam Maliyet Farkı
          </span>
          <strong
            className={`mt-2 block text-[26px] font-bold tracking-[-0.04em] ${
              comparison.totalCostDifference <= 0 ? "text-[#0b7a45]" : "text-[#b42318]"
            }`}
          >
            {formatTry(Math.abs(comparison.totalCostDifference))}
          </strong>
        </div>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-2">
        <ComparisonCard
          title="Senaryo A – Evim Sistemleri"
          tag={comparison.winner === "A" ? "Daha Mantıklı" : "Senaryo A"}
          highlighted={comparison.winner === "A"}
          form={formA}
          onChange={(field, value) => updateScenario("a", field, value)}
          result={comparison.scenarioA}
        />
        <ComparisonCard
          title="Senaryo B – Evim Sistemleri"
          tag={comparison.winner === "B" ? "Daha Mantıklı" : "Senaryo B"}
          highlighted={comparison.winner === "B"}
          form={formB}
          onChange={(field, value) => updateScenario("b", field, value)}
          result={comparison.scenarioB}
        />
      </section>

      <section
        ref={summaryRef}
        className="mt-5 rounded-[20px] border border-[#dde5ef] bg-white shadow-[0_10px_30px_rgba(8,27,58,0.08)]"
      >
        <div className="flex items-center justify-between gap-3 border-b border-[#dde5ef] px-5 py-4">
          <h2 className="text-[26px] font-bold tracking-[-0.04em] text-[#172133]">Karşılaştırma Özeti</h2>
          <span className="rounded-full bg-[#1d74f5] px-3 py-1 text-[12px] font-extrabold text-white">Otomatik</span>
        </div>
        <div className="p-5">
          <div className="overflow-x-auto">
            <table className="min-w-[760px] text-left text-[13px]">
              <thead className="bg-[#fbfdff] text-[11px] font-bold uppercase tracking-[0.08em] text-[#74829a]">
                <tr>
                  <th className="px-4 py-3">Kalem</th>
                  <th className="px-4 py-3">Senaryo A</th>
                  <th className="px-4 py-3">Senaryo B</th>
                  <th className="px-4 py-3">Fark (A - B)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-[#edf2f7]">
                  <td className="px-4 py-3">NPV Hesaplaması</td>
                  <td className="px-4 py-3">{formatTry(comparison.scenarioA.npv)}</td>
                  <td className="px-4 py-3">{formatTry(comparison.scenarioB.npv)}</td>
                  <td className={`px-4 py-3 ${comparison.npvDifference >= 0 ? "text-[#0b7a45]" : "text-[#b42318]"}`}>
                    {formatTry(comparison.npvDifference)}
                  </td>
                </tr>
                <tr className="border-t border-[#edf2f7]">
                  <td className="px-4 py-3">Toplam Maliyet</td>
                  <td className="px-4 py-3">{formatTry(comparison.scenarioA.totalCost)}</td>
                  <td className="px-4 py-3">{formatTry(comparison.scenarioB.totalCost)}</td>
                  <td
                    className={`px-4 py-3 ${
                      comparison.totalCostDifference <= 0 ? "text-[#0b7a45]" : "text-[#b42318]"
                    }`}
                  >
                    {formatTry(comparison.totalCostDifference)}
                  </td>
                </tr>
                <tr className="border-t border-[#edf2f7]">
                  <td className="px-4 py-3">Aylık Taksit</td>
                  <td className="px-4 py-3">{formatTry(comparison.scenarioA.installment)}</td>
                  <td className="px-4 py-3">{formatTry(comparison.scenarioB.installment)}</td>
                  <td className="px-4 py-3">
                    {formatTry(comparison.scenarioA.installment - comparison.scenarioB.installment)}
                  </td>
                </tr>
                <tr className="border-t border-[#edf2f7]">
                  <td className="px-4 py-3">Teslim Zamanı</td>
                  <td className="px-4 py-3">{comparison.scenarioA.delivery}. ay</td>
                  <td className="px-4 py-3">{comparison.scenarioB.delivery}. ay</td>
                  <td className="px-4 py-3">{comparison.scenarioA.delivery - comparison.scenarioB.delivery} ay</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-[12px] bg-[#1d74f5] px-5 py-3 text-[15px] font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#125ee0]"
              onClick={scrollToSummary}
            >
              Hesapla
            </button>
            <button
              type="button"
              className="rounded-[12px] bg-[#e8eef6] px-5 py-3 text-[15px] font-extrabold text-[#193253] transition hover:-translate-y-0.5 hover:bg-[#dae6f4]"
              onClick={resetDefaults}
            >
              Varsayılanlara Dön
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
