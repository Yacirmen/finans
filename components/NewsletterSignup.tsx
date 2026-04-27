"use client";

import { useState } from "react";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function NewsletterSignup({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const normalized = email.trim().toLowerCase();

    if (!emailPattern.test(normalized)) {
      setMessage("Lütfen geçerli bir e-posta adresi girin.");
      return;
    }

    const existing = JSON.parse(localStorage.getItem("newsletterEmails") || "[]") as string[];
    localStorage.setItem("newsletterEmails", JSON.stringify(Array.from(new Set([...existing, normalized]))));
    setEmail("");
    setMessage("Kaydınız alındı. İlk bültende görüşmek üzere.");
  }

  return (
    <section className={compact ? "" : "page-container mt-14"}>
      <div className="rounded-[26px] border border-[#d9e4ee] bg-[linear-gradient(135deg,#eaf3ff_0%,#ffffff_56%,#f6fbff_100%)] p-6 shadow-[0_18px_42px_rgba(15,35,70,0.06)] md:p-8">
        <div className="grid gap-5 lg:grid-cols-[1fr_420px] lg:items-center">
          <div>
            <span className="text-xs font-black uppercase tracking-[0.16em] text-[#0b3a6f]">Bülten</span>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-950">Tasarruf & Finans Rehberi</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
              Haftalık tasarruf ve finansa dair rehber talep etmek için mailinizi girin.
            </p>
          </div>
          <form className="grid gap-3 sm:grid-cols-[1fr_auto]" onSubmit={submit}>
            <input
              className="form-control !h-[48px] !bg-white"
              inputMode="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="mail@ornek.com"
              value={email}
            />
            <button className="rounded-[14px] bg-[#0b3a6f] px-6 py-3 text-sm font-black text-white shadow-[0_14px_26px_rgba(11,58,111,0.20)]" type="submit">
              Kaydol
            </button>
            {message ? <p className="text-sm font-semibold text-[#0b3a6f] sm:col-span-2">{message}</p> : null}
          </form>
        </div>
      </div>
    </section>
  );
}
