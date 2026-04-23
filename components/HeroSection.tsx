const cards = [
  ["Hesaplama", "Net maliyetinizi anında hesaplayın", "#calculator", ""],
  ["Karşılaştır", "2 teklifi yan yana kıyaslayın", "#calculator", "compare"],
  ["Firmalar", "Lisanslı kurumları birlikte görün", "#faq", ""],
  ["Danışmanlık Al", "Ücretsiz teklif talebi oluşturun", "#login", "login"],
];

export function HeroSection() {
  return (
    <section className="page-container mt-4 overflow-hidden rounded-2xl border border-emerald-100 bg-white">
      <div className="relative grid min-h-[420px] gap-8 bg-[radial-gradient(circle_at_5%_10%,rgba(6,148,95,0.14),transparent_24rem)] px-6 py-10 md:px-12 lg:grid-cols-[1.05fr_0.95fr] lg:px-16">
        <div className="absolute inset-0 opacity-70 [background-image:radial-gradient(rgba(6,148,95,0.14)_1px,transparent_1px)] [background-size:18px_18px]" />
        <div className="relative z-10 flex flex-col justify-center">
          <span className="mb-6 w-fit rounded-full bg-white px-5 py-2 text-sm font-extrabold text-[var(--green-dark)] shadow-sm">
            Banka kredisi ile karşılaştırmalı analiz
          </span>
          <h1 className="max-w-[600px] text-[clamp(42px,5.1vw,68px)] font-black leading-[0.96] tracking-[-0.06em] text-slate-950">
            Tasarruf finansmanının <span className="text-[var(--green)]">gerçek maliyetini</span> hesaplayın
          </h1>
          <p className="mt-6 max-w-[610px] text-[19px] leading-8 text-slate-600">
            Enflasyondan arındırılmış maliyet analizi, banka kredisi karşılaştırması ve peşinat etkisini tek hesaplamada görün.
          </p>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold text-slate-600">
            <span>Net bugünkü maliyet</span>
            <span>Banka kredisi kıyası</span>
            <span>Peşinat senaryosu</span>
          </div>
          <a className="mt-7 w-fit rounded-lg bg-[var(--green)] px-7 py-4 text-base font-extrabold text-white shadow-[0_14px_28px_rgba(6,148,95,0.22)]" href="#calculator">
            Hemen Hesapla
          </a>
        </div>

        <div className="relative z-10 flex items-center justify-center">
          <div className="absolute right-2 top-1 h-72 w-80 rotate-6 rounded-[28px] bg-emerald-900/10" />
          <div className="absolute bottom-4 right-12 hidden h-24 w-52 rounded-full bg-[var(--green)]/20 blur-2xl lg:block" />
          <div className="absolute right-8 top-10 hidden h-52 w-72 overflow-hidden rounded-[28px] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-slate-100 opacity-70 lg:block">
            <span className="absolute left-8 top-12 h-24 w-28 -skew-y-6 rounded-t-xl bg-slate-300/70" />
            <span className="absolute left-16 top-20 h-24 w-36 rounded-lg bg-white/80 shadow-sm" />
            <span className="absolute bottom-8 right-8 h-12 w-32 rounded-full bg-emerald-700/30" />
            <span className="absolute bottom-12 right-16 h-10 w-28 rounded-t-full bg-slate-500/20" />
          </div>
          <div className="grid w-full max-w-[540px] grid-cols-1 gap-4 sm:grid-cols-2">
            {cards.map(([title, text, href, action]) => (
              <a
                className="min-h-[128px] rounded-2xl border border-slate-100 bg-white/90 p-6 text-center shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur transition hover:-translate-y-1 hover:border-emerald-200"
                href={href}
                key={title}
                data-compare-cta={action === "compare" ? true : undefined}
                data-login-button={action === "login" ? true : undefined}
              >
                <div className="mx-auto mb-4 grid h-11 w-11 place-items-center rounded-xl border border-emerald-200 bg-emerald-50 text-xl font-black text-[var(--green)]">
                  ▥
                </div>
                <h2 className="text-xl font-black text-slate-950">{title}</h2>
                <p className="mt-2 text-sm font-bold text-slate-600">{text}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
