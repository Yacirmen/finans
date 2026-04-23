const scenarioValues = [
  ["Varlık tipi", "Konut"],
  ["Model", "Çekilişsiz"],
  ["Sözleşme tutarı", "3.000.000 TL"],
  ["Peşinat", "1.000.000 TL"],
  ["Vade", "48 ay"],
  ["Aylık ödeme", "41.667 TL"],
  ["Hizmet bedeli", "%7,5"],
  ["Kira etkisi", "25.000 TL/ay"],
  ["Banka kıyası", "Aynı peşinatla kredi"],
];

export function ExampleScenarioSection() {
  return (
    <section className="page-container mt-9">
      <div className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 soft-shadow lg:grid-cols-[0.42fr_0.58fr] lg:p-8">
        <div>
          <span className="form-label text-[var(--green-dark)]">Örnek senaryo</span>
          <h2 className="mt-3 max-w-md text-3xl font-black tracking-[-0.04em] text-slate-950">
            Formu doldurmadan önce örnek bir maliyet akışını inceleyin
          </h2>
          <p className="mt-4 max-w-md text-base leading-7 text-slate-600">
            Gerçekçi bir konut senaryosu ile peşinat, vade, teslim ve hizmet bedelinin sonuç üzerindeki etkisini hızlıca görün.
          </p>
          <button className="mt-7 rounded-lg bg-[var(--green)] px-6 py-3 text-sm font-black text-white" type="button">
            Bu senaryoyu çalıştır
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {scenarioValues.map(([label, value]) => (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4" key={label}>
              <span className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</span>
              <strong className="mt-2 block text-[15px] font-black text-slate-950">{value}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
