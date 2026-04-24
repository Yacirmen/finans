import {
  LOAN_PRESETS,
  calculateLoanSummary,
  type LoanScheduleRow,
  type LoanSummary,
} from "./loanEngine";

export type AssetType = "Konut" | "Araba";
export type ModelType = "cekilissiz" | "cekilisli";
export type HousingStatus = "yok" | "var";

export const COMPANY_OPTIONS = [
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
] as const;

export type CompanyName = (typeof COMPANY_OPTIONS)[number];

export type CompanyParam = {
  defaultServiceFeeRate: number;
  deliverySpeedFactor: number;
  riskFactor: number;
  campaignDiscountRate: number;
  notes: string;
};

export const companyParams: Record<CompanyName, CompanyParam> = {
  Eminevim: {
    defaultServiceFeeRate: 11.8,
    deliverySpeedFactor: 1.02,
    riskFactor: 1.02,
    campaignDiscountRate: 0.2,
    notes: "Varsayılan tahmini parametre kullanılıyor.",
  },
  "Fuzul Ev": {
    defaultServiceFeeRate: 11.4,
    deliverySpeedFactor: 1.05,
    riskFactor: 0.98,
    campaignDiscountRate: 0.3,
    notes: "Varsayılan tahmini parametre kullanılıyor.",
  },
  Katılımevim: {
    defaultServiceFeeRate: 11.6,
    deliverySpeedFactor: 1.01,
    riskFactor: 1.04,
    campaignDiscountRate: 0.15,
    notes: "Varsayılan tahmini parametre kullanılıyor.",
  },
  "Sinpaş YTS": {
    defaultServiceFeeRate: 10.9,
    deliverySpeedFactor: 1.08,
    riskFactor: 0.94,
    campaignDiscountRate: 0.4,
    notes: "Varsayılan tahmini parametre kullanılıyor.",
  },
  "Emlak Katılım Tasarruf Finansmanı": {
    defaultServiceFeeRate: 10.6,
    deliverySpeedFactor: 1.06,
    riskFactor: 0.92,
    campaignDiscountRate: 0.45,
    notes: "Varsayılan tahmini parametre kullanılıyor.",
  },
  Birevim: {
    defaultServiceFeeRate: 11.7,
    deliverySpeedFactor: 0.98,
    riskFactor: 1.06,
    campaignDiscountRate: 0.1,
    notes: "Varsayılan tahmini parametre kullanılıyor.",
  },
  "İyi Finans": {
    defaultServiceFeeRate: 10.8,
    deliverySpeedFactor: 1.04,
    riskFactor: 0.95,
    campaignDiscountRate: 0.35,
    notes: "Varsayılan tahmini parametre kullanılıyor.",
  },
  İmece: {
    defaultServiceFeeRate: 11.2,
    deliverySpeedFactor: 1,
    riskFactor: 1,
    campaignDiscountRate: 0.2,
    notes: "Varsayılan tahmini parametre kullanılıyor.",
  },
  "Albayrak Finans": {
    defaultServiceFeeRate: 10.7,
    deliverySpeedFactor: 1.03,
    riskFactor: 0.97,
    campaignDiscountRate: 0.3,
    notes: "Varsayılan tahmini parametre kullanılıyor.",
  },
  Diğer: {
    defaultServiceFeeRate: 11.8,
    deliverySpeedFactor: 1,
    riskFactor: 1,
    campaignDiscountRate: 0,
    notes: "Varsayılan tahmini parametre kullanılıyor.",
  },
};

export type OfferState = {
  model: ModelType;
  company: CompanyName;
  assetPrice: string;
  downPayment: string;
  term: string;
  monthlyPayment: string;
  escalating: boolean;
  manualPlan: boolean;
  manualPlanText: string;
  delivery: string;
  serviceFee: string;
  rent: string;
  advancedOpen: boolean;
  inflation: string;
  creditRate: string;
  yearlyIncrease: string;
  compareBank: boolean;
  bankAmount: string;
  bankRate: string;
  bankTerm: string;
  bankHousingStatus: HousingStatus;
};

