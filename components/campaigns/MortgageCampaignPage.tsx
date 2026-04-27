"use client";

import { useMemo, useState } from "react";
import { calculateLoanSummary } from "../../lib/loanEngine";
import { withBasePath } from "../../lib/sitePaths";

type BankOffer = {
  bank: string;
  badge: string;
  rate: number;
  fee: number;
  note: string;
  sponsored?: boolean;
};

const BANK_OFFERS: BankOffer[] = [
  { bank: "Akbank", badge: "AK", rate: 2.84, fee: 39_100, note: "Konut finansmanı için sabit taksitli teklif." },
  { bank: "Fibabanka", badge: "FB", rate: 2.99, fee: 32_500, note: "Dijital başvuru akışına uygun örnek teklif.", sponsored: true },
  { bank: "Garanti BBVA", badge: "GB", rate: 3.05, fee: 36_000, note: "Ekspertiz ve masraf kalemleri dahil edilerek hesaplanır." },
  { bank: "İş Bankası", badge: "İŞ", rate: 3.12, fee: 34_750, note: "Uzun vadeli konut kredisi senaryosu." },
  { bank: "Yapı Kredi", badge: "YK", rate: 3.18, fee: 35_400, note: "Karşılaştırmalı aylık ödeme görünümü." },
  { bank: "Ziraat Bankası", badge: "ZB", rate: 3.25, fee: 31_900, note: "Kamu bankası örnek konut kredisi oranı." },
];

const formatTRY = (value: number) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);

const formatPercent = (value: number) =>
  new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);

