"use client";

import { useMemo, useState } from "react";
import { formatPercentTr, formatTry } from "../../lib/formatters";
import { calculateLoanSummary, type LoanInput } from "../../lib/loanEngine";

type CreditModuleKey = "konut-ilk-evim" | "konut-evi-olan" | "tasit" | "ihtiyac";

type CreditFormState = {
  amount: string;
  term: string;
  rate: string;
  inflation: string;
  fee: string;
  bsmv: string;
  kkdf: string;
};

const modulePresets: Record<CreditModuleKey, LoanInput & { inflation: number; label: string }> = {
  "konut-ilk-evim": {
    label: "KONUT İLK EVİM",
    principal: 5_000_000,
    term: 84,
    rate: 2.7,
    inflation: 25,
    fee: 0,
    bsmv: 0,
    kkdf: 0,
  },
  "konut-evi-olan": {
    label: "KONUT EVİ OLAN",
    principal: 500_000,
    term: 60,
    rate: 2.85,
    inflation: 25,
    fee: 0,
    bsmv: 15,
    kkdf: 0,
  },
  tasit: {
    label: "TAŞIT",
    principal: 100_000,
    term: 12,
    rate: 3.45,
    inflation: 25,
    fee: 0,
    bsmv: 15,
    kkdf: 15,
  },
  ihtiyac: {
    label: "İHTİYAÇ",
    principal: 100_000,
    term: 12,
    rate: 4.19,
    inflation: 25,
    fee: 0,
    bsmv: 15,
    kkdf: 15,
  },
};

function monthlyDiscountRateFromReference(inflation: number) {
  return Math.max(0, inflation || 0) / 12 / 100;
}

function buildNetPresentValue(summary: ReturnType<typeof calculateLoanSummary>, inflation: number) {
  const discount = monthlyDiscountRateFromReference(inflation);
  const paymentPresentValue = summary.schedule.reduce((sum, row) => {
    const divisor = Math.pow(1 + discount, row.period);
    return sum + row.payment / (Number.isFinite(divisor) && divisor > 0 ? divisor : 1);
  }, 0);

  return summary.netDisbursed - paymentPresentValue;
}

function presetToForm(preset: CreditModuleKey): CreditFormState {
  const base = modulePresets[preset];
  return {
    amount: String(base.principal),
    term: String(base.term),
    rate: String(base.rate),
    inflation: String(base.inflation),
    fee: String(base.fee),
    bsmv: String(base.bsmv),
    kkdf: String(base.kkdf),
  };
}

function formToLoanInput(form: CreditFormState): LoanInput {
  return {
    principal: Number(form.amount || 0),
    term: Number(form.term || 0),
    rate: Number(form.rate || 0),
    fee: Number(form.fee || 0),
    bsmv: Number(form.bsmv || 0),
    kkdf: Number(form.kkdf || 0),
  };
}

