import { companyParams, type CompanyName } from "../companyParams";

export type ComparisonAssetType = "Konut" | "Taşıt" | "konut" | "arac";

export type OfferScenarioInput = {
  assetType: ComparisonAssetType;
  company: CompanyName;
  assetValue: number;
  downPayment: number;
  orgRate: number;
  termMonths: number;
  monthlyDiscountRate: number;
  monthlyRent: number;
  additionalCost?: number;
};

export type OfferScenarioResult = {
  input: OfferScenarioInput;
  type: "konut" | "arac";
  home: number;
  down: number;
  org: number;
  term: number;
  disc: number;
  rent: number;
  deliveryMonth: number;
  financingPV: number;
  firstDownRatio: number;
  monthly: number;
  allPaymentsPV: number;
  orgPlusDown: number;
  startOut: number;
  credit: number;
  totalRepay: number;
  totalCost: number;
  rentsPV: number;
  npv: number;
  downRateFirstInstallment: number;
  downRateUntilDelivery: number;
  organizationFee: number;
  organizationFeeAndDownPayment: number;
  initialCashOut: number;
  financeAmount: number;
  term40: number;
  monthlyInstallment: number;
  monthlyPaymentsPV: number;
  totalRepayment: number;
  totalInterestAndCosts: number;
  rentPV: number;
  financingPresentCost: number;
  estimatedRateEquivalent: number | null;
  warnings: string[];
};

export type OfferComparisonResult = {
  scenarioA: OfferScenarioResult;
  scenarioB: OfferScenarioResult;
  winner: "A" | "B";
  npvDifference: number;
  npvDiff: number;
  totalCostDifference: number;
  bestCost: number;
};

export const defaultScenarioA: OfferScenarioInput = {
  assetType: "Konut",
  company: "Eminevim",
  assetValue: 5_000_000,
  downPayment: 0,
  orgRate: 8.5,
  termMonths: 84,
  monthlyDiscountRate: 2.0833333333333336,
  monthlyRent: 25_000,
};

export const defaultScenarioB: OfferScenarioInput = {
  assetType: "Konut",
  company: "Fuzul Ev",
  assetValue: 1_000_000,
  downPayment: 750_000,
  orgRate: 8.5,
  termMonths: 48,
  monthlyDiscountRate: 2.0833333333333336,
  monthlyRent: 25_000,
};

function normalizeType(assetType: ComparisonAssetType): "konut" | "arac" {
  return assetType === "Taşıt" || assetType === "arac" ? "arac" : "konut";
}

function clampTerm(type: "konut" | "arac", term: number) {
  const maxTerm = type === "arac" ? 60 : 120;
  return Math.max(1, Math.min(maxTerm, Math.round(term || 1)));
}

export function pv(rate: number, nper: number, pmt: number, fv = 0) {
  if (!Number.isFinite(rate) || !Number.isFinite(nper) || !Number.isFinite(pmt) || !Number.isFinite(fv)) return 0;
  if (nper <= 0) return 0;

  if (rate === 0) {
    return -(pmt * nper + fv);
  }

  return -(pmt * (1 - Math.pow(1 + rate, -nper)) / rate + fv * Math.pow(1 + rate, -nper));
}

export function calculateEstimatedBankRateEquivalent() {
  // TODO: Gerçek üyelik ve reverse-rate hedef nakit akışı netleşince bağlanacak.
  return null;
}

export function calculateOfferScenario(input: OfferScenarioInput): OfferScenarioResult {
  const type = normalizeType(input.assetType);
  const params = companyParams[input.company];
  const home = Math.max(0, input.assetValue || 0);
  const down = Math.min(Math.max(0, input.downPayment || 0), home);
  const term = clampTerm(type, input.termMonths);
  const disc = Math.max(0, input.monthlyDiscountRate || 0);
  const monthlyDiscountRate = disc / 100;
  const rent = Math.max(0, input.monthlyRent || 0);
  const additionalCost = Math.max(0, input.additionalCost || 0);
  const org = Math.max(0, input.orgRate || params.defaultServiceFeeRate || 0);
  const warnings: string[] = [];

  if (input.termMonths !== term) {
    warnings.push(type === "arac" ? "Araç için vade 60 ay ile sınırlandı." : "Konut için vade 120 ay ile sınırlandı.");
  }

  if ((input.downPayment || 0) > home) {
    warnings.push("Peşinat varlık değerini aşamaz; varlık değerine eşitlendi.");
  }

  const firstDownRatio = home > 0 ? down / home : 0;
  const deliveryMonth = Math.max(5, Math.ceil(term * 0.4 * (1 - firstDownRatio)));
  const financingPV = home / Math.pow(1 + monthlyDiscountRate, deliveryMonth);
  const credit = Math.max(0, home - down);
  const monthly = credit / term;
  const allPaymentsPV = pv(monthlyDiscountRate, term, -monthly);
  const orgPlusDown = home * org / 100 + down;
  const startOut = down + orgPlusDown;
  const totalRepay = monthly * term + additionalCost;
  const totalCost = totalRepay + startOut;
  const rentsPV = pv(monthlyDiscountRate, deliveryMonth, -rent, 0);
  const npv = allPaymentsPV + rentsPV + orgPlusDown - financingPV;
  const downRateUntilDelivery = home > 0 ? (down + deliveryMonth * monthly) / home : 0;

  return {
    input: { ...input, assetType: type === "arac" ? "Taşıt" : "Konut", downPayment: down, orgRate: org, termMonths: term },
    type,
    home,
    down,
    org,
    term,
    disc,
    rent,
    deliveryMonth,
    financingPV,
    firstDownRatio,
    monthly,
    allPaymentsPV,
    orgPlusDown,
    startOut,
    credit,
    totalRepay,
    totalCost,
    rentsPV,
    npv,
    downRateFirstInstallment: firstDownRatio,
    downRateUntilDelivery,
    organizationFee: home * org / 100,
    organizationFeeAndDownPayment: orgPlusDown,
    initialCashOut: startOut,
    financeAmount: credit,
    term40: term * 0.4,
    monthlyInstallment: monthly,
    monthlyPaymentsPV: allPaymentsPV,
    totalRepayment: totalRepay,
    totalInterestAndCosts: additionalCost,
    rentPV: rentsPV,
    financingPresentCost: financingPV,
    estimatedRateEquivalent: calculateEstimatedBankRateEquivalent(),
    warnings,
  };
}

export function compareOfferScenarios(
  scenarioA: OfferScenarioInput,
  scenarioB: OfferScenarioInput,
): OfferComparisonResult {
  const resultA = calculateOfferScenario(scenarioA);
  const resultB = calculateOfferScenario(scenarioB);
  const winner = resultA.npv >= resultB.npv ? "A" : "B";
  const npvDifference = resultA.npv - resultB.npv;

  return {
    scenarioA: resultA,
    scenarioB: resultB,
    winner,
    npvDifference,
    npvDiff: Math.abs(npvDifference),
    totalCostDifference: resultA.totalCost - resultB.totalCost,
    bestCost: Math.min(resultA.totalCost, resultB.totalCost),
  };
}
