"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  COMPANY_OPTIONS,
  DEFAULT_OFFER,
  cashflowRowsToCsv,
  companyParams,
  loanScheduleToCsv,
  type AssetType,
  type CashflowRow,
  type CompanyName,
  type DecisionSummary,
  type LoanComparison,
  type OfferResult,
  type OfferState,
  calculateDecisionSummary,
  calculateOffer,
  formatMoney,
  formatPercent,
} from "../lib/comparisonEngine";

function readSearchValue(searchParams: URLSearchParams, key: string, fallback = "") {
  return searchParams.get(key) ?? fallback;
}

function readBoolean(searchParams: URLSearchParams, key: string, fallback = false) {
  const value = readSearchValue(searchParams, key, fallback ? "1" : "");
  return value === "1" || value === "true" || value === "on";
}

function getOfferFromSearch(searchParams: URLSearchParams, prefix: "offer1" | "offer2"): OfferState {
  const fallback = DEFAULT_OFFER;
  const company = readSearchValue(searchParams, `${prefix}_company`, fallback.company) as CompanyName;
  const companyDefaultServiceFee =
    companyParams[company]?.defaultServiceFeeRate ?? companyParams.Diğer.defaultServiceFeeRate;

  return {
    model: readSearchValue(searchParams, `${prefix}_model`, fallback.model) as OfferState["model"],
    company,
    assetPrice: readSearchValue(searchParams, `${prefix}_assetPrice`, fallback.assetPrice),
    downPayment: readSearchValue(searchParams, `${prefix}_downPayment`, fallback.downPayment),
    term: readSearchValue(searchParams, `${prefix}_term`, fallback.term),
    monthlyPayment: readSearchValue(searchParams, `${prefix}_monthlyPayment`, fallback.monthlyPayment),
    escalating: readBoolean(searchParams, `${prefix}_escalating`, fallback.escalating),
    manualPlan: readBoolean(searchParams, `${prefix}_manualPlan`, fallback.manualPlan),
    manualPlanText: readSearchValue(searchParams, `${prefix}_manualPlanText`, fallback.manualPlanText),
    delivery: readSearchValue(searchParams, `${prefix}_delivery`, fallback.delivery),
    serviceFee: readSearchValue(
      searchParams,
      `${prefix}_serviceFee`,
      `${companyDefaultServiceFee}`.replace(".", ","),
    ),
    rent: readSearchValue(searchParams, `${prefix}_rent`, fallback.rent),
    advancedOpen: readBoolean(searchParams, `${prefix}_advancedOpen`, fallback.advancedOpen),
    inflation: readSearchValue(searchParams, `${prefix}_inflation`, fallback.inflation),
    creditRate: readSearchValue(searchParams, `${prefix}_creditRate`, fallback.creditRate),
    yearlyIncrease: readSearchValue(searchParams, `${prefix}_yearlyIncrease`, fallback.yearlyIncrease),
    compareBank: readBoolean(searchParams, `${prefix}_compareBank`, fallback.compareBank),
    bankAmount: readSearchValue(searchParams, `${prefix}_bankAmount`, fallback.bankAmount),
    bankRate: readSearchValue(searchParams, `${prefix}_bankRate`, fallback.bankRate),
    bankTerm: readSearchValue(searchParams, `${prefix}_bankTerm`, fallback.bankTerm),
    bankHousingStatus: readSearchValue(
      searchParams,
      `${prefix}_bankHousingStatus`,
      fallback.bankHousingStatus,
    ) as OfferState["bankHousingStatus"],
  };
}

