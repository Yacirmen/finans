import { companyParams, type CompanyName } from "../companyParams";

export type ComparisonAssetType = "Konut" | "Taşıt";

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
  totalCost: number;
  deliveryMonth: number;
  rentPV: number;
  financingPresentCost: number;
  npv: number;
  estimatedRateEquivalent: number | null;
  warnings: string[];
};

export type OfferComparisonResult = {
  scenarioA: OfferScenarioResult;
  scenarioB: OfferScenarioResult;
  winner: "A" | "B" | null;
  npvDifference: number;
  totalCostDifference: number;
};

export const defaultScenarioA: OfferScenarioInput = {
  assetType: "Konut",
  company: "Eminevim",
  assetValue: 5_000_000,
  downPayment: 0,
  orgRate: 8.5,
  termMonths: 84,
  monthlyDiscountRate: 2.0833333333333335,
  monthlyRent: 25_000,
};

export const defaultScenarioB: OfferScenarioInput = {
  assetType: "Konut",
  company: "Fuzul Ev",
  assetValue: 1_000_000,
  downPayment: 750_000,
  orgRate: 8.5,
  termMonths: 48,
  monthlyDiscountRate: 2.0833333333333335,
  monthlyRent: 25_000,
};

function clampTerm(assetType: ComparisonAssetType, term: number) {
  const maxTerm = assetType === "Taşıt" ? 60 : 120;
  return Math.max(1, Math.min(maxTerm, Math.round(term || 1)));
}

function excelPresentValue(payment: number, rate: number, months: number) {
  if (!payment || !months) return 0;
  if (!rate) return payment * months;
  return payment * ((1 - Math.pow(1 + rate, -months)) / rate);
}

export function calculateEstimatedBankRateEquivalent() {
  // TODO: Gerçek üyelik ve reverse-rate hedef nakit akışı netleşince bağlanacak.
  return null;
}

export function calculateOfferScenario(input: OfferScenarioInput): OfferScenarioResult {
  const params = companyParams[input.company];
  const assetType = input.assetType;
  const assetValue = Math.max(0, input.assetValue || 0);
  const downPayment = Math.max(0, input.downPayment || 0);
  const termMonths = clampTerm(assetType, input.termMonths);
  const monthlyDiscountRate = Math.max(0, input.monthlyDiscountRate || 0) / 100;
  const monthlyRent = Math.max(0, input.monthlyRent || 0);
  const additionalCost = Math.max(0, input.additionalCost || 0);
  const orgRate = Math.max(0, input.orgRate || params.defaultServiceFeeRate || 0);
  const warnings: string[] = [];

  if (input.termMonths !== termMonths) {
    warnings.push(assetType === "Taşıt" ? "Taşıt için vade 60 ay ile sınırlandı." : "Konut için vade 120 ay ile sınırlandı.");
  }

  const downRateFirstInstallment = assetValue > 0 ? downPayment / assetValue : 0;
  const financeAmount = Math.max(0, assetValue - downPayment);
  const monthlyInstallment = financeAmount / termMonths;
  const deliveryBase = Math.ceil(termMonths * 0.4 * (1 - downRateFirstInstallment));
  const deliveryMonth = Math.max(5, Math.min(termMonths, deliveryBase));
  const downRateUntilDelivery = assetValue > 0 ? (downPayment + deliveryMonth * monthlyInstallment) / assetValue : 0;

  const organizationFee = assetValue * (orgRate / 100);
  const organizationFeeAndDownPayment = organizationFee + downPayment;
  const initialCashOut = downPayment + organizationFeeAndDownPayment;
  const term40 = termMonths * 0.4;
  const monthlyPaymentsPV = excelPresentValue(monthlyInstallment, monthlyDiscountRate, termMonths);
  const totalRepayment = monthlyInstallment * termMonths + additionalCost;
  const totalInterestAndCosts = additionalCost;
  const totalCost = totalRepayment + initialCashOut;
  const rentPV = excelPresentValue(monthlyRent, monthlyDiscountRate, deliveryMonth);
  const financingPresentCost = assetValue / Math.pow(1 + monthlyDiscountRate, deliveryMonth);
  const npv = monthlyPaymentsPV + rentPV + organizationFeeAndDownPayment - financingPresentCost;

  return {
    input: { ...input, orgRate, termMonths },
    downRateFirstInstallment,
    downRateUntilDelivery,
    organizationFee,
    organizationFeeAndDownPayment,
    initialCashOut,
    financeAmount,
    term40,
    monthlyInstallment,
    monthlyPaymentsPV,
    totalRepayment,
    totalInterestAndCosts,
    totalCost,
    deliveryMonth,
    rentPV,
    financingPresentCost,
    npv,
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

  let winner: "A" | "B" | null = null;
  if (resultA.npv > resultB.npv) winner = "A";
  else if (resultB.npv > resultA.npv) winner = "B";
  else if (resultA.totalCost < resultB.totalCost) winner = "A";
  else if (resultB.totalCost < resultA.totalCost) winner = "B";

  return {
    scenarioA: resultA,
    scenarioB: resultB,
    winner,
    npvDifference: resultA.npv - resultB.npv,
    totalCostDifference: resultA.totalCost - resultB.totalCost,
  };
}
