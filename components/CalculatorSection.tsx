const fields = [
  ["Evin Fiyatı (TL) *", "3.000.000"],
  ["Peşinat (TL)", "1.000.000"],
  ["Taksit (Ay) *", "48"],
  ["Aylık Ödeme *", "41.667"],
  ["Tahmini Teslimat", "13. ay"],
  ["Hizmet Bedeli (%)", "7.5"],
  ["Kira (TL/ay)", "25.000"],
];

export function CalculatorSection() {
  return (
    <section id="calculator" className="page-container relative z-20 mt-8">
      <div className="mx-auto max-w-[900px] rounded-2xl border border-slate-200 bg-white p-6 soft-shadow md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h2 className="text-2xl font-black tracking-[-0.03em] text-slate-950">Tasarruf Finansmanı Maliyet Hesaplayıcı</h2>
            <p className="mt-2 text-sm text-slate-500">Sözleşme bilgilerini girin, reel maliyeti ve banka kıyasını görün.</p>
          </div>
          <button className="rounded-full bg-[var(--green-soft)] px-5 py-2 text-sm font-extrabold text-[var(--green-dark)]" type="button">
            Örnek Senaryoyu Doldur
          </button>
        </div>

        <div className="mt-6 grid gap-6">
          <div className="grid gap-5 md:grid-cols-[1fr_1fr_1.12fr]">
            <div>
              <span className="form-label">Varlık Tipi</span>
              <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1">
                <button className="segment-button active" type="button">⌂ Konut</button>
                <button className="segment-button" type="button">▭ Araba</button>
              </div>
            </div>
            <div>
              <span className="form-label">Finansman Modeli</span>
              <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1">
                <button className="segment-button active" type="button">Çekilişsiz</button>
                <button className="segment-button" type="button">Çekilişli</button>
              </div>
            </div>
            <label>
              <span className="form-label">Şirket Seçimi</span>
              <select className="form-control">
                <option>Diğer</option>
                <option>Firma A</option>
                <option>Firma B</option>
                <option>Firma C</option>
              </select>
            </label>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {fields.slice(0, 4).map(([label, placeholder]) => (
                <label key={label}>
                  <span className="form-label">{label}</span>
                  <input className="form-control" placeholder={placeholder} />
                </label>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-7">
              <label className="flex items-center gap-3 text-sm font-bold text-slate-700">
                <span className="h-6 w-11 rounded-full bg-slate-200 shadow-inner" />
                Artışlı Taksit Planı
              </label>
              <label className="flex items-center gap-3 text-sm font-bold text-slate-700">
                <span className="h-6 w-11 rounded-full bg-slate-200 shadow-inner" />
                Manuel Plan Oluştur
              </label>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <div className="grid gap-5 md:grid-cols-3">
              {fields.slice(4).map(([label, placeholder]) => (
                <label key={label}>
                  <span className="form-label">{label}</span>
                  <input className="form-control" placeholder={placeholder} />
                </label>
              ))}
            </div>
            <div className="mt-3 max-w-[210px]">
              <div className="h-1.5 rounded-full bg-slate-200">
                <div className="h-1.5 w-[48%] rounded-full bg-[var(--green)]" />
              </div>
            </div>
          </div>

          <details className="border-t border-slate-200 pt-6">
            <summary className="cursor-pointer text-sm font-black uppercase tracking-[0.12em] text-slate-500">Gelişmiş Parametreler</summary>
            <div className="mt-5 grid gap-5 md:grid-cols-3">
              <label>
                <span className="form-label">Yıllık Enflasyon (%)</span>
                <input className="form-control" placeholder="32.0" />
              </label>
              <label>
                <span className="form-label">Kredi Faizi (% / ay)</span>
                <input className="form-control" placeholder="3.19" />
              </label>
              <label>
                <span className="form-label">Yıllık Taksit Artışı (%)</span>
                <input className="form-control" placeholder="15.0" />
              </label>
            </div>
          </details>

          <div className="border-t border-slate-200 pt-5">
            <label className="mb-6 flex items-center gap-3 text-sm font-bold text-slate-700">
              <span className="h-6 w-11 rounded-full bg-slate-200 shadow-inner" />
              Tasarruf Finansmanı ile Konut Kredisini Kıyasla
            </label>
            <button className="h-14 w-full rounded-xl bg-[var(--green)] text-base font-black text-white shadow-[0_16px_30px_rgba(6,148,95,0.2)]" type="button">
              HESAPLA VE SONUÇLARI GÖSTER
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
