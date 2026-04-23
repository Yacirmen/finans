const tabButtonClass =
  "rounded-[11px] px-4 py-3 text-[14px] font-semibold transition-all duration-300 text-[#526071] hover:bg-white hover:text-[#182133] data-[active=true]:bg-[#16a05a] data-[active=true]:text-white data-[active=true]:shadow-[0_10px_22px_rgba(24,160,90,0.22)]";

function InputLabel({ children }: { children: React.ReactNode }) {
  return <span className="mb-2 block text-[12px] font-bold uppercase tracking-[0.08em] text-[#72819a]">{children}</span>;
}

function MetricCard({
  label,
  value,
  previewKey,
  tone = "default",
}: {
  label: string;
  value: string;
  previewKey: string;
  tone?: "default" | "green";
}) {
  return (
    <div
      className={`rounded-[16px] border px-5 py-4 shadow-[0_6px_18px_rgba(27,39,51,0.04)] ${
        tone === "green" ? "border-[#cfeedd] bg-[#ecfbf2]" : "border-[#e6edf5] bg-[#f8fbff]"
      }`}
    >
      <span className="block text-[12px] font-bold uppercase tracking-[0.08em] text-[#74829a]">{label}</span>
      <strong
        className={`mt-2 block text-[24px] font-black tracking-[-0.05em] ${tone === "green" ? "text-[#136f45]" : "text-[#182133]"}`}
        data-limit-preview={previewKey}
      >
        {value}
      </strong>
    </div>
  );
}

export function LoanLimitSection() {
  return (
    <section id="loanLimit" className="page-container mt-8 scroll-mt-24" data-loan-limit>
      <div className="grid items-start gap-7 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="min-h-[348px] rounded-[26px] border border-[#dce7e2] bg-white p-5 shadow-[0_18px_48px_rgba(31,43,37,0.08)] md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e8eef5] pb-4">
            <div>
              <span className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#7b8aa2]">Kredi limit modülü</span>
              <h2 className="mt-1 text-[18px] font-bold tracking-[-0.03em] text-[#1c2433] md:text-[20px]">
                Konut, taşıt ve ihtiyaç limitini görün
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-1 rounded-[14px] bg-[#eef3f8] p-1">
              <button className={tabButtonClass} data-active="true" data-limit-tab-button="housing" type="button">
                Konut
              </button>
              <button className={tabButtonClass} data-active="false" data-limit-tab-button="vehicle" type="button">
                Taşıt
              </button>
              <button className={tabButtonClass} data-active="false" data-limit-tab-button="need" type="button">
                İhtiyaç
              </button>
            </div>
          </div>

          <div className="mt-5 flex min-h-[250px] flex-col">
            <div className="grid gap-5 md:grid-cols-3" data-limit-panel="housing">
              <label>
                <InputLabel>Ekspertiz Değeri (TL)</InputLabel>
                <input
                  defaultValue="6.500.000"
                  className="form-control !h-[44px] !rounded-[14px] !bg-[#f9fbfe] !font-medium"
                  data-limit-field="housingValue"
                  inputMode="numeric"
                  placeholder="6.500.000"
                />
              </label>

              <label>
                <InputLabel>Enerji Sınıfı</InputLabel>
                <select defaultValue="A-B" className="form-control !h-[44px] !rounded-[14px] !bg-[#f9fbfe] !font-medium" data-limit-field="energyClass">
                  <option value="A-B">A - B</option>
                  <option value="C">C</option>
                  <option value="Diger">Diğer</option>
                </select>
              </label>

              <label>
                <InputLabel>Konut Sahipliği</InputLabel>
                <select defaultValue="yok" className="form-control !h-[44px] !rounded-[14px] !bg-[#f9fbfe] !font-medium" data-limit-field="homeOwnership">
                  <option value="yok">Evi yok</option>
                  <option value="var">Evi var</option>
                </select>
              </label>
            </div>

            <div className="hidden w-full max-w-[360px] gap-5" data-limit-panel="vehicle">
              <label className="max-w-[360px]">
                <InputLabel>Taşıt Değeri (TL)</InputLabel>
                <input
                  defaultValue="1.250.000"
                  className="form-control !h-[44px] !rounded-[14px] !bg-[#f9fbfe] !font-medium"
                  data-limit-field="vehicleValue"
                  inputMode="numeric"
                  placeholder="1.250.000"
                />
              </label>
            </div>

            <div className="hidden w-full max-w-[360px] gap-5" data-limit-panel="need">
              <label className="max-w-[360px]">
                <InputLabel>İstenen Kredi Tutarı (TL)</InputLabel>
                <input
                  defaultValue="180.000"
                  className="form-control !h-[44px] !rounded-[14px] !bg-[#f9fbfe] !font-medium"
                  data-limit-field="needValue"
                  inputMode="numeric"
                  placeholder="180.000"
                />
              </label>
            </div>
          </div>
        </div>

        <aside className="min-h-[348px] rounded-[26px] border border-[#dce7e2] bg-white p-5 shadow-[0_18px_48px_rgba(31,43,37,0.08)] md:p-6">
          <div className="border-b border-[#e8eef5] pb-4">
            <span className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#7b8aa2]">Sonuç</span>
            <h3 className="mt-1 text-[18px] font-bold tracking-[-0.03em] text-[#1c2433]" data-limit-preview="title">
              Konut kredi modülü
            </h3>
          </div>

          <div className="mt-5 grid gap-4" data-limit-summary="housing">
            <MetricCard label="Kredi Oranı" value="%80,0" previewKey="housingRatio" tone="green" />
            <MetricCard label="Azami Kredi Tutarı" value="₺5.200.000" previewKey="housingAmount" />
          </div>

          <div className="mt-5 hidden grid gap-4" data-limit-summary="vehicle">
            <MetricCard label="Azami Kredi Tutarı" value="₺250.000" previewKey="vehicleAmount" tone="green" />
            <div className="rounded-[16px] border border-[#e6edf5] bg-[#f8fbff] px-5 py-4 text-[14px] font-medium text-[#617086]" data-limit-preview="vehicleMessage">
              Uygulanan oran: %20,0
            </div>
          </div>

          <div className="mt-5 hidden grid gap-4" data-limit-summary="need">
            <MetricCard label="Azami Vade" value="24 ay" previewKey="needTerm" tone="green" />
            <div className="rounded-[16px] border border-[#e6edf5] bg-[#f8fbff] px-5 py-4 text-[14px] font-medium text-[#617086]" data-limit-preview="needMessage">
              125.000,01 - 250.000 TL bandı için 24 ay
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
