import { withBasePath } from "../lib/sitePaths";

const groups = [
  {
    title: "Sayfalar",
    links: [
      { label: "Ana Sayfa", href: withBasePath("/") },
      { label: "Teklifleri Karşılaştır", href: withBasePath("/teklifleri-karsilastir") },
      { label: "Blog", href: withBasePath("/blog") },
      { label: "Endeks", href: withBasePath("/veri") },
      { label: "Profil", href: withBasePath("/profil") },
    ],
  },
  {
    title: "Araçlar",
    links: [
      { label: "Maliyet Hesaplayıcı", href: withBasePath("/tasarruf-finansman-hesaplama") },
      { label: "Kredi Limit Modülü", href: withBasePath("/kredi-limit") },
      { label: "Kredi Hesaplama Modülü", href: withBasePath("/kredi-hesaplama") },
      { label: "Konut Kredisi Karşılaştırması", href: withBasePath("/kampanyalar/konut-kredisi") },
    ],
  },
  {
    title: "İletişim",
    links: [
      { label: "bilgi@example.com", href: "mailto:bilgi@example.com" },
      { label: "+90 (212) 000 00 00", href: "tel:+902120000000" },
    ],
  },
  {
    title: "Yasal",
    links: [
      { label: "Kullanım Koşulları", href: "#footer" },
      { label: "Gizlilik Politikası", href: "#footer" },
      { label: "KVKK Aydınlatma Metni", href: "#footer" },
    ],
  },
] as const;

const socialLinks = [
  {
    label: "LinkedIn",
    short: "in",
    href: "https://www.linkedin.com/in/tasarruf-finansman-546579406/",
    className: "bg-[#0a66c2] text-white",
  },
  {
    label: "Facebook",
    short: "f",
    href: "https://www.facebook.com/profile.php?id=61588693012392",
    className: "bg-[#1877f2] text-white",
  },
  {
    label: "X",
    short: "𝕏",
    href: "https://x.com/tasarrufinans",
    className: "bg-black text-white",
  },
  {
    label: "Instagram",
    short: "◎",
    href: "https://www.instagram.com/tasarruf.finansman/?hl=tr",
    className: "bg-gradient-to-br from-[#833ab4] via-[#e1306c] to-[#f77737] text-white",
  },
  {
    label: "YouTube",
    short: "▶",
    href: "https://www.youtube.com/@Tasarrufinans",
    className: "bg-[#ff0000] text-white",
  },
  {
    label: "TikTok",
    short: "♪",
    href: "https://www.tiktok.com/@tasarrufinans",
    className: "bg-black text-white",
  },
] as const;

const trustBadges = ["KVKK", "SSL", "MTHS"];

export function Footer() {
  return (
    <footer id="footer" className="mt-16 border-t border-slate-200 bg-white">
      <div className="page-container border-b border-slate-200 py-10">
        <h2 className="text-xl font-black text-slate-950">Tasarruf finansmanı nasıl okunmalı?</h2>
        <p className="mt-4 max-w-5xl text-sm leading-7 text-slate-600">
          Bu ürün, tasarruf finansmanı tekliflerini yalnızca nominal ödeme toplamıyla değil; peşinat, teslim süresi,
          hizmet bedeli, kira etkisi, banka kredisi alternatifi ve piyasa verisiyle birlikte değerlendirmek için
          tasarlandı.
        </p>
      </div>

      <div className="page-container grid gap-10 py-12 lg:grid-cols-[1.2fr_repeat(4,1fr)]">
        <div>
          <div className="flex items-center gap-3 text-lg font-black text-[#0b2443]">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#fff1e8] text-[#f05a28]">▦</span>
            Finansman Rehberi
          </div>
          <p className="mt-4 max-w-sm text-sm leading-7 text-slate-600">
            Tasarruf finansmanı seçeneklerini gerçek maliyet, zaman etkisi, piyasa endeksi ve karşılaştırmalı karar
            desteğiyle inceleyin.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-slate-200 pt-5">
            {socialLinks.map((link) => (
              <a
                aria-label={link.label}
                className={`grid h-11 w-11 place-items-center rounded-[10px] text-[18px] font-black shadow-[0_10px_22px_rgba(15,23,42,0.12)] transition hover:-translate-y-0.5 ${link.className}`}
                href={link.href}
                key={link.label}
                rel="noopener noreferrer"
                target="_blank"
                title={link.label}
              >
                {link.short}
              </a>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {trustBadges.map((badge) => (
              <span
                className="rounded-[10px] border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] font-black text-slate-500"
                key={badge}
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

        {groups.map(({ title, links }) => (
          <div key={title}>
            <h2 className="text-sm font-black text-slate-950">{title}</h2>
            <ul className="mt-4 grid gap-3 text-sm text-slate-600">
              {links.map((link) => (
                <li key={link.label}>
                  <a className="transition hover:text-[#0b3a6f]" href={link.href}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-200 py-5 text-center text-sm text-slate-500">
        © 2026 Finansman Rehberi. Tüm hakları saklıdır.
      </div>
    </footer>
  );
}
