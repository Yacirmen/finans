const groups: { title: string; links: string[] }[] = [
  { title: "Sayfalar", links: ["Ana Sayfa", "Nasıl Çalışır?", "Hakkımızda", "Blog"] },
  { title: "Araçlar", links: ["Maliyet Hesaplama", "Teklifleri Karşılaştır", "Çekiliş Simülasyonu"] },
  { title: "İletişim", links: ["bilgi@example.com", "Sorularınız için bize ulaşın."] },
  { title: "Yasal", links: ["Kullanım Koşulları", "Gizlilik Politikası", "KVKK Aydınlatma Metni"] },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="page-container grid gap-10 py-12 lg:grid-cols-[1.2fr_repeat(4,1fr)]">
        <div>
          <div className="flex items-center gap-3 text-lg font-black text-[var(--green-dark)]">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--green-soft)] text-[var(--green)]">▥</span>
            Finansman Rehberi
          </div>
          <p className="mt-4 max-w-sm text-sm leading-7 text-slate-600">
            Tasarruf finansmanı seçeneklerini gerçek maliyet, zaman etkisi ve karşılaştırmalı karar desteğiyle inceleyin.
          </p>
        </div>
        {groups.map(({ title, links }) => (
          <div key={title}>
            <h2 className="text-sm font-black text-slate-950">{title}</h2>
            <ul className="mt-4 grid gap-3 text-sm text-slate-600">
              {links.map((link) => (
                <li key={link}>
                  <a href="#">{link}</a>
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
