"use client";

import { useMemo, useRef, useState } from "react";

type FormState = {
  assetType: "Konut" | "Araba";
  model: "Çekilişsiz" | "Çekilişli";
  company: string;
  assetPrice: string;
  downPayment: string;
  term: string;
  monthlyPayment: string;
  delivery: string;
  serviceFee: string;
  rent: string;
  inflation: string;
  creditRate: string;
  yearlyIncrease: string;
  escalating: boolean;
  manualPlan: boolean;
  compareBank: boolean;
};

const emptyForm: FormState = {
  assetType: "Konut",
  model: "Çekilişsiz",
  company: "Diğer",
  assetPrice: "",
  downPayment: "",
  term: "",
  monthlyPayment: "",
  delivery: "",
  serviceFee: "",
  rent: "",
  inflation: "",
  creditRate: "",
  yearlyIncrease: "",
  escalating: false,
  manualPlan: false,
  compareBank: false,
};

const exampleForm: FormState = {
  assetType: "Konut",
  model: "Çekilişsiz",
  company: "Diğer",
  assetPrice: "3000000",
  downPayment: "1000000",
  term: "48",
  monthlyPayment: "41667",
  delivery: "13",
  serviceFee: "7.5",
  rent: "25000",
  inflation: "32",
  creditRate: "3.19",
  yearlyIncrease: "15",
  escalating: false,
  manualPlan: false,
  compareBank: true,
};

const money = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 });

function parseNumber(value: string) {
  return Number(value.replace(/\./g, "").replace(",", ".")) || 0;
}

function formatMoney(value: number) {
  return `₺ ${money.format(Math.max(0, Math.round(value)))}`;
}

