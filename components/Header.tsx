"use client";

import { useState } from "react";
import { withBasePath } from "../lib/sitePaths";

const primaryNavItems = [
  { key: "home", label: "Ana Sayfa", href: withBasePath("/") },
  { key: "about", label: "Hakkımızda", href: withBasePath("/#faq") },
  { key: "data", label: "Endeks", href: withBasePath("/veri") },
  { key: "profile", label: "Profil", href: withBasePath("/profil") },
] as const;

const calculatorChildren = [
  { label: "Tasarruf Finansmanı Maliyet Hesaplayıcı", href: withBasePath("/tasarruf-finansman-hesaplama") },
  { label: "Kredi Limit Modülü", href: withBasePath("/kredi-limit") },
  { label: "Kredi Hesaplama Modülü", href: withBasePath("/kredi-hesaplama") },
  { label: "Çekilişsiz Model ve Kredi Karşılaştırma", href: withBasePath("/cekilisli-kredi-karsilastir") },
] as const;

const blogChildren = [
  { label: "Tasarruf", href: withBasePath("/blog?kategori=tasarruf") },
  { label: "Finans", href: withBasePath("/blog?kategori=finans") },
  { label: "Tasarruf Finansman", href: withBasePath("/blog?kategori=tasarruf-finansman") },
] as const;

const campaignChildren = [
  { label: "Konut Kredisi Karşılaştırması", href: withBasePath("/kampanyalar/konut-kredisi") },
] as const;

type ActiveNav =
  | "home"
  | "calculator"
  | "about"
  | "blog"
  | "campaigns"
  | "data"
  | "compare"
  | "profile"
  | "login";

