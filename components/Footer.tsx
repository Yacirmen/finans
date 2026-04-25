import { withBasePath } from "../lib/sitePaths";

const groups = [
  {
    title: "Sayfalar",
    links: [
      { label: "Ana Sayfa", href: withBasePath("/") },
      { label: "Teklifleri Karşılaştır", href: withBasePath("/teklifleri-karsilastir") },
      { label: "Blog", href: withBasePath("/#blog") },
      { label: "Endeks", href: withBasePath("/veri") },
      { label: "Profil", href: withBasePath("/profil") },
    ],
  },
  {
    title: "Araçlar",
    links: [
      { label: "Maliyet Hesaplayıcı", href: withBasePath("/#calculator") },
      { label: "Kredi Limit Modülü", href: withBasePath("/kredi-limit") },
      { label: "Kredi Hesaplama Modülü", href: withBasePath("/kredi-hesaplama") },
      { label: "Kredi Testi", href: withBasePath("/kredi-test") },
      { label: "Motor Testleri", href: withBasePath("/engine-test") },
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
  { label: "X", href: "https://x.com/tasarrufinans" },
  { label: "Instagram", href: "https://www.instagram.com/tasarruf.finansman/" },
  { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61588693012392" },
  { label: "Kaynak", href: "https://borsaninizinden.com/borsa-isleyisi-ve-yatirim-araclari/" },
] as const;

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
          <div className="flex items-center gap-3 text-lg font-black text-[var(--green-dark)]">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--green-soft)] text-[var(--green)]">▥</span>
            Finansman Rehberi
          </div>
          <p className="mt-4 max-w-sm text-sm leading-7 text-slate-600">
            Tasarruf finansmanı seçeneklerini gerçek maliyet, zaman etkisi, piyasa endeksi ve karşılaştırmalı karar
            desteğiyle inceleyin.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {socialLinks.map((link) => (
              <a
                className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                href={link.href}
                key={link.label}
                rel="noopener noreferrer"
                target="_blank"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
        {groups.map(({ title, links }) => (
          <div key={title}>
            <h2 className="text-sm font-black text-slate-950">{title}</h2>
            <ul className="mt-4 grid gap-3 text-sm text-slate-600">
              {links.map((link) => (
                <li key={link.label}>
                  <a className="transition hover:text-[var(--green-dark)]" href={link.href}>
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
