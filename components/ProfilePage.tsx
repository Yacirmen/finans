"use client";

import { useEffect, useMemo, useState } from "react";

type ProfileRecord = {
  id: string;
  title: string;
  createdAt: string;
  payload: Record<string, unknown>;
};

type ConsultationRequest = {
  fullName?: string;
  phone?: string;
  email?: string;
  assetType?: string;
  assetValue?: string;
  downPayment?: string;
  term?: string;
  note?: string;
  createdAt?: string;
};

const fieldClass =
  "mt-2 h-[46px] w-full rounded-[11px] border border-[#d8e1ea] bg-[#fbfcfe] px-4 text-[14px] font-medium text-[#1c2433] outline-none transition focus:border-[#155eef] focus:bg-white focus:ring-4 focus:ring-[#eaf3ff]";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    return JSON.parse(localStorage.getItem(key) || "") as T;
  } catch {
    return fallback;
  }
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block text-[13px] font-semibold text-[#1f2b3d]">
      {label}
      <input className={fieldClass} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} type={type} value={value} />
    </label>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[16px] border border-[#e0e6ed] bg-white p-6 shadow-[0_8px_22px_rgba(15,23,42,0.04)]">
      <h2 className="text-[20px] font-black tracking-[-0.035em] text-[#111827]">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function ProfilePage() {
  const [email, setEmail] = useState("tasarrufinansman@gmail.com");
  const [phone, setPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [message, setMessage] = useState("");
  const [records, setRecords] = useState<ProfileRecord[]>([]);
  const [consultations, setConsultations] = useState<ConsultationRequest[]>([]);

  useEffect(() => {
    const savedProfile = readJson<{ email?: string; phone?: string }>("profileInfo", {});
    setEmail(savedProfile.email || "tasarrufinansman@gmail.com");
    setPhone(savedProfile.phone || "");
    setRecords(readJson<ProfileRecord[]>("financeProfiles", []));
    setConsultations(readJson<ConsultationRequest[]>("consultationRequests", []));
  }, []);

  const requestCount = useMemo(() => records.length + consultations.length, [records.length, consultations.length]);

  function saveInfo() {
    localStorage.setItem("profileInfo", JSON.stringify({ email, phone }));
    setMessage("Bilgileriniz kaydedildi.");
  }

  function changeEmail() {
    if (!newEmail.trim()) {
      setMessage("Yeni e-posta alanını doldurun.");
      return;
    }
    setEmail(newEmail.trim());
    localStorage.setItem("profileInfo", JSON.stringify({ email: newEmail.trim(), phone }));
    setNewEmail("");
    setMessage("E-posta adresiniz güncellendi.");
  }

  function changePassword() {
    if (!password || password !== passwordRepeat) {
      setMessage("Şifreler eşleşmiyor.");
      return;
    }
    setPassword("");
    setPasswordRepeat("");
    setMessage("Şifre güncelleme talebiniz kaydedildi.");
  }

  function removeRecord(id: string) {
    const next = records.filter((item) => item.id !== id);
    setRecords(next);
    localStorage.setItem("financeProfiles", JSON.stringify(next));
  }

  return (
    <main className="min-h-screen bg-[#f6f7f9] pb-16">
      <section className="mx-auto w-full max-w-[930px] px-4 pt-14">
        <h1 className="text-[34px] font-black tracking-[-0.045em] text-[#07111f]">Profilim</h1>

        <div className="mt-8 grid items-start gap-7 lg:grid-cols-[1fr_280px]">
          <div className="grid gap-6">
            <Panel title="Kişisel Bilgiler">
              <div className="grid gap-5">
                <Field label="E-posta" onChange={setEmail} placeholder="mail@ornek.com" value={email} />
                <Field label="Telefon Numarası" onChange={setPhone} placeholder="05XX XXX XX XX" value={phone} />
                <div>
                  <button
                    className="rounded-[11px] bg-[#0b3a6f] px-5 py-3 text-[14px] font-black text-white shadow-[0_12px_24px_rgba(11,58,111,0.18)] transition hover:-translate-y-0.5 hover:bg-[#155eef]"
                    onClick={saveInfo}
                    type="button"
                  >
                    Bilgileri Kaydet
                  </button>
                </div>
              </div>
            </Panel>

            <Panel title="E-posta Güncelle">
              <div className="grid gap-5">
                <Field label="Yeni E-posta Adresi" onChange={setNewEmail} placeholder="yeni@mail.com" value={newEmail} />
                <div>
                  <button
                    className="rounded-[11px] bg-[#8fb0f3] px-5 py-3 text-[14px] font-black text-white shadow-[0_12px_24px_rgba(56,119,246,0.12)] transition hover:-translate-y-0.5"
                    onClick={changeEmail}
                    type="button"
                  >
                    E-posta Değiştir
                  </button>
                </div>
              </div>
            </Panel>

            <Panel title="Şifre Değiştir">
              <div className="grid gap-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Yeni Şifre" onChange={setPassword} type="password" value={password} />
                  <Field label="Şifre Tekrar" onChange={setPasswordRepeat} type="password" value={passwordRepeat} />
                </div>
                <div>
                  <button
                    className="rounded-[11px] bg-[#9aa1aa] px-5 py-3 text-[14px] font-black text-white shadow-[0_12px_24px_rgba(15,23,42,0.10)] transition hover:-translate-y-0.5"
                    onClick={changePassword}
                    type="button"
                  >
                    Şifreyi Güncelle
                  </button>
                </div>
              </div>
            </Panel>
          </div>

          <aside className="grid gap-5">
            <section className="rounded-[16px] bg-[#0b3a6f] p-6 text-white shadow-[0_18px_34px_rgba(11,58,111,0.22)]">
              <h2 className="text-[20px] font-black tracking-[-0.035em]">Üyelik Durumu</h2>
              <p className="mt-3 text-[13px] font-semibold leading-5 text-white/90">
                Üyeliğiniz aktif. Tüm hesaplama ve karşılaştırma özelliklerine sınırsız erişiminiz var.
              </p>
              <div className="mt-5 rounded-[11px] bg-[#155eef] px-4 py-3 text-[13px] font-black uppercase tracking-[0.06em]">
                ● Premium Plan
              </div>
            </section>

            <section className="rounded-[16px] border border-[#e0e6ed] bg-white p-6 shadow-[0_8px_22px_rgba(15,23,42,0.04)]">
              <h2 className="text-[16px] font-black tracking-[-0.02em] text-[#111827]">Hesap Bağlantıları</h2>
              <div className="mt-5 flex items-center justify-between rounded-[12px] border border-[#edf1f5] bg-[#fbfcfe] p-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-[#f3f0ff] text-[13px] font-black text-[#6d5dfc]">G</span>
                  <span className="text-[13px] font-black text-[#111827]">Google</span>
                </div>
                <span className="rounded-md bg-[#eaf3ff] px-2 py-1 text-[10px] font-black text-[#0b3a6f]">BAĞLI</span>
              </div>
            </section>
          </aside>
        </div>

        {message ? (
          <div className="mt-6 rounded-[14px] border border-[#bfd2ef] bg-[#eaf3ff] px-5 py-4 text-sm font-bold text-[#0b3a6f]">
            {message}
          </div>
        ) : null}

        <section className="mt-7 rounded-[16px] border border-[#e0e6ed] bg-white p-6 shadow-[0_8px_22px_rgba(15,23,42,0.04)]">
          <div>
            <h2 className="text-[20px] font-black tracking-[-0.035em] text-[#111827]">Danışmanlık Taleplerim</h2>
            <p className="mt-1 text-[13px] font-medium text-[#667085]">Temsilcilere gönderdiğiniz taleplerin durumu</p>
          </div>

          {requestCount ? (
            <div className="mt-6 grid gap-4">
              {consultations.map((item, index) => (
                <article className="rounded-[13px] border border-[#e5ebf0] bg-[#fbfcfe] p-4" key={`${item.createdAt}-${index}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <strong className="text-[15px] font-black text-[#111827]">{item.fullName || "İsimsiz danışmanlık talebi"}</strong>
                      <p className="mt-1 text-[13px] font-medium text-[#667085]">
                        {item.assetType || "Varlık türü belirtilmedi"} · {item.phone || "Telefon yok"} · {item.email || "E-posta yok"}
                      </p>
                    </div>
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-black text-amber-700">Beklemede</span>
                  </div>
                </article>
              ))}
              {records.map((record) => (
                <article className="rounded-[13px] border border-[#e5ebf0] bg-[#fbfcfe] p-4" key={record.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <strong className="text-[15px] font-black text-[#111827]">{record.title}</strong>
                      <p className="mt-1 text-[13px] font-medium text-[#667085]">
                        {new Date(record.createdAt).toLocaleString("tr-TR")}
                      </p>
                    </div>
                    <button
                      className="rounded-[10px] border border-[#d8e1ea] bg-white px-3 py-2 text-[12px] font-black text-[#667085]"
                      onClick={() => removeRecord(record.id)}
                      type="button"
                    >
                      Sil
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="grid min-h-[210px] place-items-center">
              <div className="text-center text-[#98a2b3]">
                <div className="mx-auto grid h-10 w-10 place-items-center rounded-[10px] border border-[#d8e1ea] text-2xl">□</div>
                <p className="mt-4 text-[13px] font-medium">Henüz danışmanlık talebi göndermediniz.</p>
              </div>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