function createUrlSearch(assetType: AssetType, offerOne: OfferState, offerTwo: OfferState, calculate: boolean) {
  const params = new URLSearchParams();
  params.set("assetType", assetType);

  const appendOffer = (prefix: "offer1" | "offer2", offer: OfferState) => {
    params.set(`${prefix}_model`, offer.model);
    params.set(`${prefix}_company`, offer.company);
    params.set(`${prefix}_assetPrice`, offer.assetPrice);
    params.set(`${prefix}_downPayment`, offer.downPayment);
    params.set(`${prefix}_term`, offer.term);
    params.set(`${prefix}_monthlyPayment`, offer.monthlyPayment);
    params.set(`${prefix}_delivery`, offer.delivery);
    params.set(`${prefix}_serviceFee`, offer.serviceFee);
    params.set(`${prefix}_rent`, offer.rent);
    params.set(`${prefix}_inflation`, offer.inflation);
    params.set(`${prefix}_creditRate`, offer.creditRate);
    params.set(`${prefix}_yearlyIncrease`, offer.yearlyIncrease);
    params.set(`${prefix}_bankAmount`, offer.bankAmount);
    params.set(`${prefix}_bankRate`, offer.bankRate);
    params.set(`${prefix}_bankTerm`, offer.bankTerm);
    params.set(`${prefix}_bankHousingStatus`, offer.bankHousingStatus);
    if (offer.escalating) params.set(`${prefix}_escalating`, "1");
    if (offer.manualPlan) params.set(`${prefix}_manualPlan`, "1");
    if (offer.manualPlanText) params.set(`${prefix}_manualPlanText`, offer.manualPlanText);
    if (offer.advancedOpen) params.set(`${prefix}_advancedOpen`, "1");
    if (offer.compareBank) params.set(`${prefix}_compareBank`, "1");
  };

  appendOffer("offer1", offerOne);
  appendOffer("offer2", offerTwo);
  if (calculate) params.set("calculate", "1");
  return params.toString();
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function StepHeading({ step, title, text }: { step: string; title: string; text: string }) {
  return (
    <div className="max-w-[900px]">
      <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#16a05a]">{step}</span>
      <h2 className="mt-1 text-[28px] font-bold tracking-[-0.04em] text-[#172133]">{title}</h2>
      <p className="mt-2 text-[14px] leading-6 text-[#66758c]">{text}</p>
    </div>
  );
}

function SegmentGroup({
  options,
  value,
  onChange,
}: {
  options: Array<{ label: string; value: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid rounded-[14px] bg-[#eef3f8] p-1" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-[12px] px-4 py-2.5 text-[14px] font-semibold transition-all duration-200 ${
              active
                ? "bg-[#16a05a] text-white shadow-[0_10px_18px_rgba(22,160,90,0.18)]"
                : "text-[#51627b] hover:bg-white/70"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function ToggleField({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex items-center gap-3 text-left text-[14px] font-medium text-[#5d6b80]">
      <span className={`relative h-6 w-11 rounded-full transition-all ${checked ? "bg-[#16a05a]" : "bg-[#d7e3ef]"}`}>
        <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${checked ? "left-6" : "left-1"}`} />
      </span>
      {label}
    </button>
  );
}

function InputLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#7b8aa2]">{children}</span>;
}

function HelperWarnings({ warnings }: { warnings: string[] }) {
  if (!warnings.length) return null;
  return (
    <div className="rounded-[16px] border border-[#f2d7a7] bg-[#fff9e8] px-4 py-3 text-[13px] leading-6 text-[#8a6413]">
      {warnings.map((warning) => (
        <p key={warning}>{warning}</p>
      ))}
    </div>
  );
}

function updateOfferField<T extends keyof OfferState>(offer: OfferState, key: T, value: OfferState[T]): OfferState {
  if (key === "company") {
    const nextCompany = value as CompanyName;
    const previousDefault = `${companyParams[offer.company].defaultServiceFeeRate}`.replace(".", ",");
    const nextDefault = `${companyParams[nextCompany].defaultServiceFeeRate}`.replace(".", ",");

    return {
      ...offer,
      company: nextCompany,
      serviceFee: !offer.serviceFee || offer.serviceFee === previousDefault ? nextDefault : offer.serviceFee,
    };
  }

  return { ...offer, [key]: value };
}

function OfferInputPanel({
  title,
  assetType,
  offer,
  onChange,
}: {
  title: string;
  assetType: AssetType;
  offer: OfferState;
  onChange: (offer: OfferState) => void;
}) {
  const companyMeta = companyParams[offer.company];
  const priceLabel = assetType === "Konut" ? "Evin Fiyatı (TL)" : "Araç Fiyatı (TL)";

  return (
    <article className="rounded-[22px] border border-[#dce7e2] bg-white p-5 shadow-[0_12px_28px_rgba(31,43,37,0.05)]">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-[22px] font-bold tracking-[-0.03em] text-[#172133]">{title}</h3>
        <span className="rounded-full bg-[#f3f7fb] px-3 py-1 text-[12px] font-semibold text-[#6e7b8f]">{offer.company}</span>
      </div>

      <div className="mt-5 grid gap-4">
        <div>
          <InputLabel>Finansman modeli</InputLabel>
          <div className="mt-2">
            <SegmentGroup
              options={[
                { label: "Çekilişsiz", value: "cekilissiz" },
                { label: "Çekilişli", value: "cekilisli" },
              ]}
              value={offer.model}
              onChange={(value) => onChange(updateOfferField(offer, "model", value as OfferState["model"]))}
            />
          </div>
        </div>

        <label className="grid gap-2">
          <InputLabel>Şirket seçimi</InputLabel>
          <select
            className="form-control !h-[46px] !rounded-[14px] !bg-white !font-medium"
            onChange={(event) => onChange(updateOfferField(offer, "company", event.target.value as CompanyName))}
            value={offer.company}
          >
            {COMPANY_OPTIONS.map((company) => (
              <option key={company} value={company}>
                {company}
              </option>
            ))}
          </select>
          <span className="text-[12px] text-[#8492a6]">{companyMeta.notes}</span>
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <InputLabel>{priceLabel}</InputLabel>
            <input className="form-control !h-[46px] !rounded-[14px] !bg-white !font-medium" value={offer.assetPrice} onChange={(event) => onChange(updateOfferField(offer, "assetPrice", event.target.value))} placeholder={assetType === "Konut" ? "3.000.000" : "1.500.000"} />
          </label>
          <label className="grid gap-2">
            <InputLabel>Peşinat (TL)</InputLabel>
            <input className="form-control !h-[46px] !rounded-[14px] !bg-white !font-medium" value={offer.downPayment} onChange={(event) => onChange(updateOfferField(offer, "downPayment", event.target.value))} placeholder="1.000.000" />
          </label>
          <label className="grid gap-2">
            <InputLabel>Taksit (Ay)</InputLabel>
            <input className="form-control !h-[46px] !rounded-[14px] !bg-white !font-medium" value={offer.term} onChange={(event) => onChange(updateOfferField(offer, "term", event.target.value))} placeholder={assetType === "Konut" ? "90" : "48"} />
            <span className="text-[12px] text-[#8492a6]">Araçlar max 60, konutlar max 120 ay.</span>
          </label>
          <label className="grid gap-2">
            <InputLabel>Aylık ödeme</InputLabel>
            <input className="form-control !h-[46px] !rounded-[14px] !bg-white !font-medium" value={offer.monthlyPayment} onChange={(event) => onChange(updateOfferField(offer, "monthlyPayment", event.target.value))} placeholder="41.667" />
          </label>
        </div>

        <div className="flex flex-wrap gap-5">
          <ToggleField checked={offer.escalating} label="Artışlı taksit planı" onChange={(checked) => onChange(updateOfferField(offer, "escalating", checked))} />
          <ToggleField checked={offer.manualPlan} label="Manuel plan oluştur" onChange={(checked) => onChange(updateOfferField(offer, "manualPlan", checked))} />
        </div>

        {offer.manualPlan ? (
          <label className="grid gap-2">
            <InputLabel>Manuel plan</InputLabel>
            <textarea className="form-control min-h-[88px] !rounded-[14px] !bg-white !py-3 text-[14px] font-medium" value={offer.manualPlanText} onChange={(event) => onChange(updateOfferField(offer, "manualPlanText", event.target.value))} placeholder="41.667, 41.667, 55.000 veya satır satır girin" />
          </label>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <label className="grid gap-2">
            <InputLabel>Teslim ayı</InputLabel>
            <input className="form-control !h-[46px] !rounded-[14px] !bg-white !font-medium" value={offer.delivery} onChange={(event) => onChange(updateOfferField(offer, "delivery", event.target.value))} />
          </label>
          <label className="grid gap-2">
            <InputLabel>Hizmet bedeli (%)</InputLabel>
            <input className="form-control !h-[46px] !rounded-[14px] !bg-white !font-medium" value={offer.serviceFee} onChange={(event) => onChange(updateOfferField(offer, "serviceFee", event.target.value))} />
          </label>
          <label className="grid gap-2">
            <InputLabel>Kira (TL/ay)</InputLabel>
            <input className="form-control !h-[46px] !rounded-[14px] !bg-white !font-medium" value={offer.rent} onChange={(event) => onChange(updateOfferField(offer, "rent", event.target.value))} />
          </label>
        </div>

        <div className="rounded-[18px] border border-[#e4ecf4] bg-[#fbfdff] p-4">
          <button className="flex w-full items-center justify-between text-left text-[13px] font-bold uppercase tracking-[0.08em] text-[#7b8aa2]" onClick={() => onChange(updateOfferField(offer, "advancedOpen", !offer.advancedOpen))} type="button">
            Gelişmiş parametreler
            <span>{offer.advancedOpen ? "−" : "+"}</span>
          </button>
          {offer.advancedOpen ? (
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <label className="grid gap-2">
                <span className="min-h-[32px] text-[12px] font-bold uppercase tracking-[0.08em] text-[#7b8aa2]">Yıllık enflasyon (%)</span>
                <input className="form-control !h-[44px] !rounded-[14px] !bg-white !font-medium" value={offer.inflation} onChange={(event) => onChange(updateOfferField(offer, "inflation", event.target.value))} />
              </label>
              <label className="grid gap-2">
                <span className="min-h-[32px] text-[12px] font-bold uppercase tracking-[0.08em] text-[#7b8aa2]">Kredi faizi (% / ay)</span>
                <input className="form-control !h-[44px] !rounded-[14px] !bg-white !font-medium" value={offer.creditRate} onChange={(event) => onChange(updateOfferField(offer, "creditRate", event.target.value))} />
              </label>
              <label className="grid gap-2">
                <span className="min-h-[32px] text-[12px] font-bold uppercase tracking-[0.08em] text-[#7b8aa2]">Yıllık taksit artışı (%)</span>
                <input className="form-control !h-[44px] !rounded-[14px] !bg-white !font-medium" value={offer.yearlyIncrease} onChange={(event) => onChange(updateOfferField(offer, "yearlyIncrease", event.target.value))} />
              </label>
            </div>
          ) : null}
        </div>

        <div className="rounded-[18px] border border-[#dce7e2] bg-[#fbfdff] p-4">
          <ToggleField checked={offer.compareBank} label="Tasarruf finansmanı ile konut kredisini kıyasla" onChange={(checked) => onChange(updateOfferField(offer, "compareBank", checked))} />
          {offer.compareBank ? (
            <>
              <div className="mt-4 grid gap-4 md:grid-cols-[1.2fr_0.7fr_0.7fr]">
                <label className="grid gap-2">
                  <InputLabel>Kredi tutarı (TL)</InputLabel>
                  <input className="form-control !h-[44px] !rounded-[14px] !bg-white !font-medium" value={offer.bankAmount} onChange={(event) => onChange(updateOfferField(offer, "bankAmount", event.target.value))} />
                </label>
                <label className="grid gap-2">
                  <InputLabel>Aylık faiz (%)</InputLabel>
                  <input className="form-control !h-[44px] !rounded-[14px] !bg-white !font-medium" value={offer.bankRate} onChange={(event) => onChange(updateOfferField(offer, "bankRate", event.target.value))} />
                </label>
                <label className="grid gap-2">
                  <InputLabel>Vade (Ay)</InputLabel>
                  <input className="form-control !h-[44px] !rounded-[14px] !bg-white !font-medium" value={offer.bankTerm} onChange={(event) => onChange(updateOfferField(offer, "bankTerm", event.target.value))} />
                </label>
              </div>
              {assetType === "Konut" ? (
                <label className="mt-4 grid gap-2 md:max-w-[360px]">
                  <InputLabel>Konut sahipliği</InputLabel>
                  <select className="form-control !h-[44px] !rounded-[14px] !bg-white !font-medium" value={offer.bankHousingStatus} onChange={(event) => onChange(updateOfferField(offer, "bankHousingStatus", event.target.value as OfferState["bankHousingStatus"]))}>
                    <option value="yok">Evi yok</option>
                    <option value="var">Evi var</option>
                  </select>
                </label>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function ResultCard({
  title,
  result,
  highlighted,
}: {
  title: string;
  result?: OfferResult;
  highlighted: boolean;
}) {
  if (!result) {
    return (
      <article className="rounded-[22px] border border-[#dce7e2] bg-white p-5 shadow-[0_12px_30px_rgba(31,43,37,0.05)]">
        <div className="flex items-center gap-3 border-b border-[#e7eef5] pb-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-[11px] border border-[#d8eee2] bg-[#f1fdf6] text-[#16a05a]">▣</span>
          <div>
            <span className="block text-[12px] font-bold uppercase tracking-[0.1em] text-[#7b8aa2]">{title}</span>
            <h3 className="mt-1 text-[28px] font-bold tracking-[-0.04em] text-[#172133]">Sonuç ekranı</h3>
          </div>
        </div>
        <div className="mt-6 rounded-[16px] border border-dashed border-[#d9e4ee] bg-[#fbfdff] p-5 text-sm leading-7 text-[#72819a]">
          Lütfen hesaplama parametrelerini doldurun. Sonuçlar burada listelenecektir.
        </div>
      </article>
    );
  }

  const breakdown = result.selectedScenario.nbmBreakdown;
  const loan = result.loanComparison;

  return (
    <article
      className={`relative rounded-[22px] border bg-white p-5 shadow-[0_12px_30px_rgba(31,43,37,0.05)] ${
        highlighted ? "border-[#f4c514] shadow-[0_20px_50px_rgba(232,179,0,0.16)]" : "border-[#dce7e2]"
      }`}
    >
      {highlighted ? (
        <span className="absolute right-4 top-[-14px] rounded-full bg-[#ffcc1d] px-4 py-1.5 text-[12px] font-bold text-[#7a4d00] shadow-[0_12px_24px_rgba(255,196,0,0.24)]">
          En İyi Teklif
        </span>
      ) : null}

      <div className="flex items-center gap-3 border-b border-[#e7eef5] pb-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-[11px] border border-[#d8eee2] bg-[#f1fdf6] text-[#16a05a]">▣</span>
        <div>
          <span className="block text-[12px] font-bold uppercase tracking-[0.1em] text-[#7b8aa2]">{title}</span>
          <h3 className="mt-1 text-[18px] font-bold tracking-[-0.03em] text-[#172133]">Hesaplama Özeti</h3>
        </div>
      </div>

      <div className="mt-4 rounded-[16px] border border-[#cfeee0] bg-[#effdf5] px-4 py-4 text-center">
        <span className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[#168b53]">Toplam geri ödeme (nominal)</span>
        <strong className="mt-1.5 block text-[24px] font-black tracking-[-0.04em] text-[#0f5636]">{formatMoney(result.totalNominalOutflow)}</strong>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-[13px] border border-[#e3ebf4] bg-[#f7faff] px-4 py-3 text-center">
          <span className="block text-[12px] text-[#7b8aa2]">Vade (Ay)</span>
          <strong className="mt-1.5 block text-[18px] font-black text-[#1c2433]">{result.selectedScenario.cashflow.length - 1}</strong>
        </div>
        <div className="rounded-[13px] border border-[#e3ebf4] bg-[#f7faff] px-4 py-3 text-center">
          <span className="block text-[12px] text-[#7b8aa2]">Teslim Ayı</span>
          <strong className="mt-1.5 block text-[18px] font-black text-[#1c2433]">{result.selectedScenario.deliveryMonth}</strong>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-[16px] border border-[#dce7e2] bg-white">
        <div className="border-b border-[#e9eff5] px-4 py-3.5">
          <h4 className="text-[13px] font-bold uppercase tracking-[0.06em] text-[#1c2433]">Net maliyet (NBM) detayı</h4>
        </div>
        <div className="px-4 py-2.5 text-[13px] text-[#6f7d94]">
          {[
            ["Peşinat PV", breakdown.downPaymentPv, "red"],
            ["Hizmet bedeli PV", breakdown.serviceFeePv, "red"],
            ["Taksitler PV", breakdown.installmentsPv, "red"],
            ["Kira PV", breakdown.rentPv, "red"],
            ["Toplam NBM", breakdown.totalNBM, "green"],
          ].map(([label, value, tone], index) => (
            <div key={label} className={`flex items-center justify-between gap-4 py-3.5 ${index < 4 ? "border-b border-[#eef3f8]" : ""}`}>
              <span>{label}</span>
              <strong className={tone === "green" ? "text-[#18a05a]" : "text-[#ff5b57]"}>{formatMoney(Number(value))}</strong>
            </div>
          ))}
        </div>
        <div className="border-t border-[#e5edf5] bg-[#f8fbff] px-4 py-4">
          <span className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[#7b8aa2]">Karar skoru</span>
          <strong className="mt-1.5 block text-[24px] font-black tracking-[-0.04em] text-[#172133]">{formatMoney(result.scenarioSet.decisionScore)}</strong>
          <span className="mt-2 block text-[12px] leading-5 text-[#6f7d94]">Karar skoru = Ortalama NBM + risk cezası + gecikme maliyeti.</span>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        <div className="rounded-[16px] border border-[#e4ecf4] bg-[#fbfdff] px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#7b8aa2]">Risk seviyesi</span>
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                result.scenarioSet.riskLabel === "Düşük"
                  ? "bg-[#eafbf1] text-[#168b53]"
                  : result.scenarioSet.riskLabel === "Orta"
                    ? "bg-[#fff4dd] text-[#a66c00]"
                    : "bg-[#fff0ee] text-[#d34a3b]"
              }`}
            >
              {result.scenarioSet.riskLabel}
            </span>
          </div>
          <div className="mt-3 grid gap-2 text-[13px] text-[#6f7d94]">
            {result.scenarioSet.mode === "range" ? (
              <>
                <div className="flex items-center justify-between gap-3"><span>En iyi NBM</span><strong className="text-[#1c2433]">{formatMoney(result.scenarioSet.bestNBM)}</strong></div>
                <div className="flex items-center justify-between gap-3"><span>Ortalama NBM</span><strong className="text-[#1c2433]">{formatMoney(result.scenarioSet.averageNBM)}</strong></div>
                <div className="flex items-center justify-between gap-3"><span>En kötü NBM</span><strong className="text-[#1c2433]">{formatMoney(result.scenarioSet.worstNBM)}</strong></div>
                <div className="flex items-center justify-between gap-3"><span>Gecikme maliyeti</span><strong className="text-[#1c2433]">{formatMoney(result.scenarioSet.delayCost)}</strong></div>
              </>
            ) : (
              <span>Çekilişsiz modelde teslim riski sabit kabul edilir.</span>
            )}
          </div>
        </div>

        <div className="rounded-[16px] border border-[#e4ecf4] bg-white px-4 py-4">
          <h4 className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#7b8aa2]">Karar yorumu</h4>
          <div className="mt-3 grid gap-2 text-[13px] leading-6 text-[#5f6f86]">
            {result.commentary.map((item) => (
              <p key={item}>{item}</p>
            ))}
            {result.riskWarning ? (
              <p className="rounded-[12px] border border-[#f4d4ad] bg-[#fff6e8] px-3 py-2 text-[#9a6210]">{result.riskWarning}</p>
            ) : null}
          </div>
        </div>

        {loan ? <LoanComparisonCard loan={loan} /> : null}
      </div>
    </article>
  );
}

function LoanComparisonCard({ loan }: { loan: LoanComparison }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-[16px] border border-[#dbe6f1] bg-[#fbfdff] p-4">
      <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#74829a]">Banka kredisi kıyası</span>
      <div className="mt-3 grid gap-2 text-[13px] text-[#6f7d94]">
        {[
          ["Kredi ana para", formatMoney(loan.summary.principal)],
          ["Net ele geçen kredi", formatMoney(loan.summary.netDisbursed)],
          ["Aylık taksit", formatMoney(loan.summary.monthlyPayment)],
          ["Toplam taksit ödemesi", formatMoney(loan.summary.totalInstallmentPayment)],
          ["Toplam faiz", formatMoney(loan.summary.totalInterest)],
          ["Toplam KKDF", formatMoney(loan.summary.totalKKDF)],
          ["Toplam BSMV", formatMoney(loan.summary.totalBSMV)],
          ["Kredi hariç masraf", formatMoney(loan.summary.fee)],
          ["Toplam geri ödeme", formatMoney(loan.summary.totalRepayment)],
          ["Toplam kredi maliyeti", formatMoney(loan.summary.totalCreditCost)],
          ["Efektif aylık maliyet", formatPercent(loan.summary.effectiveMonthlyCostRate * 100, 2)],
          ["Efektif yıllık maliyet", formatPercent(loan.summary.effectiveAnnualCost * 100, 2)],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-3">
            <span>{label}</span>
            <strong className="text-[#1c2433]">{value}</strong>
          </div>
        ))}
      </div>
      <p className="mt-3 rounded-[12px] border border-[#dbe6f1] bg-white px-3 py-2 text-[13px] leading-6 text-[#47617e]">{loan.advantageText}</p>
      <p className="mt-2 rounded-[12px] border border-[#dbe6f1] bg-white px-3 py-2 text-[13px] leading-6 text-[#47617e]">{loan.totalRepaymentText}</p>

      <details className="mt-4 rounded-[14px] border border-[#e4ecf4] bg-white" open={open} onToggle={(event) => setOpen((event.target as HTMLDetailsElement).open)}>
        <summary className="cursor-pointer list-none px-4 py-3 text-[13px] font-bold uppercase tracking-[0.08em] text-[#7b8aa2]">
          Ödeme planını göster
        </summary>
        <div className="border-t border-[#edf2f7] px-4 py-4">
          <div className="overflow-x-auto">
            <table className="min-w-[780px] text-left text-[13px]">
              <thead className="border-b border-[#edf2f7] bg-[#fbfdff] text-[11px] font-bold uppercase tracking-[0.08em] text-[#74829a]">
                <tr>
                  <th className="px-3 py-3">Dönem</th>
                  <th className="px-3 py-3">Taksit Tutarı</th>
                  <th className="px-3 py-3">Anapara</th>
                  <th className="px-3 py-3">Faiz</th>
                  <th className="px-3 py-3">KKDF</th>
                  <th className="px-3 py-3">BSMV</th>
                  <th className="px-3 py-3">Kalan Anapara</th>
                </tr>
              </thead>
              <tbody>
                {loan.summary.schedule.slice(0, 24).map((row) => (
                  <tr key={row.period} className="border-t border-[#edf2f7]">
                    <td className="px-3 py-3">{row.period}</td>
                    <td className="px-3 py-3">{formatMoney(row.payment)}</td>
                    <td className="px-3 py-3">{formatMoney(row.principalPayment)}</td>
                    <td className="px-3 py-3">{formatMoney(row.interest)}</td>
                    <td className="px-3 py-3">{formatMoney(row.kkdfAmount)}</td>
                    <td className="px-3 py-3">{formatMoney(row.bsmvAmount)}</td>
                    <td className="px-3 py-3">{formatMoney(row.remainingPrincipal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 text-[13px] text-[#6f7d94]">
            <span>{loan.summary.schedule.length > 24 ? `İlk 24 satır gösteriliyor. Kalan ${loan.summary.schedule.length - 24} satırı CSV ile indirebilirsiniz.` : "Tüm satırlar gösteriliyor."}</span>
            <button
              type="button"
              onClick={() => downloadCsv("banka-kredisi-odeme-plani.csv", loanScheduleToCsv(loan.summary.schedule))}
              className="rounded-[12px] border border-[#dce7e2] bg-[#f5fff9] px-4 py-2 font-semibold text-[#168b53]"
            >
              Ödeme planını indir
            </button>
          </div>
        </div>
      </details>
    </div>
  );
}

function ComparisonSummary({ summary }: { summary?: DecisionSummary }) {
  if (!summary || summary.winnerIndex === null) {
    return (
      <div className="rounded-[22px] border border-[#e5edf5] bg-white px-5 py-6 shadow-[0_12px_30px_rgba(31,43,37,0.05)]">
        <h3 className="text-center text-[20px] font-bold tracking-[-0.03em] text-[#11653f]">Karşılaştırma Özeti</h3>
        <p className="mt-3 text-center text-[14px] leading-6 text-[#5f6f86]">İki teklifi hesapladığınızda en avantajlı alternatif burada net şekilde vurgulanacaktır.</p>
      </div>
    );
  }

  return (
    <div className="rounded-[22px] border-2 border-[#f4c514] bg-white px-5 py-6 shadow-[0_14px_30px_rgba(232,179,0,0.08)] md:px-7">
      <h3 className="text-center text-[20px] font-bold tracking-[-0.03em] text-[#11653f]">Karşılaştırma Özeti: En Avantajlı Teklif</h3>
      <p className="mx-auto mt-3 max-w-[860px] text-center text-[14px] leading-6 text-[#5f6f86]">{summary.summaryText}</p>
      <div className="mx-auto mt-5 max-w-[320px] rounded-[20px] bg-[#fff9de] px-5 py-5 text-center shadow-[0_10px_24px_rgba(243,206,80,0.12)]">
        <strong className="block text-[22px] font-bold text-[#1c2433]">{summary.winnerLabel}</strong>
        <span className="mt-2.5 block text-[38px] font-black tracking-[-0.06em] text-[#16a05a]">{formatMoney(summary.difference)}</span>
        <span className="mt-1 block text-[14px] text-[#1c2433]">Karar skoru farkı</span>
      </div>
      <p className="mx-auto mt-5 max-w-[760px] text-center text-[14px] leading-6 text-[#5f6f86]">{summary.infoText}</p>
      {summary.cautionText ? (
        <div className="mx-auto mt-5 max-w-[920px] rounded-[16px] border border-[#f4dfa3] bg-[#fff8df] px-5 py-4 text-center text-[13px] leading-6 text-[#8b6b18]">
          {summary.cautionText}
        </div>
      ) : null}
    </div>
  );
}

function CashflowTable({ rows }: { rows: CashflowRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[1080px] text-left text-[13px]">
        <thead className="border-b border-[#edf2f7] bg-[#fbfdff] text-[11px] font-bold uppercase tracking-[0.08em] text-[#74829a]">
          <tr>
            <th className="px-4 py-3">Ay</th>
            <th className="px-4 py-3">Taksit</th>
            <th className="px-4 py-3">Peşinat</th>
            <th className="px-4 py-3">Hizmet Bedeli</th>
            <th className="px-4 py-3">Kira</th>
            <th className="px-4 py-3">Toplam Çıkış</th>
            <th className="px-4 py-3">Kümülatif Çıkış</th>
            <th className="px-4 py-3">Bugünkü Değer</th>
            <th className="px-4 py-3">Not</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.month}-${row.note}`} className={`border-t border-[#edf2f7] ${row.note.includes("Teslim") ? "bg-[#effbf5]" : ""}`}>
              <td className="px-4 py-3 text-[#172133]">{row.month}</td>
              <td className="px-4 py-3">{row.installment ? formatMoney(row.installment) : "-"}</td>
              <td className="px-4 py-3">{row.downPayment ? formatMoney(row.downPayment) : "-"}</td>
              <td className="px-4 py-3">{row.serviceFee ? formatMoney(row.serviceFee) : "-"}</td>
              <td className="px-4 py-3">{row.rent ? formatMoney(row.rent) : "-"}</td>
              <td className="px-4 py-3 font-medium text-[#d34a3b]">{formatMoney(row.totalOutflow)}</td>
              <td className="px-4 py-3">{formatMoney(row.cumulativeOutflow)}</td>
              <td className="px-4 py-3">{formatMoney(row.presentValue)}</td>
              <td className="px-4 py-3 text-[#73839b]">{row.note || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CashflowBlock({
  title,
  rows,
  downloadName,
}: {
  title: string;
  rows?: CashflowRow[];
  downloadName: string;
}) {
  return (
    <details className="rounded-[22px] border border-[#dce7e2] bg-white shadow-[0_12px_30px_rgba(31,43,37,0.05)]" open>
      <summary className="flex list-none cursor-pointer items-center justify-between gap-4 px-4 py-4 md:px-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-[#d8e3f1] bg-[#fbfdff] text-[#73839b]">▤</span>
          <h3 className="text-[18px] font-bold tracking-[-0.03em] text-[#1c2433]">{title}</h3>
        </div>
        <span className="text-[#98a7bc]">⌃</span>
      </summary>
      <div className="border-t border-[#edf2f7] px-4 pb-4 pt-4 md:px-5">
        <p className="rounded-[12px] border border-[#dfe7f1] bg-[#fbfdff] px-4 py-3 text-[13px] leading-5 text-[#6f7d94]">
          Aşağıdaki tablo, nominal Türk Lirası cinsinden cebinizden çıkacak tutarları gösterir. Kira her 12 ayda bir enflasyon kadar artar.
        </p>
        {!rows?.length ? (
          <div className="mt-5 rounded-[18px] border border-dashed border-[#d9e4ee] bg-[#fbfdff] p-5 text-sm leading-7 text-[#72819a]">
            Nakit akışı tablosu hesaplandıktan sonra burada görünecektir.
          </div>
        ) : (
          <>
            <div className="mt-5 max-h-[560px] overflow-auto rounded-[18px] border border-[#edf2f7]">
              <CashflowTable rows={rows} />
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-[13px] text-[#6f7d94]">... ve {Math.max(0, rows.length - 20)} satır daha. (Tüm tabloyu görmek için Excel olarak indirin)</span>
              <button type="button" className="rounded-[12px] bg-[#16a05a] px-4 py-2.5 text-[13px] font-bold text-white shadow-[0_10px_20px_rgba(22,160,90,0.18)] transition-all duration-300 hover:bg-[#12874b]" onClick={() => downloadCsv(downloadName, cashflowRowsToCsv(rows))}>
                Excel Olarak İndir
              </button>
            </div>
          </>
        )}
      </div>
    </details>
  );
}

export function OfferComparisonPage() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const searchKey = searchParams.toString();

  const [assetType, setAssetType] = useState<AssetType>("Konut");
  const [offerOne, setOfferOne] = useState<OfferState>(DEFAULT_OFFER);
  const [offerTwo, setOfferTwo] = useState<OfferState>(DEFAULT_OFFER);
  const [hasCalculated, setHasCalculated] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(searchKey);
    setAssetType((readSearchValue(params, "assetType", "Konut") as AssetType) || "Konut");
    setOfferOne(getOfferFromSearch(params, "offer1"));
    setOfferTwo(getOfferFromSearch(params, "offer2"));
    setHasCalculated(readBoolean(params, "calculate", false));
  }, [searchKey]);

  const results = useMemo(() => {
    if (!hasCalculated) return null;
    return [calculateOffer(assetType, offerOne), calculateOffer(assetType, offerTwo)] as [OfferResult, OfferResult];
  }, [assetType, hasCalculated, offerOne, offerTwo]);

  const decisionSummary = useMemo(() => (results ? calculateDecisionSummary(results) : null), [results]);
  const warnings = useMemo(() => (results ? [...new Set(results.flatMap((result) => result.warnings))] : []), [results]);

  useEffect(() => {
    if (!hasCalculated || !results) return;
    const target = document.getElementById("compare-results");
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }, [hasCalculated, results]);

  const syncUrl = (nextAssetType: AssetType, nextOfferOne: OfferState, nextOfferTwo: OfferState, calculate: boolean) => {
    const query = createUrlSearch(nextAssetType, nextOfferOne, nextOfferTwo, calculate);
    window.history.replaceState({}, "", `${pathname}?${query}${calculate ? "#compare-results" : ""}`);
  };

  const handleCalculate = () => {
    setHasCalculated(true);
    syncUrl(assetType, offerOne, offerTwo, true);
  };

  return (
    <main className="page-container relative isolate py-7 md:py-8">
      <section className="rounded-[24px] border border-[#dce7e2] bg-white p-5 shadow-[0_14px_34px_rgba(31,43,37,0.06)] md:p-6">
        <h1 className="text-[28px] font-bold tracking-[-0.04em] text-[#172133] md:text-[34px]">Teklifleri Karşılaştır</h1>
        <p className="mt-3 max-w-[860px] text-[14px] leading-7 text-[#6f7d94]">
          İki farklı tasarruf finansmanı teklifini yan yana girin; sonuç kartlarını, NBM kırılımını, banka kredisi kıyasını ve detaylı nakit akışını aynı ekranda karar odaklı biçimde karşılaştırın.
        </p>
      </section>

      <section className="mt-8 space-y-5">
        <StepHeading
          step="Adım 1"
          title="Teklif Parametrelerini Girin"
          text="Varlık türünü seçin ve iki teklifi aynı koşullarda girin. Sistem her teklifi bağımsız hesaplayıp karar skorunu karşılaştırır."
        />

        <div className="rounded-[22px] border border-[#dce7e2] bg-white p-4 shadow-[0_14px_34px_rgba(31,43,37,0.06)] md:p-5">
          <span className="mb-2 block text-[12px] font-bold uppercase tracking-[0.1em] text-[#7b8aa2]">Karşılaştırılacak varlık türü</span>
          <div className="max-w-[280px]">
            <SegmentGroup
              options={[
                { label: "Konut", value: "Konut" },
                { label: "Araba", value: "Araba" },
              ]}
              value={assetType}
              onChange={(value) => {
                const nextAssetType = value as AssetType;
                setAssetType(nextAssetType);
                syncUrl(nextAssetType, offerOne, offerTwo, hasCalculated);
              }}
            />
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-2">
            <OfferInputPanel title="Teklif 1" assetType={assetType} offer={offerOne} onChange={setOfferOne} />
            <OfferInputPanel title="Teklif 2" assetType={assetType} offer={offerTwo} onChange={setOfferTwo} />
          </div>

          {warnings.length ? <div className="mt-4"><HelperWarnings warnings={warnings} /></div> : null}

          <button type="button" onClick={handleCalculate} className="mt-5 h-[50px] w-full rounded-[14px] bg-[#16a05a] text-[15px] font-bold text-white shadow-[0_14px_24px_rgba(22,160,90,0.16)] transition-all duration-300 hover:bg-[#12874b]">
            TÜM TEKLİFLERİ HESAPLA
          </button>
        </div>
      </section>

      <section className="mt-8 space-y-5" id="compare-results">
        <StepHeading
          step="Adım 2"
          title="Sonuç Kartlarını Karşılaştırın"
          text="Her teklif için NBM kırılımı, risk etkisi ve kredi kıyası aynı hizada gösterilir. Karar skoru en düşük olan teklif otomatik vurgulanır."
        />
        <div className="grid gap-5 xl:grid-cols-2">
          <ResultCard title="Teklif 1" result={results?.[0]} highlighted={decisionSummary?.winnerIndex === 0} />
          <ResultCard title="Teklif 2" result={results?.[1]} highlighted={decisionSummary?.winnerIndex === 1} />
        </div>
        <ComparisonSummary summary={decisionSummary ?? undefined} />
      </section>

      <section className="mt-8 space-y-5">
        <StepHeading
          step="Adım 3"
          title="Nakit Akışı Tabloları"
          text="Her teklif için peşinat, hizmet bedeli, kira, taksit ve bugünkü değer etkisini satır satır inceleyebilir; tabloyu CSV olarak dışarı alabilirsiniz."
        />
        <div className="grid gap-5 xl:grid-cols-2">
          <CashflowBlock title="Detaylı Nakit Akışı Tablosunu Gör (Teklif 1)" rows={results?.[0]?.selectedScenario.cashflow} downloadName="teklif-1-nakit-akisi.csv" />
          <CashflowBlock title="Detaylı Nakit Akışı Tablosunu Gör (Teklif 2)" rows={results?.[1]?.selectedScenario.cashflow} downloadName="teklif-2-nakit-akisi.csv" />
        </div>
      </section>
    </main>
  );
}

