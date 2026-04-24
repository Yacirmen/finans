import {
  DEFAULT_OFFER,
  type AssetType,
  type ModelType,
  type OfferState,
  calculateOffer,
} from "../lib/comparisonEngine";

type ScenarioDefinition = {
  title: string;
  assetType: AssetType;
  offer: OfferState;
  expected: string;
  check: (result: ReturnType<typeof calculateOffer>) => boolean;
};

function createOffer(overrides: Partial<OfferState>): OfferState {
  return { ...DEFAULT_OFFER, ...overrides };
}

const SCENARIOS: ScenarioDefinition[] = [
  {
    title: "Referans örnek senaryo",
    assetType: "Konut",
    offer: createOffer({
      model: "cekilissiz",
      company: "Diğer",
      assetPrice: "3.000.000",
      downPayment: "1.000.000",
      term: "48",
      monthlyPayment: "41.667",
      delivery: "12",
      serviceFee: "7,5",
      rent: "25.000",
      compareBank: true,
      bankAmount: "2.000.000",
      bankRate: "2,80",
      bankTerm: "120",
    }),
    expected: "Finansman planı geçerli olmalı, banka kredisi kıyası ve NBM kırılımı üretilmeli.",
    check: (result) => result.isFundingValid && !!result.loanComparison && Number.isFinite(result.totalNBM),
  },
  {
    title: "Çekilişsiz düz plan",
    assetType: "Konut",
    offer: createOffer({
      model: "cekilissiz",
      monthlyPayment: "55.556",
      term: "36",
      delivery: "10",
    }),
    expected: "Tek senaryolu sonuç üretmeli ve risk aralığı oluşturmamalı.",
    check: (result) => result.scenarioSet.mode === "single" && result.scenarioSet.scenarios.length === 1,
  },
  {
    title: "Çekilişli iyi / orta / kötü senaryo",
    assetType: "Konut",
    offer: createOffer({
      model: "cekilisli",
      delivery: "18",
    }),
    expected: "Üç ayrı teslim senaryosu ve risk ölçüsü üretmeli.",
    check: (result) => result.scenarioSet.mode === "range" && result.scenarioSet.scenarios.length === 3 && result.scenarioSet.risk >= 0,
  },
  {
    title: "Artışlı taksit planı",
    assetType: "Konut",
    offer: createOffer({
      escalating: true,
      yearlyIncrease: "15",
      term: "60",
    }),
    expected: "Nakit akışında taksit artışı notu görünmeli.",
    check: (result) => result.selectedScenario.cashflow.some((row) => row.note.includes("Taksit artışı")),
  },
  {
    title: "Manuel ödeme planı",
    assetType: "Konut",
    offer: createOffer({
      manualPlan: true,
      manualPlanText: "60.000, 60.000, 62.500, 62.500",
      term: "12",
    }),
    expected: "Manuel plan geçerli okunmalı ve ilk aylarda manuel değerler kullanılmalı.",
    check: (result) => result.selectedScenario.cashflow[1]?.installment === 60000 && result.selectedScenario.cashflow[3]?.installment === 62500,
  },
  {
    title: "Geçersiz ödeme planı",
    assetType: "Konut",
    offer: createOffer({
      assetPrice: "5.000.000",
      downPayment: "1.000.000",
      term: "8",
      monthlyPayment: "41.667",
    }),
    expected: "Eksik finansman yakalanmalı ve teklif geçersiz işaretlenmeli.",
    check: (result) => !result.isFundingValid && result.unfundedAmount > 0,
  },
  {
    title: "Kira etkili geç teslim",
    assetType: "Konut",
    offer: createOffer({
      delivery: "24",
      rent: "32.000",
      inflation: "30",
    }),
    expected: "Kira PV etkisi yükselmeli ve teslim ayı sonrasına kadar kira yazılmalı.",
    check: (result) => result.selectedScenario.nbmBreakdown.rentPv > 0 && result.selectedScenario.deliveryMonth === 24,
  },
  {
    title: "Banka kredisi kıyası kapalı",
    assetType: "Araba",
    offer: createOffer({
      compareBank: false,
      model: "cekilissiz" as ModelType,
      assetPrice: "1.850.000",
      downPayment: "550.000",
      term: "36",
      monthlyPayment: "38.250",
      delivery: "6",
      serviceFee: "6,2",
      rent: "12.000",
    }),
    expected: "Kredi kıyası üretilmemeli ama NBM hesabı devam etmeli.",
    check: (result) => !result.loanComparison && Number.isFinite(result.totalNBM),
  },
];

