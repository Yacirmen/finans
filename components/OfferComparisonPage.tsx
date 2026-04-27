"use client";

import { useMemo, useState } from "react";
import {
  calculateOfferScenario,
  compareOfferScenarios,
  defaultScenarioA,
  defaultScenarioB,
  type OfferFinancingType,
  type OfferScenarioInput,
  type OfferScenarioResult,
} from "../lib/calculations/offerComparison";

type ScenarioKey = "A" | "B";
type ScenarioForm = Record<"home" | "down" | "org" | "term" | "disc" | "rent", string> & {
  type: OfferFinancingType;
};

const inputFields = [
  { key: "home", label: "Ev Değeri (TL)", decimals: 2 },
  { key: "down", label: "Peşinat Tutarı (TL)", decimals: 2 },
  { key: "org", label: "Organizasyon / Sistem Giriş Ücreti Oranı (%)", decimals: 4 },
  { key: "term", label: "Vade (Ay)", decimals: 0 },
  { key: "disc", label: "Aylık İskonto Oranı (%)", decimals: 4 },
  { key: "rent", label: "Teslim Öncesi Kira Ödüyorsanız (TL)", decimals: 2 },
] as const;

function parseTR(value: string | number | null | undefined) {
  return Number.parseFloat(String(value || "").replace(/\s/g, "").replace(/\./g, "").replace(",", ".")) || 0;
}

