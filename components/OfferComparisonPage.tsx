"use client";

import { useMemo, useRef, useState } from "react";
import {
  compareOfferScenarios,
  defaultScenarioA,
  defaultScenarioB,
  type ComparisonAssetType,
  type OfferScenarioInput,
  type OfferScenarioResult,
} from "../lib/calculations/offerComparison";
import { COMPANY_OPTIONS, companyParams, type CompanyName } from "../lib/companyParams";
import { formatNumberInput, formatNumberTr, formatPercentTr, formatTry, parseLocaleNumber } from "../lib/formatters";
import { withBasePath } from "../lib/sitePaths";

type ScenarioKey = "a" | "b";
type ScenarioForm = Record<"assetValue" | "downPayment" | "orgRate" | "termMonths" | "monthlyDiscountRate" | "monthlyRent", string> & {
  company: CompanyName;
};

const isMember = false;

function toForm(input: OfferScenarioInput): ScenarioForm {
  return {
    company: input.company,
    assetValue: formatNumberInput(input.assetValue),
    downPayment: formatNumberInput(input.downPayment),
    orgRate: formatNumberTr(input.orgRate),
    termMonths: formatNumberInput(input.termMonths),
    monthlyDiscountRate: formatNumberTr(input.monthlyDiscountRate, 8),
    monthlyRent: formatNumberInput(input.monthlyRent),
  };
}

function toInput(assetType: ComparisonAssetType, form: ScenarioForm): OfferScenarioInput {
  return {
    assetType,
    company: form.company,
    assetValue: parseLocaleNumber(form.assetValue),
    downPayment: parseLocaleNumber(form.downPayment),
    orgRate: parseLocaleNumber(form.orgRate),
    termMonths: parseLocaleNumber(form.termMonths),
    monthlyDiscountRate: parseLocaleNumber(form.monthlyDiscountRate),
    monthlyRent: parseLocaleNumber(form.monthlyRent),
  };
}