export function Header({ active = "home" }: { active?: ActiveNav }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [blogOpen, setBlogOpen] = useState(false);
  const [campaignOpen, setCampaignOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#d9e4ee] bg-white/95 shadow-[0_3px_14px_rgba(15,35,70,0.07)] backdrop-blur">
      <div className="page-container flex min-h-[72px] items-center justify-between gap-6">
        <a href={withBasePath("/")} className="flex items-center gap-3 text-[15px] font-semibold md:text-[16px]">
          <img
            src={withBasePath("/logo.png")}
            alt=""
            aria-hidden="true"
            className="h-12 w-12 rounded-[12px] object-cover"
          />
          <img
            src={withBasePath("/logo-wordmark-cropped.png")}
            alt="Tasarruf finans"
            className="h-8 w-auto object-contain md:h-10"
          />
        </a>

        <div className="hidden items-center gap-8 lg:flex">
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Ana menü">
            {primaryNavItems.map((item) => {
              const isActive = active === item.key || (active === "home" && item.key === "home");
              return (
                <a
                  key={item.key}
                  href={item.href}
                  className={`rounded-[9px] px-[14px] py-[9px] text-[14px] font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-[#eaf3ff] text-[#0b3a6f]"
                      : "text-[#3e4958] hover:bg-[#f4f8ff] hover:text-[#0b2443]"
                  }`}
                >
                  {item.label}
                </a>
              );
            })}

            <div
              className="relative"
              onMouseEnter={() => setCalculatorOpen(true)}
              onMouseLeave={() => setCalculatorOpen(false)}
              onFocusCapture={() => setCalculatorOpen(true)}
              onBlurCapture={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                  setCalculatorOpen(false);
                }
              }}
            >
              <button
                type="button"
                className={`flex items-center gap-2 rounded-[9px] px-[14px] py-[9px] text-[14px] font-medium transition-all duration-300 ${
                  active === "calculator"
                    ? "bg-[#eaf3ff] text-[#0b3a6f]"
                    : "text-[#3e4958] hover:bg-[#f4f8ff] hover:text-[#0b2443]"
                }`}
                onClick={() => setCalculatorOpen((current) => !current)}
              >
                Hesaplama Modülü
                <span className={`text-[10px] transition-transform ${calculatorOpen ? "rotate-180" : ""}`}>▼</span>
              </button>

              {calculatorOpen ? (
                <div className="absolute left-0 top-full z-50 w-[280px] pt-2">
                  <div className="rounded-[18px] border border-[#d9e4ee] bg-white p-2 shadow-[0_18px_34px_rgba(15,35,70,0.12)]">
                    {calculatorChildren.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        className="block rounded-[12px] px-4 py-3 text-[14px] font-medium text-[#3e4958] transition-colors hover:bg-[#f4f8ff] hover:text-[#0b2443]"
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div
              className="relative"
              onMouseEnter={() => setBlogOpen(true)}
              onMouseLeave={() => setBlogOpen(false)}
              onFocusCapture={() => setBlogOpen(true)}
              onBlurCapture={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                  setBlogOpen(false);
                }
              }}
            >
              <button
                type="button"
                className={`flex items-center gap-2 rounded-[9px] px-[14px] py-[9px] text-[14px] font-medium transition-all duration-300 ${
                  active === "blog"
                    ? "bg-[#eaf3ff] text-[#0b3a6f]"
                    : "text-[#3e4958] hover:bg-[#f4f8ff] hover:text-[#0b2443]"
                }`}
                onClick={() => setBlogOpen((current) => !current)}
              >
                Blog
                <span className={`text-[10px] transition-transform ${blogOpen ? "rotate-180" : ""}`}>▼</span>
              </button>

              {blogOpen ? (
                <div className="absolute left-0 top-full z-50 w-[220px] pt-2">
                  <div className="rounded-[18px] border border-[#d9e4ee] bg-white p-2 shadow-[0_18px_34px_rgba(15,35,70,0.12)]">
                    {blogChildren.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        className="block rounded-[12px] px-4 py-3 text-[14px] font-medium text-[#3e4958] transition-colors hover:bg-[#f4f8ff] hover:text-[#0b2443]"
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div
              className="relative"
              onMouseEnter={() => setCampaignOpen(true)}
              onMouseLeave={() => setCampaignOpen(false)}
              onFocusCapture={() => setCampaignOpen(true)}
              onBlurCapture={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                  setCampaignOpen(false);
                }
              }}
            >
              <button
                type="button"
                className={`flex items-center gap-2 rounded-[9px] px-[14px] py-[9px] text-[14px] font-medium transition-all duration-300 ${
                  active === "campaigns"
                    ? "bg-[#eaf3ff] text-[#0b3a6f]"
                    : "text-[#3e4958] hover:bg-[#f4f8ff] hover:text-[#0b2443]"
                }`}
                onClick={() => setCampaignOpen((current) => !current)}
              >
                Kampanyalar
                <span className={`text-[10px] transition-transform ${campaignOpen ? "rotate-180" : ""}`}>▼</span>
              </button>

              {campaignOpen ? (
                <div className="absolute left-0 top-full z-50 w-[260px] pt-2">
                  <div className="rounded-[18px] border border-[#d9e4ee] bg-white p-2 shadow-[0_18px_34px_rgba(15,35,70,0.12)]">
                    {campaignChildren.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        className="block rounded-[12px] px-4 py-3 text-[14px] font-medium text-[#3e4958] transition-colors hover:bg-[#f4f8ff] hover:text-[#0b2443]"
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </nav>

          <div className="hidden h-8 w-px bg-[#e4e9ee] lg:block" />

          <div className="hidden items-center gap-3 lg:flex">
            <a
              className="rounded-[12px] bg-[#3a7bf6] px-[22px] py-[11px] text-[14px] font-semibold text-white shadow-[0_10px_20px_rgba(58,123,246,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#2f69d8]"
              href={withBasePath("/teklifleri-karsilastir")}
            >
              Teklifleri Karşılaştır
            </a>
            <a
              className={`rounded-[12px] border border-[#0b3a6f] px-[23px] py-[11px] text-[14px] font-semibold transition-all duration-300 hover:-translate-y-0.5 ${
                active === "login" ? "bg-[#eaf3ff] text-[#0b3a6f]" : "text-[#0b3a6f] hover:bg-[#eaf3ff]"
              }`}
              href={withBasePath("/login")}
            >
              Giriş Yap
            </a>
          </div>
        </div>

        <button
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 lg:hidden"
          onClick={() => setMobileOpen((current) => !current)}
          type="button"
          aria-expanded={mobileOpen}
        >
          Menü
        </button>
      </div>

      {mobileOpen ? (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <div className="page-container grid gap-2 py-4">
            <a
              className="rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-[#f4f8ff]"
              href={withBasePath("/")}
              onClick={() => setMobileOpen(false)}
            >
              Ana Sayfa
            </a>

            <div className="rounded-[16px] border border-[#e8eef5] px-3 py-3">
              <button
                type="button"
                className="flex w-full items-center justify-between text-sm font-semibold text-slate-800"
                onClick={() => setCalculatorOpen((current) => !current)}
              >
                Hesaplama Modülü
                <span className={`text-[10px] transition-transform ${calculatorOpen ? "rotate-180" : ""}`}>▼</span>
              </button>
              {calculatorOpen ? (
                <div className="mt-3 grid gap-2">
                  {calculatorChildren.map((item) => (
                    <a
                      key={item.href}
                      className="rounded-xl bg-[#f8fbff] px-3 py-3 text-sm font-medium text-slate-700 hover:bg-[#eef4fb]"
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="rounded-[16px] border border-[#e8eef5] px-3 py-3">
              <button
                type="button"
                className="flex w-full items-center justify-between text-sm font-semibold text-slate-800"
                onClick={() => setBlogOpen((current) => !current)}
              >
                Blog
                <span className={`text-[10px] transition-transform ${blogOpen ? "rotate-180" : ""}`}>▼</span>
              </button>
              {blogOpen ? (
                <div className="mt-3 grid gap-2">
                  {blogChildren.map((item) => (
                    <a
                      key={item.href}
                      className="rounded-xl bg-[#f8fbff] px-3 py-3 text-sm font-medium text-slate-700 hover:bg-[#eef4fb]"
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="rounded-[16px] border border-[#e8eef5] px-3 py-3">
              <button
                type="button"
                className="flex w-full items-center justify-between text-sm font-semibold text-slate-800"
                onClick={() => setCampaignOpen((current) => !current)}
              >
                Kampanyalar
                <span className={`text-[10px] transition-transform ${campaignOpen ? "rotate-180" : ""}`}>▼</span>
              </button>
              {campaignOpen ? (
                <div className="mt-3 grid gap-2">
                  {campaignChildren.map((item) => (
                    <a
                      key={item.href}
                      className="rounded-xl bg-[#f8fbff] px-3 py-3 text-sm font-medium text-slate-700 hover:bg-[#eef4fb]"
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>

            {primaryNavItems
              .filter((item) => item.key !== "home")
              .map((item) => (
                <a
                  className="rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-[#f4f8ff]"
                  href={item.href}
                  key={item.key}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </a>
              ))}

            <a
              className="rounded-xl bg-[#3a7bf6] px-4 py-3 text-center text-sm font-semibold text-white"
              href={withBasePath("/teklifleri-karsilastir")}
              onClick={() => setMobileOpen(false)}
            >
              Teklifleri Karşılaştır
            </a>
            <a
              className="rounded-xl border border-[#0b3a6f] px-4 py-3 text-center text-sm font-semibold text-[#0b3a6f]"
              href={withBasePath("/login")}
              onClick={() => setMobileOpen(false)}
            >
              Giriş Yap
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}
