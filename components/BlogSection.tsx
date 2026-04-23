const posts = [
  {
    date: "Mart 2026",
    category: "Analiz",
    title: "Tasarruf finansmanı şirketlerinde maliyet nerede oluşur?",
    excerpt: "Hizmet bedeli, teslim zamanı ve grup yapısının toplam maliyete etkisini sade bir çerçevede inceleyin.",
  },
  {
    date: "Aralık 2025",
    category: "Regülasyon",
    title: "Sözleşme şartlarını okurken nelere dikkat edilmeli?",
    excerpt: "Teslim koşulu, ödeme planı ve ek maliyet başlıklarını karşılaştırırken kullanılabilecek temel kontrol listesi.",
  },
  {
    date: "Kasım 2025",
    category: "Rehber",
    title: "Kısa teslim vaadi gerçek maliyeti nasıl etkiler?",
    excerpt: "Erken teslim senaryolarında kira etkisi, peşinat ve taksit dengesini birlikte değerlendirmek gerekir.",
  },
];

export function BlogSection() {
  return (
    <section id="blog" className="page-container mt-14">
      <div className="mb-7 flex items-end justify-between gap-5">
        <div>
          <h2 className="text-3xl font-black tracking-[-0.04em] text-slate-950">Blog</h2>
          <p className="mt-2 text-base text-slate-600">Karar vermeden önce okunacak kısa rehberler.</p>
        </div>
        <a className="hidden text-sm font-black text-[var(--green-dark)] sm:block" href="#blog">
          Tüm Yazılar
        </a>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {posts.map((post) => (
          <article className="rounded-2xl border border-slate-200 bg-white p-6 soft-shadow" key={post.title}>
            <div className="flex gap-2 text-xs font-black uppercase tracking-wide text-slate-400">
              <span>{post.date}</span>
              <span>{post.category}</span>
            </div>
            <h3 className="mt-4 text-xl font-black leading-tight text-slate-950">{post.title}</h3>
            <p className="mt-3 text-[15px] leading-7 text-slate-600">{post.excerpt}</p>
            <a className="mt-5 inline-flex text-sm font-black text-[var(--green-dark)]" href="#blog">
              Devamını Oku →
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
