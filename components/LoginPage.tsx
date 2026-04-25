"use client";

import { useState } from "react";

const features = [
  {
    icon: "⚡",
    tone: "bg-[#d9fbe5] text-[#16a05a]",
    title: "Sınırsız Analiz",
    text: "Tüm şirket ve senaryolar için limitsiz hesaplama yapın, karşılaştırın.",
  },
  {
    icon: "🎯",
    tone: "bg-[#e2ecff] text-[#3478f6]",
    title: "Avantajlı Peşinat Danışmanı",
    text: "Elinizdeki peşinatı en kârlı şekilde nasıl kullanacağınızı saniyeler içinde görün.",
  },
  {
    icon: "🎲",
    tone: "bg-[#f1defe] text-[#9b4de0]",
    title: "Çekiliş Simülasyonu",
    text: "Binlerce farklı teslimat senaryosunu simüle ederek şansa değil veriye güvenin.",
  },
];

export function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    localStorage.setItem(
      "mockAuthUser",
      JSON.stringify({
        email: email || "tasarrufinansman@gmail.com",
        mode,
        updatedAt: new Date().toISOString(),
      }),
    );
    setMessage(mode === "login" ? "Giriş bilgileri kaydedildi." : "Kayıt talebiniz alındı.");
  }

  return (
    <main className="min-h-screen bg-[#f6f8fb] px-4 py-10">
      <section className="mx-auto min-h-[780px] w-full max-w-[1120px] overflow-hidden rounded-[34px] bg-[linear-gradient(125deg,#dbffe8_0%,#ffffff_43%,#e7f3ff_100%)] px-6 py-10 md:px-10 lg:px-12 lg:py-16">
        <div className="grid min-h-[680px] items-center gap-12 lg:grid-cols-[0.96fr_1fr]">
          <section className="rounded-[30px] bg-white/95 p-7 shadow-[0_24px_58px_rgba(15,23,42,0.08)] md:p-10">
            <div className="text-center">
              <span className="mx-auto block h-12 w-12">
                <span className="relative block h-full w-full" aria-hidden="true">
                  <span className="absolute left-[6px] top-[12px] h-[5px] w-[34px] -rotate-45 rounded-full bg-[#1aa55a]" />
                  <span className="absolute bottom-[5px] left-[9px] h-[14px] w-2 rounded-full bg-[#1aa55a]" />
                  <span className="absolute bottom-[5px] left-[21px] h-[22px] w-2 rounded-full bg-[#1aa55a]" />
                  <span className="absolute bottom-[5px] left-[33px] h-[17px] w-2 rounded-full bg-[#1aa55a]" />
                </span>
              </span>
              <h1 className="mt-6 text-[28px] font-black leading-[1.02] tracking-[-0.05em] text-[#07111f]">
                Tasarruf Finansmanı
                <span className="block text-[#138746]">Maliyet Hesaplayıcı</span>
              </h1>
            </div>

            <div className="mt-9 grid grid-cols-2 rounded-[14px] bg-[#f0f2f6] p-1.5">
              <button
                className={`h-11 rounded-[11px] text-[13px] font-black transition ${mode === "login" ? "bg-white text-[#138746] shadow-sm" : "text-[#667085]"}`}
                onClick={() => setMode("login")}
                type="button"
              >
                Giriş Yap
              </button>
              <button
                className={`h-11 rounded-[11px] text-[13px] font-black transition ${mode === "register" ? "bg-white text-[#138746] shadow-sm" : "text-[#667085]"}`}
                onClick={() => setMode("register")}
                type="button"
              >
                Kayıt Ol
              </button>
            </div>

            <button
              className="mt-8 flex h-13 w-full items-center justify-center gap-3 rounded-[13px] border border-[#dce4ec] bg-white text-[15px] font-black text-[#344054] shadow-sm transition hover:-translate-y-0.5 hover:border-[#cfd9e4]"
              type="button"
            >
              <span className="text-[24px] font-black text-[#4285f4]">G</span>
              Google ile Devam Et
            </button>

            <div className="my-9 flex items-center gap-4">
              <span className="h-px flex-1 bg-[#dce4ec]" />
              <span className="text-[11px] font-black uppercase tracking-[0.18em] text-[#98a2b3]">veya</span>
              <span className="h-px flex-1 bg-[#dce4ec]" />
            </div>

            <form className="grid gap-6" onSubmit={submit}>
              <label className="block">
                <span className="text-[12px] font-black uppercase tracking-[0.1em] text-[#667085]">E-posta Adresi</span>
                <input
                  className="mt-2 h-[54px] w-full rounded-[12px] border border-[#d7e0ea] bg-white px-4 text-[15px] font-semibold text-[#1f2937] outline-none transition focus:border-[#16a05a] focus:ring-4 focus:ring-emerald-100"
                  inputMode="email"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="ornek@mail.com"
                  value={email}
                />
              </label>

              <label className="block">
                <span className="flex items-center justify-between text-[12px] font-black uppercase tracking-[0.1em] text-[#667085]">
                  Şifre
                  <a className="normal-case tracking-normal text-[#138746]" href="#forgot">
                    Şifremi unuttum?
                  </a>
                </span>
                <input
                  className="mt-2 h-[54px] w-full rounded-[12px] border border-[#d7e0ea] bg-white px-4 text-[15px] font-semibold text-[#1f2937] outline-none transition focus:border-[#16a05a] focus:ring-4 focus:ring-emerald-100"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  type="password"
                  value={password}
                />
              </label>

              <button
                className="mt-6 h-[56px] rounded-[13px] bg-[#18a750] text-[16px] font-black text-white shadow-[0_14px_26px_rgba(22,160,90,0.22)] transition hover:-translate-y-0.5 hover:bg-[#138d45]"
                type="submit"
              >
                {mode === "login" ? "Giriş Yap" : "Kayıt Ol"}
              </button>
              {message ? <p className="text-center text-sm font-bold text-[#138746]">{message}</p> : null}
            </form>
          </section>

          <section>
            <h2 className="max-w-[560px] text-[clamp(36px,5vw,58px)] font-black leading-[0.95] tracking-[-0.06em] text-[#07111f]">
              Üye Olun, Tasarruf Finansmanı
              <span className="block text-[#16a05a]">Planınızı Optimize Edin</span>
            </h2>
            <p className="mt-5 max-w-[520px] text-[18px] font-medium leading-8 text-[#344054]">
              Faizsiz sistemlerin tüm gizli maliyetlerini ve fırsatlarını profesyonel araçlarla keşfedin.
            </p>

            <div className="mt-8 grid gap-5">
              {features.map((feature) => (
                <article
                  className="flex gap-5 rounded-[18px] border border-[#e0e7ef] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]"
                  key={feature.title}
                >
                  <span className={`grid h-13 w-13 shrink-0 place-items-center rounded-[15px] text-[22px] ${feature.tone}`}>
                    {feature.icon}
                  </span>
                  <div>
                    <h3 className="text-[18px] font-black text-[#07111f]">{feature.title}</h3>
                    <p className="mt-2 text-[14px] font-medium leading-6 text-[#667085]">{feature.text}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-14 flex items-center gap-4 text-sm font-black text-[#98a2b3]">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-white/80 text-[10px]">U1</span>
              <span className="grid h-8 w-8 place-items-center rounded-full bg-white/80 text-[10px]">U2</span>
              <span className="grid h-8 w-8 place-items-center rounded-full bg-white/80 text-[10px]">U3</span>
              <span className="grid h-8 w-8 place-items-center rounded-full bg-white/80 text-[10px]">U4</span>
              <span>1,000+ aktif kullanıcı</span>
            </div>
          </section>
        </div>
        <p className="mt-2 text-center text-[12px] font-medium text-[#98a2b3]">
          Üye olarak Kullanım Koşullarını kabul etmiş sayılırsınız.
        </p>
      </section>
    </main>
  );
}
