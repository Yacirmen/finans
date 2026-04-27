"use client";

import { useMemo, useState } from "react";

type PlannerFields = {
  vade: number;
  finansman: number;
  pesinat: number;
  enflasyon: number;
  kira: number;
  org: number;
  bsmv: number;
  kkdf: number;
};

type PlannerForm = Record<"vade" | "finansman" | "pesinat" | "enflasyon" | "kira" | "org", string>;

type PlanRow = {
  period: number;
  payment: number;
  paidAmount: number;
  paidRatio: number;
  rent: number;
  cashFlowPv: number;
  firstCashOutPv: number;
  remainingFinance: number;
  paymentsAndRentPv: number;
  npv: number;
};

const defaults: PlannerFields = {
  vade: 60,
  finansman: 5_000_000,
  pesinat: 2_000_000,
  enflasyon: 25,
  kira: 25_000,
  org: 0.085,
  bsmv: 0,
  kkdf: 0,
};

const fieldConfig: Array<{
  key: keyof PlannerForm;
  label: string;
  decimals: number;
  inputMode: "numeric" | "decimal";
}> = [
  { key: "finansman", label: "Finansman Tutarı", decimals: 2, inputMode: "decimal" },
  { key: "pesinat", label: "Peşinat Tutarı", decimals: 2, inputMode: "decimal" },
  { key: "enflasyon", label: "Enflasyon", decimals: 2, inputMode: "decimal" },
  { key: "kira", label: "Kira", decimals: 2, inputMode: "decimal" },
  { key: "org", label: "Organizasyon Ücreti Oranı", decimals: 3, inputMode: "decimal" },
];

