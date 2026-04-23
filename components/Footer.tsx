import { withBasePath } from "../lib/sitePaths";

const groups = [
  {
    title: "Sayfalar",
    links: [
      { label: "Ana Sayfa", href: withBasePath("/") },
      { label: "Endeks", href: withBasePath("/veri") },
      { label: "Teklifleri Karşılaştır", href: withBasePath("/teklifleri-karsilastir") },
      { label: "Nasıl Çalışır?", href: withBasePath("/#faq") },
      { label: "Blog", href: withBasePath("/#blog") },
    ],
  },
  {
    title: "Araçlar",
    links: [
      { label: "Maliyet Hesaplama", href: withBasePath("/#calculator") },
      { label: "Teklifleri Karşılaştır", href: withBasePath("/teklifleri-karsilastir") },
      { label: "Piyasa Veri Paneli", href: withBasePath("/veri") },
    ],
  },
  {
    title: "İletişim",
    links: [
      { label: "bilgi@example.com", href: "mailto:bilgi@example.com" },
      { label: "Sorularınız için bize ulaşın", href: "#footer" },
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

export function Footer() {
  return (
    <footer id="footer" className="mt-16 border-t border-slate-200 bg-white">
      <div className="page-container border-b border-slate-200 py-10">
        <h2 className="text-xl font-black text-slate-950">Tasarruf finansmanı sistemi nasıl okunmalı?</h2>
        <p className="mt-4 max-w-5xl text-sm leading-7 text-slate-600">
          Bu sayfa, birikime dayalı finansman tekliflerini sadece nominal toplam ödeme ile değil; peşinat, teslim süresi, hizmet bedeli, kira etkisi, banka kredisi alternatifi ve piyasa veri sinyalleriyle birlikte değerlendirmek için hazırlanmıştır.
        </p>
      </div>
      <div className="page-container grid gap-10 py-12 lg:grid-cols-[1.2fr_repeat(4,1fr)]">
        <div>
          <div className="flex items-center gap-3 text-lg font-black text-[var(--green-dark)]">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--green-soft)] text-[var(--green)]">▥</span>
            Finansman Rehberi
          </div>
          <p className="mt-4 max-w-sm text-sm leading-7 text-slate-600">
            Tasarruf finansmanı seçeneklerini gerçek maliyet, zaman etkisi, piyasa endeksi ve karşılaştırmalı karar desteğiyle inceleyin.
          </p>
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
      <div className="border-t border-slate-200 py-5 text-center text-sm text-slate-500">© 2026 Finansman Rehberi. Tüm hakları saklıdır.</div>
    </footer>
  );
}
