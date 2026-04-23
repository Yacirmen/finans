import type { ReactNode } from "react";

const cards = [
  {
    title: "Hesaplama",
    text: "Net maliyetinizi anında hesaplayın",
    href: "#calculator",
    action: "",
    icon: (
      <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
        <rect x="5" y="3.5" width="14" height="17" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 8h8M8 12h2m4 0h2M8 16h2m4 0h2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    title: "Karşılaştır",
    text: "2 teklifi yan yana kıyaslayın",
    href: "#calculator",
    action: "compare",
    icon: (
      <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
        <path d="M7 18V9M12 18V5M17 18v-7" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        <path d="M5 18.5h14" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    title: "Firmalar",
    text: "BDDK lisanslı 9 firma",
    href: "#faq",
    action: "",
    icon: (
      <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
        <path d="M6 20V7.5L12 4l6 3.5V20" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9 10h.01M15 10h.01M9 14h.01M15 14h.01M11 20v-3h2v3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    title: "Danışmanlık AI",
    text: "Ücretsiz teklif talebi oluşturun",
    href: "#login",
    action: "login",
    icon: (
      <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
        <path d="M7 16.5H5a2 2 0 0 1-2-2v-6A2.5 2.5 0 0 1 5.5 6h13A2.5 2.5 0 0 1 21 8.5v6a2 2 0 0 1-2 2h-4.5L10 20v-3.5H7Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
    ),
  },
] as const;

function FeatureCard({
  title,
  text,
  href,
  action,
  icon,
}: {
  title: string;
  text: string;
  href: string;
  action: string;
  icon: ReactNode;
}) {
  return (
    <a
      href={href}
      data-compare-cta={action === "compare" ? true : undefined}
      data-login-button={action === "login" ? true : undefined}
      className="group relative rounded-[26px] border border-[#e5f0ea] bg-white/94 px-6 py-7 text-center shadow-[0_18px_40px_rgba(39,57,49,0.11)] backdrop-blur-[3px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_52px_rgba(39,57,49,0.16)]"
    >
      <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-[18px] border border-[#cbf3dd] bg-[linear-gradient(180deg,#f4fff8_0%,#effdf6_100%)] text-[#16a05a] shadow-[0_10px_22px_rgba(24,160,90,0.08)] transition-transform duration-300 group-hover:scale-[1.03]">
        {icon}
      </div>
      <h2 className="text-[17px] font-extrabold tracking-[-0.03em] text-[#182133]">{title}</h2>
      <p className="mx-auto mt-3 max-w-[190px] text-[14px] font-medium leading-6 text-[#617086]">{text}</p>
    </a>
  );
}

export function HeroSection() {
  return (
    <section className="page-container mt-5">
      <div className="overflow-hidden rounded-[30px] border border-[#dcefe4] bg-white shadow-[0_12px_34px_rgba(36,61,50,0.07)]">
        <div className="relative grid min-h-[472px] gap-10 px-6 py-7 md:px-10 md:py-9 lg:grid-cols-[1.03fr_0.97fr] lg:px-12 lg:py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_7%_14%,rgba(104,246,189,0.22),transparent_22%),radial-gradient(circle_at_88%_82%,rgba(118,242,201,0.18),transparent_20%),linear-gradient(180deg,#f8fffb_0%,#f9fbff_100%)]" />
          <div className="absolute inset-0 opacity-45 [background-image:radial-gradient(rgba(28,164,102,0.12)_1px,transparent_1px)] [background-size:20px_20px]" />

          <div className="relative z-10 flex min-h-[320px] flex-col justify-center pt-2">
            <span className="mb-6 inline-flex w-fit rounded-full border border-[#d8f5e5] bg-[#f4fff8] px-4 py-2 text-[14px] font-semibold text-[#228a52] shadow-[0_6px_16px_rgba(22,160,90,0.07)]">
              Banka Kredisi ile Karşılaştırmalı Analiz
            </span>

            <h1 className="max-w-[560px] text-[clamp(44px,6vw,72px)] font-black leading-[0.9] tracking-[-0.065em] text-[#09132a]">
              Tasarruf
              <br />
              Finansmanının
              <br />
              <span className="text-[#189b57]">Gerçek Maliyetini</span>
              <br />
              Hesaplayın
            </h1>

            <p className="mt-6 max-w-[590px] text-[18px] leading-8 text-[#55657b]">
              <span className="font-bold text-[#1c9857]">Enflasyondan</span> arındırılmış net maliyet analizi, banka kredisi karşılaştırması ve peşinat optimizasyonu
              {" "}tek hesaplamada.
            </p>

            <p className="mt-4 max-w-[480px] text-[14px] leading-7 text-[#718198]">
              Sözleşme koşullarını tek ekranda görün, toplam yükü aynı zeminde ölçün ve kararınızı sayısal güvenle verin.
            </p>
          </div>

          <div className="relative z-10 flex items-center justify-center lg:justify-end">
            <div className="pointer-events-none absolute inset-y-3 right-0 hidden w-[94%] rounded-[34px] bg-[radial-gradient(circle_at_84%_83%,rgba(92,236,180,0.28),transparent_25%),linear-gradient(145deg,rgba(219,250,233,0.62),rgba(247,251,255,0.08))] lg:block" />
            <div className="pointer-events-none absolute right-[8%] top-[2%] hidden h-[90%] w-[68%] lg:block">
              <div className="absolute right-[10%] top-[1%] h-[61%] w-[58%] rotate-[18deg] rounded-[18px] bg-[linear-gradient(180deg,rgba(163,192,197,0.22),rgba(104,145,150,0.38))]" />
              <div className="absolute right-[22%] top-[8%] h-[8%] w-[8%] rounded-t-[5px] bg-white/80 shadow-[0_8px_14px_rgba(19,37,30,0.08)]" />
              <div className="absolute right-[31%] top-[44%] h-[26%] w-[34%] rounded-[16px] bg-white/60 shadow-[0_18px_38px_rgba(36,62,50,0.12)]" />
              <div className="absolute bottom-[8%] right-[4%] h-[22%] w-[36%] rounded-[999px_999px_18px_18px] bg-[linear-gradient(90deg,rgba(238,255,249,0.96),rgba(163,234,210,0.94))] opacity-95" />
              <div className="absolute bottom-[2%] right-[6%] h-[20%] w-[38%] rounded-full bg-[radial-gradient(circle,rgba(93,235,182,0.34),transparent_68%)] blur-2xl" />
            </div>

            <div className="grid w-full max-w-[460px] gap-4 sm:grid-cols-2 lg:translate-x-[6px]">
              {cards.map((card) => (
                <FeatureCard key={card.title} {...card} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