export const DEFAULT_OFFER: OfferState = {
  model: "cekilissiz",
  company: "Diğer",
  assetPrice: "3.000.000",
  downPayment: "1.000.000",
  term: "48",
  monthlyPayment: "41.667",
  escalating: false,
  manualPlan: false,
  manualPlanText: "",
  delivery: "12",
  serviceFee: "11,8",
  rent: "25.000",
  advancedOpen: false,
  inflation: "25",
  creditRate: "3,19",
  yearlyIncrease: "15",
  compareBank: true,
  bankAmount: "2.000.000",
  bankRate: "2,85",
  bankTerm: "60",
  bankHousingStatus: "yok",
};

export type CashflowRow = {
  month: number;
  installment: number;
  downPayment: number;
  serviceFee: number;
  rent: number;
  totalOutflow: number;
  cumulativeOutflow: number;
  presentValue: number;
  note: string;
};

export type NBMBreakdown = {
  downPaymentPv: number;
  serviceFeePv: number;
  installmentsPv: number;
  rentPv: number;
  totalNBM: number;
};

export type InstallmentSchedule = {
  installments: number[];
  notesByMonth: Record<number, string>;
  warnings: string[];
};

export type LoanComparison = {
  summary: LoanSummary;
  presentValueCost: number;
  presentValueInstallments: number;
  advantageDifference: number;
  advantageText: string;
  totalRepaymentDifference: number;
  totalRepaymentText: string;
};

export type ScenarioResult = {
  key: "good" | "average" | "bad" | "single";
  label: string;
  deliveryMonth: number;
  rentTotal: number;
  totalNominalOutflow: number;
  nbmBreakdown: NBMBreakdown;
  nbm: number;
  decisionScore: number;
  cashflow: CashflowRow[];
};

export type ScenarioSet = {
  mode: "single" | "range";
  scenarios: ScenarioResult[];
  selectedScenario: ScenarioResult;
  goodScenario?: ScenarioResult;
  averageScenario?: ScenarioResult;
  badScenario?: ScenarioResult;
  bestNBM: number;
  averageNBM: number;
  worstNBM: number;
  risk: number;
  riskPenalty: number;
  delayCost: number;
  decisionScore: number;
  riskLabel: "Düşük" | "Orta" | "Yüksek";
};

export type OfferResult = {
  company: CompanyName;
  companyParam: CompanyParam;
  assetType: AssetType;
  contractAmount: number;
  totalInstallmentPayment: number;
  unfundedAmount: number;
  minimumRequiredMonthlyPayment: number;
  isFundingValid: boolean;
  serviceFeeRate: number;
  serviceFeeAmount: number;
  totalNominalOutflow: number;
  totalNBM: number;
  scenarioSet: ScenarioSet;
  selectedScenario: ScenarioResult;
  loanComparison?: LoanComparison;
  warnings: string[];
  commentary: string[];
  riskWarning?: string;
};

export type DecisionSummary = {
  winnerIndex: 0 | 1 | null;
  difference: number;
  winnerLabel: string;
  summaryText: string;
  infoText: string;
  cautionText?: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function parseCurrencyLike(value: string | number | null | undefined) {
  const raw = String(value ?? "").trim();
  if (!raw) return 0;

  const normalized = raw
    .replace(/\s+/g, "")
    .replace(/[₺$€]/g, "")
    .replace(/TL/gi, "")
    .replace(/\.(?=\d{3}(?:\D|$))/g, "")
    .replace(",", ".");

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(Math.round(value || 0));
}

export function formatNumber(value: number, fractionDigits = 0) {
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value || 0);
}

export function formatPercent(value: number, fractionDigits = 1) {
  return `%${formatNumber(value, fractionDigits)}`;
}

export function getMonthlyDiscountRate(annualInflationRate: number) {
  return Math.pow(1 + annualInflationRate / 100, 1 / 12) - 1;
}

export function presentValue(amount: number, month: number, monthlyDiscountRate: number) {
  if (!amount) return 0;
  return amount / Math.pow(1 + monthlyDiscountRate, month);
}

function getOfferTerm(assetType: AssetType, rawTerm: number) {
  const hardLimit = assetType === "Araba" ? 60 : 120;
  return clamp(Math.round(rawTerm || 0), 1, hardLimit);
}

