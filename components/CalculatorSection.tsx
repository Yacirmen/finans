function Toggle({ checked, label, name }: { checked: boolean; label: string; name: string }) {
  return (
    <button className="flex items-center gap-3 text-left text-[15px] font-medium text-slate-600" data-toggle={name} data-on={String(checked)} type="button">
      <span className={`relative h-6 w-11 rounded-full transition-all duration-300 ${checked ? "bg-[#1ab067]" : "bg-[#d7e3ef]"}`}>
        <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-300 ${checked ? "left-6" : "left-1"}`} />
      </span>
      {label}
    </button>
  );
}

function SummaryLine({
  label,
  value,
  previewKey,
  tone = "default",
}: {
  label: string;
  value: string;
  previewKey: string;
  tone?: "default" | "green" | "red";
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-[#edf2f7] py-5 last:border-0 last:pb-0">
      <span className="text-[15px] text-[#748299]">{label}</span>
      <strong
        className={`text-[15px] font-bold transition-all duration-300 ${
          tone === "green" ? "text-[#17a35e]" : tone === "red" ? "text-[#ff4d4f]" : "text-[#1c2433]"
        }`}
        data-preview={previewKey}
      >
        {value}
      </strong>
    </div>
  );
}

function MetricBox({ label, value, previewKey }: { label: string; value: string; previewKey: string }) {
  return (
    <div className="rounded-[16px] border border-[#e6edf5] bg-[#f8fbff] px-5 py-4 text-center shadow-[0_6px_18px_rgba(27,39,51,0.04)]">
      <span className="block text-[14px] text-[#73829a]">{label}</span>
      <strong className="mt-2 block text-[18px] font-bold text-[#152032] transition-all duration-300" data-preview={previewKey}>
        {value}
      </strong>
    </div>
  );
}

function UtilityCard({
  title,
  text,
  cta,
  tone = "violet",
}: {
  title: string;
  text: string;
  cta: string;
  tone?: "violet" | "green";
}) {
  const toneClasses =
    tone === "green"
      ? "border-[#c8f4de] bg-[linear-gradient(180deg,#f3fff8_0%,#effcf6_100%)]"
      : "border-[#dae2ff] bg-[linear-gradient(180deg,#f7f8ff_0%,#f2f5ff_100%)]";

  const iconClasses = tone === "green" ? "bg-[#dff8ec] text-[#18a05a]" : "bg-[#e7ebff] text-[#6366f1]";
  const badgeClasses = tone === "green" ? "bg-[#effdf5] text-[#18a05a] border-[#c8f4de]" : "bg-[#f1f3ff] text-[#6366f1] border-[#d9ddff]";
  const ctaClasses = tone === "green" ? "text-[#18a05a]" : "text-[#6366f1]";

  return (
    <article className={`rounded-[18px] border p-5 shadow-[0_14px_34px_rgba(31,43,37,0.05)] ${toneClasses}`}>
      <div className="flex items-start justify-between gap-3">
        <div className={`grid h-10 w-10 place-items-center rounded-xl text-lg ${iconClasses}`}>{tone === "green" ? "⌘" : "◔"}</div>
        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${badgeClasses}`}>Üyelere Özel</span>
      </div>
      <h3 className="mt-6 text-[18px] font-bold text-[#1a2435]">{title}</h3>
      <p className="mt-3 text-[14px] leading-7 text-[#768399]">{text}</p>
      <button className={`mt-5 text-[14px] font-semibold transition-colors hover:opacity-80 ${ctaClasses}`} type="button">
        {cta} →
      </button>
    </article>
  );
}

