"use client";

import { withBasePath } from "../lib/sitePaths";

const moduleCards = [
  {
    eyebrow: "Hesaplama modülü",
    title: "Kredi Limit Modülü",
    description:
      "Geliriniz, mevcut borç yükünüz ve faiz varsayımınızla yaklaşık kredi kapasitenizi tek ekranda görün.",
    href: withBasePath("/kredi-limit"),
    cta: "Kredi limitini hesapla",
    tone: "green",
  },
  {
    eyebrow: "Kredi motoru",
    title: "Kredi Hesaplama Modülü",
    description:
      "PMT, KKDF, BSMV, net ele geçen tutar ve amortisman planını aynı tasarım dilinde detaylı inceleyin.",
    href: withBasePath("/kredi-hesaplama"),
    cta: "Kredi planını aç",
    tone: "blue",
  },
] as const;

export function LoanLimitSection() {
  return (
    <section id="loanLimit" className="page-container mt-8 scroll-mt-24">
      <div className="rounded-[28px] border border-[#d9e4ee] bg-white p-6 shadow-[0_18px_48px_rgba(15,35,70,0.07)] md:p-7">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#e8eef5] pb-5">
          <div className="max-w-[700px]">
            <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#7b8aa2]">
              Hesaplama modülleri
            </span>
            <h2 className="mt-2 text-[30px] font-bold tracking-[-0.05em] text-[#1c2433]">
              Limit ve kredi motorunu ayrı, temiz modüller halinde kullanın
            </h2>
            <p className="mt-3 text-[15px] leading-7 text-[#66768d]">
              Ana sayfadaki yönlendirme artık doğrudan gerçek modüllere gider. Eski veya yarım çalışan teaser
              blok yerine, iki ayrı hesaplama sayfasını mevcut tasarım dili içinde kullanabilirsiniz.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {moduleCards.map((card) => (
            <article
              key={card.href}
              className={`rounded-[22px] border px-5 py-5 shadow-[0_10px_24px_rgba(27,39,51,0.05)] ${
                card.tone === "green"
                    ? "border-[#d9e4ee] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)]"
                  : "border-[#dfe8f5] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)]"
              }`}
            >
              <span
                className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${
                  card.tone === "green"
                    ? "bg-[#eaf3ff] text-[#0b3a6f]"
                    : "bg-[#eaf1fb] text-[#1c4e98]"
                }`}
              >
                {card.eyebrow}
              </span>
              <h3 className="mt-4 text-[28px] font-bold tracking-[-0.04em] text-[#172133]">{card.title}</h3>
              <p className="mt-3 text-[15px] leading-7 text-[#66768d]">{card.description}</p>
              <a
                href={card.href}
                className={`mt-5 inline-flex rounded-[14px] px-5 py-3 text-[14px] font-semibold transition-all duration-300 ${
                  card.tone === "green"
                    ? "bg-[#0b3a6f] !text-white shadow-[0_14px_24px_rgba(11,58,111,0.20)] hover:-translate-y-0.5 hover:bg-[#07172f]"
                    : "bg-[#3a7bf6] !text-white shadow-[0_14px_24px_rgba(58,123,246,0.18)] hover:-translate-y-0.5 hover:bg-[#2f69d8]"
                }`}
              >
                {card.cta}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