function ScenarioField({
  label,
  value,
  onChange,
  onBlur,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="form-label">{label}</span>
      <input className="form-control !h-[42px] !rounded-[12px] !bg-white !font-medium" value={value} onBlur={onBlur} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function ResultLine({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "good" | "bad" }) {
  const color = tone === "good" ? "text-[#0b7a45]" : tone === "bad" ? "text-[#b42318]" : "text-[#081b3a]";
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#dde5ef] py-2.5 last:border-b-0">
      <span className="text-[13px] text-[#43536a]">{label}</span>
      <b className={`text-[14px] font-bold ${color}`}>{value}</b>
    </div>
  );
}

function ScenarioCard({
  title,
  tag,
  highlighted,
  form,
  onChange,
  onFormatMoney,
  result,
}: {
  title: string;
  tag: string;
  highlighted: boolean;
  form: ScenarioForm;
  onChange: (field: keyof ScenarioForm, value: string) => void;
  onFormatMoney: (field: keyof ScenarioForm) => void;
  result: OfferScenarioResult;
}) {
  return (
    <article className={`rounded-[16px] border bg-white shadow-[0_8px_24px_rgba(8,27,58,0.07)] ${highlighted ? "border-[#16a05a] ring-1 ring-[#16a05a]" : "border-[#dde5ef]"}`}>
      <div className="flex items-center justify-between gap-3 border-b border-[#dde5ef] px-5 py-4">
        <h2 className="text-[22px] font-bold text-[#172133]">{title}</h2>
        <span className={`rounded-full px-3 py-1 text-[12px] font-extrabold ${highlighted ? "bg-[#078759] text-white" : "bg-[#edf4ff] text-[#1d4f9a]"}`}>
          {tag}
        </span>
      </div>

      <div className="grid gap-4 p-5">
        <label className="grid gap-2">
          <span className="form-label">Şirket Seçimi</span>
          <select className="form-control !h-[42px] !rounded-[12px] !bg-white !font-medium" value={form.company} onChange={(event) => onChange("company", event.target.value as CompanyName)}>
            {COMPANY_OPTIONS.map((company) => (
              <option key={company} value={company}>
                {company}
              </option>
            ))}
          </select>
          <span className="text-[12px] leading-5 text-[#8492a6]">{companyParams[form.company].notes}</span>
        </label>

        <div className="grid gap-3 md:grid-cols-2">
          <ScenarioField label="Varlık Değeri (TL)" value={form.assetValue} onBlur={() => onFormatMoney("assetValue")} onChange={(value) => onChange("assetValue", value)} />
          <ScenarioField label="Peşinat Tutarı (TL)" value={form.downPayment} onBlur={() => onFormatMoney("downPayment")} onChange={(value) => onChange("downPayment", value)} />
          <ScenarioField label="Taksit Ayı" value={form.termMonths} onBlur={() => onFormatMoney("termMonths")} onChange={(value) => onChange("termMonths", value)} />
          <ScenarioField label="Organizasyon Ücreti Oranı (%)" value={form.orgRate} onChange={(value) => onChange("orgRate", value)} />
          <ScenarioField label="Aylık İskonto Oranı (%)" value={form.monthlyDiscountRate} onChange={(value) => onChange("monthlyDiscountRate", value)} />
          <ScenarioField label="Teslim Öncesi Kira (TL)" value={form.monthlyRent} onBlur={() => onFormatMoney("monthlyRent")} onChange={(value) => onChange("monthlyRent", value)} />
        </div>

        <div className="rounded-[14px] border border-[#dde5ef] bg-[#f8fbff] p-4">
          <ResultLine label="Aylık Taksit" value={formatTry(result.monthlyInstallment)} tone="good" />
          <ResultLine label="Teslim Zamanı" value={`${result.deliveryMonth}. ay`} />
          <ResultLine label="Finansman Tutarı" value={formatTry(result.financeAmount)} />
          <ResultLine label="Org. Ücreti + Peşinat" value={formatTry(result.organizationFeeAndDownPayment)} />
          <ResultLine label="Toplam Geri Ödeme" value={formatTry(result.totalRepayment)} />
          <ResultLine label="Toplam Maliyet" value={formatTry(result.totalCost)} />
          <ResultLine label="NPV / Karar Skoru" value={formatTry(result.npv)} tone="good" />
        </div>

        <details className="rounded-[14px] border border-[#e5edf5] bg-white px-4 py-3">
          <summary className="cursor-pointer text-[13px] font-bold uppercase tracking-[0.08em] text-[#74829a]">Gelişmiş detaylar</summary>
          <div className="mt-3">
            <ResultLine label="Peşinat oranı ilk taksit ile" value={formatPercentTr(result.downRateFirstInstallment * 100)} />
            <ResultLine label="Peşinat oranı teslimata kadar" value={formatPercentTr(result.downRateUntilDelivery * 100)} />
            <ResultLine label="Vade %40 süre" value={`${formatNumberTr(result.term40)} ay`} />
            <ResultLine label="Tüm taksitlerin bugünkü değeri" value={formatTry(result.monthlyPaymentsPV)} />
            <ResultLine label="Kira bugünkü değeri" value={formatTry(result.rentPV)} />
            <ResultLine label="Finansmanın bugünkü maliyeti" value={formatTry(result.financingPresentCost)} />
          </div>
        </details>

        <div className="rounded-[14px] border border-[#e6edf5] bg-[#fbfdff] px-4 py-3">
          <span className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[#74829a]">Tahmini Faiz Bilgisi</span>
          {isMember && result.estimatedRateEquivalent !== null ? (
            <strong className="mt-2 block text-[18px] font-black text-[#172133]">{formatPercentTr(result.estimatedRateEquivalent * 100)}</strong>
          ) : (
            <p className="mt-2 text-[13px] leading-6 text-[#66768d]">Tahmini faiz bilgisini görebilmek için üye olmanız gerekmektedir.</p>
          )}
        </div>
      </div>
    </article>
  );
}

export function OfferComparisonPage() {
  const summaryRef = useRef<HTMLElement | null>(null);
  const [assetType, setAssetType] = useState<ComparisonAssetType>("Konut");
  const [formA, setFormA] = useState<ScenarioForm>(() => toForm(defaultScenarioA));
  const [formB, setFormB] = useState<ScenarioForm>(() => toForm(defaultScenarioB));

  const scenarioA = useMemo(() => toInput(assetType, formA), [assetType, formA]);
  const scenarioB = useMemo(() => toInput(assetType, formB), [assetType, formB]);
  const comparison = useMemo(() => compareOfferScenarios(scenarioA, scenarioB), [scenarioA, scenarioB]);

  const resetDefaults = () => {
    setAssetType("Konut");
    setFormA(toForm(defaultScenarioA));
    setFormB(toForm(defaultScenarioB));
  };

  const updateScenario = (scenario: ScenarioKey, field: keyof ScenarioForm, value: string) => {
    const setter = scenario === "a" ? setFormA : setFormB;
    setter((current) => ({ ...current, [field]: value }));
  };

  const formatMoneyField = (scenario: ScenarioKey, field: keyof ScenarioForm) => {
    const setter = scenario === "a" ? setFormA : setFormB;
    setter((current) => ({ ...current, [field]: formatNumberInput(parseLocaleNumber(current[field])) }));
  };

  const bestScenario = comparison.winner === "A" ? "Senaryo A" : comparison.winner === "B" ? "Senaryo B" : "Dengede";

  return (
    <main className="page-container py-8">
      <section className="rounded-[22px] border border-[#dce7e2] bg-white p-5 shadow-[0_14px_34px_rgba(31,43,37,0.06)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[30px] font-bold text-[#172133]">Teklifleri Karşılaştır</h1>
            <p className="mt-3 max-w-[900px] text-[14px] leading-7 text-[#6f7d94]">
              İki şirket teklifini aynı formülle kıyaslayın; aylık taksit, teslim zamanı, NPV ve toplam maliyeti birlikte görün.
            </p>
          </div>
          <a href={withBasePath("/kredi-test")} className="rounded-[12px] bg-[#eaf1fb] px-4 py-3 text-[14px] font-semibold text-[#1c4e98]">
            Kredi Testi
          </a>
        </div>
      </section>

      <section className="mt-5 rounded-[18px] border border-[#dde5ef] bg-white p-4 shadow-[0_8px_24px_rgba(8,27,58,0.06)]">
        <span className="form-label">Karşılaştırılacak Varlık Türü</span>
        <div className="inline-grid grid-cols-2 gap-1 rounded-[12px] bg-[#eef3f8] p-1">
          {(["Konut", "Taşıt"] as ComparisonAssetType[]).map((item) => (
            <button
              key={item}
              type="button"
              data-active={assetType === item}
              onClick={() => setAssetType(item)}
              className="rounded-[10px] px-5 py-2.5 text-[14px] font-semibold text-[#526071] data-[active=true]:bg-[#16a05a] data-[active=true]:text-white"
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-5 grid gap-4 md:grid-cols-3">
        <div className="rounded-[16px] border border-[#dde5ef] bg-white px-5 py-4 shadow-[0_8px_24px_rgba(8,27,58,0.06)]">
          <span className="block text-[12px] font-semibold uppercase tracking-[0.14em] text-[#74829a]">Daha Mantıklı Senaryo</span>
          <strong className="mt-2 block text-[24px] font-bold text-[#172133]">{bestScenario}</strong>
        </div>
        <div className="rounded-[16px] border border-[#dde5ef] bg-white px-5 py-4 shadow-[0_8px_24px_rgba(8,27,58,0.06)]">
          <span className="block text-[12px] font-semibold uppercase tracking-[0.14em] text-[#74829a]">NPV Farkı</span>
          <strong className={`mt-2 block text-[24px] font-bold ${comparison.npvDifference >= 0 ? "text-[#0b7a45]" : "text-[#b42318]"}`}>{formatTry(Math.abs(comparison.npvDifference))}</strong>
        </div>
        <div className="rounded-[16px] border border-[#dde5ef] bg-white px-5 py-4 shadow-[0_8px_24px_rgba(8,27,58,0.06)]">
          <span className="block text-[12px] font-semibold uppercase tracking-[0.14em] text-[#74829a]">Toplam Maliyet Farkı</span>
          <strong className={`mt-2 block text-[24px] font-bold ${comparison.totalCostDifference <= 0 ? "text-[#0b7a45]" : "text-[#b42318]"}`}>{formatTry(Math.abs(comparison.totalCostDifference))}</strong>
        </div>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-2">
        <ScenarioCard title="Senaryo A - Evim Sistemleri" tag={comparison.winner === "A" ? "Daha Mantıklı" : "Senaryo A"} highlighted={comparison.winner === "A"} form={formA} onChange={(field, value) => updateScenario("a", field, value)} onFormatMoney={(field) => formatMoneyField("a", field)} result={comparison.scenarioA} />
        <ScenarioCard title="Senaryo B - Evim Sistemleri" tag={comparison.winner === "B" ? "Daha Mantıklı" : "Senaryo B"} highlighted={comparison.winner === "B"} form={formB} onChange={(field, value) => updateScenario("b", field, value)} onFormatMoney={(field) => formatMoneyField("b", field)} result={comparison.scenarioB} />
      </section>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={() => summaryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })} className="rounded-[12px] bg-[#1d74f5] px-5 py-3 text-[14px] font-semibold text-white">
          Hesapla
        </button>
        <button type="button" onClick={resetDefaults} className="rounded-[12px] bg-[#eaf1fb] px-5 py-3 text-[14px] font-semibold text-[#1c4e98]">
          Varsayılanlara Dön
        </button>
      </div>

      <section ref={summaryRef} className="mt-5 rounded-[18px] border border-[#dde5ef] bg-white shadow-[0_8px_24px_rgba(8,27,58,0.06)]">
        <div className="flex items-center justify-between gap-3 border-b border-[#dde5ef] px-5 py-4">
          <h2 className="text-[24px] font-bold text-[#172133]">Karşılaştırma Özeti</h2>
          <span className="rounded-full bg-[#1d74f5] px-3 py-1 text-[12px] font-extrabold text-white">Otomatik</span>
        </div>
        <div className="overflow-x-auto p-5">
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
              {[
                ["NPV Hesaplaması", comparison.scenarioA.npv, comparison.scenarioB.npv],
                ["Toplam Maliyet", comparison.scenarioA.totalCost, comparison.scenarioB.totalCost],
                ["Aylık Taksit", comparison.scenarioA.monthlyInstallment, comparison.scenarioB.monthlyInstallment],
              ].map(([label, a, b]) => (
                <tr className="border-t border-[#edf2f7]" key={String(label)}>
                  <td className="px-4 py-3">{label}</td>
                  <td className="px-4 py-3">{formatTry(Number(a))}</td>
                  <td className="px-4 py-3">{formatTry(Number(b))}</td>
                  <td className={`px-4 py-3 ${Number(a) - Number(b) >= 0 ? "text-[#0b7a45]" : "text-[#b42318]"}`}>{formatTry(Number(a) - Number(b))}</td>
                </tr>
              ))}
              <tr className="border-t border-[#edf2f7]">
                <td className="px-4 py-3">Teslim Zamanı</td>
                <td className="px-4 py-3">{comparison.scenarioA.deliveryMonth}. ay</td>
                <td className="px-4 py-3">{comparison.scenarioB.deliveryMonth}. ay</td>
                <td className="px-4 py-3">{comparison.scenarioA.deliveryMonth - comparison.scenarioB.deliveryMonth} ay</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