function parseTR(value: string | number | null | undefined) {
  if (value === null || value === undefined) return 0;
  const cleaned = String(value).replace(/₺|%|\s/g, "").replace(/\./g, "").replace(",", ".");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNumber(value: number, decimals = 0) {
  const safeValue = Number.isFinite(value) ? value : 0;
  return safeValue.toLocaleString("tr-TR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function formatTL(value: number) {
  return `₺${formatNumber(value, 2)}`;
}

function formatPercent(value: number) {
  return `${formatNumber(value * 100, 2)}%`;
}

function excelPV(rate: number, nper: number, pmt = 0, fv = 0, type = 0) {
  if (!Number.isFinite(rate) || !Number.isFinite(nper)) return 0;
  if (Math.abs(rate) < 1e-12) return -(fv + pmt * nper);
  const pvif = Math.pow(1 + rate, nper);
  return -(fv + (pmt * (1 + rate * type) * (pvif - 1)) / rate) / pvif;
}

function formatFieldValue(value: number, decimals = 2) {
  return formatNumber(value, decimals);
}

function defaultsToForm(): PlannerForm {
  return {
    vade: formatNumber(defaults.vade, 0),
    finansman: formatFieldValue(defaults.finansman, 2),
    pesinat: formatFieldValue(defaults.pesinat, 2),
    enflasyon: formatFieldValue(defaults.enflasyon, 2),
    kira: formatFieldValue(defaults.kira, 2),
    org: formatFieldValue(defaults.org, 3),
  };
}

function formatDuringTyping(value: string, decimals = 2) {
  const hasComma = value.includes(",");
  const endsWithComma = value.endsWith(",");
  const [rawInteger = "", ...rawDecimals] = value.split(",");
  const integerPart = rawInteger.replace(/\D/g, "");
  const decimalPart = rawDecimals.join("").replace(/\D/g, "").slice(0, decimals);
  const formattedInteger = integerPart
    ? Number(integerPart).toLocaleString("tr-TR", { maximumFractionDigits: 0 })
    : "";

  if (endsWithComma) return `${formattedInteger},`;
  if (hasComma) return `${formattedInteger},${decimalPart}`;
  return formattedInteger;
}

function toFields(form: PlannerForm): PlannerFields {
  return {
    vade: Math.max(1, Math.round(parseTR(form.vade))),
    finansman: Math.max(0, parseTR(form.finansman)),
    pesinat: Math.max(0, parseTR(form.pesinat)),
    enflasyon: Math.max(0, parseTR(form.enflasyon)),
    kira: Math.max(0, parseTR(form.kira)),
    org: Math.max(0, parseTR(form.org)),
    bsmv: defaults.bsmv,
    kkdf: defaults.kkdf,
  };
}

function calculatePlan(form: PlannerForm, manualPayments: Record<number, string>) {
  const fields = toFields(form);
  const vade = fields.vade;
  const finansman = fields.finansman;
  const pesinat = Math.min(fields.pesinat, finansman);
  const remainingAfterDown = Math.max(0, finansman - pesinat);
  const organizationAndDown =
    pesinat + finansman * fields.org * (1 + fields.bsmv + fields.kkdf);
  const discountRate = fields.enflasyon / 12 / 100;
  const deliveryMonth = Math.max(5, Math.ceil(vade * 0.4 * (1 - pesinat / Math.max(finansman, 1))));
  const baseInstallment = vade ? remainingAfterDown / vade : 0;

  const rows: PlanRow[] = [];
  let previousPaidAmount = 0;

  for (let period = 0; period <= vade; period += 1) {
    let payment = 0;
    let paidAmount = 0;
    let paidRatio = 0;
    let rent = 0;
    let cashFlowPv = 0;
    let firstCashOutPv = 0;
    let remainingFinance = 0;
    let paymentsAndRentPv = 0;
    let npv = 0;

    if (period === 0) {
      payment = finansman * fields.org + pesinat;
      paidAmount = pesinat;
      paidRatio = finansman ? paidAmount / finansman : 0;
      cashFlowPv = -payment;
      firstCashOutPv = paidRatio < 0.4 ? -cashFlowPv : 0;
      remainingFinance = finansman - paidAmount;
      paymentsAndRentPv =
        excelPV(discountRate, period, -fields.kira, 0) + excelPV(discountRate, vade, -baseInstallment, 0);
      npv = paymentsAndRentPv + firstCashOutPv - remainingFinance;
    } else {
      const base = period === 1 ? pesinat : previousPaidAmount;
      const remaining = Math.max(0, finansman - base);
      const automaticPayment = Math.max(0.01, remaining / (vade - period + 1));
      const manualPayment = manualPayments[period] !== undefined ? parseTR(manualPayments[period]) : undefined;
      payment = manualPayment !== undefined ? Math.max(0, manualPayment) : automaticPayment;
      paidAmount = Math.min(finansman, base + payment);
      paidRatio = finansman ? paidAmount / finansman : 0;
      rent =
        paidRatio < 0.4
          ? fields.kira * Math.pow(1 + fields.enflasyon / 100, Math.floor((period - 1) / 12))
          : 0;
      cashFlowPv = excelPV(discountRate, period, 0, payment + rent);
      firstCashOutPv = paidRatio < 0.4 ? rows[0]?.firstCashOutPv ?? 0 : 0;
      remainingFinance = finansman - paidAmount;
      paymentsAndRentPv =
        excelPV(discountRate, period, -fields.kira, 0) + excelPV(discountRate, vade, -baseInstallment, 0);
      npv = paymentsAndRentPv + firstCashOutPv - remainingFinance;
    }

    previousPaidAmount = paidAmount;
    rows.push({
      period,
      payment,
      paidAmount,
      paidRatio,
      rent,
      cashFlowPv,
      firstCashOutPv,
      remainingFinance,
      paymentsAndRentPv,
      npv,
    });
  }

  const deliveryRow = rows[Math.min(deliveryMonth, rows.length - 1)] ?? rows[0];
  const bestRow = rows.reduce((best, row) => (row.npv > best.npv ? row : best), rows[0]);

  return {
    fields,
    rows,
    deliveryMonth,
    baseInstallment,
    organizationAndDown,
    deliveryRow,
    bestRow,
  };
}

export function CreditCalculatorModule() {
  const [form, setForm] = useState<PlannerForm>(() => defaultsToForm());
  const [manualPayments, setManualPayments] = useState<Record<number, string>>({});
  const result = useMemo(() => calculatePlan(form, manualPayments), [form, manualPayments]);

  function updateField(key: keyof PlannerForm, value: string, decimals = 2) {
    if (key === "vade") {
      setForm((current) => ({ ...current, vade: value.replace(/\D/g, "") }));
      return;
    }

    setForm((current) => ({ ...current, [key]: formatDuringTyping(value, decimals) }));
  }

  function normalizeField(key: keyof PlannerForm, decimals = 2) {
    setForm((current) => {
      const parsed = parseTR(current[key]);
      return {
        ...current,
        [key]: key === "vade" ? formatNumber(Math.max(1, Math.round(parsed)), 0) : formatNumber(parsed, decimals),
      };
    });
  }

  function resetDefaults() {
    setManualPayments({});
    setForm(defaultsToForm());
  }

  function normalizeAll() {
    setForm((current) => ({
      vade: formatNumber(Math.max(1, Math.round(parseTR(current.vade))), 0),
      finansman: formatNumber(parseTR(current.finansman), 2),
      pesinat: formatNumber(parseTR(current.pesinat), 2),
      enflasyon: formatNumber(parseTR(current.enflasyon), 2),
      kira: formatNumber(parseTR(current.kira), 2),
      org: formatNumber(parseTR(current.org), 3),
    }));
  }

  function updateManualPayment(period: number, value: string) {
    setManualPayments((current) => ({ ...current, [period]: formatDuringTyping(value, 2) }));
  }

  function normalizeManualPayment(period: number, value: string) {
    setManualPayments((current) => ({ ...current, [period]: formatNumber(parseTR(value), 2) }));
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#e6f2ff_0,#f7faff_35%,#f4f7fb_100%)] text-[#0f172a]">
      <div className="mx-auto max-w-[1180px] px-[18px] pb-[54px] pt-[34px]">
        <section className="mb-6 flex items-end justify-between gap-5 max-[900px]:block">
          <div>
            <div className="text-[12px] font-extrabold uppercase tracking-[0.16em] text-[#0f5ea8]">
              Premium hesaplama aracı
            </div>
            <h1 className="mb-1.5 mt-2 text-[34px] font-black leading-[1.05] tracking-[-0.04em] text-[#0b2443]">
              Tasarruf Finansman Hesaplama
            </h1>
            <p className="m-0 text-[15px] text-[#64748b]">
              Girişleri değiştirin; teslim ayı, taksit, NPV ve ödeme planı anında güncellensin.
            </p>
          </div>
          <div className="rounded-full bg-[#0b2443] px-4 py-[11px] text-[13px] font-bold text-white shadow-[0_22px_60px_rgba(15,23,42,0.10)] max-[900px]:mt-3 max-[900px]:inline-block">
            Bankacılık arayüzü · Canlı hesaplama
          </div>
        </section>

        <section className="grid gap-[22px] lg:grid-cols-[380px_1fr]">
          <aside className="self-start rounded-[26px] border border-[rgba(226,232,240,0.9)] bg-white/90 p-[22px] shadow-[0_22px_60px_rgba(15,23,42,0.10)] backdrop-blur-xl lg:sticky lg:top-[18px]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="m-0 text-[18px] font-black tracking-[-0.02em]">Girişler</h2>
              <span className="text-[12px] text-[#64748b]">A1:B20</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="mb-[13px] block">
                <span className="mb-[7px] block text-[13px] font-bold text-[#334155]">Finansman Vadesi</span>
                <input
                  className="h-[46px] w-full rounded-[15px] border border-[#e2e8f0] bg-[#f8fafc] px-[14px] text-[15px] font-bold text-[#0f172a] outline-none transition focus:border-[#2f80ed] focus:bg-white focus:shadow-[0_0_0_4px_rgba(47,128,237,0.12)]"
                  inputMode="numeric"
                  value={form.vade}
                  onBlur={() => normalizeField("vade", 0)}
                  onChange={(event) => updateField("vade", event.target.value, 0)}
                />
              </label>
              <label className="mb-[13px] block">
                <span className="mb-[7px] block text-[13px] font-bold text-[#334155]">
                  Tasarruf Finansman Teslim Ayı
                </span>
                <input
                  className="h-[46px] w-full rounded-[15px] border border-[#e2e8f0] bg-[#eef4fb] px-[14px] text-[15px] font-bold text-[#475569] outline-none"
                  readOnly
                  value={`${result.deliveryMonth}. Ay`}
                />
              </label>
            </div>

            {fieldConfig.map((field) => (
              <label className="mb-[13px] block" key={field.key}>
                <span className="mb-[7px] block text-[13px] font-bold text-[#334155]">{field.label}</span>
                <input
                  className="h-[46px] w-full rounded-[15px] border border-[#e2e8f0] bg-[#f8fafc] px-[14px] text-right text-[15px] font-bold text-[#0f172a] outline-none transition focus:border-[#2f80ed] focus:bg-white focus:shadow-[0_0_0_4px_rgba(47,128,237,0.12)]"
                  inputMode={field.inputMode}
                  value={form[field.key]}
                  onBlur={() => normalizeField(field.key, field.decimals)}
                  onChange={(event) => updateField(field.key, event.target.value, field.decimals)}
                />
              </label>
            ))}

            <div className="mt-4 flex gap-[10px]">
              <button
                className="h-[46px] flex-1 rounded-[15px] border-0 bg-[linear-gradient(135deg,#0b3a6f,#0f5ea8)] px-4 font-extrabold text-white transition hover:-translate-y-0.5"
                type="button"
                onClick={normalizeAll}
              >
                Hesapla
              </button>
              <button
                className="h-[46px] rounded-[15px] border-0 bg-[#eef4fb] px-4 font-extrabold text-[#0b3a6f] transition hover:-translate-y-0.5"
                type="button"
                onClick={resetDefaults}
              >
                Sıfırla
              </button>
            </div>
          </aside>

          <article className="rounded-[26px] border border-[rgba(226,232,240,0.9)] bg-white/90 p-[22px] shadow-[0_22px_60px_rgba(15,23,42,0.10)] backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="m-0 text-[18px] font-black tracking-[-0.02em]">Sonuçlar</h2>
              <span className="inline-flex items-center rounded-full bg-[#e9f7ef] px-[10px] py-[7px] text-[12px] font-extrabold text-[#047857]">
                Güncel
              </span>
            </div>

            <div className="mb-[18px] grid grid-cols-3 gap-[14px] max-[900px]:grid-cols-1">
              <div className="min-h-28 rounded-[22px] border border-[#e2e8f0] bg-[linear-gradient(135deg,#0b3a6f,#0f5ea8)] p-[17px] text-white">
                <small className="block text-[12px] font-bold text-white">Net Bugünkü Değer</small>
                <strong className="mt-3 block text-[24px] font-black text-white">
                  {formatTL(result.deliveryRow?.npv ?? 0)}
                </strong>
              </div>
              <div className="min-h-28 rounded-[22px] border border-[#e2e8f0] bg-[linear-gradient(180deg,#fff,#f8fbff)] p-[17px]">
                <small className="block text-[12px] font-bold text-[#64748b]">Taksit Tutarı</small>
                <strong className="mt-3 block text-[24px] font-black text-[#0b2443]">
                  {formatTL(result.baseInstallment)}
                </strong>
              </div>
              <div className="min-h-28 rounded-[22px] border border-[#e2e8f0] bg-[linear-gradient(180deg,#fff,#f8fbff)] p-[17px]">
                <small className="block text-[12px] font-bold text-[#64748b]">Kredinin Mantıklı Olacağı Ay</small>
                <strong className="mt-3 block text-[24px] font-black text-[#0b2443]">
                  {result.bestRow?.period ?? 0}. Ay
                </strong>
              </div>
            </div>

            <div className="mb-[18px] grid grid-cols-4 gap-3 max-[900px]:grid-cols-1">
              <div className="rounded-[18px] border border-[#e2e8f0] bg-[#f8fafc] p-[14px]">
                <small className="block text-[11px] font-bold text-[#64748b]">Organizasyon + Peşinat</small>
                <b className="mt-2 block text-[15px]">{formatTL(result.organizationAndDown)}</b>
              </div>
              <div className="rounded-[18px] border border-[#e2e8f0] bg-[#f8fafc] p-[14px]">
                <small className="block text-[11px] font-bold text-[#64748b]">Finansmanın Bugünkü Maliyeti</small>
                <b className="mt-2 block text-[15px]">{formatTL(result.deliveryRow?.remainingFinance ?? 0)}</b>
              </div>
              <div className="rounded-[18px] border border-[#e2e8f0] bg-[#f8fafc] p-[14px]">
                <small className="block text-[11px] font-bold text-[#64748b]">Ödemelerin Bugünkü Maliyeti</small>
                <b className="mt-2 block text-[15px]">{formatTL(result.deliveryRow?.paymentsAndRentPv ?? 0)}</b>
              </div>
              <div className="rounded-[18px] border border-[#e2e8f0] bg-[#f8fafc] p-[14px]">
                <small className="block text-[11px] font-bold text-[#64748b]">Tasarruf Finansman Teslim Ayı</small>
                <b className="mt-2 block text-[15px]">{result.deliveryMonth}. Ay</b>
              </div>
            </div>

            <div className="overflow-hidden rounded-[26px] border border-[rgba(226,232,240,0.9)] bg-white shadow-[0_22px_60px_rgba(15,23,42,0.10)]">
              <div className="flex items-center justify-between border-b border-[#e2e8f0] px-5 py-[18px]">
                <h3 className="m-0 text-[17px] font-black">Gösterilecek Plan</h3>
                <span className="text-[13px] text-[#64748b]">{result.rows.length} dönem</span>
              </div>
              <div className="max-h-[520px] overflow-auto">
                <table className="w-full border-separate border-spacing-0 text-[13px]">
                  <thead>
                    <tr>
                      <th className="sticky top-0 z-[1] border-b border-[#e2e8f0] bg-[#f1f5f9] p-3 text-center text-[12px] font-bold text-[#334155]">
                        Dönem
                      </th>
                      <th className="sticky top-0 z-[1] border-b border-[#e2e8f0] bg-[#f1f5f9] p-3 text-right text-[12px] font-bold text-[#334155]">
                        Taksit Tutarı
                      </th>
                      <th className="sticky top-0 z-[1] border-b border-[#e2e8f0] bg-[#f1f5f9] p-3 text-right text-[12px] font-bold text-[#334155]">
                        Ödenen %
                      </th>
                      <th className="sticky top-0 z-[1] border-b border-[#e2e8f0] bg-[#f1f5f9] p-3 text-right text-[12px] font-bold text-[#334155]">
                        NPV
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((row) => (
                      <tr className="even:bg-[#fbfdff]" key={row.period}>
                        <td className="border-b border-[#edf2f7] bg-inherit p-3 text-center">{row.period}</td>
                        <td className="border-b border-[#edf2f7] bg-inherit p-3 text-right">
                          {row.period === 0 ? (
                            formatTL(row.payment)
                          ) : (
                            <input
                              className="w-[132px] rounded-xl border border-[#dbe5f0] bg-white px-[10px] py-[9px] text-right text-[13px] font-extrabold text-[#0b2443] outline-none focus:border-[#2f80ed] focus:shadow-[0_0_0_3px_rgba(47,128,237,0.12)]"
                              inputMode="decimal"
                              value={
                                manualPayments[row.period] !== undefined
                                  ? manualPayments[row.period]
                                  : formatNumber(row.payment, 2)
                              }
                              onBlur={(event) => normalizeManualPayment(row.period, event.currentTarget.value)}
                              onChange={(event) => updateManualPayment(row.period, event.currentTarget.value)}
                            />
                          )}
                        </td>
                        <td className="border-b border-[#edf2f7] bg-inherit p-3 text-right">
                          {formatPercent(row.paidRatio)}
                        </td>
                        <td
                          className={`border-b border-[#edf2f7] bg-inherit p-3 text-right ${
                            row.npv < 0 ? "text-[#b91c1c]" : "text-[#047857]"
                          }`}
                        >
                          {formatTL(row.npv)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
