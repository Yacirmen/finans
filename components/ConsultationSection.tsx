"use client";

import { useState } from "react";

const initialForm = {
  fullName: "",
  phone: "",
  email: "",
  assetType: "Konut",
  assetValue: "",
  downPayment: "",
  term: "",
  note: "",
};

export function ConsultationSection() {
  const [form, setForm] = useState(initialForm);
  const [saved, setSaved] = useState(false);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const existing = JSON.parse(localStorage.getItem("consultationRequests") || "[]") as unknown[];
    localStorage.setItem(
      "consultationRequests",
      JSON.stringify([{ ...form, createdAt: new Date().toISOString() }, ...existing]),
    );
    setForm(initialForm);
    setSaved(true);
  }

  function setField(field: keyof typeof initialForm, value: string) {
    setSaved(false);
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <section className="page-container mt-14">
      <div className="grid gap-6 rounded-[26px] border border-slate-200 bg-white p-6 shadow-[0_18px_42px_rgba(15,23,42,0.06)] lg:grid-cols-[0.8fr_1.2fr] md:p-8">
        <div>
          <span className="text-xs font-black uppercase tracking-[0.16em] text-[#a94612]">Danışmanlık</span>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-slate-950">Uzmanına Danış</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Kayıt, ücret olmaksızın teklif talebinizi oluşturun. Bilgiler şimdilik sadece bu tarayıcıda saklanır.
          </p>
        </div>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
          <input className="form-control" placeholder="Ad Soyad" value={form.fullName} onChange={(event) => setField("fullName", event.target.value)} />
          <input className="form-control" placeholder="Telefon" value={form.phone} onChange={(event) => setField("phone", event.target.value)} />
          <input className="form-control" placeholder="E-posta" value={form.email} onChange={(event) => setField("email", event.target.value)} />
          <select className="form-control" value={form.assetType} onChange={(event) => setField("assetType", event.target.value)}>
            <option>Konut</option>
            <option>Taşıt</option>
          </select>
          <input className="form-control" placeholder="Bütçe / varlık değeri" value={form.assetValue} onChange={(event) => setField("assetValue", event.target.value)} />
          <input className="form-control" placeholder="Peşinat" value={form.downPayment} onChange={(event) => setField("downPayment", event.target.value)} />
          <input className="form-control" placeholder="Taksit ayı" value={form.term} onChange={(event) => setField("term", event.target.value)} />
          <input className="form-control" placeholder="Notunuz" value={form.note} onChange={(event) => setField("note", event.target.value)} />
          <button className="rounded-[14px] bg-[#f47a2a] px-6 py-3 text-sm font-black text-white shadow-[0_14px_26px_rgba(244,122,42,0.18)] md:col-span-2" type="submit">
            Talebi Kaydet
          </button>
          {saved ? <p className="text-sm font-semibold text-[#a94612] md:col-span-2">Talebiniz kaydedildi.</p> : null}
        </form>
      </div>
    </section>
  );
}
