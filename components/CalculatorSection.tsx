"use client";

import { type ReactNode, useMemo, useRef, useState } from "react";
import {
  DEFAULT_OFFER,
  calculateOffer,
  formatMoney,
  formatPercent,
  type AssetType,
  type OfferResult,
  type OfferState,
} from "../lib/comparisonEngine";
import { COMPANY_OPTIONS, companyParams, type CompanyName } from "../lib/companyParams";

const exampleOffer: OfferState = {
  ...DEFAULT_OFFER,
  model: "cekilissiz",
  company: "Diğer",
  assetPrice: "3.000.000",
  downPayment: "1.000.000",
  term: "48",
  monthlyPayment: "41.667",
  delivery: "12",
  serviceFee: "7,5",
  rent: "25.000",
  bankAmount: "2.000.000",
  bankRate: "2,80",
  bankTerm: "120",
  compareBank: true,
};

function SegmentGroup({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
}) {
  return (
    <div
      className="grid rounded-[14px] bg-[#eef3f8] p-1"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option) => {
        const active = option.value === value;
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
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 text-left text-[14px] font-medium text-[#5d6b80]"
    >
      <span className={`relative h-6 w-11 rounded-full transition-all ${checked ? "bg-[#16a05a]" : "bg-[#d7e3ef]"}`}>
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${checked ? "left-6" : "left-1"}`}
        />
      </span>
      {label}
    </button>
  );
}

function InputLabel({ children }: { children: ReactNode }) {
  return <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#7b8aa2]">{children}</span>;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  help,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  help?: string;
  textarea?: boolean;
}) {
  return (
    <label className="grid gap-2">
      <InputLabel>{label}</InputLabel>
      {textarea ? (
        <textarea
          className="form-control min-h-[88px] !rounded-[14px] !bg-[#f9fbfe] !py-3 text-[14px] font-medium"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          className="form-control !h-[46px] !rounded-[14px] !bg-[#f9fbfe] !font-medium"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
      )}
      {help ? <span className="text-[12px] leading-5 text-[#8492a6]">{help}</span> : null}
    </label>
  );
}

function SummaryLine({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "green" | "red";
}) {
  const color = tone === "green" ? "text-[#17a35e]" : tone === "red" ? "text-[#e05044]" : "text-[#1c2433]";
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-[#edf2f7] py-4 last:border-b-0 last:pb-0">
      <span className="text-[14px] text-[#748299]">{label}</span>
      <strong className={`text-[15px] font-bold ${color}`}>{value}</strong>
    </div>
  );
}

function ExampleScenarioCard({ onApply }: { onApply: () => void }) {
  return (
    <aside className="rounded-[26px] border border-[#dce7e2] bg-white p-5 shadow-[0_18px_48px_rgba(31,43,37,0.08)] md:p-6">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-[14px] bg-[#ecfff3] text-[#16a05a]">⚡</span>
        <div>
          <h3 className="text-[18px] font-bold tracking-[-0.03em] text-[#172133]">Hemen Dene</h3>
          <p className="mt-2 text-[14px] leading-6 text-[#66758c]">
            Referans örnek senaryoyu tek tıkla doldur, sonra sonuç panelinde net bugünkü maliyeti gör.
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-[18px] border border-[#dce7e2] bg-[#fbfefd] p-4">
        <div className="grid gap-3 text-[14px] text-[#5c6d84]">
          <div className="grid grid-cols-[1fr_auto] gap-3"><span>Varlık</span><strong className="text-[#172133]">Konut</strong></div>
          <div className="grid grid-cols-[1fr_auto] gap-3"><span>Model</span><strong className="text-[#172133]">Çekilişsiz</strong></div>
          <div className="grid grid-cols-[1fr_auto] gap-3"><span>Sözleşme Tutarı</span><strong className="text-[#172133]">₺3.000.000</strong></div>
          <div className="grid grid-cols-[1fr_auto] gap-3"><span>Peşinat</span><strong className="text-[#172133]">₺1.000.000</strong></div>
          <div className="grid grid-cols-[1fr_auto] gap-3"><span>Vade</span><strong className="text-[#172133]">48 ay</strong></div>
          <div className="grid grid-cols-[1fr_auto] gap-3"><span>Aylık Ödeme</span><strong className="text-[#172133]">₺41.667</strong></div>
          <div className="grid grid-cols-[1fr_auto] gap-3"><span>Organizasyon Ücreti</span><strong className="text-[#172133]">%7,5</strong></div>
          <div className="grid grid-cols-[1fr_auto] gap-3"><span>Kira</span><strong className="text-[#172133]">₺25.000/ay</strong></div>
        </div>
      </div>

      <div className="mt-5 rounded-[18px] border border-[#dce7e2] bg-[#f8fbff] p-4">
        <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#7b8aa2]">Banka Kredisi</span>
        <div className="mt-3 grid gap-2 text-[14px] text-[#5c6d84]">
          <div className="grid grid-cols-[1fr_auto] gap-3"><span>Kredi Tutarı</span><strong className="text-[#172133]">₺2.000.000</strong></div>
          <div className="grid grid-cols-[1fr_auto] gap-3"><span>Aylık Faiz</span><strong className="text-[#172133]">%2,80</strong></div>
          <div className="grid grid-cols-[1fr_auto] gap-3"><span>Vade</span><strong className="text-[#172133]">120 ay</strong></div>
        </div>
      </div>

      <button
        type="button"
        onClick={onApply}
        className="mt-5 w-full rounded-[14px] bg-[#16a05a] px-5 py-3 text-[15px] font-semibold text-white shadow-[0_14px_28px_rgba(22,160,90,0.18)] transition hover:-translate-y-0.5 hover:bg-[#12874b]"
      >
        Bu Senaryoyu Hesapla
      </button>
    </aside>
  );
}

function ResultPanel({ result }: { result: OfferResult | null }) {
  if (!result) {
    return (
      <aside className="rounded-[26px] border border-[#dce7e2] bg-white p-5 shadow-[0_18px_48px_rgba(31,43,37,0.08)] md:p-6">
        <div className="flex items-center gap-3 border-b border-[#e8eef5] pb-4">
          <span className="grid h-10 w-10 place-items-center rounded-[14px] bg-[#effdf5] text-[#16a05a]">▣</span>
          <div>
            <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#7b8aa2]">Karar özeti</span>
            <h3 className="mt-1 text-[18px] font-bold tracking-[-0.03em] text-[#172133]">Sonuç bekleniyor</h3>
          </div>
        </div>
        <div className="mt-5 rounded-[18px] border border-dashed border-[#d9e4ee] bg-[#fbfdff] p-5 text-[14px] leading-7 text-[#72819a]">
          Formu doldurup <strong>Hesapla ve Sonuçları Göster</strong> dediğinde NBM kırılımı, banka kredisi kıyası ve
          karar yorumu burada oluşur.
        </div>
      </aside>
    );
  }

  const breakdown = result.selectedScenario.nbmBreakdown;
  const loan = result.loanComparison?.summary;

  return (
    <aside className="rounded-[26px] border border-[#dce7e2] bg-white p-5 shadow-[0_18px_48px_rgba(31,43,37,0.08)] md:p-6">
      <div className="flex items-center gap-3 border-b border-[#e8eef5] pb-4">
        <span className="grid h-10 w-10 place-items-center rounded-[14px] bg-[#effdf5] text-[#16a05a]">▣</span>
        <div>
          <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#7b8aa2]">Hesaplama Özeti</span>
          <h3 className="mt-1 text-[18px] font-bold tracking-[-0.03em] text-[#172133]">Net bugünkü maliyet görünümü</h3>
        </div>
      </div>

      <div className="mt-5 rounded-[18px] border border-[#d2efdf] bg-[#effdf5] px-4 py-4 text-center">
        <span className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[#168b53]">Toplam geri ödeme (nominal)</span>
        <strong className="mt-1.5 block text-[28px] font-black tracking-[-0.05em] text-[#0f5636]">{formatMoney(result.totalNominalOutflow)}</strong>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-[14px] border border-[#e3ebf4] bg-[#f8fbff] px-4 py-3 text-center">
          <span className="block text-[12px] text-[#7b8aa2]">Vade (Ay)</span>
          <strong className="mt-1.5 block text-[18px] font-black text-[#1c2433]">{result.selectedScenario.cashflow.length - 1}</strong>
        </div>
        <div className="rounded-[14px] border border-[#e3ebf4] bg-[#f8fbff] px-4 py-3 text-center">
          <span className="block text-[12px] text-[#7b8aa2]">Teslim Ayı</span>
          <strong className="mt-1.5 block text-[18px] font-black text-[#1c2433]">{result.selectedScenario.deliveryMonth}</strong>
        </div>
      </div>

      <div className="mt-4 rounded-[18px] border border-[#dce7e2] bg-white">
        <div className="border-b border-[#e7eef5] px-4 py-3">
          <h4 className="text-[13px] font-bold uppercase tracking-[0.06em] text-[#1c2433]">Net maliyet (NBM) detayı</h4>
        </div>
        <div className="px-4 py-2">
          <SummaryLine label="Peşinat PV" value={formatMoney(breakdown.downPaymentPv)} tone="red" />
          <SummaryLine label="Hizmet Bedeli PV" value={formatMoney(breakdown.serviceFeePv)} tone="red" />
          <SummaryLine label="Taksitler PV" value={formatMoney(breakdown.installmentsPv)} tone="red" />
          <SummaryLine label="Kira PV" value={formatMoney(breakdown.rentPv)} tone="red" />
          <SummaryLine label="Toplam NBM" value={formatMoney(result.totalNBM)} tone="green" />
        </div>
      </div>

      <div className="mt-4 rounded-[18px] border border-[#dce7e2] bg-[#fbfdff] px-4 py-4">
        <div className="grid gap-3">
          {result.commentary.map((line) => (
            <p key={line} className="text-[13px] leading-6 text-[#5e6f85]">
              {line}
            </p>
          ))}
          {result.riskWarning ? (
            <p className="rounded-[14px] border border-[#f4dfa3] bg-[#fff7df] px-4 py-3 text-[13px] leading-6 text-[#8b6b18]">
              {result.riskWarning}
            </p>
          ) : null}
        </div>
      </div>

      {loan ? (
        <div className="mt-4 rounded-[18px] border border-[#dce7e2] bg-[#fbfdff] px-4 py-4">
          <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#74829a]">Banka kredisi kıyası</span>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {[
              ["Kredi ana para", formatMoney(loan.principal)],
              ["Net ele geçen kredi", formatMoney(loan.netDisbursed)],
              ["Aylık taksit", formatMoney(loan.monthlyPayment)],
              ["Toplam taksit ödemesi", formatMoney(loan.totalInstallmentPayment)],
              ["Toplam faiz", formatMoney(loan.totalInterest)],
              ["Toplam KKDF", formatMoney(loan.totalKKDF)],
              ["Toplam BSMV", formatMoney(loan.totalBSMV)],
              ["Kredi hariç masraf", formatMoney(loan.fee)],
              ["Toplam geri ödeme", formatMoney(loan.totalRepayment)],
              ["Toplam kredi maliyeti", formatMoney(loan.totalCreditCost)],
              ["Efektif aylık maliyet", formatPercent(loan.effectiveMonthlyCostRate * 100, 2)],
              ["Efektif yıllık maliyet", formatPercent(loan.effectiveAnnualCost * 100, 2)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[13px] border border-[#e3ebf4] bg-white px-4 py-3">
                <span className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[#7b8aa2]">{label}</span>
                <strong className="mt-2 block text-[16px] font-black text-[#172133]">{value}</strong>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </aside>
  );
}

export function CalculatorSection() {
  const [assetType, setAssetType] = useState<AssetType>("Konut");
  const [offer, setOffer] = useState<OfferState>(exampleOffer);
  const [result, setResult] = useState<OfferResult | null>(() => calculateOffer("Konut", exampleOffer));
  const [warnings, setWarnings] = useState<string[]>([]);
  const resultRef = useRef<HTMLDivElement | null>(null);

  const companyNote = useMemo(() => companyParams[offer.company].notes, [offer.company]);
  const priceLabel = assetType === "Konut" ? "Evin Fiyatı (TL)" : "Araç Fiyatı (TL)";

  const updateOffer = <T extends keyof OfferState>(key: T, value: OfferState[T]) => {
    setOffer((current) => {
      if (key === "company") {
        const nextCompany = value as CompanyName;
        const previousDefault = `${companyParams[current.company].defaultServiceFeeRate}`.replace(".", ",");
        const nextDefault = `${companyParams[nextCompany].defaultServiceFeeRate}`.replace(".", ",");
        return {
          ...current,
          company: nextCompany,
          serviceFee: !current.serviceFee || current.serviceFee === previousDefault ? nextDefault : current.serviceFee,
        };
      }

      return { ...current, [key]: value };
    });
  };

  const handleExample = () => {
    setAssetType("Konut");
    setOffer(exampleOffer);
    const next = calculateOffer("Konut", exampleOffer);
    setResult(next);
    setWarnings(next.warnings);
    window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  const handleCalculate = () => {
    const next = calculateOffer(assetType, offer);
    setResult(next);
    setWarnings(next.warnings);
    window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  return (
    <section id="calculator" className="page-container relative z-20 mt-8 scroll-mt-24">
      <div className="grid items-start gap-7 lg:grid-cols-[1.14fr_0.86fr]">
        <div className="rounded-[26px] border border-[#dce7e2] bg-white p-5 shadow-[0_18px_48px_rgba(31,43,37,0.08)] md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e8eef5] pb-4">
            <h2 className="text-[18px] font-bold tracking-[-0.03em] text-[#1c2433] md:text-[20px]">Tasarruf Finansmanı Maliyet Hesaplayıcı</h2>
            <button
              className="rounded-full bg-[#e9fbef] px-4 py-2 text-[14px] font-medium text-[#179253] transition-all duration-300 hover:bg-[#dcf7e6]"
              onClick={handleExample}
              type="button"
            >
              Örnek Senaryoyu Doldur
            </button>
          </div>

          <div className="mt-5 grid gap-6">
            <div className="grid gap-5 md:grid-cols-[1fr_1fr_1.08fr]">
              <div>
                <InputLabel>Varlık Tipi</InputLabel>
                <div className="mt-2">
                  <SegmentGroup
                    value={assetType}
                    onChange={(value) => setAssetType(value as AssetType)}
                    options={[
                      { label: "Konut", value: "Konut" },
                      { label: "Araba", value: "Araba" },
                    ]}
                  />
                </div>
              </div>

              <div>
                <InputLabel>Finansman Modeli</InputLabel>
                <div className="mt-2">
                  <SegmentGroup
                    value={offer.model}
                    onChange={(value) => updateOffer("model", value as OfferState["model"])}
                    options={[
                      { label: "Çekilişsiz", value: "cekilissiz" },
                      { label: "Çekilişli", value: "cekilisli" },
                    ]}
                  />
                </div>
              </div>

              <label className="grid gap-2">
                <InputLabel>Şirket Seçimi</InputLabel>
                <select
                  className="form-control !h-[56px] !rounded-[16px] !bg-[#f9fbfe] !font-medium"
                  value={offer.company}
                  onChange={(event) => updateOffer("company", event.target.value as CompanyName)}
                >
                  {COMPANY_OPTIONS.map((company) => (
                    <option key={company} value={company}>
                      {company}
                    </option>
                  ))}
                </select>
                <span className="text-[12px] leading-5 text-[#8492a6]">{companyNote}</span>
              </label>
            </div>

            <div className="border-t border-[#e8eef5] pt-6">
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                <Field label={priceLabel} value={offer.assetPrice} onChange={(value) => updateOffer("assetPrice", value)} placeholder="3.000.000" />
                <Field label="Peşinat (TL)" value={offer.downPayment} onChange={(value) => updateOffer("downPayment", value)} placeholder="1.000.000" />
                <Field
                  label="Taksit / Vade (Ay)"
                  value={offer.term}
                  onChange={(value) => updateOffer("term", value)}
                  placeholder="48"
                  help={assetType === "Konut" ? "Konutlarda max 120 ay." : "Araçlarda max 60 ay."}
                />
                <Field label="Aylık Ödeme" value={offer.monthlyPayment} onChange={(value) => updateOffer("monthlyPayment", value)} placeholder="41.667" />
              </div>

              <div className="mt-5 flex flex-wrap gap-8">
                <ToggleField checked={offer.escalating} label="Artışlı Taksit Planı" onChange={(checked) => updateOffer("escalating", checked)} />
                <ToggleField checked={offer.manualPlan} label="Manuel Plan Oluştur" onChange={(checked) => updateOffer("manualPlan", checked)} />
              </div>
            </div>

            {offer.manualPlan ? (
              <Field
                textarea
                label="Manuel Plan"
                value={offer.manualPlanText}
                onChange={(value) => updateOffer("manualPlanText", value)}
                placeholder="41.667, 41.667, 55.000 veya satır satır girin"
              />
            ) : null}

            <div className="border-t border-[#e8eef5] pt-6">
              <div className="grid gap-5 md:grid-cols-3">
                <Field label="Tahmini Teslimat" value={offer.delivery} onChange={(value) => updateOffer("delivery", value)} placeholder="12" />
                <Field label="Hizmet Bedeli / Organizasyon Ücreti (%)" value={offer.serviceFee} onChange={(value) => updateOffer("serviceFee", value)} placeholder="7,5" />
                <Field label="Kira (TL/ay)" value={offer.rent} onChange={(value) => updateOffer("rent", value)} placeholder="25.000" />
              </div>
            </div>

            <div className="rounded-[18px] border border-[#e4ecf4] bg-[#fbfdff] p-4">
              <button
                className="flex w-full items-center justify-between text-left text-[13px] font-bold uppercase tracking-[0.08em] text-[#7b8aa2]"
                onClick={() => updateOffer("advancedOpen", !offer.advancedOpen)}
                type="button"
              >
                Gelişmiş Parametreler
                <span>{offer.advancedOpen ? "−" : "+"}</span>
              </button>
              {offer.advancedOpen ? (
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <Field label="Yıllık Enflasyon (%)" value={offer.inflation} onChange={(value) => updateOffer("inflation", value)} placeholder="25" />
                  <Field label="Kredi Faizi (% / ay)" value={offer.creditRate} onChange={(value) => updateOffer("creditRate", value)} placeholder="3,19" />
                  <Field label="Yıllık Taksit Artışı (%)" value={offer.yearlyIncrease} onChange={(value) => updateOffer("yearlyIncrease", value)} placeholder="15" />
                </div>
              ) : null}
            </div>

            <div className="rounded-[18px] border border-[#dce7e2] bg-[#fbfdff] p-4">
              <ToggleField
                checked={offer.compareBank}
                label="Tasarruf Finansmanı ile Konut Kredisini Kıyasla"
                onChange={(checked) => updateOffer("compareBank", checked)}
              />
              {offer.compareBank ? (
                <>
                  <div className="mt-4 grid gap-4 md:grid-cols-[1.2fr_0.7fr_0.7fr]">
                    <Field label="Kredi Tutarı (TL)" value={offer.bankAmount} onChange={(value) => updateOffer("bankAmount", value)} placeholder="2.000.000" />
                    <Field label="Aylık Faiz (%)" value={offer.bankRate} onChange={(value) => updateOffer("bankRate", value)} placeholder="2,80" />
                    <Field label="Vade (Ay)" value={offer.bankTerm} onChange={(value) => updateOffer("bankTerm", value)} placeholder="120" />
                  </div>
                  {assetType === "Konut" ? (
                    <label className="mt-4 grid gap-2 md:max-w-[360px]">
                      <InputLabel>Konut Sahipliği</InputLabel>
                      <select
                        className="form-control !h-[44px] !rounded-[14px] !bg-white !font-medium"
                        value={offer.bankHousingStatus}
                        onChange={(event) =>
                          updateOffer("bankHousingStatus", event.target.value as OfferState["bankHousingStatus"])
                        }
                      >
                        <option value="yok">Evi yok</option>
                        <option value="var">Evi var</option>
                      </select>
                    </label>
                  ) : null}
                </>
              ) : null}
            </div>

            {warnings.length ? (
              <div className="rounded-[16px] border border-[#f2d7a7] bg-[#fff9e8] px-4 py-3 text-[13px] leading-6 text-[#8a6413]">
                {warnings.map((warning) => (
                  <p key={warning}>{warning}</p>
                ))}
              </div>
            ) : null}

            <button
              className="rounded-[16px] bg-[#16a05a] px-6 py-4 text-[16px] font-semibold text-white shadow-[0_16px_30px_rgba(22,160,90,0.18)] transition hover:-translate-y-0.5 hover:bg-[#12874b]"
              onClick={handleCalculate}
              type="button"
            >
              Hesapla ve Sonuçları Göster
            </button>
          </div>
        </div>

        <div className="space-y-6" ref={resultRef}>
          <ExampleScenarioCard onApply={handleExample} />
          <ResultPanel result={result} />
        </div>
      </div>
    </section>
  );
}
