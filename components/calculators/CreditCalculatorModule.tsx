"use client";

import { useMemo, useState } from "react";

type LoanTypeKey = "KONUT İLK EVİM" | "KONUT EVİ OLAN" | "TAŞIT" | "İHTİYAÇ";

type LoanDefaults = {
  krediTutari: number;
  vade: number;
  faiz: number;
  enflasyon: number;
  masraf: number;
  bsmv: number;
  kkdf: number;
};

type LoanForm = Record<keyof LoanDefaults, string>;

type ScheduleRow = {
  donem: number;
  taksit: number;
  anapara: number;
  faizTutar: number;
  kkdfTutar: number;
  bsmvTutar: number;
  kalan: number;
};

const defaults: Record<LoanTypeKey, LoanDefaults> = {
  "KONUT İLK EVİM": {
    krediTutari: 5_000_000,
    vade: 84,
    faiz: 2.7,
    enflasyon: 25,
    masraf: 0,
    bsmv: 0,
    kkdf: 0,
  },
  "KONUT EVİ OLAN": {
    krediTutari: 500_000,
    vade: 60,
    faiz: 2.85,
    enflasyon: 25,
    masraf: 0,
    bsmv: 15,
    kkdf: 0,
  },
  TAŞIT: {
    krediTutari: 100_000,
    vade: 12,
    faiz: 3.45,
    enflasyon: 25,
    masraf: 0,
    bsmv: 15,
    kkdf: 15,
  },
  İHTİYAÇ: {
    krediTutari: 100_000,
    vade: 12,
    faiz: 4.19,
    enflasyon: 25,
    masraf: 0,
    bsmv: 15,
    kkdf: 15,
  },
};

const fieldLabels: Array<[keyof LoanDefaults, string, "decimal" | "numeric"]> = [
  ["krediTutari", "Kredi Tutarı", "decimal"],
  ["vade", "Kredi Vadesi", "numeric"],
  ["faiz", "Kredi Faizi (%)", "decimal"],
  ["enflasyon", "Enflasyon (%)", "decimal"],
  ["masraf", "Kredi Hariç Masraf", "decimal"],
  ["bsmv", "BSMV (%)", "decimal"],
  ["kkdf", "KKDF (%)", "decimal"],
];