function StatusBadge({ ok }: { ok: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ${
        ok ? "bg-[#eafbf1] text-[#168b53]" : "bg-[#fff0ee] text-[#d34a3b]"
      }`}
    >
      {ok ? "OK" : "Kontrol Et"}
    </span>
  );
}

export function EngineTestPage() {
  const results = SCENARIOS.map((scenario) => {
    const result = calculateOffer(scenario.assetType, scenario.offer);
    return { scenario, result, ok: scenario.check(result) };
  });

  return (
    <main className="page-container relative isolate py-7 md:py-8">
      <section className="rounded-[24px] border border-[#dce7e2] bg-white p-5 shadow-[0_14px_34px_rgba(31,43,37,0.06)] md:p-6">
        <h1 className="text-[28px] font-bold tracking-[-0.04em] text-[#172133] md:text-[34px]">
          Tasarruf Finansmanı Motor Testleri
        </h1>
        <p className="mt-3 max-w-[920px] text-[14px] leading-7 text-[#6f7d94]">
          Ana hesap motorunun farklı senaryolarda beklenen davranışı üretip üretmediğini kontrol edin. Bu panel,
          compare ve ana sayfa hesap akışının aynı finansal çekirdeği kullandığını doğrulamak için hazırlanmıştır.
        </p>
      </section>

      <section className="mt-8 grid gap-5">
        {results.map(({ scenario, result, ok }) => (
          <article
            key={scenario.title}
            className="rounded-[22px] border border-[#dce7e2] bg-white p-5 shadow-[0_12px_30px_rgba(31,43,37,0.05)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#16a05a]">{scenario.assetType}</p>
                <h2 className="mt-1 text-[24px] font-bold tracking-[-0.03em] text-[#172133]">{scenario.title}</h2>
                <p className="mt-2 max-w-[820px] text-[14px] leading-6 text-[#66758c]">{scenario.expected}</p>
              </div>
              <StatusBadge ok={ok} />
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-[18px] border border-[#e6edf5] bg-[#fbfdff] p-4">
                <h3 className="text-[14px] font-bold uppercase tracking-[0.08em] text-[#7b8aa2]">Inputlar</h3>
                <dl className="mt-3 grid gap-2 text-[14px]">
                  <div className="flex justify-between gap-4">
                    <dt className="text-[#6f7d94]">Şirket</dt>
                    <dd className="font-semibold text-[#172133]">{scenario.offer.company}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-[#6f7d94]">Model</dt>
                    <dd className="font-semibold text-[#172133]">{scenario.offer.model}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-[#6f7d94]">Varlık Fiyatı</dt>
                    <dd className="font-semibold text-[#172133]">{scenario.offer.assetPrice}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-[#6f7d94]">Peşinat</dt>
                    <dd className="font-semibold text-[#172133]">{scenario.offer.downPayment}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-[#6f7d94]">Vade</dt>
                    <dd className="font-semibold text-[#172133]">{scenario.offer.term} ay</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-[#6f7d94]">Aylık Ödeme</dt>
                    <dd className="font-semibold text-[#172133]">{scenario.offer.monthlyPayment}</dd>
                  </div>
                </dl>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[18px] border border-[#e6edf5] bg-white p-4">
                  <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#7b8aa2]">Toplam NBM</span>
                  <strong className="mt-2 block text-[24px] font-black tracking-[-0.05em] text-[#172133]">
                    {result.totalNBM.toLocaleString("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 })}
                  </strong>
                </div>
                <div className="rounded-[18px] border border-[#e6edf5] bg-white p-4">
                  <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#7b8aa2]">Karar Skoru</span>
                  <strong className="mt-2 block text-[24px] font-black tracking-[-0.05em] text-[#172133]">
                    {result.scenarioSet.decisionScore.toLocaleString("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 })}
                  </strong>
                </div>
                <div className="rounded-[18px] border border-[#e6edf5] bg-white p-4">
                  <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#7b8aa2]">Risk</span>
                  <strong className="mt-2 block text-[24px] font-black tracking-[-0.05em] text-[#172133]">
                    {result.scenarioSet.risk.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}
                  </strong>
                </div>
                <div className="rounded-[18px] border border-[#e6edf5] bg-white p-4">
                  <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#7b8aa2]">Durum</span>
                  <strong className={`mt-2 block text-[20px] font-black tracking-[-0.04em] ${result.isFundingValid ? "text-[#168b53]" : "text-[#d34a3b]"}`}>
                    {result.isFundingValid ? "Geçerli" : "Geçersiz"}
                  </strong>
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
