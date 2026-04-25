"use client";

import { useMemo, useState } from "react";
import {
  calculateHousingLoanLimit,
  calculateNeedLoanTerm,
  calculateVehicleLoanLimit,
  type HousingEnergyClass,
} from "../../lib/loanLimit";
import { formatPercentTr, formatTry, parseLocaleNumber } from "../../lib/formatters";

type LimitTab = "housing" | "vehicle" | "need";

const tabButtonClass =
  "rounded-[11px] px-4 py-3 text-[14px] font-semibold transition-all duration-300 text-[#526071] hover:bg-white hover:text-[#182133] data-[active=true]:bg-[#16a05a] data-[active=true]:text-white data-[active=true]:shadow-[0_10px_22px_rgba(24,160,90,0.22)]";

function InputLabel({ children }: { children: React.ReactNode }) {
  return <span className="mb-2 block text-[12px] font-bold uppercase tracking-[0.08em] text-[#72819a]">{children}</span>;
}

function MetricCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "green";
}) {
  return (
    <div
      className={`rounded-[16px] border px-5 py-4 shadow-[0_6px_18px_rgba(27,39,51,0.04)] ${
        tone === "green" ? "border-[#cfeedd] bg-[#ecfbf2]" : "border-[#e6edf5] bg-[#f8fbff]"
      }`}
    >
      <span className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[#74829a]">{label}</span>
      <strong
        className={`mt-2 block text-[24px] font-black tracking-[-0.05em] ${
          tone === "green" ? "text-[#136f45]" : "text-[#182133]"
        }`}
      >
        {value}
      </strong>
    </div>
  );
}

export function CreditLimitCalculatorModule() {
  const [tab, setTab] = useState<LimitTab>("housing");
  const [housingValue, setHousingValue] = useState("6.500.000");
  const [energyClass, setEnergyClass] = useState<HousingEnergyClass>("A-B");
  const [homeOwnership, setHomeOwnership] = useState<"yok" | "var">("yok");
  const [vehicleValue, setVehicleValue] = useState("1.250.000");
  const [needValue, setNeedValue] = useState("180.000");
  const [saveMessage, setSaveMessage] = useState("");

  const housingExpertise = useMemo(() => parseLocaleNumber(housingValue), [housingValue]);
  const vehicleAmount = useMemo(() => parseLocaleNumber(vehicleValue), [vehicleValue]);
  const needAmount = useMemo(() => parseLocaleNumber(needValue), [needValue]);

  const housingResult = useMemo(
    () => calculateHousingLoanLimit(housingExpertise, energyClass, homeOwnership === "var"),
    [housingExpertise, energyClass, homeOwnership],
  );
  const housingDownPayment = Math.max(0, housingExpertise - housingResult.maxCreditAmount);
  const housingDownPaymentRatio = housingExpertise > 0 ? housingDownPayment / housingExpertise : 0;

  const vehicleResult = useMemo(() => calculateVehicleLoanLimit(vehicleAmount), [vehicleAmount]);
  const needTerm = useMemo(() => calculateNeedLoanTerm(needAmount), [needAmount]);

  function saveProfile() {
    const payload =
      tab === "housing"
        ? {
            module: "Kredi Limit Modülü",
            type: "Konut",
            expertiseValue: housingExpertise,
            maxCreditAmount: housingResult.maxCreditAmount,
            downPayment: housingDownPayment,
            downPaymentRatio: housingDownPaymentRatio,
            ratio: housingResult.ratio,
            energyClass,
            homeOwnership,
          }
        : tab === "vehicle"
          ? {
              module: "Kredi Limit Modülü",
              type: "Taşıt",
              vehicleValue: vehicleAmount,
              maxCreditAmount: vehicleResult.maxCreditAmount,
              ratio: vehicleResult.ratio,
              eligible: vehicleResult.eligible,
            }
          : {
              module: "Kredi Limit Modülü",
              type: "İhtiyaç",
              requestedAmount: needAmount,
              maxTerm: needTerm,
            };

    const existing = JSON.parse(localStorage.getItem("financeProfiles") || "[]") as unknown[];
    localStorage.setItem(
      "financeProfiles",
      JSON.stringify([
        {
          id: crypto.randomUUID(),
          title: `${payload.type} kredi limit kaydı`,
          createdAt: new Date().toISOString(),
          payload,
        },
        ...existing,
      ]),
    );
    setSaveMessage("Profilinize kaydedildi.");
  }

  return (
    <section id="loanLimit" className="page-container mt-8 scroll-mt-24">
      <div className="grid items-start gap-7 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="min-h-[348px] rounded-[26px] border border-[#dce7e2] bg-white p-5 shadow-[0_18px_48px_rgba(31,43,37,0.08)] md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e8eef5] pb-4">
            <div>
              <span className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#7b8aa2]">Kredi limit modülü</span>
              <h2 className="mt-1 text-[18px] font-bold tracking-[-0.03em] text-[#1c2433] md:text-[20px]">
                Konut, taşıt ve ihtiyaç limitini görün
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-1 rounded-[14px] bg-[#eef3f8] p-1">
              <button className={tabButtonClass} data-active={tab === "housing"} onClick={() => setTab("housing")} type="button">
                Konut
              </button>
              <button className={tabButtonClass} data-active={tab === "vehicle"} onClick={() => setTab("vehicle")} type="button">
                Taşıt
              </button>
              <button className={tabButtonClass} data-active={tab === "need"} onClick={() => setTab("need")} type="button">
                İhtiyaç
              </button>
            </div>
          </div>

          <div className="mt-5 flex min-h-[250px] flex-col">
            {tab === "housing" ? (
              <div className="grid gap-5 md:grid-cols-3">
                <label>
                  <InputLabel>Ekspertiz Değeri (TL)</InputLabel>
                  <input
                    value={housingValue}
                    onChange={(event) => setHousingValue(event.target.value)}
                    className="form-control !h-[44px] !rounded-[14px] !bg-[#f9fbfe] !font-medium"
                    inputMode="numeric"
                    placeholder="6.500.000"
                  />
                </label>

                <label>
                  <InputLabel>Enerji Sınıfı</InputLabel>
                  <select
                    value={energyClass}
                    onChange={(event) => setEnergyClass(event.target.value as HousingEnergyClass)}
                    className="form-control !h-[44px] !rounded-[14px] !bg-[#f9fbfe] !font-medium"
                  >
                    <option value="A-B">A - B</option>
                    <option value="C">C</option>
                    <option value="Diger">Diğer</option>
                  </select>
                </label>

                <label>
                  <InputLabel>Konut Sahipliği</InputLabel>
                  <select
                    value={homeOwnership}
                    onChange={(event) => setHomeOwnership(event.target.value as "yok" | "var")}
                    className="form-control !h-[44px] !rounded-[14px] !bg-[#f9fbfe] !font-medium"
                  >
                    <option value="yok">Evi yok</option>
                    <option value="var">Evi var</option>
                  </select>
                </label>
              </div>
            ) : null}

            {tab === "vehicle" ? (
              <div className="w-full max-w-[360px] gap-5">
                <label className="max-w-[360px]">
                  <InputLabel>Taşıt Değeri (TL)</InputLabel>
                  <input
                    value={vehicleValue}
                    onChange={(event) => setVehicleValue(event.target.value)}
                    className="form-control !h-[44px] !rounded-[14px] !bg-[#f9fbfe] !font-medium"
                    inputMode="numeric"
                    placeholder="1.250.000"
                  />
                </label>
              </div>
            ) : null}

            {tab === "need" ? (
              <div className="w-full max-w-[360px] gap-5">
                <label className="max-w-[360px]">
                  <InputLabel>İstenen Kredi Tutarı (TL)</InputLabel>
                  <input
                    value={needValue}
                    onChange={(event) => setNeedValue(event.target.value)}
                    className="form-control !h-[44px] !rounded-[14px] !bg-[#f9fbfe] !font-medium"
                    inputMode="numeric"
                    placeholder="180.000"
                  />
                </label>
              </div>
            ) : null}
          </div>
        </div>

        <aside className="min-h-[348px] rounded-[26px] border border-[#dce7e2] bg-white p-5 shadow-[0_18px_48px_rgba(31,43,37,0.08)] md:p-6">
          <div className="border-b border-[#e8eef5] pb-4">
            <span className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#7b8aa2]">Sonuç</span>
            <h3 className="mt-1 text-[18px] font-bold tracking-[-0.03em] text-[#1c2433]">
              {tab === "housing" ? "Konut kredi modülü" : tab === "vehicle" ? "Taşıt kredi modülü" : "İhtiyaç kredi modülü"}
            </h3>
          </div>

          {tab === "housing" ? (
            <div className="mt-5 grid gap-4">
              <MetricCard label="Kredi Oranı" value={formatPercentTr(housingResult.ratio * 100)} tone="green" />
              <MetricCard label="Azami Kredi Tutarı" value={formatTry(housingResult.maxCreditAmount)} />
              <MetricCard label="Peşinat Oranı" value={formatPercentTr(housingDownPaymentRatio * 100)} />
              <MetricCard label="Peşinat Tutarı" value={formatTry(housingDownPayment)} />
            </div>
          ) : null}

          {tab === "vehicle" ? (
            <div className="mt-5 grid gap-4">
              <MetricCard label="Azami Kredi Tutarı" value={formatTry(vehicleResult.maxCreditAmount)} tone="green" />
              <div className="rounded-[16px] border border-[#e6edf5] bg-[#f8fbff] px-5 py-4 text-[14px] font-medium text-[#617086]">
                {vehicleResult.eligible ? `Uygulanan oran: ${formatPercentTr(vehicleResult.ratio * 100)}` : vehicleResult.message}
              </div>
            </div>
          ) : null}

          {tab === "need" ? (
            <div className="mt-5 grid gap-4">
              <MetricCard label="Azami Vade" value={`${needTerm} ay`} tone="green" />
              <div className="rounded-[16px] border border-[#e6edf5] bg-[#f8fbff] px-5 py-4 text-[14px] font-medium text-[#617086]">
                {needAmount <= 125000
                  ? "125.000 TL ve altı için 36 ay"
                  : needAmount <= 250000
                    ? "125.000,01 - 250.000 TL bandı için 24 ay"
                    : "250.000 TL üstü için 12 ay"}
              </div>
            </div>
          ) : null}

          <button
            className="mt-5 w-full rounded-[14px] bg-[#16a05a] px-5 py-3 text-sm font-black text-white shadow-[0_14px_26px_rgba(22,160,90,0.16)] transition hover:-translate-y-0.5"
            onClick={saveProfile}
            type="button"
          >
            Profilime Kaydet
          </button>
          {saveMessage ? <p className="mt-3 text-sm font-semibold text-emerald-700">{saveMessage}</p> : null}
        </aside>
      </div>
    </section>
  );
}