function parseManualPlan(text: string) {
  const tokens = String(text || "")
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);

  const values: number[] = [];
  const warnings: string[] = [];

  tokens.forEach((token) => {
    const parsed = parseCurrencyLike(token);
    if (parsed > 0) values.push(parsed);
    else warnings.push(`"${token}" değeri manuel planda sayı olarak okunamadı.`);
  });

  return { values, warnings };
}

export function buildInstallmentSchedule({
  term,
  baseMonthlyPayment,
  yearlyIncrease,
  escalating,
  manualPlan,
  manualPlanText,
}: {
  term: number;
  baseMonthlyPayment: number;
  yearlyIncrease: number;
  escalating: boolean;
  manualPlan: boolean;
  manualPlanText: string;
}): InstallmentSchedule {
  const notesByMonth: Record<number, string> = {};
  const warnings: string[] = [];

  if (manualPlan) {
    const { values, warnings: manualWarnings } = parseManualPlan(manualPlanText);
    warnings.push(...manualWarnings);

    if (values.length > 0) {
      const fallback = values[values.length - 1] || baseMonthlyPayment;
      return {
        installments: Array.from({ length: term }, (_, index) => values[index] ?? fallback),
        notesByMonth,
        warnings,
      };
    }

    warnings.push("Manuel plan aktif ancak geçerli ödeme girilmedi; düz plan kullanıldı.");
  }

  if (escalating) {
    return {
      installments: Array.from({ length: term }, (_, index) => {
        const month = index + 1;
        const installment =
          baseMonthlyPayment *
          Math.pow(1 + yearlyIncrease / 100, Math.floor((month - 1) / 12));

        if (month > 1 && (month - 1) % 12 === 0) {
          notesByMonth[month] = "Taksit artışı";
        }

        return installment;
      }),
      notesByMonth,
      warnings,
    };
  }

  return {
    installments: Array.from({ length: term }, () => baseMonthlyPayment),
    notesByMonth,
    warnings,
  };
}

export function buildRentSchedule({
  term,
  currentMonthlyRent,
  annualInflationRate,
  deliveryMonth,
}: {
  term: number;
  currentMonthlyRent: number;
  annualInflationRate: number;
  deliveryMonth: number;
}) {
  return Array.from({ length: term }, (_, index) => {
    const month = index + 1;
    if (month > deliveryMonth) return 0;
    return currentMonthlyRent * Math.pow(1 + annualInflationRate / 100, Math.floor((month - 1) / 12));
  });
}

function getLoanPreset(assetType: AssetType, housingStatus: HousingStatus) {
  if (assetType === "Araba") return LOAN_PRESETS.tasit;
  return housingStatus === "var"
    ? LOAN_PRESETS["konut-evi-olan"]
    : LOAN_PRESETS["konut-evi-olmayan"];
}

export function calculateLoanComparison({
  assetType,
  offer,
  annualInflationRate,
  offerNBM,
}: {
  assetType: AssetType;
  offer: OfferState;
  annualInflationRate: number;
  offerNBM: number;
}): LoanComparison | undefined {
  if (!offer.compareBank) return undefined;

  const preset = getLoanPreset(assetType, offer.bankHousingStatus);
  const principal = parseCurrencyLike(offer.bankAmount) || preset.principal;
  const term = Math.max(1, Math.round(parseCurrencyLike(offer.bankTerm) || preset.term));
  const rate = parseCurrencyLike(offer.bankRate) || preset.rate;

  const summary = calculateLoanSummary({
    principal,
    term,
    rate,
    fee: preset.fee,
    bsmv: preset.bsmv,
    kkdf: preset.kkdf,
  });

  if (summary.warning) return undefined;

  const monthlyDiscountRate = getMonthlyDiscountRate(annualInflationRate);
  const presentValueInstallments = summary.schedule.reduce(
    (sum, row) => sum + presentValue(row.payment, row.period, monthlyDiscountRate),
    0,
  );
  const presentValueCost = summary.fee + presentValueInstallments;
  const advantageDifference = Math.abs(presentValueCost - offerNBM);
  const offerIsBetter = offerNBM <= presentValueCost;
  const totalRepaymentDifference = Math.abs(summary.totalRepayment - offerNBM);

  return {
    summary,
    presentValueCost,
    presentValueInstallments,
    advantageDifference,
    advantageText: `Banka kredisine göre bu teklif bugünkü değerle ${formatMoney(advantageDifference)} ${
      offerIsBetter ? "avantajlıdır" : "dezavantajlıdır"
    }.`,
    totalRepaymentDifference,
    totalRepaymentText: `Banka kredisi toplam geri ödeme bazında ${formatMoney(
      totalRepaymentDifference,
    )} daha ${summary.totalRepayment >= offerNBM ? "pahalı" : "ucuz"} görünmektedir.`,
  };
}

