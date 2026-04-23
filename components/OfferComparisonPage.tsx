"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  COMPANY_OPTIONS,
  DEFAULT_OFFER,
  type AssetType,
  type OfferResult,
  type OfferState,
  calculateOffer,
  exportRowsToCsv,
  formatMoney,
  formatPercent,
  parseCurrencyLike,
} from "../lib/comparisonEngine";

function ToggleField({
  checked,
  label,
  onClick,
  pulse,
  offerIndex,
  toggleName,
}: {
  checked: boolean;
  label: string;
  onClick: () => void;
  pulse?: boolean;
  offerIndex: 1 | 2;
  toggleName: string;
}) {
  return (
    <button
      aria-pressed={checked}
      className={`flex items-center gap-3 text-left text-[14px] font-medium text-[#5c6a7f] ${pulse ? "button-ack" : ""}`}
      data-compare-offer={offerIndex}
      data-compare-toggle={toggleName}
      data-compare-toggle-button={toggleName}
      data-on={checked ? "true" : "false"}
      onClick={onClick}
      type="button"
    >
      <span className={`pointer-events-none relative h-6 w-11 rounded-full transition-all duration-300 ${checked ? "bg-[#18a05a]" : "bg-[#d7e3ef]"}`}>
        <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-300 ${checked ? "left-6" : "left-1"}`} />
      </span>
      {label}
    </button>
  );
}

function StepHeading({ step, title, text }: { step: string; title: string; text: string }) {
  return (
    <div className="max-w-[860px]">
      <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#7b8aa2]">{step}</span>
      <h2 className="mt-2 text-[26px] font-bold tracking-[-0.03em] text-[#1b2332] md:text-[32px]">{title}</h2>
      <p className="mt-3 text-[15px] leading-7 text-[#6f7d94]">{text}</p>
    </div>
  );
}

function ComparisonInputCard({
  title,
  offerIndex,
  assetType,
  offer,
  onChange,
  activePulse,
  onPulse,
}: {
  title: string;
  offerIndex: 1 | 2;
  assetType: AssetType;
  offer: OfferState;
  onChange: (patch: Partial<OfferState>) => void;
  activePulse: string | null;
  onPulse: (key: string) => void;
}) {
  const priceLabel = assetType === "Konut" ? "Evin Fiyati (TL) *" : "Arac Fiyati (TL) *";
  const inputClass = "form-control !h-[44px] !rounded-[14px] !bg-white !font-medium";
  const isPulsing = (key: string) => activePulse?.startsWith(key) ?? false;

  return (
    <article
      className="relative isolate rounded-[24px] border border-[#dce7e2] bg-white p-5 shadow-[0_16px_34px_rgba(31,43,37,0.06)] md:p-6"
      data-compare-card={offerIndex}
    >
      <h3 className="text-[21px] font-bold tracking-[-0.03em] text-[#1d2534]">{title}</h3>

      <div className="mt-5 grid gap-5">
        <div>
          <span className="form-label">Finansman Modeli</span>
          <div className="relative z-10 grid grid-cols-2 rounded-[14px] bg-[#eef3f8] p-1">
            {[
              ["cekilissiz", "Cekilissiz"],
              ["cekilisli", "Cekilisli"],
            ].map(([value, label]) => (
              <button
                aria-pressed={offer.model === value}
                className={`segment-button relative z-10 cursor-pointer pointer-events-auto ${offer.model === value ? "active" : ""} ${
                  isPulsing(`${title}-model-${value}`) ? "button-ack" : ""
                }`}
                data-compare-model={value}
                data-compare-offer={offerIndex}
                key={value}
                onClick={() => {
                  onPulse(`${title}-model-${value}`);
                  onChange({ model: value as OfferState["model"] });
                }}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <label>
          <span className="form-label">Sirket Secimi</span>
          <select
            className={`${inputClass} relative z-10 cursor-pointer`}
            data-compare-field="company"
            data-compare-offer={offerIndex}
            onChange={(event) => onChange({ company: event.target.value })}
            value={offer.company}
          >
            {COMPANY_OPTIONS.map((company) => (
              <option key={company} value={company}>
                {company}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-5 md:grid-cols-2">
          <label>
            <span className="form-label">{priceLabel}</span>
            <input
              className={`${inputClass} relative z-10`}
              data-compare-field="assetPrice"
              data-compare-offer={offerIndex}
              onChange={(event) => onChange({ assetPrice: event.target.value })}
              value={offer.assetPrice}
            />
          </label>
          <label>
            <span className="form-label">Pesinat (TL)</span>
            <input
              className={`${inputClass} relative z-10`}
              data-compare-field="downPayment"
              data-compare-offer={offerIndex}
              onChange={(event) => onChange({ downPayment: event.target.value })}
              value={offer.downPayment}
            />
          </label>
          <label>
            <span className="form-label">Taksit (Ay) *</span>
            <input
              className={`${inputClass} relative z-10`}
              data-compare-field="term"
              data-compare-offer={offerIndex}
              onChange={(event) => onChange({ term: event.target.value })}
              value={offer.term}
            />
            <span className="mt-2 block text-[12px] text-[#8b99aa]">Araclar max 60, Konutlar max 120 ay.</span>
          </label>
          <label>
            <span className="form-label">Aylik Odeme *</span>
            <input
              className={`${inputClass} relative z-10`}
              data-compare-field="monthlyPayment"
              data-compare-offer={offerIndex}
              onChange={(event) => onChange({ monthlyPayment: event.target.value })}
              value={offer.monthlyPayment}
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-6">
          <ToggleField
            checked={offer.escalating}
            label="Artisli Taksit Plani"
            offerIndex={offerIndex}
            onClick={() => {
              onPulse(`${title}-toggle-escalating`);
              onChange({ escalating: !offer.escalating });
            }}
            pulse={isPulsing(`${title}-toggle-escalating`)}
            toggleName="escalating"
          />
          <ToggleField
            checked={offer.manualPlan}
            label="Manuel Plan Olustur"
            offerIndex={offerIndex}
            onClick={() => {
              onPulse(`${title}-toggle-manualPlan`);
              onChange({ manualPlan: !offer.manualPlan });
            }}
            pulse={isPulsing(`${title}-toggle-manualPlan`)}
            toggleName="manualPlan"
          />
        </div>

        {offer.manualPlan ? (
          <label>
            <span className="form-label">Manuel Odeme Plani</span>
            <textarea
              className="form-control relative z-10 min-h-[100px] !rounded-[16px] !py-3 text-[14px] font-medium"
              data-compare-field="manualPlanText"
              data-compare-offer={offerIndex}
              onChange={(event) => onChange({ manualPlanText: event.target.value })}
              placeholder="41.667, 41.667, 55.000 ..."
              value={offer.manualPlanText}
            />
          </label>
        ) : null}

        <div className="grid gap-5 md:grid-cols-3">
          <label>
            <span className="form-label">Teslim Ayi</span>
            <input
              className={`${inputClass} relative z-10`}
              data-compare-field="delivery"
              data-compare-offer={offerIndex}
              onChange={(event) => onChange({ delivery: event.target.value })}
              value={offer.delivery}
            />
          </label>
          <label>
            <span className="form-label">Hizmet Bedeli (%)</span>
            <input
              className={`${inputClass} relative z-10`}
              data-compare-field="serviceFee"
              data-compare-offer={offerIndex}
              onChange={(event) => onChange({ serviceFee: event.target.value })}
              value={offer.serviceFee}
            />
          </label>
          <label>
            <span className="form-label">Kira (TL/ay)</span>
            <input
              className={`${inputClass} relative z-10`}
              data-compare-field="rent"
              data-compare-offer={offerIndex}
              onChange={(event) => onChange({ rent: event.target.value })}
              value={offer.rent}
            />
          </label>
        </div>

        <details
          className="rounded-[18px] border border-[#e6edf5] bg-[#fbfdff] p-4"
          onToggle={(event) => onChange({ advancedOpen: (event.currentTarget as HTMLDetailsElement).open })}
          open={offer.advancedOpen}
        >
          <summary className="relative z-10 cursor-pointer text-[14px] font-bold uppercase tracking-[0.08em] text-[#74829a]">Gelismis Parametreler</summary>
          <div className="mt-4 grid gap-5 md:grid-cols-3">
            <label className="flex flex-col">
              <span className="form-label min-h-[34px]">Yillik Enflasyon (%)</span>
              <input
                className={`${inputClass} relative z-10`}
                data-compare-field="inflation"
                data-compare-offer={offerIndex}
                onChange={(event) => onChange({ inflation: event.target.value })}
                value={offer.inflation}
              />
            </label>
            <label className="flex flex-col">
              <span className="form-label min-h-[34px]">Kredi Faizi (% / ay)</span>
              <input
                className={`${inputClass} relative z-10`}
                data-compare-field="creditRate"
                data-compare-offer={offerIndex}
                onChange={(event) => onChange({ creditRate: event.target.value })}
                value={offer.creditRate}
              />
            </label>
            <label className="flex flex-col">
              <span className="form-label min-h-[34px]">Yillik Taksit Artisi (%)</span>
              <input
                className={`${inputClass} relative z-10`}
                data-compare-field="yearlyIncrease"
                data-compare-offer={offerIndex}
                onChange={(event) => onChange({ yearlyIncrease: event.target.value })}
                value={offer.yearlyIncrease}
              />
            </label>
          </div>
        </details>

        <div className="rounded-[18px] border border-[#dbe6f1] bg-[#f9fbfe] p-4">
          <ToggleField
            checked={offer.compareBank}
            label="Tasarruf Finansmani ile Konut Kredisini Kiyasla"
            offerIndex={offerIndex}
            onClick={() => {
              onPulse(`${title}-toggle-compareBank`);
              onChange({ compareBank: !offer.compareBank });
            }}
            pulse={isPulsing(`${title}-toggle-compareBank`)}
            toggleName="compareBank"
          />

          {offer.compareBank ? (
            <div className="mt-4 grid gap-4 md:grid-cols-[1.2fr_0.7fr_0.7fr]">
              <label>
                <span className="form-label">Kredi Tutari (TL)</span>
                <input
                  className={`${inputClass} relative z-10`}
                  data-compare-field="bankAmount"
                  data-compare-offer={offerIndex}
                  onChange={(event) => onChange({ bankAmount: event.target.value })}
                  value={offer.bankAmount}
                />
              </label>
              <label>
                <span className="form-label">Aylik Faiz (%)</span>
                <input
                  className={`${inputClass} relative z-10`}
                  data-compare-field="bankRate"
                  data-compare-offer={offerIndex}
                  onChange={(event) => onChange({ bankRate: event.target.value })}
                  value={offer.bankRate}
                />
              </label>
              <label>
                <span className="form-label">Vade (Ay)</span>
                <input
                  className={`${inputClass} relative z-10`}
                  data-compare-field="bankTerm"
                  data-compare-offer={offerIndex}
                  onChange={(event) => onChange({ bankTerm: event.target.value })}
                  value={offer.bankTerm}
                />
              </label>
              {assetType === "Konut" ? (
                <label className="md:col-span-2">
                  <span className="form-label">Konut Sahipligi</span>
                  <select
                    className={`${inputClass} relative z-10 cursor-pointer`}
                    data-compare-field="bankHousingStatus"
                    data-compare-offer={offerIndex}
                    onChange={(event) => onChange({ bankHousingStatus: event.target.value as OfferState["bankHousingStatus"] })}
                    value={offer.bankHousingStatus}
                  >
                    <option value="yok">Evi yok</option>
                    <option value="var">Evi var</option>
                  </select>
                </label>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function ResultCard({
  offerLabel,
  offerIndex,
  offer,
  result,
  highlighted,
}: {
  offerLabel: string;
  offerIndex: 1 | 2;
  offer: OfferState;
  result?: OfferResult;
  highlighted: boolean;
}) {
  return (
    <div data-compare-result-root={offerIndex}>
      <article
        className={`rounded-[24px] border p-6 shadow-[0_16px_38px_rgba(31,43,37,0.06)] transition-all duration-300 ${
          highlighted ? "border-[#b8ebcc] bg-[linear-gradient(180deg,#fbfffd_0%,#f0fbf5_100%)] shadow-[0_18px_48px_rgba(24,160,90,0.14)]" : "border-[#dce7e2] bg-white"
        }`}
        data-compare-result-card={offerIndex}
        data-highlighted={highlighted ? "true" : "false"}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#7b8aa2]">{offerLabel}</span>
            <h3 className="mt-2 text-[22px] font-bold tracking-[-0.03em] text-[#1c2433]" data-compare-result-field="company">
              {result ? offer.company : "Sonuc ekrani"}
            </h3>
            <p className="mt-1 text-sm text-[#6f7d94]" data-compare-result-field="model">
              {result ? (offer.model === "cekilisli" ? "Cekilisli model" : "Cekilissiz model") : ""}
            </p>
          </div>
          <span className={`rounded-full bg-[#e7fbef] px-3 py-1 text-[12px] font-semibold text-[#168b53] ${highlighted ? "" : "hidden"}`} data-compare-result-winner>
            En dusuk NBM
          </span>
        </div>

        <div className={`${result ? "hidden" : ""} mt-5 rounded-[18px] border border-dashed border-[#d9e4ee] bg-[#fbfdff] p-5 text-sm leading-7 text-[#72819a]`} data-compare-result-empty>
          Lutfen hesaplama parametrelerini doldurun. Sonuclariniz burada listelenecektir.
        </div>

        <div className={`${result ? "" : "hidden"}`} data-compare-result-content>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-[16px] border border-[#e6edf5] bg-[#fbfdff] px-4 py-4">
              <span className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[#74829a]">Baslangic Cikisi</span>
              <strong className="mt-2 block text-[24px] font-black tracking-[-0.04em] text-[#1b2433]" data-compare-result-field="initialOutflow">
                {result ? formatMoney(result.initialOutflow) : "-"}
              </strong>
            </div>
            <div className="rounded-[16px] border border-[#e6edf5] bg-[#fbfdff] px-4 py-4">
              <span className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[#74829a]">Vade</span>
              <strong className="mt-2 block text-[24px] font-black tracking-[-0.04em] text-[#1b2433]" data-compare-result-field="term">
                {result ? `${parseCurrencyLike(offer.term)} ay` : "-"}
              </strong>
            </div>
            <div className="rounded-[16px] border border-[#e6edf5] bg-[#fbfdff] px-4 py-4">
              <span className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[#74829a]">Aylik Odeme</span>
              <strong className="mt-2 block text-[24px] font-black tracking-[-0.04em] text-[#1b2433]" data-compare-result-field="monthlyPayment">
                {result ? formatMoney(parseCurrencyLike(offer.monthlyPayment)) : "-"}
              </strong>
            </div>
            <div className="rounded-[16px] border border-[#e6edf5] bg-[#fbfdff] px-4 py-4">
              <span className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[#74829a]">Toplam Geri Odeme</span>
              <strong className="mt-2 block text-[24px] font-black tracking-[-0.04em] text-[#1b2433]" data-compare-result-field="totalRepayment">
                {result ? formatMoney(result.totalRepayment) : "-"}
              </strong>
            </div>
          </div>

          <div className="mt-5 rounded-[18px] border border-[#dce7e2] bg-[#f8fbff] p-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <span className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[#74829a]">Toplam Nakit Cikisi</span>
                <strong className="mt-2 block text-[28px] font-black tracking-[-0.05em] text-[#1c2433]" data-compare-result-field="totalOutflow">
                  {result ? formatMoney(result.totalOutflow) : "-"}
                </strong>
              </div>
              <div>
                <span className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[#74829a]">Net Bugunku Maliyet (NBM)</span>
                <strong className={`mt-2 block text-[28px] font-black tracking-[-0.05em] ${highlighted ? "text-[#168b53]" : "text-[#1c2433]"}`} data-compare-result-field="nbm">
                  {result ? formatMoney(result.nbm) : "-"}
                </strong>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 text-sm text-[#6f7d94]">
            <div className="flex items-center justify-between gap-4 rounded-[14px] border border-[#edf2f7] px-4 py-3">
              <span>Pesinat</span>
              <strong className="text-[#1c2433]" data-compare-result-field="downPayment">
                {result ? formatMoney(parseCurrencyLike(offer.downPayment)) : "-"}
              </strong>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-[14px] border border-[#edf2f7] px-4 py-3">
              <span>Hizmet Bedeli</span>
              <strong className="text-[#1c2433]" data-compare-result-field="serviceFee">
                {result ? formatPercent(parseCurrencyLike(offer.serviceFee)) : "-"}
              </strong>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-[14px] border border-[#edf2f7] px-4 py-3">
              <span>Kontrat / Finansman Tutari</span>
              <strong className="text-[#1c2433]" data-compare-result-field="contractAmount">
                {result ? formatMoney(result.contractAmount) : "-"}
              </strong>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-[14px] border border-[#edf2f7] px-4 py-3">
              <span>Teslim Ayi</span>
              <strong className="text-[#1c2433]" data-compare-result-field="delivery">
                {result ? `${parseCurrencyLike(offer.delivery)}. ay` : "-"}
              </strong>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-[14px] border border-[#edf2f7] px-4 py-3">
              <span>Otomatik Teslim Onerisi</span>
              <strong className="text-[#1c2433]" data-compare-result-field="suggestedDelivery">
                {result ? `${result.suggestedDelivery}. ay` : "-"}
              </strong>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-[14px] border border-[#edf2f7] px-4 py-3">
              <span>Bugunku Deger (Fayda)</span>
              <strong className="text-[#1c2433]" data-compare-result-field="pvBenefit">
                {result ? formatMoney(result.pvBenefit) : "-"}
              </strong>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-[14px] border border-[#edf2f7] px-4 py-3">
              <span>Karar Skoru (NPV)</span>
              <strong className={`${highlighted ? "text-[#168b53]" : "text-[#1c2433]"}`} data-compare-result-field="score">
                {result ? formatMoney(result.score) : "-"}
              </strong>
            </div>
          </div>

          <div className={`${result?.bankSummary ? "" : "hidden"} mt-5 rounded-[18px] border border-[#d8e3f1] bg-[#fbfdff] p-5`} data-compare-bank-summary>
            <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#74829a]">Kredi Kiyasi</span>
            <div className="mt-3 grid gap-3 text-sm text-[#6f7d94]">
              <div className="flex items-center justify-between gap-4">
                <span>Aylik Kredi Taksiti</span>
                <strong className="text-[#1c2433]" data-compare-result-field="bankInstallment">
                  {result?.bankSummary ? formatMoney(result.bankSummary.installment) : "-"}
                </strong>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Toplam Geri Odeme</span>
                <strong className="text-[#1c2433]" data-compare-result-field="bankTotalRepayment">
                  {result?.bankSummary ? formatMoney(result.bankSummary.totalRepayment) : "-"}
                </strong>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Yillik Efektif Maliyet</span>
                <strong className="text-[#1c2433]" data-compare-result-field="bankAnnualEffectiveCost">
                  {result?.bankSummary ? formatPercent(result.bankSummary.annualEffectiveCost * 100, 2) : "-"}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

function CashflowBlock({
  title,
  offerIndex,
  rows,
  onExport,
}: {
  title: string;
  offerIndex: 1 | 2;
  rows?: OfferResult["cashflow"];
  onExport: () => void;
}) {
  return (
    <article className="rounded-[24px] border border-[#dce7e2] bg-white p-5 shadow-[0_16px_38px_rgba(31,43,37,0.06)] md:p-6" data-compare-cashflow-root={offerIndex}>
      <h3 className="text-[22px] font-bold tracking-[-0.03em] text-[#1c2433]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[#6f7d94]">
        Asagidaki tablo, nominal Turk Lirasi cinsinden cebinizden cikacak tutarlari gosterir. Kira her 12 ayda bir enflasyon kadar artar.
      </p>

      <div className={`${rows ? "hidden" : ""} mt-5 rounded-[18px] border border-dashed border-[#d9e4ee] bg-[#fbfdff] p-5 text-sm leading-7 text-[#72819a]`} data-compare-cashflow-empty>
        Nakit akisi tablosu hesaplandiktan sonra burada gorunecektir.
      </div>

      <div className={`${rows ? "" : "hidden"} mt-5 overflow-x-auto rounded-[18px] border border-[#edf2f7]`} data-compare-cashflow-table>
        <table className="min-w-full text-left">
          <thead className="bg-[#f8fbff]">
            <tr className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#74829a]">
              <th className="px-4 py-4">Ay</th>
              <th className="px-4 py-4">Taksit</th>
              <th className="px-4 py-4">Kira</th>
              <th className="px-4 py-4">Hizmet Bedeli</th>
              <th className="px-4 py-4">Kumulatif Cikis</th>
              <th className="px-4 py-4">Bugunku Deger</th>
            </tr>
          </thead>
          <tbody data-compare-cashflow-body>
            {rows?.map((row) => (
              <tr className="border-t border-[#edf2f7]" key={row.month}>
                <td className="px-4 py-4 text-sm text-[#1c2433]">{row.month}</td>
                <td className="px-4 py-4 text-sm text-[#1c2433]">{formatMoney(row.installment)}</td>
                <td className="px-4 py-4 text-sm text-[#1c2433]">{formatMoney(row.rent)}</td>
                <td className="px-4 py-4 text-sm text-[#1c2433]">{formatMoney(row.serviceFee)}</td>
                <td className="px-4 py-4 text-sm font-medium text-[#1c2433]">{formatMoney(row.cumulativeOutflow)}</td>
                <td className="px-4 py-4 text-sm font-medium text-[#168b53]">{formatMoney(row.presentValue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        className={`mt-5 rounded-[12px] bg-[#16a05a] px-5 py-3 text-[14px] font-bold text-white shadow-[0_12px_22px_rgba(22,160,90,0.18)] transition-all duration-300 hover:bg-[#12874b] ${rows ? "" : "hidden"}`}
        data-compare-export={offerIndex}
        onClick={onExport}
        type="button"
      >
        Excel Olarak Indir
      </button>
    </article>
  );
}

export function OfferComparisonPage() {
  const rootRef = useRef<HTMLElement | null>(null);
  const resultsRef = useRef<HTMLElement | null>(null);
  const [assetType, setAssetType] = useState<AssetType>("Konut");
  const [offerOne, setOfferOne] = useState<OfferState>(DEFAULT_OFFER);
  const [offerTwo, setOfferTwo] = useState<OfferState>({ ...DEFAULT_OFFER, company: "Diger" });
  const [calculated, setCalculated] = useState(false);
  const [activePulse, setActivePulse] = useState<string | null>(null);
  const [calculatingAck, setCalculatingAck] = useState(false);

  const results = useMemo(() => {
    if (!calculated) return null;
    return [calculateOffer(assetType, offerOne), calculateOffer(assetType, offerTwo)] as [OfferResult, OfferResult];
  }, [assetType, calculated, offerOne, offerTwo]);

  const winnerIndex = useMemo(() => {
    if (!results) return null;
    return results[0].nbm <= results[1].nbm ? 0 : 1;
  }, [results]);

  const updateOffer = (index: 0 | 1, patch: Partial<OfferState>) => {
    if (index === 0) {
      setOfferOne((prev) => ({ ...prev, ...patch }));
      return;
    }
    setOfferTwo((prev) => ({ ...prev, ...patch }));
  };

  useEffect(() => {
    if (rootRef.current) rootRef.current.dataset.compareHydrated = "true";
  }, []);

  useEffect(() => {
    if (!activePulse) return;
    const timeout = window.setTimeout(() => setActivePulse(null), 280);
    return () => window.clearTimeout(timeout);
  }, [activePulse]);

  useEffect(() => {
    if (!calculatingAck) return;
    const timeout = window.setTimeout(() => setCalculatingAck(false), 420);
    return () => window.clearTimeout(timeout);
  }, [calculatingAck]);

  useEffect(() => {
    if (!calculated || !resultsRef.current) return;
    const section = resultsRef.current;
    const top = section.getBoundingClientRect().top + window.scrollY - 92;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    section.classList.remove("surface-ack");
    void section.offsetWidth;
    section.classList.add("surface-ack");
    const timeout = window.setTimeout(() => section.classList.remove("surface-ack"), 540);
    return () => window.clearTimeout(timeout);
  }, [calculated, results]);

  const pulse = (key: string) => setActivePulse(`${key}-${Date.now()}`);
  const isPulsing = (key: string) => activePulse?.startsWith(key) ?? false;

  return (
    <main className="page-container relative isolate py-8 md:py-10" data-compare-root ref={rootRef}>
      <section className="rounded-[28px] border border-[#dce7e2] bg-white p-6 shadow-[0_18px_48px_rgba(31,43,37,0.08)] md:p-8">
        <h1 className="text-[34px] font-bold tracking-[-0.04em] text-[#172133] md:text-[44px]">Farkli Sirket Tekliflerini Karsilastirin</h1>
        <p className="mt-4 max-w-[820px] text-[15px] leading-8 text-[#6f7d94]">
          Iki farkli tasarruf finansmani teklifini yan yana girip; sonuc ozetini ve detayli nakit akislarini ana hesaplayicidaki gibi karsilastirmali inceleyebilirsiniz.
        </p>
      </section>

      <section className="mt-10 space-y-6">
        <StepHeading
          step="Adim 1"
          title="Teklif Parametrelerini Girin"
          text="Her bir teklif icin varlik turu, model, teslim ayi ve kredi seceneklerini ayri ayri duzenleyin."
        />

        <div className="rounded-[24px] border border-[#dce7e2] bg-white p-5 shadow-[0_18px_48px_rgba(31,43,37,0.08)] md:p-6">
          <span className="form-label">Karsilastirilacak Varlik Turu</span>
          <div className="relative z-10 grid max-w-[280px] grid-cols-2 rounded-[14px] bg-[#eef3f8] p-1">
            {(["Konut", "Araba"] as AssetType[]).map((item) => (
              <button
                aria-pressed={assetType === item}
                className={`segment-button relative z-10 cursor-pointer pointer-events-auto ${assetType === item ? "active" : ""} ${isPulsing(`asset-${item.toLowerCase()}`) ? "button-ack" : ""}`}
                data-compare-asset-button={item}
                key={item}
                onClick={() => {
                  pulse(`asset-${item.toLowerCase()}`);
                  setAssetType(item);
                }}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <ComparisonInputCard
              activePulse={activePulse}
              assetType={assetType}
              offer={offerOne}
              offerIndex={1}
              onChange={(patch) => updateOffer(0, patch)}
              onPulse={pulse}
              title="Teklif 1"
            />
            <ComparisonInputCard
              activePulse={activePulse}
              assetType={assetType}
              offer={offerTwo}
              offerIndex={2}
              onChange={(patch) => updateOffer(1, patch)}
              onPulse={pulse}
              title="Teklif 2"
            />
          </div>

          <button
            className={`relative z-10 mt-6 h-[52px] w-full cursor-pointer rounded-[14px] bg-[#16a05a] text-[15px] font-bold text-white shadow-[0_16px_28px_rgba(22,160,90,0.18)] transition-all duration-300 hover:bg-[#12874b] ${isPulsing("calculate") || calculatingAck ? "button-ack" : ""}`}
            data-compare-calculate="true"
            onClick={() => {
              pulse("calculate");
              setCalculatingAck(true);
              setCalculated(false);
              window.requestAnimationFrame(() => setCalculated(true));
            }}
            type="button"
          >
            {calculatingAck ? "SONUCLAR HESAPLANIYOR..." : "TUM TEKLIFLERI HESAPLA"}
          </button>
        </div>
      </section>

      <section className="mt-10 space-y-6" data-compare-results-section ref={resultsRef}>
        <StepHeading
          step="Adim 2"
          title="Sonuc Kartlarini Karsilastirin"
          text="Her teklif icin Net Bugunku Maliyet (NBM) ve kredi karsilastirmasi ayni hizada gosterilir. En dusuk NBM degerine sahip kart otomatik olarak vurgulanir."
        />

        <div className="grid gap-6 xl:grid-cols-2">
          <ResultCard highlighted={winnerIndex === 0} offer={offerOne} offerIndex={1} offerLabel="Teklif 1" result={results?.[0]} />
          <ResultCard highlighted={winnerIndex === 1} offer={offerTwo} offerIndex={2} offerLabel="Teklif 2" result={results?.[1]} />
        </div>
      </section>

      <section className="mt-10 space-y-6">
        <StepHeading
          step="Adim 3"
          title="Nakit Akisi Tablolari"
          text="Ana hesaplayicidaki nakit akisi tablosunun aynisi her teklif icin ayri sunulur; Excel olarak indirebilir ve satir bazinda inceleyebilirsiniz."
        />

        <div className="grid gap-6 xl:grid-cols-2">
          <CashflowBlock
            offerIndex={1}
            onExport={() => results?.[0] && exportRowsToCsv("teklif-1-nakit-akisi.csv", results[0].cashflow)}
            rows={results?.[0]?.cashflow}
            title="Detayli Nakit Akisi Tablosunu Gor (Teklif 1)"
          />
          <CashflowBlock
            offerIndex={2}
            onExport={() => results?.[1] && exportRowsToCsv("teklif-2-nakit-akisi.csv", results[1].cashflow)}
            rows={results?.[1]?.cashflow}
            title="Detayli Nakit Akisi Tablosunu Gor (Teklif 2)"
          />
        </div>
      </section>
    </main>
  );
}