function Toggle({
  checked,
  label,
  onClick,
}: {
  checked: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button className="flex items-center gap-3 text-left text-sm font-bold text-slate-700" onClick={onClick} type="button">
      <span className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-[var(--green)]" : "bg-slate-200"}`}>
        <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${checked ? "left-6" : "left-1"}`} />
      </span>
      {label}
    </button>
  );
}

export function CalculatorSection() {
  const [form, setForm] = useState<FormState>(exampleForm);
  const [showResult, setShowResult] = useState(false);
  const [resultPulse, setResultPulse] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const result = useMemo(() => {
    const assetPrice = parseNumber(form.assetPrice);
    const downPayment = parseNumber(form.downPayment);
    const term = parseNumber(form.term);
    const monthly = parseNumber(form.monthlyPayment);
    const delivery = parseNumber(form.delivery);
    const feeRate = parseNumber(form.serviceFee);
    const rent = parseNumber(form.rent);
    const fee = assetPrice * (feeRate / 100);
    const totalPaid = downPayment + fee + monthly * term;
    const waitingCost = Math.max(0, delivery) * rent;
    const estimatedNet = totalPaid + waitingCost - assetPrice;
    const bankComparable = Math.max(0, assetPrice - downPayment) * 1.62;

    return {
      fee,
      totalPaid,
      estimatedNet,
      bankComparable,
      delivery: delivery || 0,
      monthly: monthly || 0,
    };
  }, [form]);

  const update = (key: keyof FormState, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const fillExample = () => {
    setForm(exampleForm);
    setShowResult(false);
    document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const clearForm = () => {
    setForm(emptyForm);
    setShowResult(false);
  };

  const calculate = () => {
    setShowResult(true);
    setResultPulse(true);
    window.setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
    window.setTimeout(() => setResultPulse(false), 1200);
  };

  return (
    <section id="calculator" className="page-container relative z-20 mt-8">
      <div className="mx-auto max-w-[900px] rounded-2xl border border-slate-200 bg-white p-6 soft-shadow md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h2 className="text-2xl font-black tracking-[-0.03em] text-slate-950">Tasarruf Finansmanı Maliyet Hesaplayıcı</h2>
            <p className="mt-2 text-sm text-slate-500">Sözleşme bilgilerini girin, reel maliyeti ve banka kıyasını görün.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="rounded-full bg-[var(--green-soft)] px-5 py-2 text-sm font-extrabold text-[var(--green-dark)]" onClick={fillExample} type="button">
              Örnek Senaryoyu Doldur
            </button>
            <button className="rounded-full bg-slate-100 px-5 py-2 text-sm font-extrabold text-slate-600" onClick={clearForm} type="button">
              Temizle
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-6">
          <div className="grid gap-5 md:grid-cols-[1fr_1fr_1.12fr]">
            <div>
              <span className="form-label">Varlık Tipi</span>
              <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1">
                {(["Konut", "Araba"] as const).map((type) => (
                  <button className={`segment-button ${form.assetType === type ? "active" : ""}`} onClick={() => update("assetType", type)} type="button" key={type}>
                    {type === "Konut" ? "⌂" : "▭"} {type}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="form-label">Finansman Modeli</span>
              <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1">
                {(["Çekilişsiz", "Çekilişli"] as const).map((model) => (
                  <button className={`segment-button ${form.model === model ? "active" : ""}`} onClick={() => update("model", model)} type="button" key={model}>
                    {model}
                  </button>
                ))}
              </div>
            </div>
            <label>
              <span className="form-label">Şirket Seçimi</span>
              <select className="form-control" value={form.company} onChange={(event) => update("company", event.target.value)}>
                <option>Diğer</option>
                <option>Firma A</option>
                <option>Firma B</option>
                <option>Firma C</option>
              </select>
            </label>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {[
                ["assetPrice", "Evin Fiyatı (TL) *", "3.000.000"],
                ["downPayment", "Peşinat (TL)", "1.000.000"],
                ["term", "Taksit (Ay) *", "48"],
                ["monthlyPayment", "Aylık Ödeme *", "41.667"],
              ].map(([key, label, placeholder]) => (
                <label key={key}>
                  <span className="form-label">{label}</span>
                  <input className="form-control" placeholder={placeholder} value={form[key as keyof FormState] as string} onChange={(event) => update(key as keyof FormState, event.target.value)} />
                </label>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-7">
              <Toggle checked={form.escalating} label="Artışlı Taksit Planı" onClick={() => update("escalating", !form.escalating)} />
              <Toggle checked={form.manualPlan} label="Manuel Plan Oluştur" onClick={() => update("manualPlan", !form.manualPlan)} />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <div className="grid gap-5 md:grid-cols-3">
              {[
                ["delivery", "Tahmini Teslimat", "13. ay"],
                ["serviceFee", "Hizmet Bedeli (%)", "7.5"],
                ["rent", "Kira (TL/ay)", "25.000"],
              ].map(([key, label, placeholder]) => (
                <label key={key}>
                  <span className="form-label">{label}</span>
                  <input className="form-control" placeholder={placeholder} value={form[key as keyof FormState] as string} onChange={(event) => update(key as keyof FormState, event.target.value)} />
                </label>
              ))}
            </div>
            <div className="mt-3 max-w-[210px]">
              <div className="h-1.5 rounded-full bg-slate-200">
                <div className="h-1.5 rounded-full bg-[var(--green)] transition-all" style={{ width: `${Math.min(100, Math.max(8, result.delivery * 3.7))}%` }} />
              </div>
            </div>
          </div>

          <details className="border-t border-slate-200 pt-6">
            <summary className="cursor-pointer text-sm font-black uppercase tracking-[0.12em] text-slate-500">Gelişmiş Parametreler</summary>
            <div className="mt-5 grid gap-5 md:grid-cols-3">
              {[
                ["inflation", "Yıllık Enflasyon (%)", "32.0"],
                ["creditRate", "Kredi Faizi (% / ay)", "3.19"],
                ["yearlyIncrease", "Yıllık Taksit Artışı (%)", "15.0"],
              ].map(([key, label, placeholder]) => (
                <label key={key}>
                  <span className="form-label">{label}</span>
                  <input className="form-control" placeholder={placeholder} value={form[key as keyof FormState] as string} onChange={(event) => update(key as keyof FormState, event.target.value)} />
                </label>
              ))}
            </div>
          </details>

          <div className="border-t border-slate-200 pt-5">
            <div className="mb-6">
              <Toggle checked={form.compareBank} label="Tasarruf Finansmanı ile Konut Kredisini Kıyasla" onClick={() => update("compareBank", !form.compareBank)} />
            </div>
            <button className="h-14 w-full rounded-xl bg-[var(--green)] text-base font-black text-white shadow-[0_16px_30px_rgba(6,148,95,0.2)] transition hover:-translate-y-0.5 hover:bg-[var(--green-dark)]" onClick={calculate} type="button">
              HESAPLA VE SONUÇLARI GÖSTER
            </button>
          </div>

          {showResult ? (
            <div
              ref={resultRef}
              className={`grid gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 transition md:grid-cols-4 ${
                resultPulse ? "scale-[1.015] shadow-[0_0_0_6px_rgba(6,148,95,0.14),0_18px_34px_rgba(6,148,95,0.16)]" : ""
              }`}
            >
              <div>
                <span className="text-xs font-black uppercase tracking-wide text-slate-500">Net maliyet</span>
                <strong className="mt-2 block text-xl font-black text-slate-950">{formatMoney(result.estimatedNet)}</strong>
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wide text-slate-500">Toplam ödeme</span>
                <strong className="mt-2 block text-xl font-black text-slate-950">{formatMoney(result.totalPaid)}</strong>
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wide text-slate-500">Hizmet bedeli</span>
                <strong className="mt-2 block text-xl font-black text-slate-950">{formatMoney(result.fee)}</strong>
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wide text-slate-500">Banka kıyası</span>
                <strong className="mt-2 block text-xl font-black text-slate-950">{form.compareBank ? formatMoney(result.bankComparable) : "Kapalı"}</strong>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
