import { blogPosts } from "../lib/blogPosts";
import { withBasePath } from "../lib/sitePaths";

export function BlogSection() {
  const [featured, ...rest] = blogPosts;

  return (
    <section id="blog" className="page-container mt-14">
      <div className="mb-7 flex items-end justify-between gap-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0b3a6f]">Finans Rehberi</p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-950">Blog</h2>
          <p className="mt-2 max-w-2xl text-base text-slate-600">
            Kira artışı, konut kampanyaları ve taşıt kredisi kararlarını aynı finansal bakışla okuyun.
          </p>
        </div>
        <a className="hidden text-sm font-black text-[#0b3a6f] sm:block" href={withBasePath("/blog")}>
          Tüm Yazılar →
        </a>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <a
          className="group rounded-[24px] border border-[#d9e4ee] bg-white p-7 shadow-[0_18px_42px_rgba(15,35,70,0.07)] transition hover:-translate-y-1 hover:shadow-[0_24px_58px_rgba(15,35,70,0.12)]"
          href={withBasePath(`/blog/${featured.slug}`)}
        >
          <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-wide">
            <span className="text-slate-400">{featured.date}</span>
            <span className="rounded-full bg-[#eaf3ff] px-2 py-0.5 text-[#0b3a6f]">{featured.category}</span>
          </div>
          <h3 className="mt-5 max-w-2xl text-[clamp(26px,4vw,40px)] font-black leading-[1.04] tracking-[-0.05em] text-slate-950 group-hover:text-[#155eef]">
            {featured.title}
          </h3>
          <p className="mt-4 max-w-3xl text-[15px] leading-7 text-slate-600">{featured.excerpt}</p>
          <span className="mt-6 inline-flex rounded-xl bg-[#0b3a6f] px-5 py-3 text-sm font-black text-white shadow-[0_14px_26px_rgba(11,58,111,0.18)]">
            Devamını Oku
          </span>
        </a>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
          {rest.map((post) => (
            <a
              className="group rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:border-[#bfd2ef]"
              href={withBasePath(`/blog/${post.slug}`)}
              key={post.slug}
            >
              <div className="flex flex-wrap gap-2 text-[11px] font-black uppercase tracking-wide">
                <span className="text-slate-400">{post.date}</span>
                <span className="rounded-full bg-[#eff6ff] px-2 py-0.5 text-[#2563eb]">{post.category}</span>
              </div>
              <h3 className="mt-3 text-lg font-black leading-tight text-slate-950 group-hover:text-[#155eef]">
                {post.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{post.excerpt}</p>
              <span className="mt-3 inline-flex text-sm font-black text-[#0b3a6f]">Devamını Oku →</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
