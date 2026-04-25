export type OfferFinancingType = "konut" | "arac";

export type OfferScenarioInput = {
  type: OfferFinancingType;
  home: number;
  down: number;
  org: number;
  term: number;
  disc: number;
  rent: number;
};

export type OfferScenarioResult = OfferScenarioInput & {
  monthlyDiscountRate: number;
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
};

export type OfferComparisonResult = {
  scenarioA: OfferScenarioResult;
  scenarioB: OfferScenarioResult;
  winner: "A" | "B";
  npvDiff: number;
  bestCost: number;
};

export const defaultScenarioA: OfferScenarioInput = {
  home: 5_000_000,
  down: 0,
  org: 8.5,
  term: 84,
  disc: 2.0833333333333336,
  rent: 25_000,
  type: "konut",
};

export const defaultScenarioB: OfferScenarioInput = {
  home: 1_000_000,
  down: 750_000,
  org: 8.5,
  term: 48,
  disc: 2.0833333333333336,
  rent: 25_000,
  type: "konut",
};

export function pv(rate: number, nper: number, pmt: number, fv = 0) {
  if (!Number.isFinite(rate) || !Number.isFinite(nper) || !Number.isFinite(pmt) || !Number.isFinite(fv)) {
    return 0;
  }

  if (nper <= 0) return 0;

  if (rate === 0) {
    return -(pmt * nper + fv);
  }

  return -(
    (pmt * (1 - Math.pow(1 + rate, -nper))) / rate +
    fv * Math.pow(1 + rate, -nper)
  );
}

export function getMaxTerm(type: OfferFinancingType) {
  return type === "arac" ? 60 : 120;
}

export function sanitizeOfferScenario(input: OfferScenarioInput): OfferScenarioInput {
  const type = input.type === "arac" ? "arac" : "konut";
  const home = Math.max(0, Number.isFinite(input.home) ? input.home : 0);
  const down = Math.min(Math.max(0, Number.isFinite(input.down) ? input.down : 0), home);
  const org = Math.max(0, Number.isFinite(input.org) ? input.org : 0);
  const rent = Math.max(0, Number.isFinite(input.rent) ? input.rent : 0);
  const disc = Math.max(0, Number.isFinite(input.disc) ? input.disc : 0);
  const term = Math.max(1, Math.min(getMaxTerm(type), Math.round(Number.isFinite(input.term) ? input.term : 1)));

  return { type, home, down, org, term, disc, rent };
}

export function calculateOfferScenario(input: OfferScenarioInput): OfferScenarioResult {
  const safe = sanitizeOfferScenario(input);
  const { type, home, down, org, term, disc, rent } = safe;
  const monthlyDiscountRate = disc / 100;
  const downRatio = home > 0 ? down / home : 0;
  const deliveryMonth = Math.max(5, Math.ceil(term * 0.4 * (1 - (downRatio || 0))));
  const financingPV = home / Math.pow(1 + monthlyDiscountRate, deliveryMonth);
  const firstDownRatio = home > 0 ? down / home : 0;
  const monthly = (home - down) / term;
  const allPaymentsPV = pv(monthlyDiscountRate, term, -monthly);
  const orgPlusDown = (home * org) / 100 + down;
  const startOut = down + orgPlusDown;
  const credit = home - down;
  const totalRepay = monthly * term;
  const totalCost = totalRepay + startOut;
  const rentsPV = pv(monthlyDiscountRate, deliveryMonth, -rent, 0);
  const npv = allPaymentsPV + rentsPV + orgPlusDown - financingPV;

  return {
    type,
    home,
    down,
    org,
    term,
    disc,
    rent,
    monthlyDiscountRate,
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
  };
}

export function compareOfferScenarios(
  scenarioA: OfferScenarioInput,
  scenarioB: OfferScenarioInput,
): OfferComparisonResult {
  const resultA = calculateOfferScenario(scenarioA);
  const resultB = calculateOfferScenario(scenarioB);
  const winner = resultA.npv >= resultB.npv ? "A" : "B";

  return {
    scenarioA: resultA,
    scenarioB: resultB,
    winner,
    npvDiff: Math.abs(resultA.npv - resultB.npv),
    bestCost: Math.min(resultA.totalCost, resultB.totalCost),
  };
}
