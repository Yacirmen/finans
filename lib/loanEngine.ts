export type LoanPresetKey =
  | "konut-evi-olmayan"
  | "konut-evi-olan"
  | "tasit"
  | "ihtiyac";

export type LoanPreset = {
  principal: number;
  term: number;
  rate: number;
  fee: number;
  bsmv: number;
  kkdf: number;
};

export type LoanScheduleRow = {
  period: number;
  payment: number;
  principalPayment: number;
  interest: number;
  kkdfAmount: number;
  bsmvAmount: number;
  remainingPrincipal: number;
};

export type LoanSummary = {
  principal: number;
  term: number;
  nominalMonthlyRate: number;
  effectiveMonthlyRate: number;
  fee: number;
  bsmv: number;
  kkdf: number;
  monthlyPayment: number;
  totalInstallmentPayment: number;
  totalInterest: number;
  totalKKDF: number;
  totalBSMV: number;
  totalRepayment: number;
  totalCreditCost: number;
  netDisbursed: number;
  effectiveMonthlyCostRate: number;
  effectiveAnnualCost: number;
  schedule: LoanScheduleRow[];
  warning?: string;
};

export const LOAN_PRESETS: Record<LoanPresetKey, LoanPreset> = {
  "konut-evi-olmayan": {
    principal: 2_000_000,
    term: 120,
    rate: 2.8,
    fee: 39_100,
    bsmv: 0,
    kkdf: 0,
  },
  "konut-evi-olan": {
    principal: 500_000,
    term: 60,
    rate: 2.85,
    fee: 39_100,
    bsmv: 15,
    kkdf: 0,
  },
  tasit: {
    principal: 100_000,
    term: 12,
    rate: 3.45,
    fee: 925.92,
    bsmv: 15,
    kkdf: 15,
  },
  ihtiyac: {
    principal: 100_000,
    term: 12,
    rate: 4.19,
    fee: 575,
    bsmv: 15,
    kkdf: 15,
  },
};

export function calculateEffectiveMonthlyRate(monthlyRatePct: number, bsmv: number, kkdf: number) {
  const nominalRate = Math.max(0, monthlyRatePct || 0) / 100;
  const safeBSMV = Math.max(0, bsmv || 0);
  const safeKKDF = Math.max(0, kkdf || 0);
  return nominalRate * (1 + (safeBSMV + safeKKDF) / 100);
}

export function calculatePMT(rate: number, term: number, principal: number) {
  const safeTerm = Math.max(0, Math.round(term || 0));
  const safePrincipal = Math.max(0, principal || 0);

  if (!safePrincipal || !safeTerm) return 0;
  if (!rate) return safePrincipal / safeTerm;

  const factor = Math.pow(1 + rate, safeTerm);
  return (safePrincipal * rate * factor) / (factor - 1);
}

export function solveRateByIRR(term: number, payment: number, netDisbursed: number) {
  const safeTerm = Math.max(0, Math.round(term || 0));
  const safePayment = Math.max(0, payment || 0);
  const safeDisbursed = Math.max(0, netDisbursed || 0);

  if (!safeTerm || !safePayment || !safeDisbursed) return 0;

  let low = 0;
  let high = 1;

  for (let i = 0; i < 24; i += 1) {
    const guess = calculatePMT(high, safeTerm, safeDisbursed);
    if (!Number.isFinite(guess)) return 0;
    if (guess >= safePayment) break;
    high *= 2;
    if (high > 10) return 0;
  }

  for (let i = 0; i < 120; i += 1) {
    const mid = (low + high) / 2;
    const guess = calculatePMT(mid, safeTerm, safeDisbursed);
    if (!Number.isFinite(guess)) return 0;
    if (Math.abs(guess - safePayment) < 1e-10) return mid;
    if (guess > safePayment) high = mid;
    else low = mid;
  }

  const solved = (low + high) / 2;
  return Number.isFinite(solved) ? solved : 0;
}

export function buildLoanSchedule({
  principal,
  term,
  rate,
  fee,
  bsmv,
  kkdf,
}: LoanPreset): LoanScheduleRow[] {
  const safePrincipal = Math.max(0, principal || 0);
  const safeTerm = Math.max(0, Math.round(term || 0));
  const safeNominalRate = Math.max(0, rate || 0) / 100;
  const safeBSMV = Math.max(0, bsmv || 0);
  const safeKKDF = Math.max(0, kkdf || 0);
  const effectiveMonthlyRate = calculateEffectiveMonthlyRate(rate, safeBSMV, safeKKDF);
  const payment = calculatePMT(effectiveMonthlyRate, safeTerm, safePrincipal);

  if (!safePrincipal || !safeTerm || !Number.isFinite(payment)) {
    return [];
  }

  let remainingPrincipal = safePrincipal;
  const schedule: LoanScheduleRow[] = [];

  for (let period = 1; period <= safeTerm; period += 1) {
    const interest = remainingPrincipal * safeNominalRate;
    const kkdfAmount = interest * (safeKKDF / 100);
    const bsmvAmount = interest * (safeBSMV / 100);
    let principalPayment = payment - interest - kkdfAmount - bsmvAmount;

    if (period === safeTerm || principalPayment > remainingPrincipal) {
      principalPayment = remainingPrincipal;
    }

    remainingPrincipal = Math.max(0, remainingPrincipal - principalPayment);

    if (period === safeTerm && remainingPrincipal < 0.05) {
      remainingPrincipal = 0;
    }

    schedule.push({
      period,
      payment,
      principalPayment,
      interest,
      kkdfAmount,
      bsmvAmount,
      remainingPrincipal,
    });
  }

  return schedule;
}