function calculateSuggestedDelivery(assetPrice: number, downPayment: number, monthlyPayment: number, term: number) {
  if (!assetPrice || !monthlyPayment || !term) return 1;
  const targetRatioMonth = Math.max(0, term * (0.4 - downPayment / assetPrice));
  const targetPaymentMonth = Math.max(0, (assetPrice * 0.4 - downPayment) / monthlyPayment);
  return clamp(Math.max(Math.ceil(targetRatioMonth), Math.ceil(targetPaymentMonth), 5), 1, term);
}

function standardDeviation(values: number[]) {
  if (values.length <= 1) return 0;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance =
    values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

function buildScenarioCashflow({
  term,
  deliveryMonth,
  installments,
  installmentNotes,
  downPayment,
  serviceFeeAmount,
  rents,
  discountRate,
}: {
  term: number;
  deliveryMonth: number;
  installments: number[];
  installmentNotes: Record<number, string>;
  downPayment: number;
  serviceFeeAmount: number;
  rents: number[];
  discountRate: number;
}) {
  const rows: CashflowRow[] = [];
  let cumulative = downPayment + serviceFeeAmount;

  rows.push({
    month: 0,
    installment: 0,
    downPayment,
    serviceFee: serviceFeeAmount,
    rent: 0,
    totalOutflow: downPayment + serviceFeeAmount,
    cumulativeOutflow: cumulative,
    presentValue: downPayment + serviceFeeAmount,
    note: "Peşinat ve hizmet bedeli",
  });

  for (let month = 1; month <= term; month += 1) {
    const installment = installments[month - 1] ?? 0;
    const rent = rents[month - 1] ?? 0;
    const totalOutflow = installment + rent;
    cumulative += totalOutflow;

    const notes = new Set<string>();
    if (installmentNotes[month]) notes.add(installmentNotes[month]);
    if (month === deliveryMonth) notes.add("Teslim");

    rows.push({
      month,
      installment,
      downPayment: 0,
      serviceFee: 0,
      rent,
      totalOutflow,
      cumulativeOutflow: cumulative,
      presentValue: presentValue(totalOutflow, month, discountRate),
      note: Array.from(notes).join(" • "),
    });
  }

  return rows;
}

function createScenario({
  key,
  label,
  deliveryMonth,
  term,
  installments,
  installmentNotes,
  downPayment,
  serviceFeeAmount,
  rents,
  discountRate,
  currentMonthlyRent,
  averageDelivery,
}: {
  key: ScenarioResult["key"];
  label: string;
  deliveryMonth: number;
  term: number;
  installments: number[];
  installmentNotes: Record<number, string>;
  downPayment: number;
  serviceFeeAmount: number;
  rents: number[];
  discountRate: number;
  currentMonthlyRent: number;
  averageDelivery: number;
}): ScenarioResult {
  const cashflow = buildScenarioCashflow({
    term,
    deliveryMonth,
    installments,
    installmentNotes,
    downPayment,
    serviceFeeAmount,
    rents,
    discountRate,
  });

  const installmentsPv = cashflow.reduce(
    (sum, row) => sum + presentValue(row.installment, row.month, discountRate),
    0,
  );
  const rentPv = cashflow.reduce((sum, row) => sum + presentValue(row.rent, row.month, discountRate), 0);
  const downPaymentPv = downPayment;
  const serviceFeePv = serviceFeeAmount;
  const totalNBM = downPaymentPv + serviceFeePv + installmentsPv + rentPv;
  const totalNominalOutflow = cashflow.reduce((sum, row) => sum + row.totalOutflow, 0);
  const delayCost = Math.max(0, deliveryMonth - averageDelivery) * currentMonthlyRent;

  return {
    key,
    label,
    deliveryMonth,
    rentTotal: cashflow.reduce((sum, row) => sum + row.rent, 0),
    totalNominalOutflow,
    nbmBreakdown: {
      downPaymentPv,
      serviceFeePv,
      installmentsPv,
      rentPv,
      totalNBM,
    },
    nbm: totalNBM,
    decisionScore: totalNBM + delayCost,
    cashflow,
  };
}

export function calculateScenarioSet({
  offer,
  serviceFeeAmount,
  adjustedDelivery,
  term,
  annualInflationRate,
  currentMonthlyRent,
  riskWeight = 0.25,
}: {
  offer: OfferState;
  serviceFeeAmount: number;
  adjustedDelivery: number;
  term: number;
  annualInflationRate: number;
  currentMonthlyRent: number;
  riskWeight?: number;
}): ScenarioSet {
  const downPayment = parseCurrencyLike(offer.downPayment);
  const discountRate = getMonthlyDiscountRate(annualInflationRate);
  const company = companyParams[offer.company];
  const installmentSchedule = buildInstallmentSchedule({
    term,
    baseMonthlyPayment: parseCurrencyLike(offer.monthlyPayment),
    yearlyIncrease: parseCurrencyLike(offer.yearlyIncrease),
    escalating: offer.escalating,
    manualPlan: offer.manualPlan,
    manualPlanText: offer.manualPlanText,
  });

  const buildScenario = (key: ScenarioResult["key"], label: string, deliveryMonth: number) => {
    const rents = buildRentSchedule({
      term,
      currentMonthlyRent,
      annualInflationRate,
      deliveryMonth,
    });

    return createScenario({
      key,
      label,
      deliveryMonth,
      term,
      installments: installmentSchedule.installments,
      installmentNotes: installmentSchedule.notesByMonth,
      downPayment,
      serviceFeeAmount,
      rents,
      discountRate,
      currentMonthlyRent,
      averageDelivery: adjustedDelivery,
    });
  };

  if (offer.model === "cekilissiz") {
    const single = buildScenario("single", "Planlanan teslim", adjustedDelivery);
    return {
      mode: "single",
      scenarios: [single],
      selectedScenario: single,
      bestNBM: single.nbm,
      averageNBM: single.nbm,
      worstNBM: single.nbm,
      risk: 0,
      riskPenalty: 0,
      delayCost: 0,
      decisionScore: single.nbm,
      riskLabel: "Düşük",
    };
  }

  const goodDelivery = clamp(Math.max(1, Math.round(adjustedDelivery * 0.6 * company.deliverySpeedFactor)), 1, term);
  const averageDelivery = adjustedDelivery;
  const badDelivery = clamp(
    Math.min(term, Math.round(adjustedDelivery * (1.4 + Math.max(company.riskFactor - 1, 0) * 0.25))),
    1,
    term,
  );

  const goodScenario = buildScenario("good", "İyi senaryo", goodDelivery);
  const averageScenario = buildScenario("average", "Ortalama senaryo", averageDelivery);
  const badScenario = buildScenario("bad", "Kötü senaryo", badDelivery);
  const scenarios = [goodScenario, averageScenario, badScenario];
  const nbmValues = scenarios.map((scenario) => scenario.nbm);
  const risk = standardDeviation(nbmValues);
  const delayCost = Math.max(0, badDelivery - averageDelivery) * currentMonthlyRent;
  const riskPenalty = risk * riskWeight * company.riskFactor;
  const decisionScore = averageScenario.nbm + riskPenalty + delayCost;

  return {
    mode: "range",
    scenarios,
    selectedScenario: averageScenario,
    goodScenario,
    averageScenario,
    badScenario,
    bestNBM: Math.min(...nbmValues),
    averageNBM: averageScenario.nbm,
    worstNBM: Math.max(...nbmValues),
    risk,
    riskPenalty,
    delayCost,
    decisionScore,
    riskLabel: risk < 40_000 ? "Düşük" : risk < 110_000 ? "Orta" : "Yüksek",
  };
}

export function calculateOffer(assetType: AssetType, offer: OfferState): OfferResult {
  const warnings: string[] = [];
  const company = companyParams[offer.company];
  const assetPrice = parseCurrencyLike(offer.assetPrice);
  const downPayment = parseCurrencyLike(offer.downPayment);
  const term = getOfferTerm(assetType, parseCurrencyLike(offer.term));
  const monthlyPayment = parseCurrencyLike(offer.monthlyPayment);
  const currentMonthlyRent = parseCurrencyLike(offer.rent);
  const annualInflationRate = parseCurrencyLike(offer.inflation) || 25;

  if (!assetPrice) warnings.push("Varlık fiyatı sıfır veya boş görünüyor.");
  if (!monthlyPayment) warnings.push("Aylık ödeme sıfır veya boş görünüyor.");
  if (parseCurrencyLike(offer.serviceFee) < 0) warnings.push("Hizmet bedeli oranı negatif olamaz.");
  if (parseCurrencyLike(offer.creditRate) < 0) warnings.push("Kredi faizi negatif olamaz.");

  const expectedDelivery =
    Math.max(1, Math.round(parseCurrencyLike(offer.delivery))) ||
    calculateSuggestedDelivery(assetPrice, downPayment, monthlyPayment, term);
  const adjustedDelivery = clamp(Math.max(1, Math.round(expectedDelivery / company.deliverySpeedFactor)), 1, term);
  const serviceFeeRate = Math.max(
    0,
    (parseCurrencyLike(offer.serviceFee) || company.defaultServiceFeeRate) - company.campaignDiscountRate,
  );
  const serviceFeeAmount = assetPrice * (serviceFeeRate / 100);
  const installmentSchedule = buildInstallmentSchedule({
    term,
    baseMonthlyPayment: monthlyPayment,
    yearlyIncrease: parseCurrencyLike(offer.yearlyIncrease),
    escalating: offer.escalating,
    manualPlan: offer.manualPlan,
    manualPlanText: offer.manualPlanText,
  });

  warnings.push(...installmentSchedule.warnings);

  const contractAmount = Math.max(assetPrice - downPayment, 0);
  const totalInstallmentPayment = installmentSchedule.installments.reduce(
    (sum, installment) => sum + installment,
    0,
  );
  const unfundedAmount = Math.max(0, contractAmount - totalInstallmentPayment);
  const minimumRequiredMonthlyPayment = term > 0 ? contractAmount / term : 0;
  const isFundingValid = unfundedAmount <= 1;

  if (!isFundingValid) {
    warnings.push(
      "Aylık ödeme ve vade, finansman tutarını karşılamıyor. Lütfen aylık ödemeyi veya vadeyi artırın.",
    );
  }

  const scenarioSet = calculateScenarioSet({
    offer,
    serviceFeeAmount,
    adjustedDelivery,
    term,
    annualInflationRate,
    currentMonthlyRent,
  });

  const selectedScenario = scenarioSet.selectedScenario;
  const loanComparison = calculateLoanComparison({
    assetType,
    offer,
    annualInflationRate,
    offerNBM: selectedScenario.nbm,
  });

  const commentary = [
    `Toplam NBM ${formatMoney(selectedScenario.nbm)} seviyesinde oluşuyor.`,
    `Kira etkisinin bugünkü değeri ${formatMoney(selectedScenario.nbmBreakdown.rentPv)} düzeyinde.`,
    `Hizmet bedeli ve peşinatın toplam bugünkü yükü ${formatMoney(
      selectedScenario.nbmBreakdown.downPaymentPv + selectedScenario.nbmBreakdown.serviceFeePv,
    )}.`,
    `Teslim varsayımı ${selectedScenario.deliveryMonth}. ay üzerinden okunuyor.`,
  ];

  if (!isFundingValid) {
    commentary.unshift(
      `Bu planda ${formatMoney(unfundedAmount)} tutarında eksik finansman oluşuyor. Minimum aylık ödeme yaklaşık ${formatMoney(
        minimumRequiredMonthlyPayment,
      )} olmalıdır.`,
    );
  }

  if (scenarioSet.mode === "range") {
    commentary.push(
      `Çekilişli modelde risk aralığı ${formatMoney(scenarioSet.bestNBM)} ile ${formatMoney(
        scenarioSet.worstNBM,
      )} arasında değişiyor.`,
    );
  }

  if (loanComparison) commentary.push(loanComparison.advantageText);

  const riskWarning =
    scenarioSet.mode === "range" && scenarioSet.riskLabel !== "Düşük"
      ? "Bu teklif daha düşük maliyetli görünse de teslim belirsizliği nedeniyle risklidir."
      : undefined;

  return {
    company: offer.company,
    companyParam: company,
    assetType,
    contractAmount,
    totalInstallmentPayment,
    unfundedAmount,
    minimumRequiredMonthlyPayment,
    isFundingValid,
    serviceFeeRate,
    serviceFeeAmount,
    totalNominalOutflow: selectedScenario.totalNominalOutflow,
    totalNBM: selectedScenario.nbm,
    scenarioSet,
    selectedScenario,
    loanComparison,
    warnings,
    commentary,
    riskWarning,
  };
}

export function calculateDecisionSummary(results: OfferResult[]): DecisionSummary {
  if (!results.length) {
    return {
      winnerIndex: null,
      difference: 0,
      winnerLabel: "Sonuç bekleniyor",
      summaryText: "Karşılaştırma için iki teklifi de hesaplayın.",
      infoText: "Karar skoru = Ortalama NBM + risk cezası + gecikme maliyeti.",
    };
  }

  const validEntries = results
    .map((result, index) => ({ result, index: index as 0 | 1 }))
    .filter((entry) => entry.result.isFundingValid);

  if (!validEntries.length) {
    return {
      winnerIndex: null,
      difference: 0,
      winnerLabel: "Geçerli teklif yok",
      summaryText:
        "Tekliflerin ödeme planı finansman tutarını karşılamıyor. Önce aylık ödeme veya vadeyi güncelleyin.",
      infoText: "Karar skoru yalnızca finansman planı tutarlı tekliflerde değerlendirilir.",
    };
  }

  const winnerEntry =
    validEntries.length === 1
      ? validEntries[0]
      : validEntries[0].result.scenarioSet.decisionScore <= validEntries[1].result.scenarioSet.decisionScore
        ? validEntries[0]
        : validEntries[1];
  const loserEntry = validEntries.find((entry) => entry.index !== winnerEntry.index);
  const winnerIndex = winnerEntry.index;
  const winner = winnerEntry.result;
  const loser = loserEntry?.result;
  const difference = loser ? Math.abs(loser.scenarioSet.decisionScore - winner.scenarioSet.decisionScore) : 0;

  return {
    winnerIndex,
    difference,
    winnerLabel: winner.company,
    summaryText: loser
      ? `Teklif ${winnerIndex + 1}, Teklif ${loserEntry!.index + 1}'e göre bugünkü değerle ${formatMoney(
          difference,
        )} daha avantajlı.`
      : `Teklif ${winnerIndex + 1} hesaplandı.`,
    infoText: "Karar skoru = Ortalama NBM + risk cezası + gecikme maliyeti.",
    cautionText: winner.riskWarning,
  };
}

export function calculateScenarioSetForOffers(assetType: AssetType, offers: OfferState[]) {
  const results = offers.map((offer) => calculateOffer(assetType, offer));
  return {
    offers: results,
    decision: calculateDecisionSummary(results),
  };
}

export function cashflowRowsToCsv(rows: CashflowRow[]) {
  const header = [
    "Ay",
    "Taksit",
    "Peşinat",
    "Hizmet Bedeli",
    "Kira",
    "Toplam Çıkış",
    "Kümülatif Çıkış",
    "Bugünkü Değer",
    "Not",
  ].join(",");

  return [header]
    .concat(
      rows.map((row) =>
        [
          row.month,
          row.installment,
          row.downPayment,
          row.serviceFee,
          row.rent,
          row.totalOutflow,
          row.cumulativeOutflow,
          row.presentValue,
          `"${row.note.replace(/"/g, '""')}"`,
        ].join(","),
      ),
    )
    .join("\n");
}

export function loanScheduleToCsv(rows: LoanScheduleRow[]) {
  const header = ["Dönem", "Taksit Tutarı", "Anapara", "Faiz", "KKDF", "BSMV", "Kalan Anapara"].join(",");
  return [header]
    .concat(
      rows.map((row) =>
        [
          row.period,
          row.payment,
          row.principalPayment,
          row.interest,
          row.kkdfAmount,
          row.bsmvAmount,
          row.remainingPrincipal,
        ].join(","),
      ),
    )
    .join("\n");
}
