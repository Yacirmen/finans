export type AssetType = "Konut" | "Araba";
export type ModelType = "cekilissiz" | "cekilisli";
export type HousingStatus = "yok" | "var";

export type OfferState = {
  model: ModelType;
  company: string;
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

export type CashflowRow = {
  month: number;
  installment: number;
  rent: number;
  serviceFee: number;
  cumulativeOutflow: number;
  presentValue: number;
};

export type BankSummary = {
  installment: number;
  totalRepayment: number;
  netDisbursed: number;
  annualEffectiveCost: number;
};

export type OfferResult = {
  contractAmount: number;
  initialOutflow: number;
  feeAmount: number;
  totalRepayment: number;
  totalCost: number;
  totalOutflow: number;
  score: number;
  nbm: number;
  pvBenefit: number;
  pvInstallments: number;
  pvRent: number;
  suggestedDelivery: number;
  cashflow: CashflowRow[];
  bankSummary?: BankSummary;
};

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
  serviceFee: "11.8",
  rent: "25.000",
  advancedOpen: false,
  inflation: "25",
  creditRate: "3.19",
  yearlyIncrease: "15",
  compareBank: true,
  bankAmount: "2.000.000",
  bankRate: "2.85",
  bankTerm: "60",
  bankHousingStatus: "yok",
};

export function parseCurrencyLike(value: string | number | undefined | null) {
  const raw = String(value ?? "").trim();
  if (!raw) return 0;
  const normalized = raw.includes(",")
    ? raw.replace(/\./g, "").replace(",", ".")
    : /^\d+\.\d{1,2}$/.test(raw)
      ? raw
      : raw.replace(/\./g, "");
  const number = Number(normalized);
  return Number.isFinite(number) ? number : 0;
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(
    Math.round(value || 0),
  );
}

export function formatPercent(value: number, fractionDigits = 1) {
  return `%${new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value || 0)}`;
}

export function monthlyDiscountRate(annualInflation: number) {
  return annualInflation / 12 / 100;
}

export function presentValue(amount: number, period: number, rate: number) {
  if (!amount) return 0;
  if (!rate) return amount;
  return amount / Math.pow(1 + rate, Math.max(0, period));
}

function calculatePayment(principal: number, monthlyRate: number, term: number) {
  if (!principal || !term) return 0;
  if (!monthlyRate) return principal / term;
  const factor = Math.pow(1 + monthlyRate, term);
  return (principal * monthlyRate * factor) / (factor - 1);
}

function solveMonthlyRate(payment: number, term: number, presentValueAmount: number) {
  if (!payment || !term || !presentValueAmount) return 0;
  let low = 0;
  let high = 1;

  for (let i = 0; i < 80; i += 1) {
    const mid = (low + high) / 2;
    const guess = calculatePayment(presentValueAmount, mid, term);
    if (guess > payment) high = mid;
    else low = mid;
  }

  return (low + high) / 2;
}

function getBankConfig(assetType: AssetType, housingStatus: HousingStatus) {
  if (assetType === "Araba") {
    return { fee: 925.92, bsmv: 15, kkdf: 15 };
  }

  return {
    fee: 39100,
    bsmv: housingStatus === "var" ? 15 : 0,
    kkdf: 0,
  };
}

function calculateBankSummary(assetType: AssetType, offer: OfferState): BankSummary {
  const principal = parseCurrencyLike(offer.bankAmount);
  const rate = parseCurrencyLike(offer.bankRate);
  const term = Math.max(1, Math.round(parseCurrencyLike(offer.bankTerm)));
  const config = getBankConfig(assetType, offer.bankHousingStatus);
  const nominalMonthlyRate = rate / 100;
  const taxedMonthlyRate = nominalMonthlyRate * (1 + (config.bsmv + config.kkdf) / 100);
  const installment = calculatePayment(principal, taxedMonthlyRate, term);

  let balance = principal;
  let totalBaseInterest = 0;

  for (let i = 0; i < term; i += 1) {
    const baseInterest = balance * nominalMonthlyRate;
    const kkdfAmount = (baseInterest * config.kkdf) / 100;
    const bsmvAmount = (baseInterest * config.bsmv) / 100;
    const principalPart = installment - baseInterest - kkdfAmount - bsmvAmount;
    balance = Math.max(0, balance - principalPart);
    totalBaseInterest += baseInterest;
  }

  const totalRepayment = principal + totalBaseInterest + config.fee;
  const netDisbursed = principal - config.fee;
  const effectiveMonthlyRate = solveMonthlyRate(installment, term, netDisbursed);
  const annualEffectiveCost = Math.pow(1 + effectiveMonthlyRate, 12) - 1;

  return {
    installment,
    totalRepayment,
    netDisbursed,
    annualEffectiveCost,
  };
}