export function calculateEffectiveAnnualCost(monthlyCostRate: number) {
  if (!Number.isFinite(monthlyCostRate) || monthlyCostRate <= -1) return 0;
  return Math.pow(1 + monthlyCostRate, 12) - 1;
}

export function calculateLoanSummary(input: LoanPreset): LoanSummary {
  const principal = Math.max(0, input.principal || 0);
  const term = Math.max(0, Math.round(input.term || 0));
  const monthlyRatePct = Math.max(0, input.rate || 0);
  const fee = Math.max(0, input.fee || 0);
  const bsmv = Math.max(0, input.bsmv || 0);
  const kkdf = Math.max(0, input.kkdf || 0);

  if (!principal || !term) {
    return {
      principal,
      term,
      nominalMonthlyRate: monthlyRatePct / 100,
      effectiveMonthlyRate: 0,
      fee,
      bsmv,
      kkdf,
      monthlyPayment: 0,
      totalInstallmentPayment: 0,
      totalInterest: 0,
      totalKKDF: 0,
      totalBSMV: 0,
      totalRepayment: 0,
      totalCreditCost: 0,
      netDisbursed: Math.max(0, principal - fee),
      effectiveMonthlyCostRate: 0,
      effectiveAnnualCost: 0,
      schedule: [],
      warning: "Kredi tutarı ve vade sıfırdan büyük olmalıdır.",
    };
  }

  if (fee > principal) {
    return {
      principal,
      term,
      nominalMonthlyRate: monthlyRatePct / 100,
      effectiveMonthlyRate: 0,
      fee,
      bsmv,
      kkdf,
      monthlyPayment: 0,
      totalInstallmentPayment: 0,
      totalInterest: 0,
      totalKKDF: 0,
      totalBSMV: 0,
      totalRepayment: 0,
      totalCreditCost: 0,
      netDisbursed: 0,
      effectiveMonthlyCostRate: 0,
      effectiveAnnualCost: 0,
      schedule: [],
      warning: "Masraf tutarı kredi anaparasından büyük olamaz.",
    };
  }

  const effectiveMonthlyRate = calculateEffectiveMonthlyRate(monthlyRatePct, bsmv, kkdf);
  const monthlyPayment = calculatePMT(effectiveMonthlyRate, term, principal);
  const schedule = buildLoanSchedule({
    principal,
    term,
    rate: monthlyRatePct,
    fee,
    bsmv,
    kkdf,
  });

  const totalInterest = schedule.reduce((sum, row) => sum + row.interest, 0);
  const totalKKDF = schedule.reduce((sum, row) => sum + row.kkdfAmount, 0);
  const totalBSMV = schedule.reduce((sum, row) => sum + row.bsmvAmount, 0);
  const totalInstallmentPayment = monthlyPayment * term;
  const netDisbursed = Math.max(0, principal - fee);
  const totalRepayment = totalInstallmentPayment + fee;
  const totalCreditCost = totalRepayment - netDisbursed;
  const effectiveMonthlyCostRate = solveRateByIRR(term, monthlyPayment, netDisbursed);
  const effectiveAnnualCost = calculateEffectiveAnnualCost(effectiveMonthlyCostRate);

  return {
    principal,
    term,
    nominalMonthlyRate: monthlyRatePct / 100,
    effectiveMonthlyRate,
    fee,
    bsmv,
    kkdf,
    monthlyPayment,
    totalInstallmentPayment,
    totalInterest,
    totalKKDF,
    totalBSMV,
    totalRepayment,
    totalCreditCost,
    netDisbursed,
    effectiveMonthlyCostRate,
    effectiveAnnualCost,
    schedule,
  };
}

export function formatLoanResult(summary: LoanSummary) {
  return {
    monthlyPayment: summary.monthlyPayment,
    totalRepayment: summary.totalRepayment,
    totalCreditCost: summary.totalCreditCost,
    effectiveAnnualCost: summary.effectiveAnnualCost,
  };
}
