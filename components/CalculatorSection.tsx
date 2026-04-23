function Toggle({ checked, label, name }: { checked: boolean; label: string; name: string }) {
  return (
    <button className="flex items-center gap-3 text-left text-sm font-bold text-slate-700" data-toggle={name} data-on={String(checked)} type="button">
      <span className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-[var(--green)]" : "bg-slate-200"}`}>
        <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${checked ? "left-6" : "left-1"}`} />
      </span>
      {label}
    </button>
  );
}

export function CalculatorSection() {
  return (
    <section id="calculator" className="page-container relative z-20 -mt-28 scroll-mt-24 lg:-mt-56" data-calculator>
      <div className="mx-auto max-w-[900px] rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.12)] md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h2 className="text-2xl font-black tracking-[-0.03em] text-slate-950">Tasarruf Finansmanı Maliyet Hesaplayıcı</h2>
            <p className="mt-2 text-sm text-slate-500">Sözleşme bilgilerini girin, reel maliyeti ve banka kıyasını görün.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="rounded-full bg-[var(--green-soft)] px-5 py-2 text-sm font-extrabold text-[var(--green-dark)]" data-fill-example type="button">
              Örnek Senaryoyu Doldur
            </button>
            <button className="rounded-full bg-slate-100 px-5 py-2 text-sm font-extrabold text-slate-600" data-clear-form type="button">
              Temizle
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-6">
          <div className="grid gap-5 md:grid-cols-[1fr_1fr_1.12fr]">
            <div>
              <span className="form-label">Varlık Tipi</span>
              <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1">
                {(["Konut", "Araba"] as const).map((type) => (
                  <button className={`segment-button ${type === "Konut" ? "active" : ""}`} data-segment="assetType" data-value={type} type="button" key={type}>
                    {type === "Konut" ? "⌂" : "▭"} {type}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="form-label">Finansman Modeli</span>
              <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1">
                {(["Çekilişsiz", "Çekilişli"] as const).map((model) => (
                  <button className={`segment-button ${model === "Çekilişsiz" ? "active" : ""}`} data-segment="model" data-value={model} type="button" key={model}>
                    {model}
                  </button>
                ))}
              </div>
            </div>
            <label>
              <span className="form-label">Şirket Seçimi</span>
              <select className="form-control" data-field="company" defaultValue="Diğer">
                <option>Diğer</option>
                <option>Firma A</option>
                <option>Firma B</option>
                <option>Firma C</option>
              </select>
            </label>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {[
                ["assetPrice", "Evin Fiyatı (TL) *", "3.000.000"],
                ["downPayment", "Peşinat (TL)", "1.000.000"],
                ["term", "Taksit (Ay) *", "48"],
                ["monthlyPayment", "Aylık Ödeme *", "41.667"],
              ].map(([key, label, placeholder]) => (
                <label key={key}>
                  <span className="form-label">{label}</span>
                  <input className="form-control" placeholder={placeholder} defaultValue={["assetPrice", "downPayment", "term", "monthlyPayment"].includes(key) ? { assetPrice: "3000000", downPayment: "1000000", term: "48", monthlyPayment: "41667" }[key] : ""} data-field={key} />
                </label>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-7">
              <Toggle checked={false} label="Artışlı Taksit Planı" name="escalating" />
              <Toggle checked={false} label="Manuel Plan Oluştur" name="manualPlan" />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <div className="grid gap-5 md:grid-cols-3">
              {[
                ["delivery", "Tahmini Teslimat", "13. ay"],
                ["serviceFee", "Hizmet Bedeli (%)", "7.5"],
                ["rent", "Kira (TL/ay)", "25.000"],
              ].map(([key, label, placeholder]) => (
                <label key={key}>
                  <span className="form-label">{label}</span>
                  <input className="form-control" placeholder={placeholder} defaultValue={{ delivery: "13", serviceFee: "7.5", rent: "25000" }[key]} data-field={key} />
                </label>
              ))}
            </div>
            <div className="mt-3 max-w-[210px]">
              <div className="h-1.5 rounded-full bg-slate-200">
                <div className="h-1.5 rounded-full bg-[var(--green)] transition-all" data-delivery-bar style={{ width: "48.1%" }} />
              </div>
            </div>
          </div>

          <details className="border-t border-slate-200 pt-6">
            <summary className="cursor-pointer text-sm font-black uppercase tracking-[0.12em] text-slate-500">Gelişmiş Parametreler</summary>
            <div className="mt-5 grid gap-5 md:grid-cols-3">
              {[
                ["inflation", "Yıllık Enflasyon (%)", "32.0"],
                ["creditRate", "Kredi Faizi (% / ay)", "3.19"],
                ["yearlyIncrease", "Yıllık Taksit Artışı (%)", "15.0"],
              ].map(([key, label, placeholder]) => (
                <label key={key}>
                  <span className="form-label">{label}</span>
                  <input className="form-control" placeholder={placeholder} defaultValue={{ inflation: "32", creditRate: "3.19", yearlyIncrease: "15" }[key]} data-field={key} />
                </label>
              ))}
            </div>
          </details>

          <div className="border-t border-slate-200 pt-5">
            <p className="mb-4 hidden rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700" data-form-error />
            <div className="mb-6">
              <Toggle checked={true} label="Tasarruf Finansmanı ile Konut Kredisini Kıyasla" name="compareBank" />
            </div>
            <button className="h-14 w-full rounded-xl bg-[var(--green)] text-base font-black text-white shadow-[0_16px_30px_rgba(6,148,95,0.2)] transition hover:-translate-y-0.5 hover:bg-[var(--green-dark)]" data-calculate type="button">
              HESAPLA VE SONUÇLARI GÖSTER
            </button>
          </div>

          <div className="hidden grid gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 transition md:grid-cols-4" data-result-panel />
        </div>
      </div>
    </section>
  );
}
