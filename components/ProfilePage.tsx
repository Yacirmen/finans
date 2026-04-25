"use client";

import { useEffect, useState } from "react";
import { NewsletterSignup } from "./NewsletterSignup";

type ProfileRecord = {
  id: string;
  title: string;
  createdAt: string;
  payload: Record<string, unknown>;
};

function readRecords() {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem("financeProfiles") || "[]") as ProfileRecord[];
}

export function ProfilePage() {
  const [records, setRecords] = useState<ProfileRecord[]>([]);

  useEffect(() => {
    setRecords(readRecords());
  }, []);

  function persist(next: ProfileRecord[]) {
    setRecords(next);
    localStorage.setItem("financeProfiles", JSON.stringify(next));
  }

  return (
    <main className="bg-[#f6f8fb] pb-16">
      <section className="page-container pt-8">
        <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-[0_18px_42px_rgba(15,23,42,0.06)] md:p-8">
          <span className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Profil</span>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.05em] text-slate-950">Kaydedilen finansman kayıtları</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
            Kredi limit ve danışmanlık kayıtları şimdilik tarayıcınızda saklanır. Backend/auth bağlandığında bu yapı kolayca taşınabilir.
          </p>
        </div>
      </section>

      <section className="page-container mt-6">
        <NewsletterSignup compact />
      </section>

      <section className="page-container mt-6">
        <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-black text-slate-950">Kayıtlar</h2>
            <button
              className="rounded-xl border border-rose-200 px-4 py-2 text-sm font-bold text-rose-600 disabled:opacity-40"
              disabled={!records.length}
              onClick={() => persist([])}
              type="button"
            >
              Tümünü Temizle
            </button>
          </div>

          {records.length ? (
            <div className="mt-5 grid gap-4">
              {records.map((record) => (
                <article className="rounded-[18px] border border-slate-200 bg-[#f8fbff] p-5" key={record.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <strong className="text-lg font-black text-slate-950">{record.title}</strong>
                      <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                        {new Date(record.createdAt).toLocaleString("tr-TR")}
                      </p>
                    </div>
                    <button
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600"
                      onClick={() => persist(records.filter((item) => item.id !== record.id))}
                      type="button"
                    >
                      Sil
                    </button>
                  </div>
                  <pre className="mt-4 overflow-auto rounded-xl bg-white p-4 text-xs text-slate-600">
                    {JSON.stringify(record.payload, null, 2)}
                  </pre>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-[18px] border border-dashed border-slate-300 bg-[#f8fbff] p-6 text-sm font-semibold text-slate-500">
              Henüz kaydedilmiş profil kaydı yok.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
