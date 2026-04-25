const posts = [
  {
    date: "Mart 2026",
    category: "maliyet",
    title: "Tasarruf finansmanı şirketlerinde gerçek maliyet nerede oluşur?",
    excerpt:
      "Hizmet bedeli, teslim zamanı ve ödeme planı toplam maliyeti farklı yönlerden etkiler. Teklifleri aynı zeminde okumak karar kalitesini artırır.",
  },
  {
    date: "Aralık 2025",
    category: "BDDK",
    title: "Sözleşme şartlarını okurken hangi kalemlere dikkat edilmeli?",
    excerpt:
      "Teslim koşulu, ek ücretler, ödeme ritmi ve iptal süreçleri tasarruf finansmanı sözleşmesinin en kritik kontrol alanlarıdır.",
  },
  {
    date: "Kasım 2025",
    category: "kredi",
    title: "Banka kredisi ile tasarruf finansmanı aynı tabloda nasıl kıyaslanır?",
    excerpt:
      "Aylık taksit tek başına yeterli değildir. Bugünkü değer, masraf, vergi ve teslim gecikmesi birlikte okunmalıdır.",
  },
  {
    date: "Ekim 2025",
    category: "rehber",
    title: "Net bugünkü maliyet, karar verirken neden önemlidir?",
    excerpt:
      "Farklı vadeleri ve teslim tarihlerini aynı güne indirgemek, görünürde ucuz olan teklifin gerçek etkisini anlamaya yardım eder.",
  },
];

export function BlogSection() {
  const [featured, ...rest] = posts;

  return (
    <section id="blog" className="page-container mt-14">
      <div className="mb-7 flex items-end justify-between gap-5">
        <div>
          <h2 className="text-3xl font-black tracking-[-0.04em] text-slate-950">Blog</h2>
          <p className="mt-2 text-base text-slate-600">Tasarruf finansmanı, kredi ve maliyet analizi üzerine kısa rehberler.</p>
        </div>
        <a className="hidden text-sm font-black text-[var(--green-dark)] sm:block" href="#blog">
          Tüm Yazılar →
        </a>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.18fr_0.82fr]">
        <article className="rounded-[24px] border border-emerald-100 bg-white p-7 shadow-[0_18px_42px_rgba(15,23,42,0.07)]">
          <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-wide">
            <span className="text-slate-400">{featured.date}</span>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">{featured.category}</span>
          </div>
          <h3 className="mt-5 max-w-2xl text-[clamp(26px,4vw,40px)] font-black leading-[1.04] tracking-[-0.05em] text-slate-950">
            {featured.title}
          </h3>
          <p className="mt-4 max-w-3xl text-[15px] leading-7 text-slate-600">{featured.excerpt}</p>
          <a className="mt-6 inline-flex rounded-xl bg-[#16a05a] px-5 py-3 text-sm font-black text-white shadow-[0_14px_26px_rgba(22,160,90,0.16)]" href="#blog">
            Devamını Oku
          </a>
        </article>

        <div className="grid gap-4">
          {rest.map((post) => (
            <article className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]" key={post.title}>
              <div className="flex flex-wrap gap-2 text-[11px] font-black uppercase tracking-wide">
                <span className="text-slate-400">{post.date}</span>
                <span className="rounded-full bg-[#eff6ff] px-2 py-0.5 text-[#2563eb]">{post.category}</span>
              </div>
              <h3 className="mt-3 text-lg font-black leading-tight text-slate-950">{post.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{post.excerpt}</p>
              <a className="mt-3 inline-flex text-sm font-black text-[var(--green-dark)]" href="#blog">
                Devamını Oku →
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
