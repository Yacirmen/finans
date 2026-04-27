"use client";

import { useMemo, useState } from "react";

type FormState = {
  vade: string;
  tutar: string;
  enflasyon: string;
  kira: string;
  pesinat: string;
  orgOran: string;
  teslim: string;
  tfFaiz: string;
  krediFaiz: string;
  masraf: string;
  rowLimit: string;
};

const defaults: FormState = {
  vade: "60",
  tutar: "5.000.000",
  enflasyon: "25",
  kira: "25.000",
  pesinat: "0",
  orgOran: "0,085",
  teslim: "24",
  tfFaiz: "0",
  krediFaiz: "2,7",
  masraf: "0",
  rowLimit: "120",
};

function parseTR(value: string | number | null | undefined) {
  const raw = String(value ?? "").trim().replace(/\s/g, "");
  if (!raw) return 0;
  const parsed = Number(raw.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNumber(value: number, decimals = 0) {
  const safe = Number.isFinite(value) ? value : 0;
  return safe.toLocaleString("tr-TR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function formatTL(value: number) {
  return `${formatNumber(value, 2)} TL`;
}

function formatPct(value: number, decimals = 2) {
  return `${formatNumber(value * 100, decimals)}%`;
}

function formatInput(value: string, decimals = 2) {
  const hasComma = value.includes(",");
  const [integerRaw = "", decimalRaw = ""] = value.split(",");
  const integer = integerRaw.replace(/\D/g, "");
  const decimal = decimalRaw.replace(/\D/g, "").slice(0, decimals);
  const formattedInteger = integer ? Number(integer).toLocaleString("tr-TR") : "";
  return hasComma ? `${formattedInteger},${decimal}` : formattedInteger;
}

function excelPV(rate: number, nper: number, pmt: number, fv = 0, type = 0) {
  if (!Number.isFinite(rate) || !Number.isFinite(nper)) return 0;
  if (rate === 0) return -(fv + pmt * nper);
  const pow = Math.pow(1 + rate, nper);
  return -(fv + (pmt * (1 + rate * type) * (pow - 1)) / rate) / pow;
}

function excelPMT(rate: number, nper: number, pv: number, fv = 0, type = 0) {
  if (!Number.isFinite(rate) || !Number.isFinite(nper) || nper === 0) return 0;
  if (rate === 0) return -(pv + fv) / nper;
  const pow = Math.pow(1 + rate, nper);
  return -(rate * (fv + pow * pv)) / ((1 + rate * type) * (pow - 1));
}

function calculate(form: FormState) {
  const vade = Math.max(1, Math.round(parseTR(form.vade)));
  const tutar = parseTR(form.tutar);
  const enflasyon = parseTR(form.enflasyon);
  const kira = parseTR(form.kira);
  const pesinat = parseTR(form.pesinat);
  const orgOran = parseTR(form.orgOran);
  const teslim = Math.max(0, Math.round(parseTR(form.teslim)));
  const tfFaiz = parseTR(form.tfFaiz);
  const krediFaiz = parseTR(form.krediFaiz);
  const masraf = parseTR(form.masraf);
  const rowLimit = Math.max(1, Math.round(parseTR(form.rowLimit)));
  const iskonto = enflasyon / 12 / 100;

  const tfOrg = tutar * orgOran + pesinat;
  const krOrg = 0;
  const tfFinPV = tutar / Math.pow(1 + iskonto, teslim);
  const krFinPV = tutar;
  const tfTaksit = excelPMT(tfFaiz / 100, vade, -tutar);
  const krTaksit = excelPMT(krediFaiz / 100, vade, -tutar);
  const tfPaymentPV = Array.from({ length: vade }, (_, index) => {
    const month = index + 1;
    return tfTaksit / Math.pow(1 + iskonto, month);
  }).reduce((sum, item) => sum + item, 0);
  const tfOdePV = excelPV(iskonto, teslim, -kira) + tfPaymentPV;
  const krOdePV = excelPV(iskonto, vade, -krTaksit);
  const tfNpv = tfOdePV + tfOrg - tfFinPV;
  const krNpv = krOdePV + krOrg - krFinPV + masraf;
  const better = tfNpv < krNpv ? "Çekilişsiz Sistem Daha Faydalı" : "Kredi Kullanımı Daha Faydalı";

  let paid = 0;
  let mantikliAy = "Bulunamadı";
  let found = false;
  const max = Math.min(vade, Math.max(0, rowLimit));
  const rows = Array.from({ length: max + 1 }, (_, month) => {
    const taksit = month === 0 ? tfOrg : tfTaksit;
    if (month > 0) paid += taksit;
    const paidPct = month === 0 ? 0 : paid / Math.max(tutar, 1);
    const probability = month === 0 ? 0 : 1 / (vade - (month - 1));
    const firstOut = paidPct < 0.4 ? tfOrg : 0;
    const financePv = tutar / Math.pow(1 + iskonto, month);
    const rentPv = excelPV(iskonto, month, -kira);
    const futurePlanPv = Array.from({ length: vade }, (_, index) => {
      const period = index + 1;
      return tfTaksit / Math.pow(1 + iskonto, period);
    }).reduce((sum, item) => sum + item, 0);
    const npv = rentPv + futurePlanPv + firstOut - financePv;
    const decision = npv < krNpv ? "Çekilişsiz Sistem" : "Kredi Kullan";

    if (!found && decision === "Kredi Kullan") {
      mantikliAy = `${month}. ay`;
      found = true;
    }

    return { month, taksit, paidPct, probability, npv, decision };
  });

  return {
    better,
    mantikliAy,
    teslim,
    tf: { org: tfOrg, finPV: tfFinPV, odePV: tfOdePV, npv: tfNpv, taksit: tfTaksit },
    kr: { org: krOrg, finPV: krFinPV, odePV: krOdePV, npv: krNpv, taksit: krTaksit, masraf },
    rows,
  };
}

export function RaffleCreditComparisonModule() {
  const [form, setForm] = useState<FormState>(defaults);
  const result = useMemo(() => calculate(form), [form]);

  function update(key: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [key]: key === "vade" || key === "teslim" || key === "rowLimit" ? value.replace(/\D/g, "") : formatInput(value, 3) }));
  }

  const inputClass =
    "h-[46px] w-full rounded-[15px] border border-[#d0d8e5] bg-white px-[13px] text-right text-[16px] font-black text-[#101828] outline-none transition focus:border-[#155eef] focus:shadow-[0_0_0_4px_rgba(21,94,239,0.12)]";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_8%_0%,rgba(217,164,65,0.20),transparent_26%),linear-gradient(135deg,#07172f_0%,#0d2447_34%,#f4f7fb_34%,#edf3f9_100%)]">
      <div className="mx-auto max-w-[1280px] px-[18px] pb-[54px] pt-[34px]">
        <section className="mb-[22px] flex items-center justify-between gap-[18px] rounded-[30px] border border-white/20 bg-white/10 p-[26px] shadow-[0_22px_60px_rgba(15,35,70,0.14)] max-[980px]:block">
          <div className="flex items-center gap-3.5">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[linear-gradient(135deg,#d9a441,#f6df9b)] font-black text-[#07172f]">
              TF
            </div>
            <div>
              <h1 className="m-0 text-[32px] font-black leading-[1.1] tracking-[-0.03em] text-white">
                Çekilişsiz Model vs Kredi Hesaplama
              </h1>
              <p className="mt-1 text-[13px] font-bold text-slate-300">
                Tasarruf finansman ve kredi senaryosu karşılaştırma aracı
              </p>
            </div>
          </div>
          <span className="rounded-full border border-white/20 bg-white/10 px-3.5 py-2.5 font-black text-white max-[980px]:mt-3 max-[980px]:inline-block">
            Premium Hesaplama Paneli
          </span>
        </section>

        <section className="grid items-start gap-5 lg:grid-cols-[410px_1fr]">
          <aside className="overflow-hidden rounded-[24px] border border-[#e4eaf3] bg-white shadow-[0_10px_30px_rgba(15,35,70,0.10)]">
            <div className="border-b border-[#e4eaf3] bg-[linear-gradient(180deg,#fff,#f9fbff)] px-5 py-[18px]">
              <h2 className="m-0 text-[17px] font-black">Manuel Giriş Alanları</h2>
            </div>
            <div className="p-5">
              <p className="mb-3 mt-2 flex items-center gap-2 text-[12px] font-black uppercase tracking-[0.11em] text-[#344054] before:h-[7px] before:w-[7px] before:rounded-full before:bg-[#d9a441]">
                Ortak Varsayımlar
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["vade", "Finansman Vadesi", "Ay"],
                  ["tutar", "Finansman Tutarı", "TL"],
                  ["enflasyon", "Enflasyon", "% yıllık"],
                  ["kira", "Kira", "TL"],
                ].map(([key, label, helper]) => (
                  <label className="mb-3.5 block" key={key}>
                    <span className="mb-2 flex justify-between text-[13px] font-black text-[#344054]">
                      {label} <small className="font-bold text-[#98a2b3]">{helper}</small>
                    </span>
                    <input className={inputClass} value={form[key as keyof FormState]} onChange={(event) => update(key as keyof FormState, event.target.value)} />
                  </label>
                ))}
              </div>

              <p className="mb-3 mt-2 flex items-center gap-2 text-[12px] font-black uppercase tracking-[0.11em] text-[#344054] before:h-[7px] before:w-[7px] before:rounded-full before:bg-[#d9a441]">
                Çekilişsiz Tasarruf Finansman
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["pesinat", "Peşinat Tutarı", "TL"],
                  ["orgOran", "Organizasyon Oranı", "örn. 0,085"],
                  ["teslim", "Teslimat Ayı", "Manuel"],
                  ["tfFaiz", "Tasarruf Finansman Faizi", "%"],
                ].map(([key, label, helper]) => (
                  <label className="mb-3.5 block" key={key}>
                    <span className="mb-2 flex justify-between text-[13px] font-black text-[#344054]">
                      {label} <small className="font-bold text-[#98a2b3]">{helper}</small>
                    </span>
                    <input className={inputClass} value={form[key as keyof FormState]} onChange={(event) => update(key as keyof FormState, event.target.value)} />
                  </label>
                ))}
              </div>

              <p className="mb-3 mt-2 flex items-center gap-2 text-[12px] font-black uppercase tracking-[0.11em] text-[#344054] before:h-[7px] before:w-[7px] before:rounded-full before:bg-[#d9a441]">
                Kredi Senaryosu
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["krediFaiz", "Kredi Faizi", "% aylık"],
                  ["masraf", "Kredi Hariç Masraf", "TL"],
                ].map(([key, label, helper]) => (
                  <label className="mb-3.5 block" key={key}>
                    <span className="mb-2 flex justify-between text-[13px] font-black text-[#344054]">
                      {label} <small className="font-bold text-[#98a2b3]">{helper}</small>
                    </span>
                    <input className={inputClass} value={form[key as keyof FormState]} onChange={(event) => update(key as keyof FormState, event.target.value)} />
                  </label>
                ))}
              </div>
            </div>
          </aside>

          <div className="grid gap-5">
            <section className="overflow-hidden rounded-[24px] border border-[#e4eaf3] bg-white shadow-[0_10px_30px_rgba(15,35,70,0.10)]">
              <div className="border-b border-[#e4eaf3] bg-[linear-gradient(180deg,#fff,#f9fbff)] px-5 py-[18px]">
                <h2 className="m-0 text-[17px] font-black">Sonuçlar</h2>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-[1.25fr_1fr_1fr] gap-3 max-[980px]:grid-cols-1">
                  <div className="min-h-[104px] rounded-[20px] border border-[#1b3b68] bg-[linear-gradient(135deg,#07172f,#123461)] p-4">
                    <div className="text-[11px] font-black uppercase tracking-[0.07em] text-[#b9c8dd]">Nihai Değerlendirme</div>
                    <div className="mt-2.5 text-[20px] font-black tracking-[-0.02em] text-white">{result.better}</div>
                  </div>
                  <div className="min-h-[104px] rounded-[20px] border border-[#e4eaf3] bg-white p-4">
                    <div className="text-[11px] font-black uppercase tracking-[0.07em] text-[#667085]">Kredinin Mantıklı Olacağı Ay</div>
                    <div className="mt-2.5 text-[23px] font-black">{result.mantikliAy}</div>
                  </div>
                  <div className="min-h-[104px] rounded-[20px] border border-[#e4eaf3] bg-white p-4">
                    <div className="text-[11px] font-black uppercase tracking-[0.07em] text-[#667085]">Tasarruf Finansman Teslim Ayı</div>
                    <div className="mt-2.5 text-[23px] font-black">{result.teslim}. ay</div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3.5 max-[980px]:grid-cols-1">
                  <ScenarioResult title="Çekilişsiz Tasarruf Finansman Modeli" result={result.tf} delivery={result.teslim} />
                  <ScenarioResult title="Kredi Kullanma Senaryosu" result={result.kr} masraf={result.kr.masraf} />
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-[24px] border border-[#e4eaf3] bg-white shadow-[0_10px_30px_rgba(15,35,70,0.10)]">
              <div className="flex items-center justify-between gap-3 border-b border-[#e4eaf3] bg-[linear-gradient(180deg,#fff,#f9fbff)] px-[18px] py-[15px]">
                <strong className="text-[16px] font-black">Gösterilecek Plan</strong>
                <label className="flex items-center gap-2 text-[13px] font-black text-[#667085]">
                  Satır sayısı
                  <input
                    className="h-[38px] max-w-[110px] rounded-[15px] border border-[#d0d8e5] px-3 text-right text-sm font-black"
                    value={form.rowLimit}
                    onChange={(event) => update("rowLimit", event.target.value)}
                  />
                </label>
              </div>
              <div className="max-h-[540px] overflow-auto">
                <table className="w-full border-separate border-spacing-0 bg-white text-[13px]">
                  <thead>
                    <tr>
                      {["Dönem Sayısı", "Taksit Tutarı", "Ödenen %", "Kura Olasılığı", "NPV", "Karar"].map((head) => (
                        <th className="sticky top-0 z-[1] whitespace-nowrap border-b border-[#edf2f7] bg-[#f8fbff] px-[13px] py-3 text-right text-[11px] font-black uppercase tracking-[0.06em] text-[#475467] first:text-left" key={head}>
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((row) => (
                      <tr className="hover:bg-[#fbfdff]" key={row.month}>
                        <td className="whitespace-nowrap border-b border-[#edf2f7] px-[13px] py-3 text-left">{row.month}</td>
                        <td className="whitespace-nowrap border-b border-[#edf2f7] px-[13px] py-3 text-right">{formatTL(row.taksit)}</td>
                        <td className="whitespace-nowrap border-b border-[#edf2f7] px-[13px] py-3 text-right">{formatPct(row.paidPct)}</td>
                        <td className="whitespace-nowrap border-b border-[#edf2f7] px-[13px] py-3 text-right">{row.probability ? formatPct(row.probability) : "-"}</td>
                        <td className="whitespace-nowrap border-b border-[#edf2f7] px-[13px] py-3 text-right">{formatTL(row.npv)}</td>
                        <td className="whitespace-nowrap border-b border-[#edf2f7] px-[13px] py-3 text-right">
                          <span className={`rounded-full px-2.5 py-1.5 text-xs font-black ${row.decision === "Çekilişsiz Sistem" ? "bg-[#e8f7f1] text-[#047857]" : "bg-[#eaf2ff] text-[#155eef]"}`}>
                            {row.decision}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function ScenarioResult({
  title,
  result,
  delivery,
  masraf,
}: {
  title: string;
  result: { org: number; finPV: number; odePV: number; npv: number; taksit: number };
  delivery?: number;
  masraf?: number;
}) {
  const rows = [
    ["1- Peşinat + Organizasyon Ücreti", formatTL(result.org)],
    ["2- Finansmanın Bugünkü Maliyeti", formatTL(result.finPV)],
    ["3- Ödemelerin Bugünkü Maliyeti", formatTL(result.odePV)],
    ["NPV", formatTL(result.npv)],
    ["Taksit Tutarı", formatTL(result.taksit)],
    [delivery !== undefined ? "Teslimat Ayı" : "Kredi Hariç Masraf", delivery !== undefined ? `${delivery}. ay` : formatTL(masraf ?? 0)],
  ];

  return (
    <div className="rounded-[22px] border border-[#e4eaf3] bg-white p-[17px] shadow-[0_10px_24px_rgba(15,35,70,0.06)]">
      <h3 className="mb-3.5 text-[16px] font-black">{title}</h3>
      {rows.map(([label, value]) => (
        <div className="flex justify-between gap-[18px] border-b border-dashed border-[#e6edf6] py-2.5 text-sm last:border-b-0" key={label}>
          <span className="font-bold text-[#667085]">{label}</span>
          <span className="text-right font-black">{value}</span>
        </div>
      ))}
    </div>
  );
}