function inputFmt(value: number, decimals = 2) {
  return (Number.isFinite(value) ? value : 0).toLocaleString("tr-TR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

function formatLiveInput(value: string, decimals = 2) {
  const raw = String(value).replace(/[^0-9,.]/g, "");
  if (raw === "") return "";

  const lastComma = raw.lastIndexOf(",");
  let integerPart = "";
  let fractionPart = "";
  let hasDecimal = false;

  if (decimals > 0 && lastComma >= 0) {
    hasDecimal = true;
    integerPart = raw.slice(0, lastComma).replace(/[,.]/g, "");
    fractionPart = raw.slice(lastComma + 1).replace(/[,.]/g, "").slice(0, decimals);
  } else {
    integerPart = raw.replace(/[,.]/g, "");
  }

  if (integerPart === "") integerPart = "0";
  const formatted = Number(integerPart).toLocaleString("tr-TR");
  return hasDecimal ? `${formatted},${fractionPart}` : formatted;
}

function formatTL(value: number) {
  return `${(Number.isFinite(value) ? value : 0).toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} TL`;
}

function toForm(input: OfferScenarioInput): ScenarioForm {
  return {
    type: input.type,
    home: inputFmt(input.home, 2),
    down: inputFmt(input.down, 2),
    org: inputFmt(input.org, 4),
    term: inputFmt(input.term, 0),
    disc: inputFmt(input.disc, 4),
    rent: inputFmt(input.rent, 2),
  };
}

function toInput(form: ScenarioForm): OfferScenarioInput {
  return {
    type: form.type,
    home: parseTR(form.home),
    down: parseTR(form.down),
    org: parseTR(form.org),
    term: parseTR(form.term),
    disc: parseTR(form.disc),
    rent: parseTR(form.rent),
  };
}

function normalizeForm(form: ScenarioForm): ScenarioForm {
  return toForm(calculateOfferScenario(toInput(form)));
}

function Field({
  label,
  value,
  decimals,
  onChange,
  onBlur,
}: {
  label: string;
  value: string;
  decimals: number;
  onChange: (value: string) => void;
  onBlur: () => void;
}) {
  return (
    <label className="grid gap-2 md:grid-cols-[1.25fr_1fr] md:items-center">
      <span className="text-[14px] font-bold text-[#34435d]">{label}</span>
      <input
        className="h-12 w-full rounded-[12px] border border-[#d6dfeb] bg-white px-3 text-right text-[16px] text-[#071a3a] outline-none transition focus:border-[#1259b2] focus:ring-4 focus:ring-blue-100"
        inputMode="decimal"
        onBlur={onBlur}
        onChange={(event) => onChange(formatLiveInput(event.target.value, decimals))}
        value={value}
      />
    </label>
  );
}

function ScenarioInputCard({
  scenario,
  title,
  form,
  onChange,
  onCalculate,
  onReset,
}: {
  scenario: ScenarioKey;
  title: string;
  form: ScenarioForm;
  onChange: (next: ScenarioForm) => void;
  onCalculate: () => void;
  onReset: () => void;
}) {
  const update = (field: keyof ScenarioForm, value: string | OfferFinancingType) => {
    const next = { ...form, [field]: value };
    if (field === "type") {
      onChange(normalizeForm(next));
      return;
    }
    onChange(next);
  };

  return (
    <section className="overflow-hidden rounded-[20px] border border-[#e3eaf3] bg-white shadow-[0_14px_32px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between gap-4 border-b border-[#e3eaf3] px-5 py-[18px]">
        <h2 className="m-0 text-[20px] font-black tracking-[-0.02em] text-[#071a3a]">{title}</h2>
        <span className="rounded-full bg-[#1259b2] px-3 py-1.5 text-[12px] font-black text-white">{scenario}</span>
      </div>

      <div className="grid gap-[13px] p-5">
        <label className="grid gap-2 md:grid-cols-[1.25fr_1fr] md:items-center">
          <span className="text-[14px] font-bold text-[#34435d]">Finansman Türü</span>
          <select
            className="h-12 w-full rounded-[12px] border border-[#d6dfeb] bg-white px-3 text-[16px] text-[#071a3a] outline-none transition focus:border-[#1259b2] focus:ring-4 focus:ring-blue-100"
            onChange={(event) => update("type", event.target.value as OfferFinancingType)}
            value={form.type}
          >
            <option value="konut">Konut</option>
            <option value="arac">Araç</option>
          </select>
        </label>

        {inputFields.map((field) => (
          <Field
            decimals={field.decimals}
            key={field.key}
            label={field.label}
            onBlur={onCalculate}
            onChange={(value) => update(field.key, value)}
            value={form[field.key]}
          />
        ))}

        <p className="-mt-1 mb-1 text-[12px] text-[#64748b]">Vade sınırı: Konut max 120 ay, Araç max 60 ay.</p>

        <div className="mt-1 flex gap-2.5">
          <button
            className="rounded-[12px] bg-[#1889f2] px-[18px] py-3 text-[14px] font-black text-white transition hover:-translate-y-0.5 hover:bg-[#126fc8]"
            onClick={onCalculate}
            type="button"
          >
            HESAPLA
          </button>
          <button
            className="rounded-[12px] bg-[#e8eef6] px-[18px] py-3 text-[14px] font-black text-[#475569] transition hover:-translate-y-0.5 hover:bg-[#dce6f2]"
            onClick={onReset}
            type="button"
          >
            TEMİZLE
          </button>
        </div>
      </div>
    </section>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-[#e3eaf3] py-[13px] text-[16px] last:border-b-0">
      <span className="text-[#334155]">{label}</span>
      <b className="text-right font-black text-[#071a3a]">{value}</b>
    </div>
  );
}

function ResultCard({ title, result, winner }: { title: string; result: OfferScenarioResult; winner: boolean }) {
  return (
    <article
      className={`rounded-[20px] border bg-white p-5 shadow-[0_14px_32px_rgba(15,23,42,0.08)] ${
        winner ? "border-[2px] border-[rgba(7,134,75,0.3)] bg-[linear-gradient(180deg,#ffffff,#f2fff8)]" : "border-[#e3eaf3]"
      }`}
    >
      <h3 className="mb-4 text-[21px] font-black tracking-[-0.02em] text-[#071a3a]">{title}</h3>
      <ResultRow label="Finansmanın Bugünkü Maliyeti" value={formatTL(result.financingPV)} />
      <ResultRow label="Organizasyon/Sistem Giriş Ücreti + Peşinat" value={formatTL(result.orgPlusDown)} />
      <ResultRow label="Aylık Taksit" value={formatTL(result.monthly)} />
      <ResultRow label="Evin Teslim Zamanı" value={`${result.deliveryMonth}. Ay`} />
      <ResultRow label="Tüm Muhtemel Kiraların Bugünkü Değeri" value={formatTL(result.rentsPV)} />
      <ResultRow label="Toplam Geri Ödeme" value={formatTL(result.totalRepay)} />
      <ResultRow label="Toplam Maliyet" value={formatTL(result.totalCost)} />
      <ResultRow label="NPV Hesaplaması" value={formatTL(result.npv)} />
    </article>
  );
}

function diffClass(diff: number, higherGood = false) {
  if (higherGood) return diff >= 0 ? "text-[#07864b]" : "text-[#dc2626]";
  return diff <= 0 ? "text-[#07864b]" : "text-[#dc2626]";
}

export function OfferComparisonPage() {
  const [formA, setFormA] = useState<ScenarioForm>(() => toForm(defaultScenarioA));
  const [formB, setFormB] = useState<ScenarioForm>(() => toForm(defaultScenarioB));

  const comparison = useMemo(() => compareOfferScenarios(toInput(formA), toInput(formB)), [formA, formB]);
  const { scenarioA, scenarioB } = comparison;
  const winnerLabel = comparison.winner === "A" ? "Senaryo A" : "Senaryo B";

  const tableRows = [
    ["Finansmanın Bugünkü Maliyeti", scenarioA.financingPV, scenarioB.financingPV, false],
    ["Organizasyon + Peşinat", scenarioA.orgPlusDown, scenarioB.orgPlusDown, false],
    ["Tüm Aylık Ödemelerin Bugünkü Değeri", scenarioA.allPaymentsPV, scenarioB.allPaymentsPV, false],
    ["Tüm Muhtemel Kiraların Bugünkü Değeri", scenarioA.rentsPV, scenarioB.rentsPV, false],
    ["NPV", scenarioA.npv, scenarioB.npv, true],
  ] as const;

  return (
    <main className="bg-[#f4f7fb]">
      <div className="mx-auto max-w-[1220px] px-[18px] py-7">
        <section className="mb-[22px] flex items-end justify-between gap-4 max-[900px]:block">
          <div>
            <h1 className="m-0 text-[34px] font-black tracking-[-0.03em] text-[#071a3a] max-[900px]:text-[28px]">
              Teklif Karşılaştırma Modülü
            </h1>
            <p className="mt-2 text-[15px] text-[#64748b]">
              İki tasarruf finansman teklifini bugünkü değer ve NPV mantığıyla karşılaştırır.
            </p>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-[18px] max-[900px]:grid-cols-1">
          <ScenarioInputCard
            form={formA}
            onCalculate={() => setFormA((current) => normalizeForm(current))}
            onChange={setFormA}
            onReset={() => setFormA(toForm(defaultScenarioA))}
            scenario="A"
            title="Senaryo A – Evim Sistemleri"
          />
          <ScenarioInputCard
            form={formB}
            onCalculate={() => setFormB((current) => normalizeForm(current))}
            onChange={setFormB}
            onReset={() => setFormB(toForm(defaultScenarioB))}
            scenario="B"
            title="Senaryo B – Evim Sistemleri"
          />
        </section>

        <section className="my-5 grid grid-cols-3 gap-3.5 max-[900px]:grid-cols-1">
          <div className="rounded-[18px] border border-[#e3eaf3] bg-white p-[18px] shadow-[0_14px_32px_rgba(15,23,42,0.08)]">
            <span className="mb-2.5 block text-[14px] font-black text-[#53627c]">Daha Mantıklı Teklif</span>
            <strong className="text-[25px] font-black text-[#07864b]">{winnerLabel}</strong>
          </div>
          <div className="rounded-[18px] border border-[#e3eaf3] bg-white p-[18px] shadow-[0_14px_32px_rgba(15,23,42,0.08)]">
            <span className="mb-2.5 block text-[14px] font-black text-[#53627c]">NPV Farkı</span>
            <strong className="text-[25px] font-black text-[#1259b2]">{formatTL(comparison.npvDiff)}</strong>
          </div>
          <div className="rounded-[18px] border border-[#e3eaf3] bg-white p-[18px] shadow-[0_14px_32px_rgba(15,23,42,0.08)]">
            <span className="mb-2.5 block text-[14px] font-black text-[#53627c]">En Düşük Toplam Maliyet</span>
            <strong className="text-[25px] font-black text-[#c55b00]">{formatTL(comparison.bestCost)}</strong>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-[18px] max-[900px]:grid-cols-1">
          <ResultCard result={scenarioA} title="Senaryo A Sonuçları" winner={comparison.winner === "A"} />
          <ResultCard result={scenarioB} title="Senaryo B Sonuçları" winner={comparison.winner === "B"} />
        </section>

        <section className="mt-[18px] overflow-auto rounded-[20px] border border-[#e3eaf3] bg-white shadow-[0_14px_32px_rgba(15,23,42,0.08)]">
          <h2 className="m-0 border-b border-[#e3eaf3] px-5 py-[18px] text-[21px] font-black text-[#071a3a]">
            Karşılaştırma Özeti
          </h2>
          <table className="w-full min-w-[780px] border-collapse text-[14px]">
            <thead>
              <tr className="bg-[#f8fafc] text-[13px] uppercase tracking-[0.02em] text-[#334155]">
                <th className="border-b border-[#e3eaf3] px-[15px] py-[13px] text-left">Kalem</th>
                <th className="border-b border-[#e3eaf3] px-[15px] py-[13px] text-right">Senaryo A</th>
                <th className="border-b border-[#e3eaf3] px-[15px] py-[13px] text-right">Senaryo B</th>
                <th className="border-b border-[#e3eaf3] px-[15px] py-[13px] text-right">Fark (A-B)</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map(([label, a, b, higherGood]) => {
                const diff = a - b;
                return (
                  <tr key={label}>
                    <td className="border-b border-[#e3eaf3] px-[15px] py-[13px] text-left font-bold text-[#071a3a]">
                      {label}
                    </td>
                    <td className="border-b border-[#e3eaf3] px-[15px] py-[13px] text-right font-bold text-[#071a3a]">
                      {formatTL(a)}
                    </td>
                    <td className="border-b border-[#e3eaf3] px-[15px] py-[13px] text-right font-bold text-[#071a3a]">
                      {formatTL(b)}
                    </td>
                    <td className={`border-b border-[#e3eaf3] px-[15px] py-[13px] text-right font-black ${diffClass(diff, higherGood)}`}>
                      {formatTL(diff)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
