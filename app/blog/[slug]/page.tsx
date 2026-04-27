import { notFound } from "next/navigation";
import { Footer } from "../../../components/Footer";
import { Header } from "../../../components/Header";
import { blogPosts } from "../../../lib/blogPosts";
import { withBasePath } from "../../../lib/sitePaths";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts.find((item) => item.slug === slug);

  if (!post) notFound();

  return (
    <>
      <Header active="blog" />
      <main className="bg-[linear-gradient(180deg,#eaf3ff_0%,#f6f8fb_44%,#ffffff_100%)] py-12">
        <article className="page-container max-w-[880px]">
          <a className="text-sm font-black text-[#0b3a6f]" href={withBasePath("/blog")}>
            ← Bloga Dön
          </a>
          <div className="mt-6 rounded-[28px] border border-[#d9e4ee] bg-white p-8 shadow-[0_22px_54px_rgba(15,35,70,0.08)]">
            <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-wide">
              <span className="text-slate-400">{post.date}</span>
              <span className="rounded-full bg-[#eaf3ff] px-2 py-0.5 text-[#0b3a6f]">{post.category}</span>
            </div>
            <h1 className="mt-5 text-[clamp(32px,5vw,54px)] font-black leading-[1.02] tracking-[-0.06em] text-slate-950">
              {post.title}
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">{post.excerpt}</p>

            <div className="mt-9 grid gap-7">
              {post.sections.map((section) => (
                <section key={section.heading}>
                  <h2 className="text-2xl font-black tracking-[-0.04em] text-slate-950">{section.heading}</h2>
                  <p className="mt-3 text-[16px] leading-8 text-slate-700">{section.body}</p>
                </section>
              ))}
            </div>

            <div className="mt-9 rounded-[18px] border border-[#e8eef5] bg-[#f8fbff] p-5 text-sm leading-7 text-slate-600">
              Bu yazı, finansal karar verirken kontrol edilmesi gereken başlıkları sadeleştirir. Nihai karar öncesinde
              teklif koşullarını, sözleşme maddelerini ve güncel oranları ayrıca kontrol edin.
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
