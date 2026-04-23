const cards = [
  ["Hesaplama", "Net maliyetinizi anında hesaplayın"],
  ["Karşılaştır", "2 teklifi yan yana kıyaslayın"],
  ["Firmalar", "Lisanslı kurumları birlikte görün"],
  ["Danışmanlık Al", "Ücretsiz teklif talebi oluşturun"],
];

export function HeroSection() {
  return (
    <section className="page-container mt-4 overflow-hidden rounded-2xl border border-emerald-100 bg-white">
      <div className="relative grid min-h-[440px] gap-8 bg-[radial-gradient(circle_at_5%_10%,rgba(6,148,95,0.14),transparent_24rem)] px-6 py-12 md:px-12 lg:grid-cols-[1.05fr_0.95fr] lg:px-16">
        <div className="absolute inset-0 opacity-70 [background-image:radial-gradient(rgba(6,148,95,0.14)_1px,transparent_1px)] [background-size:18px_18px]" />
        <div className="relative z-10 flex flex-col justify-center">
          <span className="mb-7 w-fit rounded-full bg-white px-5 py-2 text-sm font-extrabold text-[var(--green-dark)] shadow-sm">
            Banka kredisi ile karşılaştırmalı analiz
          </span>
          <h1 className="max-w-[610px] text-[clamp(44px,5.8vw,76px)] font-black leading-[0.96] tracking-[-0.06em] text-slate-950">
            Tasarruf finansmanının <span className="text-[var(--green)]">gerçek maliyetini</span> hesaplayın
          </h1>
          <p className="mt-7 max-w-[610px] text-xl leading-8 text-slate-600">
            Enflasyondan arındırılmış maliyet analizi, banka kredisi karşılaştırması ve peşinat etkisini tek hesaplamada görün.
          </p>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold text-slate-600">
            <span>Net bugünkü maliyet</span>
            <span>Banka kredisi kıyası</span>
            <span>Peşinat senaryosu</span>
          </div>
          <a className="mt-9 w-fit rounded-lg bg-[var(--green)] px-7 py-4 text-base font-extrabold text-white shadow-[0_14px_28px_rgba(6,148,95,0.22)]" href="#calculator">
            Hemen Hesapla
          </a>
        </div>

        <div className="relative z-10 flex items-center justify-center">
          <div className="absolute right-4 top-2 h-64 w-72 rotate-6 rounded-[28px] bg-emerald-900/10" />
          <div className="grid w-full max-w-[540px] grid-cols-1 gap-4 sm:grid-cols-2">
            {cards.map(([title, text]) => (
              <article className="min-h-[146px] rounded-2xl border border-slate-100 bg-white/90 p-7 text-center shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur" key={title}>
                <div className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-xl border border-emerald-200 bg-emerald-50 text-2xl font-black text-[var(--green)]">
                  ▥
                </div>
                <h2 className="text-xl font-black text-slate-950">{title}</h2>
                <p className="mt-2 text-sm font-bold text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
