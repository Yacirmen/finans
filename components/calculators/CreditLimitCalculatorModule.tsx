"use client";

import { useMemo, useState } from "react";
import { calculateCreditLimit, type CreditLimitType } from "../../lib/calculations/creditLimit";
import { formatPercentTr, formatTry } from "../../lib/formatters";

export function CreditLimitCalculatorModule() {
  const [form, setForm] = useState({
    income: "90000",
    debt: "15000",
    type: "Konut" as CreditLimitType,
    term: "120",
    rate: "2.8",
    ratio: "45",
    fee: "0",
  });

  const result = useMemo(
    () =>
      calculateCreditLimit({
        monthlyIncome: Number(form.income || 0),
        currentDebtPayments: Number(form.debt || 0),
        creditType: form.type,
        term: Number(form.term || 0),
        monthlyRate: Number(form.rate || 0),
        maxPaymentRatio: Number(form.ratio || 0),
        fee: Number(form.fee || 0),
      }),
    [form],
  );

  return (
    <main className="page-container py-8">
      <section className="rounded-[24px] border border-[#dce7e2] bg-white p-5 shadow-[0_14px_34px_rgba(31,43,37,0.06)] md:p-6">
        <h1 className="text-[30px] font-bold tracking-[-0.04em] text-[#172133]">Kredi Limit Modülü</h1>
        <p className="mt-3 max-w-[900px] text-[14px] leading-7 text-[#6f7d94]">
          Gelirinizi, mevcut borçlarınızı ve faiz/vade kombinasyonunu girin; yaklaşık kullanılabilir kredi limitini,
          geri ödeme yükünü ve risk seviyesini aynı ekranda görün.
        </p>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
        <article className="rounded-[22px] border border-[#dce7e2] bg-white p-5 shadow-[0_12px_30px_rgba(31,43,37,0.05)]">
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ["income", "Aylık net gelir"],
              ["debt", "Mevcut aylık kredi/borç ödemesi"],
              ["term", "Vade"],
              ["rate", "Aylık faiz oranı"],
              ["ratio", "Maksimum ödeme / gelir oranı (%)"],
              ["fee", "Kredi hariç masraf"],
            ].map(([key, label]) => (
              <label key={key} className="grid gap-2">
                <span className="form-label">{label}</span>
                <input
                  className="form-control !h-[46px] !rounded-[14px] !bg-white !font-medium"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form[key as keyof typeof form]}
                  onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                />
              </label>
            ))}

            <label className="grid gap-2">
              <span className="form-label">Kredi tipi</span>
              <select
                className="form-control !h-[46px] !rounded-[14px] !bg-white !font-medium"
                value={form.type}
                onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as CreditLimitType }))}
              >
                <option value="Konut">Konut</option>
                <option value="Taşıt">Taşıt</option>
                <option value="İhtiyaç">İhtiyaç</option>
              </select>
            </label>
          </div>
        </article>

        <div className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[18px] border border-[#dce7e2] bg-white p-4 shadow-[0_10px_24px_rgba(31,43,37,0.04)]">
              <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#7b8aa2]">Maksimum Ödenebilir Taksit</span>
              <strong className="mt-2 block text-[26px] font-black tracking-[-0.04em] text-[#172133]">{formatTry(result.maxAffordablePayment)}</strong>
            </div>
            <div className="rounded-[18px] border border-[#dce7e2] bg-white p-4 shadow-[0_10px_24px_rgba(31,43,37,0.04)]">
              <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#7b8aa2]">Kalan Ödeme Kapasitesi</span>
              <strong className="mt-2 block text-[26px] font-black tracking-[-0.04em] text-[#172133]">{formatTry(result.remainingCapacity)}</strong>
            </div>
            <div className="rounded-[18px] border border-[#d2efdf] bg-[#effdf5] p-4 shadow-[0_10px_24px_rgba(31,43,37,0.04)]">
              <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#168b53]">Tahmini Maksimum Kredi Limiti</span>
              <strong className="mt-2 block text-[26px] font-black tracking-[-0.04em] text-[#0f5636]">{formatTry(result.estimatedMaxPrincipal)}</strong>
            </div>
          </div>

          <div className="rounded-[22px] border border-[#dce7e2] bg-white p-5 shadow-[0_12px_30px_rgba(31,43,37,0.05)]">
            <h2 className="text-[20px] font-bold tracking-[-0.03em] text-[#172133]">Karar Özeti</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {[
                ["Toplam Geri Ödeme", formatTry(result.totalRepayment)],
                ["Aylık Taksit", formatTry(result.monthlyPayment)],
                ["Risk Seviyesi", result.riskLevel],
                ["Borç Yükü", formatPercentTr(result.debtRatio * 100)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[14px] border border-[#e6edf4] bg-[#fbfdff] px-4 py-3">
                  <span className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[#7b8aa2]">{label}</span>
                  <strong className="mt-2 block text-[18px] font-black text-[#172133]">{value}</strong>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[14px] leading-7 text-[#6f7d94]">
              Hesaplanan kredi limiti, seçilen gelir oranı ve mevcut borç yüküne göre yaklaşık bir üst sınır sunar.
              Nihai kredi tahsisi banka risk politikalarına göre değişebilir.
            </p>
            {result.warning ? (
              <div className="mt-4 rounded-[16px] border border-[#f2d7a7] bg-[#fff9e8] px-4 py-3 text-[13px] leading-6 text-[#8a6413]">
                {result.warning}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