function buildInstallmentSchedule(offer: OfferState, term: number) {
  const baseMonthlyPayment = parseCurrencyLike(offer.monthlyPayment);
  const yearlyIncrease = parseCurrencyLike(offer.yearlyIncrease);

  if (offer.manualPlan) {
    const parts = offer.manualPlanText
      .split(/[\n,;]+/)
      .map((item) => parseCurrencyLike(item))
      .filter((value) => value > 0);

    if (parts.length > 0) {
      return Array.from({ length: term }, (_, index) => parts[index] ?? parts[parts.length - 1]);
    }
  }

  if (offer.escalating) {
    return Array.from({ length: term }, (_, index) => baseMonthlyPayment * Math.pow(1 + yearlyIncrease / 100, Math.floor(index / 12)));
  }

  return Array.from({ length: term }, () => baseMonthlyPayment);
}

function calculateSuggestedDelivery(assetPrice: number, downPayment: number, monthlyPayment: number, term: number) {
  if (!assetPrice || !monthlyPayment || !term) return 0;
  const targetRatioMonth = Math.max(0, term * (0.4 - downPayment / assetPrice));
  const targetPaymentMonth = Math.max(0, ((assetPrice * 0.4) - downPayment) / monthlyPayment);
  return Math.max(Math.ceil(targetRatioMonth), Math.ceil(targetPaymentMonth), 5);
}

export function calculateOffer(assetType: AssetType, offer: OfferState): OfferResult {
  const assetPrice = parseCurrencyLike(offer.assetPrice);
  const downPayment = parseCurrencyLike(offer.downPayment);
  const rawTerm = Math.max(1, Math.round(parseCurrencyLike(offer.term)));
  const term = assetType === "Araba" ? Math.min(rawTerm, 60) : Math.min(rawTerm, 120);
  const monthlyPayment = parseCurrencyLike(offer.monthlyPayment);
  const suggestedDelivery = calculateSuggestedDelivery(assetPrice, downPayment, monthlyPayment, term);
  const deliveryInput = Math.round(parseCurrencyLike(offer.delivery));
  const delivery = Math.max(0, deliveryInput || suggestedDelivery);
  const serviceFeeRate = parseCurrencyLike(offer.serviceFee);
  const rent = parseCurrencyLike(offer.rent);
  const inflation = parseCurrencyLike(offer.inflation) || 25;
  const discountRate = monthlyDiscountRate(inflation);
  const feeAmount = (assetPrice * serviceFeeRate) / 100;
  const initialOutflow = downPayment + feeAmount;
  const schedule = buildInstallmentSchedule(offer, term);

  let cumulative = initialOutflow;
  const rows: CashflowRow[] = [
    {
      month: 0,
      installment: 0,
      rent: 0,
      serviceFee: initialOutflow,
      cumulativeOutflow: cumulative,
      presentValue: cumulative,
    },
  ];

  let pvInstallments = 0;
  let pvRent = 0;

  for (let month = 1; month <= term; month += 1) {
    const installment = schedule[month - 1] ?? schedule[schedule.length - 1] ?? 0;
    const rentForMonth = month <= delivery ? rent * Math.pow(1 + inflation / 100, Math.floor((month - 1) / 12)) : 0;
    const outflow = installment + rentForMonth;
    cumulative += outflow;
    pvInstallments += presentValue(installment, month, discountRate);
    pvRent += presentValue(rentForMonth, month, discountRate);

    rows.push({
      month,
      installment,
      rent: rentForMonth,
      serviceFee: 0,
      cumulativeOutflow: cumulative,
      presentValue: presentValue(outflow, month, discountRate),
    });
  }

  const pvBenefit = presentValue(assetPrice, delivery, discountRate);
  const totalRepayment = schedule.reduce((sum, value) => sum + value, 0);
  const totalCost = totalRepayment + initialOutflow;
  const score = -initialOutflow + pvBenefit - pvInstallments - pvRent;
  const nbm = Math.max(-score, 0);
  const totalOutflow = rows[rows.length - 1]?.cumulativeOutflow ?? cumulative;

  return {
    contractAmount: Math.max(0, assetPrice - downPayment),
    initialOutflow,
    feeAmount,
    totalRepayment,
    totalCost,
    totalOutflow,
    score,
    nbm,
    pvBenefit,
    pvInstallments,
    pvRent,
    suggestedDelivery,
    cashflow: rows,
    bankSummary: offer.compareBank ? calculateBankSummary(assetType, offer) : undefined,
  };
}

export function exportRowsToCsv(filename: string, rows: CashflowRow[]) {
  const csv = ["Ay,Taksit,Kira,Hizmet Bedeli,Kumulatif Cikis,Bugunku Deger"]
    .concat(rows.map((row) => [row.month, row.installment, row.rent, row.serviceFee, row.cumulativeOutflow, row.presentValue].join(",")))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
