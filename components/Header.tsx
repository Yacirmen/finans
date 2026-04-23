import { withBasePath } from "../lib/sitePaths";

const homeNavItems = [
  { key: "home", label: "Ana Sayfa", href: withBasePath("/") },
  { key: "firms", label: "Firmalar", href: withBasePath("/#faq") },
  { key: "faq", label: "Nasıl Çalışır?", href: withBasePath("/#faq") },
  { key: "about", label: "Hakkımızda", href: withBasePath("/#blog") },
  { key: "blog", label: "Blog", href: withBasePath("/#blog") },
  { key: "data", label: "Endeks", href: withBasePath("/veri") },
] as const;

type ActiveNav = "home" | "calculator" | "firms" | "faq" | "about" | "blog" | "data" | "compare";

export function Header({ active = "home" }: { active?: ActiveNav }) {
  const navItems = homeNavItems;

  return (
    <header className="sticky top-0 z-50 border-b border-[#dce6df] bg-white/95 shadow-[0_3px_14px_rgba(31,41,55,0.06)] backdrop-blur">
      <div className="page-container flex min-h-[72px] items-center justify-between gap-6">
        <a href={withBasePath("/")} className="flex items-center gap-3 text-[15px] font-semibold text-[#158147] md:text-[16px]">
          <span className="relative h-8 w-8" aria-hidden="true">
            <span className="absolute left-[3px] top-[7px] h-[3px] w-[21px] -rotate-45 rounded-full bg-[#1db25f]" />
            <span className="absolute bottom-[2px] left-[4px] h-[11px] w-1.5 rounded-full bg-[#1db25f]" />
            <span className="absolute bottom-[2px] left-[12px] h-[17px] w-1.5 rounded-full bg-[#1db25f]" />
            <span className="absolute bottom-[2px] left-[20px] h-[13px] w-1.5 rounded-full bg-[#1db25f]" />
          </span>
          Tasarruf Finansmanı
        </a>

        <div className="hidden items-center gap-8 lg:flex">
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Ana menü">
            {navItems.map((item) => {
              const isActive = active === item.key || (active === "home" && item.key === "home");
              return (
                <a
                  key={item.key}
                  href={item.href}
                  className={`rounded-[9px] px-[14px] py-[9px] text-[14px] font-medium transition-all duration-300 ${
                    isActive ? "bg-[#e9fbef] text-[#1b804d]" : "text-[#3e4958] hover:bg-[#f5f8f6] hover:text-[#182132]"
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          <div className="hidden h-8 w-px bg-[#e4e9ee] lg:block" />

          <div className="hidden items-center gap-3 lg:flex">
            <a
              className="rounded-[12px] bg-[#3a7bf6] px-[22px] py-[11px] text-[14px] font-semibold text-white shadow-[0_10px_20px_rgba(58,123,246,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#2f69d8]"
              href={withBasePath("/teklifleri-karsilastir")}
              data-compare-cta
            >
              Teklifleri Karşılaştır
            </a>
            <a
              className="rounded-[12px] border border-[#1ca353] px-[23px] py-[11px] text-[14px] font-semibold text-[#116537] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#f4fff8]"
              href="#login"
              data-login-button
            >
              Giriş Yap
            </a>
          </div>
        </div>

        <button
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 lg:hidden"
          data-mobile-menu-button
          type="button"
          aria-expanded="false"
        >
          Menü
        </button>
      </div>

      <div className="hidden border-t border-slate-200 bg-white lg:hidden" data-mobile-menu>
        <div className="page-container grid gap-2 py-4">
          {navItems.map((item) => (
            <a className="rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-[#f3f7f4]" href={item.href} key={item.key}>
              {item.label}
            </a>
          ))}
          <a className="rounded-xl bg-[#3a7bf6] px-4 py-3 text-center text-sm font-semibold text-white" href={withBasePath("/teklifleri-karsilastir")} data-compare-cta>
            Teklifleri Karşılaştır
          </a>
          <a className="rounded-xl border border-[#1ca353] px-4 py-3 text-center text-sm font-semibold text-[#116537]" href="#login" data-login-button>
            Giriş Yap
          </a>
        </div>
      </div>
    </header>
  );
}