export function CreditCalculatorModule() {
  const [preset, setPreset] = useState<CreditModuleKey>("konut-ilk-evim");
  const [form, setForm] = useState<CreditFormState>(() => presetToForm("konut-ilk-evim"));
  const [submitted, setSubmitted] = useState<CreditFormState>(() => presetToForm("konut-ilk-evim"));

  const input = useMemo(() => formToLoanInput(submitted), [submitted]);
  const summary = useMemo(() => calculateLoanSummary(input), [input]);
  const netPresentValue = useMemo(
    () => buildNetPresentValue(summary, Number(submitted.inflation || 0)),
    [summary, submitted.inflation],
  );

  const applyPreset = (nextPreset: CreditModuleKey) => {
    const nextForm = presetToForm(nextPreset);
    setPreset(nextPreset);
    setForm(nextForm);
    setSubmitted(nextForm);
  };

  const handleCalculate = () => {
    setSubmitted(form);
  };

  const handleReset = () => {
    applyPreset(preset);
  };

  return (
    <main className="page-container py-8">
      <section className="rounded-[24px] border border-[#dce7e2] bg-white p-5 shadow-[0_14px_34px_rgba(31,43,37,0.06)] md:p-6">
        <h1 className="text-[30px] font-bold tracking-[-0.04em] text-[#172133]">Kredi Hesaplama Modülü</h1>
        <p className="mt-3 max-w-[900px] text-[14px] leading-7 text-[#6f7d94]">
          Kredi taksiti, net bugünkü değer, toplam geri ödeme ve detaylı ödeme planını tek ekranda görün. Hesaplama
          motoru BSMV ve KKDF etkisini dönemsel olarak dikkate alır.
        </p>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
        <article className="rounded-[22px] border border-[#dce7e2] bg-white p-5 shadow-[0_12px_30px_rgba(31,43,37,0.05)]">
          <div className="grid gap-4">
            <label className="grid gap-2">
              <span className="form-label">Kredi Tipi</span>
              <select
                className="form-control !h-[46px] !rounded-[14px] !bg-white !font-medium"
                value={preset}
                onChange={(event) => applyPreset(event.target.value as CreditModuleKey)}
              >
                {Object.entries(modulePresets).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["amount", "Kredi Tutarı"],
                ["term", "Kredi Vadesi (Ay)"],
                ["rate", "Kredi Faizi (%)"],
                ["inflation", "Enflasyon (%)"],
                ["fee", "Kredi Hariç Masraf"],
                ["bsmv", "BSMV (%)"],
                ["kkdf", "KKDF (%)"],
              ].map(([key, label]) => (
                <label key={key} className="grid gap-2">
                  <span className="form-label">{label}</span>
                  <input
                    className="form-control !h-[46px] !rounded-[14px] !bg-white !font-medium"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form[key as keyof CreditFormState]}
                    onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                  />
                </label>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleCalculate}
                className="rounded-[12px] bg-[#1d74f5] px-5 py-3 text-[14px] font-semibold text-white shadow-[0_10px_20px_rgba(29,116,245,0.18)] transition hover:-translate-y-0.5 hover:bg-[#1265dd]"
              >
                Hesapla
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="rounded-[12px] bg-[#eaf1fb] px-5 py-3 text-[14px] font-semibold text-[#1c4e98] transition hover:-translate-y-0.5 hover:bg-[#dce8fb]"
              >
                Varsayılana Dön
              </button>
            </div>
          </div>
        </article>

        <div className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[18px] border border-[#d8e2ff] bg-[linear-gradient(135deg,#fff,#f3f7ff)] p-4 shadow-[0_10px_24px_rgba(31,43,37,0.04)]">
              <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#1f4fd8]">Net Bugünkü Değer</span>
              <strong className="mt-2 block text-[25px] font-black tracking-[-0.04em] text-[#1f4fd8]">
                {formatTry(netPresentValue)}
              </strong>
            </div>
            <div className="rounded-[18px] border border-[#dce7e2] bg-white p-4 shadow-[0_10px_24px_rgba(31,43,37,0.04)]">
              <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#7b8aa2]">Taksit Tutarı</span>
              <strong className="mt-2 block text-[25px] font-black tracking-[-0.04em] text-[#172133]">
                {formatTry(summary.monthlyPayment)}
              </strong>
            </div>
            <div className="rounded-[18px] border border-[#dce7e2] bg-white p-4 shadow-[0_10px_24px_rgba(31,43,37,0.04)]">
              <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#7b8aa2]">Yıllık Faiz Maliyeti</span>
              <strong className="mt-2 block text-[25px] font-black tracking-[-0.04em] text-[#172133]">
                {formatPercentTr(summary.effectiveAnnualCost * 100)}
              </strong>
            </div>
            <div className="rounded-[18px] border border-[#d2efdf] bg-[#effdf5] p-4 shadow-[0_10px_24px_rgba(31,43,37,0.04)]">
              <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#168b53]">Kullandırım Sonrası Ele Geçen</span>
              <strong className="mt-2 block text-[25px] font-black tracking-[-0.04em] text-[#0f5636]">
                {formatTry(summary.netDisbursed)}
              </strong>
            </div>
          </div>

          <div className="rounded-[22px] border border-[#dce7e2] bg-white p-5 shadow-[0_12px_30px_rgba(31,43,37,0.05)]">
            <h2 className="text-[20px] font-bold tracking-[-0.03em] text-[#172133]">Sonuçlar</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {[
                ["Net Bugünkü Değer", formatTry(netPresentValue)],
                ["Toplam Geri Ödeme", formatTry(summary.totalRepayment)],
                ["Toplam Taksit Ödemesi", formatTry(summary.totalInstallmentPayment)],
                ["Toplam Faizli Geri Ödeme", formatTry(summary.totalWithInterest)],
                ["Toplam Faiz", formatTry(summary.totalInterest)],
                ["Toplam KKDF", formatTry(summary.totalKKDF)],
                ["Toplam BSMV", formatTry(summary.totalBSMV)],
                ["Toplam Kredi Maliyeti", formatTry(summary.totalCreditCost)],
                ["Efektif Aylık Maliyet", formatPercentTr(summary.effectiveMonthlyCostRate * 100)],
                ["Kredi Hariç Masraf", formatTry(summary.fee)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[14px] border border-[#e6edf4] bg-[#fbfdff] px-4 py-3">
                  <span className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[#7b8aa2]">{label}</span>
                  <strong className="mt-2 block text-[18px] font-black text-[#172133]">{value}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[22px] border border-[#dce7e2] bg-white p-5 shadow-[0_12px_30px_rgba(31,43,37,0.05)]">
            <h2 className="text-[20px] font-bold tracking-[-0.03em] text-[#172133]">Ödeme Planı</h2>
            <div className="mt-4 overflow-x-auto rounded-[16px] border border-[#e8eef5]">
              <table className="min-w-[860px] text-left text-[13px]">
                <thead className="bg-[#fbfdff] text-[11px] font-bold uppercase tracking-[0.08em] text-[#74829a]">
                  <tr>
                    <th className="px-4 py-3">Dönem</th>
                    <th className="px-4 py-3">Taksit</th>
                    <th className="px-4 py-3">Anapara</th>
                    <th className="px-4 py-3">Faiz</th>
                    <th className="px-4 py-3">KKDF</th>
                    <th className="px-4 py-3">BSMV</th>
                    <th className="px-4 py-3">Kalan Anapara</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.schedule.map((row) => (
                    <tr key={row.period} className="border-t border-[#edf2f7]">
                      <td className="px-4 py-3">{row.period}</td>
                      <td className="px-4 py-3">{formatTry(row.payment)}</td>
                      <td className="px-4 py-3">{formatTry(row.principalPayment)}</td>
                      <td className="px-4 py-3">{formatTry(row.interest)}</td>
                      <td className="px-4 py-3">{formatTry(row.kkdfAmount)}</td>
                      <td className="px-4 py-3">{formatTry(row.bsmvAmount)}</td>
                      <td className="px-4 py-3">{formatTry(row.remainingPrincipal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
