"use client";

import { useMemo, useState } from "react";

type PlannerInputs = {
  vade: string;
  finansman: string;
  pesinat: string;
  enflasyon: string;
  kira: string;
  org: string;
};

type ParsedInputs = {
  vade: number;
  finansman: number;
  pesinat: number;
  enflasyon: number;
  kira: number;
  org: number;
  bsmv: number;
  kkdf: number;
};

type PlanRow = {
  period: number;
  installment: number;
  paidAmount: number;
  paidRatio: number;
  rent: number;
  cashFlowPv: number;
  initialOutIfBelowThreshold: number;
  remainingFinanceCost: number;
  paymentsPv: number;
  npv: number;
  manual: boolean;
};

type ComputedPlan = {
  inputs: ParsedInputs;
  rows: PlanRow[];
  deliveryMonth: number;
  monthlyInstallment: number;
  organizationAndDownPayment: number;
  selectedRow: PlanRow;
  bestRow: PlanRow;
};

const defaultInputs: PlannerInputs = {
  vade: "60",
  finansman: "5.000.000,00",
  pesinat: "2.000.000,00",
  enflasyon: "25,00",
  kira: "25.000,00",
  org: "0,085",
};

function parseTR(value: string | number | null | undefined) {
  if (value == null) return 0;
  const cleaned = String(value)
    .replace(/₺|%|\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNumber(value: number, decimals = 0) {
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Number.isFinite(value) ? value : 0);
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

function parseInputs(inputs: PlannerInputs): ParsedInputs {
  return {
    vade: Math.max(1, Math.round(parseTR(inputs.vade))),
    finansman: Math.max(0, parseTR(inputs.finansman)),
    pesinat: Math.max(0, parseTR(inputs.pesinat)),
    enflasyon: parseTR(inputs.enflasyon),
    kira: Math.max(0, parseTR(inputs.kira)),
    org: Math.max(0, parseTR(inputs.org)),
    bsmv: 0,
    kkdf: 0,
  };
}

function computePlan(inputs: PlannerInputs, manualInstallments: Record<number, number>): ComputedPlan {
  const x = parseInputs(inputs);
  const vade = x.vade;
  const fin = x.finansman;
  const pes = Math.min(x.pesinat, fin);
  const netFinancing = Math.max(0, fin - pes);
  const organizationAndDownPayment = pes + fin * x.org * (1 + x.bsmv + x.kkdf);
  const monthlyDiscount = x.enflasyon / 12 / 100;
  const deliveryMonth = Math.max(5, Math.ceil(vade * 0.4 * (1 - pes / Math.max(fin, 1))));
  const monthlyInstallment = vade ? netFinancing / vade : 0;

  const rows: PlanRow[] = [];
  let previousPaid = 0;

  for (let period = 0; period <= vade; period += 1) {
    let installment = 0;
    let paidAmount = 0;
    let paidRatio = 0;
    let rent = 0;
    let cashFlowPv = 0;
    let initialOutIfBelowThreshold = 0;
    let remainingFinanceCost = 0;
    let paymentsPv = 0;
    let npv = 0;

    if (period === 0) {
      installment = fin * x.org + pes;
      paidAmount = pes;
      paidRatio = fin ? paidAmount / fin : 0;
      rent = 0;
      cashFlowPv = -installment;
      initialOutIfBelowThreshold = paidRatio < 0.4 ? -cashFlowPv : 0;
      remainingFinanceCost = fin - paidAmount;
      paymentsPv = excelPV(monthlyDiscount, period, -x.kira, 0) + excelPV(monthlyDiscount, vade, -monthlyInstallment, 0);
      npv = paymentsPv + initialOutIfBelowThreshold - remainingFinanceCost;
    } else {
      const basePaid = period === 1 ? pes : previousPaid;
      const remaining = Math.max(0, fin - basePaid);
      const automaticInstallment = Math.max(0.01, remaining / (vade - period + 1));
      installment =
        manualInstallments[period] !== undefined && manualInstallments[period] !== null
          ? Math.max(0, manualInstallments[period])
          : automaticInstallment;
      paidAmount = Math.min(fin, basePaid + installment);
      paidRatio = fin ? paidAmount / fin : 0;
      rent = paidRatio < 0.4 ? x.kira * Math.pow(1 + x.enflasyon / 100, Math.floor((period - 1) / 12)) : 0;
      cashFlowPv = excelPV(monthlyDiscount, period, 0, installment + rent);
      initialOutIfBelowThreshold = paidRatio < 0.4 ? rows[0]?.initialOutIfBelowThreshold || 0 : 0;
      remainingFinanceCost = fin - paidAmount;
      paymentsPv = excelPV(monthlyDiscount, period, -x.kira, 0) + excelPV(monthlyDiscount, vade, -monthlyInstallment, 0);
      npv = paymentsPv + initialOutIfBelowThreshold - remainingFinanceCost;
    }

    previousPaid = paidAmount;
    rows.push({
      period,
      installment,
      paidAmount,
      paidRatio,
      rent,
      cashFlowPv,
      initialOutIfBelowThreshold,
      remainingFinanceCost,
      paymentsPv,
      npv,
      manual: manualInstallments[period] !== undefined,
    });
  }

  const selectedRow = rows[Math.min(deliveryMonth, rows.length - 1)] || rows[0];
  const bestRow = rows.reduce((best, row) => (row.npv > best.npv ? row : best), rows[0]);

  return {
    inputs: { ...x, pesinat: pes },
    rows,
    deliveryMonth,
    monthlyInstallment,
    organizationAndDownPayment,
    selectedRow,
    bestRow,
  };
}

function normalizeInput(name: keyof PlannerInputs, value: string) {
  const numberValue = parseTR(value);
  if (name === "vade") return formatNumber(Math.max(1, Math.round(numberValue)), 0);
  if (name === "org") return formatNumber(numberValue, 3);
  return formatNumber(numberValue, 2);
}

export function CalculatorSection() {
  const [inputs, setInputs] = useState<PlannerInputs>(defaultInputs);
  const [manualInstallments, setManualInstallments] = useState<Record<number, number>>({});

  const computed = useMemo(() => computePlan(inputs, manualInstallments), [inputs, manualInstallments]);

  function setField(name: keyof PlannerInputs, value: string) {
    setInputs((current) => ({ ...current, [name]: value }));
  }

  function resetDefaults() {
    setManualInstallments({});
    setInputs(defaultInputs);
  }

  function setManualInstallment(period: number, value: string) {
    const parsed = parseTR(value);
    setManualInstallments((current) => ({
      ...current,
      [period]: parsed,
    }));
  }

  const visibleRows = computed.rows;

  return (
    <section id="calculator" className="page-container py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[#0f5ea8]">Premium hesaplama aracı</p>
          <h1 className="mt-2 text-[34px] font-black leading-[1.05] tracking-[-0.05em] text-[#0b2443]">
            Tasarruf Finansman Hesaplama
          </h1>
          <p className="mt-2 text-[15px] leading-7 text-[#64748b]">
            Girişleri değiştirin; teslim ayı, taksit, NPV ve ödeme planı anında güncellensin.
          </p>
        </div>
        <span className="rounded-full bg-[#0b2443] px-4 py-3 text-[13px] font-bold text-white shadow-[0_22px_60px_rgba(15,23,42,0.10)]">
          Bankacılık arayüzü · Canlı hesaplama
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <aside className="self-start rounded-[26px] border border-[#e2e8f0]/90 bg-white/90 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.10)] backdrop-blur lg:sticky lg:top-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[18px] font-black text-[#0f172a]">Girişler</h2>
            <span className="text-[12px] font-semibold text-[#64748b]">A1:B20</span>
          </div>

          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-2 block text-[13px] font-bold text-[#334155]">Finansman Vadesi</span>
                <input
                  className="h-[46px] w-full rounded-[15px] border border-[#e2e8f0] bg-[#f8fafc] px-3 text-[15px] font-bold text-[#0f172a] outline-none transition focus:border-[#2f80ed] focus:bg-white focus:ring-4 focus:ring-[#2f80ed]/10"
                  value={inputs.vade}
                  onBlur={() => setField("vade", normalizeInput("vade", inputs.vade))}
                  onChange={(event) => setField("vade", event.target.value)}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-[13px] font-bold text-[#334155]">Tasarruf Finansman Teslim Ayı</span>
                <input
                  className="h-[46px] w-full rounded-[15px] border border-[#e2e8f0] bg-[#eef4fb] px-3 text-[15px] font-bold text-[#475569] outline-none"
                  readOnly
                  value={`${computed.deliveryMonth}. Ay`}
                />
              </label>
            </div>

            {[
              ["finansman", "Finansman Tutarı"],
              ["pesinat", "Peşinat Tutarı"],
              ["enflasyon", "Enflasyon"],
              ["kira", "Kira"],
              ["org", "Organizasyon Ücreti Oranı"],
            ].map(([name, label]) => (
              <label className="block" key={name}>
                <span className="mb-2 block text-[13px] font-bold text-[#334155]">{label}</span>
                <input
                  className="h-[46px] w-full rounded-[15px] border border-[#e2e8f0] bg-[#f8fafc] px-3 text-[15px] font-bold text-[#0f172a] outline-none transition focus:border-[#2f80ed] focus:bg-white focus:ring-4 focus:ring-[#2f80ed]/10"
                  value={inputs[name as keyof PlannerInputs]}
                  onBlur={() => setField(name as keyof PlannerInputs, normalizeInput(name as keyof PlannerInputs, inputs[name as keyof PlannerInputs]))}
                  onChange={(event) => setField(name as keyof PlannerInputs, event.target.value)}
                />
              </label>
            ))}
          </div>

          <div className="mt-4 flex gap-3">
            <button
              className="h-[46px] flex-1 rounded-[15px] bg-[linear-gradient(135deg,#0b3a6f,#0f5ea8)] px-4 text-[14px] font-black text-white shadow-[0_14px_26px_rgba(11,58,111,0.18)] transition hover:-translate-y-0.5"
              type="button"
            >
              Hesapla
            </button>
            <button
              className="h-[46px] rounded-[15px] bg-[#eef4fb] px-4 text-[14px] font-black text-[#0b3a6f] transition hover:-translate-y-0.5"
              onClick={resetDefaults}
              type="button"
            >
              Sıfırla
            </button>
          </div>
        </aside>

        <main className="rounded-[26px] border border-[#e2e8f0]/90 bg-white/90 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.10)] backdrop-blur">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-[18px] font-black text-[#0f172a]">Sonuçlar</h2>
            <span className="inline-flex rounded-full bg-[#e9f7ef] px-3 py-2 text-[12px] font-black text-[#047857]">Güncel</span>
          </div>

          <div className="mb-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-[22px] bg-[linear-gradient(135deg,#0b3a6f,#0f5ea8)] p-5 text-white">
              <small className="block text-[12px] font-bold text-white/85">Net Bugünkü Değer</small>
              <strong className="mt-3 block text-[26px] font-black tracking-[-0.04em]">{formatTL(computed.selectedRow.npv)}</strong>
            </div>
            <div className="rounded-[22px] border border-[#e2e8f0] bg-[linear-gradient(180deg,#fff,#f8fbff)] p-5">
              <small className="block text-[12px] font-bold text-[#64748b]">Taksit Tutarı</small>
              <strong className="mt-3 block text-[26px] font-black tracking-[-0.04em] text-[#0b2443]">
                {formatTL(computed.monthlyInstallment)}
              </strong>
            </div>
            <div className="rounded-[22px] border border-[#e2e8f0] bg-[linear-gradient(180deg,#fff,#f8fbff)] p-5">
              <small className="block text-[12px] font-bold text-[#64748b]">Kredinin Mantıklı Olacağı Ay</small>
              <strong className="mt-3 block text-[26px] font-black tracking-[-0.04em] text-[#0b2443]">
                {computed.bestRow.period}. Ay
              </strong>
            </div>
          </div>

          <div className="mb-5 grid gap-3 md:grid-cols-4">
            {[
              ["Organizasyon + Peşinat", formatTL(computed.organizationAndDownPayment)],
              ["Finansmanın Bugünkü Maliyeti", formatTL(computed.selectedRow.remainingFinanceCost)],
              ["Ödemelerin Bugünkü Maliyeti", formatTL(computed.selectedRow.paymentsPv)],
              ["Tasarruf Finansman Teslim Ayı", `${computed.deliveryMonth}. Ay`],
            ].map(([label, value]) => (
              <div className="rounded-[18px] border border-[#e2e8f0] bg-[#f8fafc] p-4" key={label}>
                <small className="block text-[11px] font-bold text-[#64748b]">{label}</small>
                <b className="mt-2 block text-[15px] text-[#0f172a]">{value}</b>
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-[22px] border border-[#e2e8f0] bg-white">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] px-5 py-4">
              <h3 className="text-[17px] font-black text-[#0f172a]">Gösterilecek Plan</h3>
              <span className="text-[13px] font-semibold text-[#64748b]">{visibleRows.length} dönem</span>
            </div>
            <div className="max-h-[520px] overflow-auto">
              <table className="w-full border-separate border-spacing-0">
                <thead>
                  <tr>
                    <th className="sticky top-0 z-10 border-b border-[#e2e8f0] bg-[#f1f5f9] p-3 text-center text-[12px] font-bold text-[#334155]">
                      Dönem
                    </th>
                    <th className="sticky top-0 z-10 border-b border-[#e2e8f0] bg-[#f1f5f9] p-3 text-right text-[12px] font-bold text-[#334155]">
                      Taksit Tutarı
                    </th>
                    <th className="sticky top-0 z-10 border-b border-[#e2e8f0] bg-[#f1f5f9] p-3 text-right text-[12px] font-bold text-[#334155]">
                      Ödenen %
                    </th>
                    <th className="sticky top-0 z-10 border-b border-[#e2e8f0] bg-[#f1f5f9] p-3 text-right text-[12px] font-bold text-[#334155]">
                      NPV
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row) => (
                    <tr key={row.period} className="even:bg-[#fbfdff]">
                      <td className="border-b border-[#edf2f7] bg-inherit p-3 text-center text-[13px]">{row.period}</td>
                      <td className="border-b border-[#edf2f7] bg-inherit p-3 text-right text-[13px]">
                        {row.period === 0 ? (
                          formatTL(row.installment)
                        ) : (
                          <input
                            className="w-[132px] rounded-[12px] border border-[#dbe5f0] bg-white px-3 py-2 text-right text-[13px] font-black text-[#0b2443] outline-none transition focus:border-[#2f80ed] focus:ring-4 focus:ring-[#2f80ed]/10"
                            value={formatNumber(row.installment, 2)}
                            onChange={(event) => setManualInstallment(row.period, event.target.value)}
                          />
                        )}
                      </td>
                      <td className="border-b border-[#edf2f7] bg-inherit p-3 text-right text-[13px]">{formatPercent(row.paidRatio)}</td>
                      <td
                        className={`border-b border-[#edf2f7] bg-inherit p-3 text-right text-[13px] font-bold ${
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
        </main>
      </div>
    </section>
  );
}
