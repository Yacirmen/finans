export type OfferScenarioInput = {
  home: number;
  down: number;
  orgRate: number;
  term: number;
  discount: number;
  rent: number;
};

export type OfferScenarioResult = {
  downRate: number;
  orgFee: number;
  initial: number;
  finance: number;
  term40: number;
  installment: number;
  totalPay: number;
  totalCost: number;
  delivery: number;
  downRateFirst: number;
  downRateDelivery: number;
  npv: number;
};

export type OfferComparisonResult = {
  scenarioA: OfferScenarioResult;
  scenarioB: OfferScenarioResult;
  winner: "A" | "B" | null;
  npvDifference: number;
  totalCostDifference: number;
};

export const defaultScenarioA: OfferScenarioInput = {
  home: 1_000_000,
  down: 400_000,
  orgRate: 7.5,
  term: 25,
  discount: 2.0833333333333335,
  rent: 25_000,
};

export const defaultScenarioB: OfferScenarioInput = {
  home: 1_000_000,
  down: 750_000,
  orgRate: 7.5,
  term: 48,
  discount: 2.0833333333333335,
  rent: 25_000,
};

export function pv(rate: number, nper: number, payment: number) {
  if (!rate) return -(payment * nper);
  return -(payment * (1 - Math.pow(1 + rate, -nper))) / rate;
}

export function calculateOfferScenario(input: OfferScenarioInput): OfferScenarioResult {
  const home = Math.max(0, input.home || 0);
  const down = Math.max(0, input.down || 0);
  const orgRate = Math.max(0, input.orgRate || 0);
  const term = Math.max(1, Math.round(input.term || 1));
  const discount = Math.max(0, input.discount || 0) / 100;
  const rent = Math.max(0, input.rent || 0);

  const downRate = home > 0 ? down / home : 0;
  const orgFee = home * (orgRate / 100);
  const initial = down + orgFee;
  const finance = Math.max(0, home - down);
  const term40 = term * 0.4;
  const installment = finance / term;
  const totalPay = installment * term;
  const totalCost = totalPay + initial;
  const delivery = Math.max(5, Math.ceil(term * 0.4 * (1 - downRate)));
  const downRateFirst = home > 0 ? (down + installment) / home : 0;
  const downRateDelivery = home > 0 ? (down + delivery * installment) / home : 0;
  const rentPv = pv(discount, delivery, rent);
  const installmentsPv = pv(discount, term, installment);
  const npv = -initial + home / Math.pow(1 + discount, delivery) + installmentsPv + rentPv;

  return {
    downRate,
    orgFee,
    initial,
    finance,
    term40,
    installment,
    totalPay,
    totalCost,
    delivery,
    downRateFirst,
    downRateDelivery,
    npv,
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

