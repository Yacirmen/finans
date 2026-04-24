"use client";

import { useMemo, useState } from "react";
import {
  LOAN_PRESETS,
  compareLoanEngines,
  formatLoanResult,
  type LoanComparisonRow,
  type LoanPresetKey,
  type LoanScheduleComparisonRow,
} from "../lib/loanEngine";

const PRESET_OPTIONS = Object.entries(LOAN_PRESETS) as Array<
  [LoanPresetKey, (typeof LOAN_PRESETS)[LoanPresetKey]]
>;

const moneyFormatter = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat("tr-TR", {
  style: "percent",
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

function formatValue(value: number, format: "money" | "percent") {
  if (!Number.isFinite(value)) return "Hesaplanamadı";
  return format === "percent" ? percentFormatter.format(value) : moneyFormatter.format(value);
}

function formatDiff(row: LoanComparisonRow) {
  return row.format === "percent"
    ? percentFormatter.format(row.difference)
    : moneyFormatter.format(row.difference);
}

function SummaryColumn({
  title,
  values,
}: {
  title: string;
  values: ReturnType<typeof formatLoanResult>;
}) {
  const items = [
    ["Kredi Faizi BSMV+KKDF", formatValue(values.effectiveMonthlyRate, "percent")],
    ["Efektif Aylık Maliyet", formatValue(values.effectiveMonthlyCostRate, "percent")],
    ["Yıllık Faiz Maliyeti", formatValue(values.effectiveAnnualCost, "percent")],
    ["Taksit Tutarı", formatValue(values.monthlyPayment, "money")],
    ["Toplam Faiz Ödeme", formatValue(values.totalInterest, "money")],
    ["Toplam KKDF", formatValue(values.totalKKDF, "money")],
    ["Toplam BSMV", formatValue(values.totalBSMV, "money")],
    ["Toplam Faizli Geri Ödeme", formatValue(values.totalWithInterest, "money")],
    ["Kredi Kullandırım Sonrası Ele Geçen", formatValue(values.netDisbursed, "money")],
    ["Kredi Hariç Masraf", formatValue(values.fee, "money")],
    ["Toplam Taksit Ödemesi", formatValue(values.totalInstallmentPayment, "money")],
    ["Toplam Geri Ödeme", formatValue(values.totalRepayment, "money")],
    ["Toplam Kredi Maliyeti", formatValue(values.totalCreditCost, "money")],
  ];

  return (
    <article className="rounded-[22px] border border-[#dce7e2] bg-white p-5 shadow-[0_12px_30px_rgba(31,43,37,0.05)]">
      <h3 className="text-[20px] font-bold tracking-[-0.03em] text-[#172133]">{title}</h3>
      <div className="mt-4 grid gap-3">
        {items.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between gap-4 rounded-[14px] border border-[#e7eef5] bg-[#fbfdff] px-4 py-3"
          >
            <span className="text-[13px] font-medium text-[#6f7d94]">{label}</span>
            <strong className="text-[14px] font-bold text-[#1c2433]">{value}</strong>
          </div>
        ))}
      </div>
    </article>
  );
}

function ScheduleTable({
  rows,
  showAll,
}: {
  rows: LoanScheduleComparisonRow[];
  showAll: boolean;
}) {
  const visibleRows = showAll ? rows : rows.slice(0, 12);

  return (
    <div className="overflow-x-auto rounded-[18px] border border-[#edf2f7]">
      <table className="min-w-[1720px] text-left text-[13px]">
        <thead className="bg-[#fbfdff] text-[11px] font-bold uppercase tracking-[0.08em] text-[#74829a]">
          <tr>
            <th className="px-4 py-3">Dönem</th>
            <th className="px-4 py-3">Ref. Taksit</th>
            <th className="px-4 py-3">Proje Taksit</th>
            <th className="px-4 py-3">Fark</th>
            <th className="px-4 py-3">Ref. Anapara</th>
            <th className="px-4 py-3">Proje Anapara</th>
            <th className="px-4 py-3">Fark</th>
            <th className="px-4 py-3">Ref. Faiz</th>
            <th className="px-4 py-3">Proje Faiz</th>
            <th className="px-4 py-3">Fark</th>
            <th className="px-4 py-3">Ref. KKDF</th>
            <th className="px-4 py-3">Proje KKDF</th>
            <th className="px-4 py-3">Fark</th>
            <th className="px-4 py-3">Ref. BSMV</th>
            <th className="px-4 py-3">Proje BSMV</th>
            <th className="px-4 py-3">Fark</th>
            <th className="px-4 py-3">Ref. Kalan</th>
            <th className="px-4 py-3">Proje Kalan</th>
            <th className="px-4 py-3">Fark</th>
            <th className="px-4 py-3">Durum</th>
          </tr>
        </thead>
        <tbody>
          {visibleRows.map((row) => (
            <tr key={row.period} className="border-t border-[#edf2f7]">
              <td className="px-4 py-3">{row.period}</td>
              <td className="px-4 py-3">{moneyFormatter.format(row.referencePayment)}</td>
              <td className="px-4 py-3">{moneyFormatter.format(row.projectPayment)}</td>
              <td className="px-4 py-3">{moneyFormatter.format(row.paymentDiff)}</td>
              <td className="px-4 py-3">{moneyFormatter.format(row.referencePrincipal)}</td>
              <td className="px-4 py-3">{moneyFormatter.format(row.projectPrincipal)}</td>
              <td className="px-4 py-3">{moneyFormatter.format(row.principalDiff)}</td>
              <td className="px-4 py-3">{moneyFormatter.format(row.referenceInterest)}</td>
              <td className="px-4 py-3">{moneyFormatter.format(row.projectInterest)}</td>
              <td className="px-4 py-3">{moneyFormatter.format(row.interestDiff)}</td>
              <td className="px-4 py-3">{moneyFormatter.format(row.referenceKKDF)}</td>
              <td className="px-4 py-3">{moneyFormatter.format(row.projectKKDF)}</td>
              <td className="px-4 py-3">{moneyFormatter.format(row.kkdfDiff)}</td>
              <td className="px-4 py-3">{moneyFormatter.format(row.referenceBSMV)}</td>
              <td className="px-4 py-3">{moneyFormatter.format(row.projectBSMV)}</td>
              <td className="px-4 py-3">{moneyFormatter.format(row.bsmvDiff)}</td>
              <td className="px-4 py-3">{moneyFormatter.format(row.referenceRemaining)}</td>
              <td className="px-4 py-3">{moneyFormatter.format(row.projectRemaining)}</td>
              <td className="px-4 py-3">{moneyFormatter.format(row.remainingDiff)}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                    row.status === "OK"
                      ? "bg-[#eafbf1] text-[#168b53]"
                      : "bg-[#fff0ee] text-[#d34a3b]"
                  }`}
                >
                  {row.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LoanMathTestPage() {
  const [presetKey, setPresetKey] = useState<LoanPresetKey>("konut-evi-olmayan");
  const [showAllRows, setShowAllRows] = useState(false);
  const [form, setForm] = useState(() => {
    const preset = LOAN_PRESETS["konut-evi-olmayan"];
    return {
      principal: String(preset.principal),
      term: String(preset.term),
      rate: String(preset.rate),
      fee: String(preset.fee),
      bsmv: String(preset.bsmv),
      kkdf: String(preset.kkdf),
    };
  });

  const input = useMemo(
    () => ({
      principal: Number(form.principal || 0),
      term: Number(form.term || 0),
      rate: Number(form.rate || 0),
      fee: Number(form.fee || 0),
      bsmv: Number(form.bsmv || 0),
      kkdf: Number(form.kkdf || 0),
    }),
    [form],
  );

  const comparison = useMemo(() => compareLoanEngines(input), [input]);
  const referenceValues = useMemo(() => formatLoanResult(comparison.reference), [comparison.reference]);
  const projectValues = useMemo(() => formatLoanResult(comparison.project), [comparison.project]);

  return (
    <main className="page-container relative isolate py-7 md:py-8">
      <section className="rounded-[24px] border border-[#dce7e2] bg-white p-5 shadow-[0_14px_34px_rgba(31,43,37,0.06)] md:p-6">
        <h1 className="text-[28px] font-bold tracking-[-0.04em] text-[#172133] md:text-[34px]">
          Kredi Matematiği Test Alanı
        </h1>
        <p className="mt-3 max-w-[900px] text-[14px] leading-7 text-[#6f7d94]">
          Referans HTML matematiği ile proje kredi motorunu aynı girdilerle yan yana karşılaştırın.
          Bu alan tasarımı değiştirmez; sadece kredi kıyası sonuçlarının birebir kontrolünü sağlar.
        </p>
      </section>

      <section className="mt-8 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-[22px] border border-[#dce7e2] bg-white p-5 shadow-[0_12px_30px_rgba(31,43,37,0.05)]">
          <h2 className="text-[22px] font-bold tracking-[-0.03em] text-[#172133]">Test Girdileri</h2>
          <div className="mt-5 grid gap-4">
            <label className="grid gap-2">
              <span className="form-label">Kredi Türü</span>
              <select
                className="form-control !h-[46px] !rounded-[14px] !bg-white !font-medium"
                value={presetKey}
                onChange={(event) => {
                  const nextKey = event.target.value as LoanPresetKey;
                  const preset = LOAN_PRESETS[nextKey];
                  setPresetKey(nextKey);
                  setForm({
                    principal: String(preset.principal),
                    term: String(preset.term),
                    rate: String(preset.rate),
                    fee: String(preset.fee),
                    bsmv: String(preset.bsmv),
                    kkdf: String(preset.kkdf),
                  });
                }}
              >
                {PRESET_OPTIONS.map(([key, preset]) => (
                  <option key={key} value={key}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["principal", "Kredi Tutarı"],
                ["term", "Kredi Vadesi"],
                ["rate", "Kredi Faizi (% aylık)"],
                ["fee", "Kredi Hariç Masraf"],
                ["bsmv", "BSMV (%)"],
                ["kkdf", "KKDF (%)"],
              ].map(([key, label]) => (
                <label className="grid gap-2" key={key}>
                  <span className="form-label">{label}</span>
                  <input
                    className="form-control !h-[46px] !rounded-[14px] !bg-white !font-medium"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form[key as keyof typeof form]}
                    onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                  />
                </label>
              ))}
            </div>

            <div className="rounded-[16px] border border-[#dce7e2] bg-[#fbfdff] px-4 py-4 text-[13px] leading-6 text-[#6f7d94]">
              Referans HTML içindeki PMT, vergili aylık oran, ödeme planı ve RATE yaklaşımı burada
              korunur. Proje motoru aynı girdiyi daha güvenli toplam geri ödeme mantığı ile ayrıca hesaplar.
            </div>

            {comparison.warnings.length ? (
              <div className="rounded-[16px] border border-[#f2d7a7] bg-[#fff9e8] px-4 py-3 text-[13px] leading-6 text-[#8a6413]">
                {comparison.warnings.map((warning) => (
                  <p key={warning}>{warning}</p>
                ))}
              </div>
            ) : null}
          </div>
        </article>

        <div className="grid gap-5 xl:grid-cols-2">
          <SummaryColumn title="Referans HTML Matematiği" values={referenceValues} />
          <SummaryColumn title="Mevcut Proje Kredi Motoru" values={projectValues} />
        </div>
      </section>

      <section className="mt-8 space-y-5">
        <div className="max-w-[920px]">
          <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#16a05a]">Fark Analizi</span>
          <h2 className="mt-1 text-[28px] font-bold tracking-[-0.04em] text-[#172133]">
            Referans HTML ile proje motorunu satır satır kontrol edin
          </h2>
          <p className="mt-2 text-[14px] leading-6 text-[#66758c]">
            Parasal değerlerde 0,05 TL, yüzdesel değerlerde 0,0001 tolerans kullanılır. Referans HTML
            ile proje motoru arasındaki bilinçli fark en çok toplam geri ödeme tanımında görünür.
          </p>
        </div>

        <article className="rounded-[22px] border border-[#dce7e2] bg-white p-5 shadow-[0_12px_30px_rgba(31,43,37,0.05)]">
          <div className="overflow-x-auto">
            <table className="min-w-[940px] text-left text-[13px]">
              <thead className="bg-[#fbfdff] text-[11px] font-bold uppercase tracking-[0.08em] text-[#74829a]">
                <tr>
                  <th className="px-4 py-3">Metrik</th>
                  <th className="px-4 py-3">Referans HTML</th>
                  <th className="px-4 py-3">Proje Motoru</th>
                  <th className="px-4 py-3">Fark</th>
                  <th className="px-4 py-3">Durum</th>
                </tr>
              </thead>
              <tbody>
                {comparison.rows.map((row) => (
                  <tr key={row.key} className="border-t border-[#edf2f7]">
                    <td className="px-4 py-3 text-[#172133]">{row.label}</td>
                    <td className="px-4 py-3">{formatValue(row.reference, row.format)}</td>
                    <td className="px-4 py-3">{formatValue(row.project, row.format)}</td>
                    <td className="px-4 py-3">{formatDiff(row)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          row.status === "OK"
                            ? "bg-[#eafbf1] text-[#168b53]"
                            : "bg-[#fff0ee] text-[#d34a3b]"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="mt-8 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-[900px]">
            <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#16a05a]">Ödeme Planı</span>
            <h2 className="mt-1 text-[28px] font-bold tracking-[-0.04em] text-[#172133]">
              Referans ve proje amortisman planını karşılaştırın
            </h2>
            <p className="mt-2 text-[14px] leading-6 text-[#66758c]">
              İlk 12 ay görünümüyle hızlı kontrol yapabilir veya tüm planı açarak dönemsel farkları
              inceleyebilirsiniz.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-1 rounded-[14px] bg-[#eef3f8] p-1">
            <button
              type="button"
              onClick={() => setShowAllRows(false)}
              className={`rounded-[12px] px-4 py-2.5 text-[14px] font-semibold transition-all duration-200 ${
                !showAllRows
                  ? "bg-[#16a05a] text-white shadow-[0_10px_18px_rgba(22,160,90,0.18)]"
                  : "text-[#51627b] hover:bg-white/70"
              }`}
            >
              İlk 12 Ay
            </button>
            <button
              type="button"
              onClick={() => setShowAllRows(true)}
              className={`rounded-[12px] px-4 py-2.5 text-[14px] font-semibold transition-all duration-200 ${
                showAllRows
                  ? "bg-[#16a05a] text-white shadow-[0_10px_18px_rgba(22,160,90,0.18)]"
                  : "text-[#51627b] hover:bg-white/70"
              }`}
            >
              Tüm Plan
            </button>
          </div>
        </div>

        <article className="rounded-[22px] border border-[#dce7e2] bg-white p-5 shadow-[0_12px_30px_rgba(31,43,37,0.05)]">
          <ScheduleTable rows={comparison.scheduleRows} showAll={showAllRows} />
        </article>
      </section>
    </main>
  );
}