function parseTR(value: string | number | null | undefined) {
  if (value === null || value === undefined) return 0;
  const clean = String(value).replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  const parsed = Number(clean);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNumber(value: number, digits = 2) {
  const safeValue = Number.isFinite(value) ? value : 0;
  return safeValue.toLocaleString("tr-TR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function formatTL(value: number) {
  return `${formatNumber(value, 2)} TL`;
}

function formatPct(value: number) {
  return `${formatNumber(value * 100, 2)}%`;
}

function formatInputNumber(value: number, forceDecimals = false) {
  const digits = forceDecimals ? 2 : value % 1 === 0 ? 0 : 2;
  return formatNumber(value, digits);
}

function pmt(rate: number, nper: number, pv: number) {
  if (nper === 0) return 0;
  if (Math.abs(rate) < 1e-12) return pv / nper;
  return (pv * rate) / (1 - Math.pow(1 + rate, -nper));
}

function rate(nper: number, pmtAmount: number, pv: number, fv = 0) {
  if (nper <= 0) return 0;

  const f = (r: number) => {
    if (Math.abs(r) < 1e-10) return pv + pmtAmount * nper + fv;
    return pv + (pmtAmount * (1 - Math.pow(1 + r, -nper))) / r + fv * Math.pow(1 + r, -nper);
  };

  let low = -0.999999;
  let high = 1;
  let fLow = f(low);
  let fHigh = f(high);

  while (fLow * fHigh > 0 && high < 100) {
    high *= 2;
    fHigh = f(high);
  }

  if (fLow * fHigh > 0) {
    let current = 0.01;
    for (let index = 0; index < 100; index += 1) {
      const fx = f(current);
      const h = 1e-6;
      const dfx = (f(current + h) - f(current - h)) / (2 * h);
      if (!Number.isFinite(dfx) || Math.abs(dfx) < 1e-12) break;
      const next = current - fx / dfx;
      if (!Number.isFinite(next) || next <= -0.999999) break;
      if (Math.abs(next - current) < 1e-12) return next;
      current = next;
    }
    return Number.NaN;
  }

  for (let index = 0; index < 140; index += 1) {
    const mid = (low + high) / 2;
    const fMid = f(mid);
    if (Math.abs(fMid) < 1e-8) return mid;
    if (fLow * fMid <= 0) {
      high = mid;
      fHigh = fMid;
    } else {
      low = mid;
      fLow = fMid;
    }
  }

  return (low + high) / 2;
}

function presetToForm(type: LoanTypeKey): LoanForm {
  const preset = defaults[type];
  return {
    krediTutari: formatInputNumber(preset.krediTutari),
    vade: String(preset.vade),
    faiz: formatInputNumber(preset.faiz),
    enflasyon: formatInputNumber(preset.enflasyon),
    masraf: formatInputNumber(preset.masraf),
    bsmv: formatInputNumber(preset.bsmv),
    kkdf: formatInputNumber(preset.kkdf),
  };
}

function formatDuringTyping(value: string, key: keyof LoanDefaults) {
  if (key === "vade") return value.replace(/\D/g, "");

  const hasComma = value.includes(",");
  const endsWithComma = value.endsWith(",");
  const [rawInteger = "", ...rawDecimals] = value.split(",");
  const integerPart = rawInteger.replace(/\D/g, "");
  const decimalPart = rawDecimals.join("").replace(/\D/g, "").slice(0, 2);
  const formattedInteger = integerPart
    ? Number(integerPart).toLocaleString("tr-TR", { maximumFractionDigits: 0 })
    : "";

  if (hasComma) return `${formattedInteger},${decimalPart}`;
  if (endsWithComma) return `${formattedInteger},`;
  return formattedInteger;
}

function normalizeOnBlur(value: string, key: keyof LoanDefaults) {
  const parsed = parseTR(value);
  if (key === "vade") return String(Math.round(parsed || 0));
  return formatInputNumber(parsed, value.includes(","));
}

function calculate(form: LoanForm) {
  const krediTutari = parseTR(form.krediTutari);
  const vade = Math.max(0, Math.round(parseTR(form.vade)));
  const faiz = parseTR(form.faiz);
  const enflasyon = parseTR(form.enflasyon);
  const masraf = parseTR(form.masraf);
  const bsmv = parseTR(form.bsmv);
  const kkdf = parseTR(form.kkdf);

  const aylikIskonto = enflasyon / 12 / 100;
  const efektifAylikFaiz = (faiz / 100) * (1 + (bsmv + kkdf) / 100);
  const taksit = pmt(efektifAylikFaiz, vade, krediTutari);
  const krediSonrasiEleGecen = krediTutari - masraf;

  let kalan = krediTutari;
  let npvOdemeler = 0;
  let toplamFaiz = 0;
  const rows: ScheduleRow[] = [];

  for (let donem = 1; donem <= vade; donem += 1) {
    const faizTutar = kalan * (faiz / 100);
    const kkdfTutar = (faizTutar * kkdf) / 100;
    const bsmvTutar = (faizTutar * bsmv) / 100;
    const anapara = taksit - faizTutar - kkdfTutar - bsmvTutar;

    kalan -= anapara;
    if (donem <= 170) toplamFaiz += faizTutar;
    npvOdemeler += taksit / Math.pow(1 + aylikIskonto, donem);

    rows.push({
      donem,
      taksit,
      anapara,
      faizTutar,
      kkdfTutar,
      bsmvTutar,
      kalan: Math.abs(kalan) < 0.01 ? 0 : kalan,
    });
  }

  const toplamFaizliGeriOdeme = toplamFaiz + krediTutari;
  const toplamGeriOdeme = toplamFaizliGeriOdeme + masraf;
  const netBugunkuDeger = Math.abs(krediSonrasiEleGecen - npvOdemeler);
  const aylikRate = rate(vade, -taksit, krediSonrasiEleGecen);
  const yillikFaizMaliyeti = Math.pow(1 + aylikRate, 12) - 1;

  return {
    netBugunkuDeger,
    taksit,
    yillikFaizMaliyeti,
    rows,
  };
}

export function CreditCalculatorModule() {
  const [loanType, setLoanType] = useState<LoanTypeKey>("KONUT İLK EVİM");
  const [form, setForm] = useState<LoanForm>(() => presetToForm("KONUT İLK EVİM"));
  const result = useMemo(() => calculate(form), [form]);

  function updateField(key: keyof LoanDefaults, value: string) {
    setForm((current) => ({ ...current, [key]: formatDuringTyping(value, key) }));
  }

  function blurField(key: keyof LoanDefaults) {
    setForm((current) => ({ ...current, [key]: normalizeOnBlur(current[key], key) }));
  }

  function changeLoanType(nextType: LoanTypeKey) {
    setLoanType(nextType);
    setForm(presetToForm(nextType));
  }

  function handleCalculate() {
    setForm((current) => {
      const normalized = { ...current };
      fieldLabels.forEach(([key]) => {
        normalized[key] = normalizeOnBlur(current[key], key);
      });
      return normalized;
    });
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_12%_0%,rgba(197,155,69,0.28),transparent_28%),radial-gradient(circle_at_88%_10%,rgba(21,94,239,0.26),transparent_28%),linear-gradient(135deg,#08111f_0%,#101c33_46%,#edf3fb_46%,#f6f8fb_100%)]">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[length:42px_42px] [mask-image:linear-gradient(180deg,rgba(0,0,0,0.75),transparent_65%)]" />
      <div className="relative mx-auto max-w-[1220px] px-[18px] pb-[60px] pt-[34px]">
        <section className="mb-[22px] flex min-h-[150px] items-end justify-between gap-[18px] text-white max-[980px]:min-h-[120px] max-[980px]:flex-col max-[980px]:items-start">
          <h1 className="m-0 text-[clamp(32px,4.6vw,56px)] font-black leading-none tracking-[-0.055em]">
            Kredi Hesaplama
          </h1>
          <span className="whitespace-nowrap rounded-full border border-white/20 bg-white/10 px-[14px] py-[10px] text-[13px] font-extrabold tracking-[0.02em] text-slate-200 backdrop-blur-[14px] max-[700px]:hidden">
            Finansal Hesaplama Paneli
          </span>
        </section>

        <section className="grid items-start gap-[22px] lg:grid-cols-[430px_1fr]">
          <article className="overflow-hidden rounded-[24px] border border-white/70 bg-white/95 shadow-[0_24px_70px_rgba(2,8,23,0.18)] backdrop-blur-[20px] lg:sticky lg:top-[18px]">
            <div className="flex items-center justify-between gap-3 border-b border-[#e2e8f0] bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-[22px] py-5">
              <h2 className="flex items-center gap-[10px] text-[17px] font-black tracking-[-0.02em] text-[#0f172a] before:h-7 before:w-[10px] before:rounded-full before:bg-[linear-gradient(180deg,#c59b45,#f2d58b)] before:shadow-[0_0_0_4px_rgba(197,155,69,0.15)]">
                Giriş Bilgileri
              </h2>
            </div>
            <div className="p-[22px]">
              <div className="grid grid-cols-2 gap-4 max-[700px]:grid-cols-1">
                <label className="col-span-full block">
                  <span className="mb-2 flex items-center justify-between gap-2 text-[12px] font-extrabold tracking-[0.01em] text-[#334155]">
                    Kredi Türü
                  </span>
                  <select
                    className="w-full cursor-pointer rounded-2xl border border-[#cbd5e1] bg-[linear-gradient(180deg,#fff,#fbfdff)] px-3.5 py-3.5 text-[15px] font-bold text-[#0f172a] shadow-[0_1px_0_rgba(15,23,42,0.03)] outline-none transition focus:-translate-y-px focus:border-[#155eef] focus:shadow-[0_0_0_4px_rgba(21,94,239,0.12),0_12px_24px_rgba(15,23,42,0.06)]"
                    value={loanType}
                    onChange={(event) => changeLoanType(event.target.value as LoanTypeKey)}
                  >
                    {Object.keys(defaults).map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>

                {fieldLabels.map(([key, label, inputMode]) => (
                  <label className={key === "krediTutari" ? "col-span-full block" : "block"} key={key}>
                    <span className="mb-2 flex items-center justify-between gap-2 text-[12px] font-extrabold tracking-[0.01em] text-[#334155]">
                      {label}
                    </span>
                    <input
                      className="w-full rounded-2xl border border-[#cbd5e1] bg-[linear-gradient(180deg,#fff,#fbfdff)] px-3.5 py-3.5 text-right text-[15px] font-bold text-[#0f172a] shadow-[0_1px_0_rgba(15,23,42,0.03)] outline-none transition focus:-translate-y-px focus:border-[#155eef] focus:shadow-[0_0_0_4px_rgba(21,94,239,0.12),0_12px_24px_rgba(15,23,42,0.06)]"
                      inputMode={inputMode}
                      value={form[key]}
                      onBlur={() => blurField(key)}
                      onChange={(event) => updateField(key, event.target.value)}
                    />
                  </label>
                ))}
              </div>

              <button
                className="mt-[18px] w-full rounded-[18px] border-0 bg-[linear-gradient(135deg,#0b3a75_0%,#155eef_100%)] px-[18px] py-4 text-[16px] font-black text-white shadow-[0_18px_36px_rgba(21,94,239,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_46px_rgba(21,94,239,0.34)]"
                type="button"
                onClick={handleCalculate}
              >
                Hesapla
              </button>
            </div>
          </article>

          <article className="overflow-hidden rounded-[24px] border border-white/70 bg-white/95 shadow-[0_24px_70px_rgba(2,8,23,0.18)] backdrop-blur-[20px]">
            <div className="flex items-center justify-between gap-3 border-b border-[#e2e8f0] bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-[22px] py-5">
              <h2 className="flex items-center gap-[10px] text-[17px] font-black tracking-[-0.02em] text-[#0f172a] before:h-7 before:w-[10px] before:rounded-full before:bg-[linear-gradient(180deg,#c59b45,#f2d58b)] before:shadow-[0_0_0_4px_rgba(197,155,69,0.15)]">
                Sonuçlar
              </h2>
            </div>
            <div className="p-[22px]">
              <div className="grid grid-cols-3 gap-[14px] max-[700px]:grid-cols-1">
                <div className="relative min-h-28 overflow-hidden rounded-[20px] border border-white/20 bg-[linear-gradient(135deg,#0b3a75_0%,#155eef_100%)] p-[18px] text-white shadow-[0_14px_35px_rgba(15,23,42,0.08)] after:absolute after:right-[-28px] after:top-[-28px] after:h-[78px] after:w-[78px] after:rounded-full after:bg-white/10">
                  <div className="mb-[10px] text-[12px] font-black uppercase tracking-[0.04em] text-blue-100">
                    Net Bugünkü Değer
                  </div>
                  <div className="relative z-10 break-words text-[24px] font-black tracking-[-0.035em]">
                    {formatTL(result.netBugunkuDeger)}
                  </div>
                </div>
                <div className="relative min-h-28 overflow-hidden rounded-[20px] border border-[#e2e8f0] bg-[linear-gradient(180deg,#fff,#f9fbff)] p-[18px] shadow-[0_14px_35px_rgba(15,23,42,0.08)] after:absolute after:right-[-28px] after:top-[-28px] after:h-[78px] after:w-[78px] after:rounded-full after:bg-[rgba(21,94,239,0.07)]">
                  <div className="mb-[10px] text-[12px] font-black uppercase tracking-[0.04em] text-[#64748b]">
                    Taksit Tutarı
                  </div>
                  <div className="relative z-10 break-words text-[21px] font-black tracking-[-0.035em] text-[#0f172a]">
                    {formatTL(result.taksit)}
                  </div>
                </div>
                <div className="relative min-h-28 overflow-hidden rounded-[20px] border border-[#e2e8f0] bg-[linear-gradient(180deg,#fff,#f9fbff)] p-[18px] shadow-[0_14px_35px_rgba(15,23,42,0.08)] after:absolute after:right-[-28px] after:top-[-28px] after:h-[78px] after:w-[78px] after:rounded-full after:bg-[rgba(21,94,239,0.07)]">
                  <div className="mb-[10px] text-[12px] font-black uppercase tracking-[0.04em] text-[#64748b]">
                    Yıllık Faiz Maliyeti
                  </div>
                  <div className="relative z-10 break-words text-[21px] font-black tracking-[-0.035em] text-[#0f172a]">
                    {formatPct(result.yillikFaizMaliyeti)}
                  </div>
                </div>
              </div>

              <div className="mb-3 mt-7 flex items-center justify-between gap-3 text-[16px] font-black tracking-[-0.02em] text-[#0f172a] after:rounded-full after:border after:border-[#e2e8f0] after:bg-[#f1f5f9] after:px-[10px] after:py-2 after:text-[12px] after:font-extrabold after:text-[#64748b] after:content-['Detaylı_Amortisman']">
                Ödeme Planı
              </div>
              <div className="max-h-[460px] overflow-auto rounded-[20px] border border-[#e2e8f0] bg-white shadow-[0_14px_35px_rgba(15,23,42,0.08)]">
                <table className="w-full min-w-[860px] border-separate border-spacing-0 text-[13px]">
                  <thead>
                    <tr>
                      {["Dönem", "Taksit", "Anapara", "Faiz", "KKDF", "BSMV", "Kalan Anapara"].map((heading) => (
                        <th
                          className="sticky top-0 z-[1] border-b border-[#1e293b] bg-[#0f172a] px-3 py-[13px] text-right text-[11px] font-bold uppercase tracking-[0.03em] text-[#e5e7eb] first:text-center"
                          key={heading}
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((row) => (
                      <tr className="even:bg-[#fafcff] hover:bg-[#eef6ff]" key={row.donem}>
                        <td className="whitespace-nowrap border-b border-[#eef2f7] px-3 py-[11px] text-center font-semibold text-[#334155]">
                          {row.donem}
                        </td>
                        <td className="whitespace-nowrap border-b border-[#eef2f7] px-3 py-[11px] text-right font-semibold text-[#334155]">
                          {formatTL(row.taksit)}
                        </td>
                        <td className="whitespace-nowrap border-b border-[#eef2f7] px-3 py-[11px] text-right font-semibold text-[#334155]">
                          {formatTL(row.anapara)}
                        </td>
                        <td className="whitespace-nowrap border-b border-[#eef2f7] px-3 py-[11px] text-right font-semibold text-[#334155]">
                          {formatTL(row.faizTutar)}
                        </td>
                        <td className="whitespace-nowrap border-b border-[#eef2f7] px-3 py-[11px] text-right font-semibold text-[#334155]">
                          {formatTL(row.kkdfTutar)}
                        </td>
                        <td className="whitespace-nowrap border-b border-[#eef2f7] px-3 py-[11px] text-right font-semibold text-[#334155]">
                          {formatTL(row.bsmvTutar)}
                        </td>
                        <td className="whitespace-nowrap border-b border-[#eef2f7] px-3 py-[11px] text-right font-semibold text-[#334155]">
                          {formatTL(row.kalan)}
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