const parseTRNumber = (value: string) => {
  const normalized = value.replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatInput = (value: string) => {
  const parsed = parseTRNumber(value);
  return parsed ? new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(parsed) : "";
};

export function MortgageCampaignPage() {
  const [principal, setPrincipal] = useState("1.000.000");
  const [term, setTerm] = useState("24");

  const safePrincipal = Math.max(0, parseTRNumber(principal));
  const safeTerm = Math.min(120, Math.max(1, Math.round(parseTRNumber(term) || 1)));

  const offers = useMemo(
    () =>
      BANK_OFFERS.map((offer) => {
        const summary = calculateLoanSummary({
          principal: safePrincipal,
          term: safeTerm,
          rate: offer.rate,
          fee: offer.fee,
          bsmv: 0,
          kkdf: 0,
        });

        return {
          ...offer,
          monthlyPayment: summary.monthlyPayment,
          totalRepayment: summary.totalRepayment,
          totalInterest: summary.totalInterest,
          effectiveAnnualCost: summary.effectiveAnnualCost,
        };
      }).sort((a, b) => a.monthlyPayment - b.monthlyPayment),
    [safePrincipal, safeTerm],
  );

  const visibleOffers = offers.slice(0, 3);
  const lockedOffers = offers.slice(3);

  return (
    <main className="bg-[#f3f6fa] pb-20 text-[#0b1730]">
      <section className="page-container pt-10">
        <div className="rounded-[28px] border border-[#dbe6f0] bg-white p-6 shadow-[0_22px_55px_rgba(14,35,62,0.08)] md:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-center">
            <div>
              <p className="text-[12px] font-black uppercase tracking-[0.18em] text-[#f05a28]">Kampanyalar</p>
              <h1 className="mt-3 max-w-3xl text-[34px] font-black leading-[1.05] tracking-[-0.04em] text-[#07162f] md:text-[52px]">
                Bankaların konut kredisi tekliflerini tek ekranda karşılaştırın
              </h1>
              <p className="mt-4 max-w-2xl text-[16px] leading-7 text-[#53657c]">
                Kredi tutarı ve vadeyi girin; bankaların aylık taksit, toplam geri ödeme ve yıllık maliyet görünümünü aynı zeminde inceleyin.
              </p>
            </div>

            <div className="rounded-[24px] border border-[#dbe6f0] bg-[#f8fbff] p-4">
              <div className="grid gap-3">
                <label className="grid gap-2 text-[12px] font-black uppercase tracking-[0.12em] text-[#6b7c93]">
                  Kredi Tutarı
                  <input
                    value={principal}
                    onBlur={() => setPrincipal(formatInput(principal))}
                    onChange={(event) => setPrincipal(event.target.value)}
                    className="h-12 rounded-[14px] border border-[#cfddeb] bg-white px-4 text-[16px] font-bold text-[#07162f] outline-none transition focus:border-[#2f72f6]"
                  />
                </label>
                <label className="grid gap-2 text-[12px] font-black uppercase tracking-[0.12em] text-[#6b7c93]">
                  Vade
                  <input
                    value={term}
                    onChange={(event) => setTerm(event.target.value)}
                    className="h-12 rounded-[14px] border border-[#cfddeb] bg-white px-4 text-[16px] font-bold text-[#07162f] outline-none transition focus:border-[#2f72f6]"
                  />
                </label>
                <a
                  href="#konut-kredisi-teklifleri"
                  className="mt-1 rounded-[14px] bg-[#0b3a6f] px-5 py-4 text-center text-[14px] font-black text-white shadow-[0_14px_26px_rgba(11,58,111,0.18)] transition hover:-translate-y-0.5"
                >
                  Teklifleri Gör
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="konut-kredisi-teklifleri" className="page-container mt-8">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[12px] font-black uppercase tracking-[0.18em] text-[#7d8da3]">Konut Kredisi</p>
            <h2 className="mt-1 text-[24px] font-black tracking-[-0.03em] md:text-[32px]">
              {safeTerm} ay vadeli {formatTRY(safePrincipal)} için banka teklifleri
            </h2>
          </div>
          <span className="rounded-full border border-[#dbe6f0] bg-white px-4 py-2 text-[13px] font-bold text-[#53657c]">
            {offers.length} teklif listeleniyor
          </span>
        </div>

        <div className="grid gap-4">
          {visibleOffers.map((offer, index) => (
            <article
              key={offer.bank}
              className={`rounded-[22px] border bg-white p-5 shadow-[0_16px_40px_rgba(14,35,62,0.07)] ${
                index === 0 ? "border-[#8bd6b0] ring-2 ring-[#dff8ea]" : "border-[#dbe6f0]"
              }`}
            >
              <div className="grid gap-5 md:grid-cols-[1fr_150px_150px_170px_120px] md:items-center">
                <div className="flex items-center gap-4">
                  <div className="grid h-14 w-14 place-items-center rounded-[16px] bg-[#eef5ff] text-[15px] font-black text-[#0b3a6f]">
                    {offer.badge}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[20px] font-black text-[#07162f]">{offer.bank}</h3>
                      {index === 0 ? (
                        <span className="rounded-full bg-[#e6f8ed] px-3 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-[#108447]">
                          En avantajlı taksit
                        </span>
                      ) : null}
                      {offer.sponsored ? (
                        <span className="rounded-full bg-[#fff1e8] px-3 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-[#d24a1d]">
                          Sponsorlu
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-[13px] leading-6 text-[#66758b]">{offer.note}</p>
                  </div>
                </div>

                <Metric label="Aylık Taksit" value={formatTRY(offer.monthlyPayment)} />
                <Metric label="Oran" value={`%${formatPercent(offer.rate)}`} />
                <Metric label="Toplam Ödeme" value={formatTRY(offer.totalRepayment)} />

                <div className="grid gap-2">
                  <button className="rounded-[12px] bg-[#19a86b] px-4 py-3 text-[13px] font-black text-white shadow-[0_10px_18px_rgba(25,168,107,0.16)]">
                    Başvur
                  </button>
                  <button className="rounded-[12px] border border-[#dbe6f0] px-4 py-3 text-[13px] font-bold text-[#53657c]">
                    Detay
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="relative mt-4 overflow-hidden rounded-[24px] border border-[#dbe6f0] bg-white p-6 shadow-[0_16px_40px_rgba(14,35,62,0.07)]">
          <div className="pointer-events-none absolute inset-0 bg-white/70 backdrop-blur-[5px]" />
          <div className="grid gap-4 opacity-55">
            {lockedOffers.map((offer) => (
              <div key={offer.bank} className="grid rounded-[18px] border border-[#e4edf6] p-4 md:grid-cols-[1fr_160px_160px]">
                <strong>{offer.bank}</strong>
                <span>%{formatPercent(offer.rate)}</span>
                <span>{formatTRY(offer.monthlyPayment)}</span>
              </div>
            ))}
          </div>
          <div className="absolute left-1/2 top-1/2 w-[min(420px,calc(100%-32px))] -translate-x-1/2 -translate-y-1/2 rounded-[24px] border border-[#dbe6f0] bg-white p-6 text-center shadow-[0_22px_60px_rgba(14,35,62,0.16)]">
            <h3 className="text-[20px] font-black text-[#07162f]">Tüm teklifleri görmek için üye olun</h3>
            <p className="mt-2 text-[13px] leading-6 text-[#66758b]">
              Karşılaştırma listesinin tamamını, detay kalemlerini ve özel teklif akışını profilinizde takip edebilirsiniz.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <a href={withBasePath("/login")} className="rounded-[12px] bg-[#0b3a6f] px-4 py-3 text-[13px] font-black text-white">
                Üye Ol
              </a>
              <a href={withBasePath("/login")} className="rounded-[12px] border border-[#dbe6f0] px-4 py-3 text-[13px] font-bold text-[#53657c]">
                Giriş Yap
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#7d8da3]">{label}</p>
      <p className="mt-1 text-[18px] font-black text-[#07162f]">{value}</p>
    </div>
  );
}
