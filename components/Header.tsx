const navItems = [
  { label: "Ana Sayfa", href: "#" },
  { label: "Firmalar", href: "#calculator" },
  { label: "Nasıl Çalışır?", href: "#faq" },
  { label: "Hakkımızda", href: "#faq" },
  { label: "Blog", href: "#blog" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-[0_2px_14px_rgba(15,23,42,0.12)] backdrop-blur">
      <div className="page-container flex min-h-[78px] items-center justify-between gap-5">
        <a href="#" className="flex items-center gap-3 text-[17px] font-black text-[var(--green-dark)]">
          <span className="relative h-9 w-9" aria-hidden="true">
            <span className="absolute left-1 top-4 h-1 w-8 -rotate-45 rounded-full bg-[var(--green)]" />
            <span className="absolute bottom-1 left-2 h-4 w-1 rounded-full bg-[var(--green)]" />
            <span className="absolute bottom-1 left-4 h-7 w-1 rounded-full bg-[var(--green)]" />
            <span className="absolute bottom-1 left-6 h-5 w-1 rounded-full bg-[var(--green)]" />
          </span>
          Finansman Rehberi
        </a>

        <nav className="hidden items-center gap-2 lg:flex" aria-label="Ana menü">
          {navItems.map((item, index) => (
            <a
              className={`rounded-lg px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-[var(--green-soft)] hover:text-[var(--green-dark)] ${
                index === 0 ? "bg-[var(--green-soft)] text-[var(--green-dark)]" : ""
              }`}
              href={item.href}
              key={item.label}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <a className="rounded-lg bg-[var(--blue)] px-6 py-3 text-sm font-extrabold text-white shadow-[0_10px_22px_rgba(47,124,246,0.22)]" href="#calculator" data-compare-cta>
            Teklifleri Karşılaştır
          </a>
          <a className="rounded-lg border-2 border-[var(--green)] px-7 py-[10px] text-sm font-extrabold text-[var(--green-dark)]" href="#login" data-login-button>
            Giriş Yap
          </a>
        </div>

        <button className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-extrabold text-slate-700 lg:hidden" data-mobile-menu-button type="button" aria-expanded="false">
          Menü
        </button>
      </div>

      <div className="hidden border-t border-slate-200 bg-white lg:hidden" data-mobile-menu>
        <div className="page-container grid gap-2 py-4">
          {navItems.map((item) => (
            <a className="rounded-lg px-3 py-3 text-sm font-bold text-slate-700" href={item.href} key={item.label}>
              {item.label}
            </a>
          ))}
          <a className="rounded-lg bg-[var(--blue)] px-4 py-3 text-center text-sm font-extrabold text-white" href="#calculator" data-compare-cta>
            Teklifleri Karşılaştır
          </a>
          <a className="rounded-lg border border-[var(--green)] px-4 py-3 text-center text-sm font-extrabold text-[var(--green-dark)]" href="#login" data-login-button>
            Giriş Yap / Üye Ol
          </a>
        </div>
      </div>
    </header>
  );
}