export function CalculatorSection() {
  return (
    <section id="calculator" className="page-container relative z-20 mt-8 scroll-mt-24" data-calculator>
      <div className="grid items-start gap-7 lg:grid-cols-[1.14fr_0.86fr]">
        <div className="space-y-6">
          <div className="rounded-[26px] border border-[#dce7e2] bg-white p-5 shadow-[0_18px_48px_rgba(31,43,37,0.08)] md:p-6" data-calculator-card>
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e8eef5] pb-4">
              <h2 className="text-[18px] font-bold tracking-[-0.03em] text-[#1c2433] md:text-[20px]">Tasarruf Finansmanı Maliyet Hesaplayıcı</h2>
              <button className="rounded-full bg-[#e9fbef] px-4 py-2 text-[14px] font-medium text-[#179253] transition-all duration-300 hover:bg-[#dcf7e6]" data-fill-example type="button">
                Örnek Senaryoyu Doldur
              </button>
            </div>

            <div className="mt-5 grid gap-6">
              <div className="grid gap-5 md:grid-cols-[1fr_1fr_1.08fr]">
                <div>
                  <span className="form-label">Varlık Tipi</span>
                  <div className="grid grid-cols-2 rounded-[14px] bg-[#eef3f8] p-1">
                    <button className="segment-button active" data-segment="assetType" data-value="Konut" type="button">
                      ⌂ Konut
                    </button>
                    <button className="segment-button" data-segment="assetType" data-value="Araba" type="button">
                      ▭ Araba
                    </button>
                  </div>
                </div>

                <div>
                  <span className="form-label">Finansman Modeli</span>
                  <div className="grid grid-cols-2 rounded-[14px] bg-[#eef3f8] p-1">
                    <button className="segment-button active" data-segment="model" data-value="cekilissiz" type="button">
                      Çekilişsiz
                    </button>
                    <button className="segment-button" data-segment="model" data-value="cekilisli" type="button">
                      Çekilişli
                    </button>
                  </div>
                </div>

                <div className="relative" data-company-select>
                  <span className="form-label">Şirket Seçimi</span>
                  <input data-field="company" type="hidden" defaultValue="Diğer" />
                  <button
                    aria-expanded="false"
                    aria-haspopup="listbox"
                    className="form-control flex !h-[56px] w-full items-center justify-between !rounded-[16px] !bg-[#f9fbfe] !font-medium text-[#1b2433] transition-all duration-200 hover:border-[#bfd0df]"
                    data-company-trigger
                    type="button"
                  >
                    <span data-company-label>Diğer</span>
                    <span className="text-[13px] text-[#8a98ac] transition-transform duration-200" data-company-chevron>
                      ˅
                    </span>
                  </button>

                  <div
                    className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 hidden overflow-hidden rounded-[18px] border border-[#d9e3ee] bg-white py-1 shadow-[0_22px_48px_rgba(27,36,51,0.16)]"
                    data-company-menu
                    role="listbox"
                  >
                    {[
                      "Eminevim",
                      "Fuzul Ev",
                      "Katılımevim",
                      "Sinpaş YTS",
                      "Emlak Katılım Tasarruf Finansmanı",
                      "Birevim",
                      "İyi Finans",
                      "İmece",
                      "Albayrak Finans",
                      "Diğer",
                    ].map((company) => (
                      <button
                        className="flex w-full items-center px-4 py-2.5 text-left text-[15px] font-medium text-[#213046] transition-colors duration-150 hover:bg-[#f3f8ff] data-[active=true]:bg-[#edf6ff] data-[active=true]:text-[#1454d1]"
                        data-company-option
                        data-value={company}
                        key={company}
                        type="button"
                      >
                        {company}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-[#e8eef5] pt-6">
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                  {[
                    ["assetPrice", "Evin Fiyatı (TL) *", "3.000.000", "3000000"],
                    ["downPayment", "Peşinat (TL)", "1.000.000", "1000000"],
                    ["term", "Taksit (Ay) *", "48", "48"],
                    ["monthlyPayment", "Aylık Ödeme *", "41.667", "41667"],
                  ].map(([key, label, placeholder, value]) => (
                    <label key={key}>
                      <span className="form-label">{label}</span>
                      <input className="form-control !h-[40px] !rounded-[14px] !bg-[#f9fbfe] !font-medium" placeholder={placeholder} defaultValue={key === "assetPrice" ? "3.000.000" : key === "downPayment" ? "1.000.000" : key === "monthlyPayment" ? "41.667" : value} data-field={key} />
                    </label>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-8">
                  <Toggle checked={false} label="Artışlı Taksit Planı" name="escalating" />
                  <Toggle checked={false} label="Manuel Plan Oluştur" name="manualPlan" />
                </div>
              </div>

              <div className="border-t border-[#e8eef5] pt-6">
                <div className="grid gap-5 md:grid-cols-3">
                  {[
                    ["delivery", "Teslim Ayı", "12", "12"],
                    ["serviceFee", "Hizmet Bedeli (%)", "11.8", "11.8"],
                    ["rent", "Kira (TL/Ay)", "25.000", "25000"],
                  ].map(([key, label, placeholder, value]) => (
                    <label key={key}>
                      <span className="form-label">{label}</span>
                      <input className="form-control !h-[40px] !rounded-[14px] !bg-[#f9fbfe] !font-medium" placeholder={placeholder} defaultValue={key === "rent" ? "25.000" : value} data-field={key} />
                    </label>
                  ))}
                </div>

                <div className="mt-3 flex justify-center">
                  <div className="w-full max-w-[116px]">
                    <div className="h-1.5 rounded-full bg-[#dce6ef]">
                      <div className="h-1.5 rounded-full bg-[#19a15b] transition-all duration-300" data-delivery-bar style={{ width: "62%" }} />
                    </div>
                  </div>
                </div>
              </div>

              <details className="border-t border-[#e8eef5] pt-6">
                <summary className="cursor-pointer text-[14px] font-bold uppercase tracking-[0.08em] text-[#74829a]">Gelişmiş Parametreler</summary>
                <div className="mt-5 grid gap-5 md:grid-cols-3">
                  {[
                    ["inflation", "Yıllık Enflasyon (%)", "32.0", "32"],
                    ["creditRate", "Kredi Faizi (% / ay)", "3.19", "3.19"],
                    ["yearlyIncrease", "Yıllık Taksit Artışı (%)", "15.0", "15"],
                  ].map(([key, label, placeholder, value]) => (
                    <label key={key}>
                      <span className="form-label">{label}</span>
                      <input className="form-control !h-[40px] !rounded-[14px] !bg-[#f9fbfe] !font-medium" placeholder={placeholder} defaultValue={value} data-field={key} />
                    </label>
                  ))}
                </div>
              </details>

              <div className="border-t border-[#e8eef5] pt-4">
                <div className="mb-5">
                  <Toggle checked={true} label="Tasarruf Finansmanı ile Konut Kredisini Kıyasla" name="compareBank" />
                </div>

                <div className="rounded-[18px] border border-[#dbe6f1] bg-[#f9fbfe] p-5" data-bank-panel>
                  <div className="flex items-center gap-3 text-[#263246]">
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#ecfff3] text-[#1aa35d]">⌂</span>
                    <h3 className="text-[16px] font-bold">Konut Kredisi Karşılaştırması</h3>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-[1.15fr_0.6fr_0.6fr]">
                    <label>
                      <span className="form-label">Kredi Tutarı (TL)</span>
                      <input className="form-control !h-[40px] !rounded-[14px] !bg-white !font-medium" data-bank-field="amount" defaultValue="2.000.000" />
                    </label>
                    <label>
                      <span className="form-label">Aylık Faiz (%)</span>
                      <input className="form-control !h-[40px] !rounded-[14px] !bg-white !font-medium" data-bank-field="rate" defaultValue="2.8" />
                    </label>
                    <label>
                      <span className="form-label">Vade (Ay)</span>
                      <input className="form-control !h-[40px] !rounded-[14px] !bg-white !font-medium" data-bank-field="term" defaultValue="120" />
                    </label>
                  </div>

                  <div className="mt-5">
                    <span className="form-label">Hesaplanan Taksit (TL)</span>
                    <div className="rounded-[14px] border border-[#cdeedc] bg-[#e8fbef] px-5 py-3 text-[16px] font-bold text-[#177d4e]" data-preview="bankInstallment">
                      ₺58.114
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#e8eef5] pt-5">
                <p className="mb-4 hidden rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" data-form-error />
                <button
                  className="h-[50px] w-full rounded-[13px] bg-[#16a05a] text-[15px] font-bold text-white shadow-[0_16px_28px_rgba(22,160,90,0.18)] transition-all duration-300 hover:bg-[#12874b]"
                  data-calculate
                  type="button"
                >
                  HESAPLA VE SONUÇLARI GÖSTER
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <UtilityCard
              title="Çekiliş Simülasyonu"
              text="Çekilişli sistemde binlerce teslim ayı senaryosunu saniyeler içinde analiz edin, şansa değil veriye dayalı karar verin."
              cta="Simülasyonu Başlat"
              tone="violet"
            />
            <UtilityCard
              title="Peşinat Optimizasyonu"
              text="Farklı peşinat senaryolarını otomatik test ederek Net Bugünkü Maliyet'i en aza indiren optimum tutarı bulun."
              cta="Oranları Ayarla"
              tone="green"
            />
          </div>
        </div>

        <aside className="self-start rounded-[26px] border border-[#dce7e2] bg-white p-6 shadow-[0_18px_48px_rgba(31,43,37,0.08)]" data-summary-panel>
          <div className="flex items-center gap-3 border-b border-[#e8eef5] pb-5">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#ecfff3] text-[#1aa35d]">⌗</span>
            <h3 className="text-[18px] font-bold text-[#1c2433]">Hesaplama Özeti</h3>
          </div>

          <div className="mt-5 rounded-[16px] border border-[#cfeedd] bg-[#eafbf1] px-5 py-4 text-center shadow-[0_10px_24px_rgba(24,160,90,0.08)]">
            <span className="block text-[14px] font-bold uppercase tracking-[0.05em] text-[#168b53]">Toplam Geri Ödeme (Nominal)</span>
            <strong className="mt-2 block text-[20px] font-bold text-[#136f45] transition-all duration-300" data-preview="totalNominal">
              ₺3.225.016
            </strong>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <MetricBox label="Vade (Ay)" value="48" previewKey="term" />
            <MetricBox label="Teslim Ayı" value="13" previewKey="delivery" />
          </div>

          <div className="mt-5 rounded-[18px] border border-[#dbe6f1] bg-white overflow-hidden">
            <div className="px-5 py-4">
              <h4 className="text-[16px] font-bold text-[#243045]">NET MALİYET (NBM) DETAYI</h4>
              <div className="mt-3">
                <SummaryLine label="Finansmanın Bugünkü Değeri (Fayda)" value="₺2.294.607" previewKey="benefitPv" tone="green" />
                <SummaryLine label="Org. Ücreti + Peşinat" value="₺1.225.000" previewKey="orgAndDown" tone="red" />
                <SummaryLine label="Aylık Ödemeler (PV)" value="₺1.256.653" previewKey="paymentsPv" tone="red" />
              </div>
            </div>

            <div className="border-t border-[#dbe6f1] bg-[#f8fbff] px-5 py-5 text-center">
              <span className="block text-[13px] font-bold uppercase tracking-[0.06em] text-[#74829a]">Net Başlangıç Maliyeti</span>
              <strong className="mt-2 block text-[22px] font-bold text-[#1c2433] transition-all duration-300" data-preview="netInitialCost">
                ₺187.046
              </strong>
              <button className="mt-4 inline-flex items-center gap-2 text-[14px] font-medium text-[#179253]" data-net-info type="button">
                Net Maliyet Ne İfade Eder? <span>⌄</span>
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button className="flex-1 rounded-[12px] bg-[#ef2a2a] px-5 py-3 text-[15px] font-bold text-white shadow-[0_10px_22px_rgba(239,42,42,0.18)] transition-all duration-300 hover:bg-[#d91e1e]" data-download-pdf type="button">
              PDF İndir
            </button>
            <button className="flex-1 rounded-[12px] border border-[#dce5ef] bg-white px-5 py-3 text-[15px] font-medium text-[#49556a] transition-all duration-300 hover:border-[#c7d4e2] hover:bg-[#f9fbfe]" data-copy-link type="button">
              Linki Kopyala
            </button>
          </div>

          <div className="mt-5 hidden grid gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 transition md:grid-cols-2" data-result-panel />
        </aside>
      </div>
    </section>
  );
}
