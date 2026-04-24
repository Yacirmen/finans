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
  label: string;
};

export type LoanInput = {
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
  totalWithInterest: number;
  totalRepayment: number;
  totalCreditCost: number;
  netDisbursed: number;
  effectiveMonthlyCostRate: number;
  effectiveAnnualCost: number;
  schedule: LoanScheduleRow[];
  warning?: string;
};

export type LoanComparisonRow = {
  key: string;
  label: string;
  reference: number;
  project: number;
  difference: number;
  tolerance: number;
  status: "OK" | "Kontrol Et";
  format: "money" | "percent";
};

export type LoanScheduleComparisonRow = {
  period: number;
  referencePayment: number;
  projectPayment: number;
  paymentDiff: number;
  referencePrincipal: number;
  projectPrincipal: number;
  principalDiff: number;
  referenceInterest: number;
  projectInterest: number;
  interestDiff: number;
  referenceKKDF: number;
  projectKKDF: number;
  kkdfDiff: number;
  referenceBSMV: number;
  projectBSMV: number;
  bsmvDiff: number;
  referenceRemaining: number;
  projectRemaining: number;
  remainingDiff: number;
  status: "OK" | "Kontrol Et";
};

export type LoanEngineComparison = {
  reference: LoanSummary;
  project: LoanSummary;
  rows: LoanComparisonRow[];
  scheduleRows: LoanScheduleComparisonRow[];
  warnings: string[];
};

export const LOAN_PRESETS: Record<LoanPresetKey, LoanPreset> = {
  "konut-evi-olmayan": {
    label: "Konut - Evi Olmayan",
    principal: 2_000_000,
    term: 120,
    rate: 2.8,
    fee: 39_100,
    bsmv: 0,
    kkdf: 0,
  },
  "konut-evi-olan": {
    label: "Konut - Evi Olan",
    principal: 500_000,
    term: 60,
    rate: 2.85,
    fee: 39_100,
    bsmv: 15,
    kkdf: 0,
  },
  tasit: {
    label: "Taşıt",
    principal: 100_000,
    term: 12,
    rate: 3.45,
    fee: 925.92,
    bsmv: 15,
    kkdf: 15,
  },
  ihtiyac: {
    label: "İhtiyaç",
    principal: 100_000,
    term: 12,
    rate: 4.19,
    fee: 575,
    bsmv: 15,
    kkdf: 15,
  },
};

function normalizeLoanInput(input: LoanInput): LoanInput {
  return {
    principal: Math.max(0, input.principal || 0),
    term: Math.max(0, Math.round(input.term || 0)),
    rate: Math.max(0, input.rate || 0),
    fee: Math.max(0, input.fee || 0),
    bsmv: Math.max(0, input.bsmv || 0),
    kkdf: Math.max(0, input.kkdf || 0),
  };
}

export function calculateEffectiveMonthlyRate(monthlyRatePct: number, bsmv: number, kkdf: number) {
  const nominalRate = Math.max(0, monthlyRatePct || 0) / 100;
  return nominalRate * (1 + (Math.max(0, bsmv || 0) + Math.max(0, kkdf || 0)) / 100);
}

export function calculatePMT(rate: number, term: number, principal: number) {
  const safePrincipal = Math.max(0, principal || 0);
  const safeTerm = Math.max(0, Math.round(term || 0));

  if (!safePrincipal || !safeTerm) return 0;
  if (!rate) return safePrincipal / safeTerm;

  const factor = Math.pow(1 + rate, safeTerm);
  if (!Number.isFinite(factor) || Math.abs(factor - 1) < 1e-12) return 0;

  return (safePrincipal * rate * factor) / (factor - 1);
}

export function solveRateByIRR(term: number, payment: number, netDisbursed: number) {
  const safeTerm = Math.max(0, Math.round(term || 0));
  const safePayment = Math.max(0, payment || 0);
  const safeDisbursed = Math.max(0, netDisbursed || 0);

  if (!safeTerm || !safePayment || !safeDisbursed) return 0;

  let low = 0;
  let high = 1;

  for (let index = 0; index < 24; index += 1) {
    const guess = calculatePMT(high, safeTerm, safeDisbursed);
    if (!Number.isFinite(guess)) return 0;
    if (guess >= safePayment) break;
    high *= 2;
    if (high > 10) return 0;
  }

  for (let index = 0; index < 120; index += 1) {
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

export function buildLoanSchedule(input: LoanInput) {
  const { principal, term, rate, bsmv, kkdf } = normalizeLoanInput(input);
  const effectiveMonthlyRate = calculateEffectiveMonthlyRate(rate, bsmv, kkdf);
  const nominalMonthlyRate = rate / 100;
  const payment = calculatePMT(effectiveMonthlyRate, term, principal);

  if (!principal || !term || !Number.isFinite(payment)) return [];

  let remainingPrincipal = principal;
  const schedule: LoanScheduleRow[] = [];

  for (let period = 1; period <= term; period += 1) {
    const interest = remainingPrincipal * nominalMonthlyRate;
    const kkdfAmount = interest * (kkdf / 100);
    const bsmvAmount = interest * (bsmv / 100);
    let principalPayment = payment - interest - kkdfAmount - bsmvAmount;

    if (period === term || principalPayment > remainingPrincipal) {
      principalPayment = remainingPrincipal;
    }

    remainingPrincipal = Math.max(0, remainingPrincipal - principalPayment);

    if (period === term && remainingPrincipal < 0.05) {
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

function buildLoanSummaryBase(input: LoanInput, totalRepayment: number, warning?: string): LoanSummary {
  const normalized = normalizeLoanInput(input);
  const effectiveMonthlyRate = calculateEffectiveMonthlyRate(
    normalized.rate,
    normalized.bsmv,
    normalized.kkdf,
  );
  const monthlyPayment = calculatePMT(effectiveMonthlyRate, normalized.term, normalized.principal);
  const schedule = buildLoanSchedule(normalized);
  const totalInterest = schedule.reduce((sum, row) => sum + row.interest, 0);
  const totalKKDF = schedule.reduce((sum, row) => sum + row.kkdfAmount, 0);
  const totalBSMV = schedule.reduce((sum, row) => sum + row.bsmvAmount, 0);
  const totalInstallmentPayment = monthlyPayment * normalized.term;
  const totalWithInterest = normalized.principal + totalInterest;
  const netDisbursed = Math.max(0, normalized.principal - normalized.fee);
  const totalCreditCost = totalRepayment - netDisbursed;
  const effectiveMonthlyCostRate = solveRateByIRR(normalized.term, monthlyPayment, netDisbursed);
  const effectiveAnnualCost = calculateEffectiveAnnualCost(effectiveMonthlyCostRate);

  return {
    principal: normalized.principal,
    term: normalized.term,
    nominalMonthlyRate: normalized.rate / 100,
    effectiveMonthlyRate,
    fee: normalized.fee,
    bsmv: normalized.bsmv,
    kkdf: normalized.kkdf,
    monthlyPayment,
    totalInstallmentPayment,
    totalInterest,
    totalKKDF,
    totalBSMV,
    totalWithInterest,
    totalRepayment,
    totalCreditCost,
    netDisbursed,
    effectiveMonthlyCostRate,
    effectiveAnnualCost,
    schedule,
    warning,
  };
}

export function calculateReferenceLoanFromHtmlLogic(input: LoanInput): LoanSummary {
  const normalized = normalizeLoanInput(input);

  if (!normalized.principal || !normalized.term) {
    return buildLoanSummaryBase(
      normalized,
      0,
      "Kredi tutarı ve vade sıfırdan büyük olmalıdır.",
    );
  }

  if (normalized.fee > normalized.principal) {
    return buildLoanSummaryBase(
      normalized,
      0,
      "Masraf tutarı kredi anaparasından büyük olamaz.",
    );
  }

  const preview = buildLoanSummaryBase(normalized, 0);
  const totalRepayment = preview.totalWithInterest + normalized.fee;
  return buildLoanSummaryBase(normalized, totalRepayment);
}

export function calculateLoanSummary(input: LoanInput): LoanSummary {
  const normalized = normalizeLoanInput(input);

  if (!normalized.principal || !normalized.term) {
    return buildLoanSummaryBase(
      normalized,
      0,
      "Kredi tutarı ve vade sıfırdan büyük olmalıdır.",
    );
  }

  if (normalized.fee > normalized.principal) {
    return buildLoanSummaryBase(
      normalized,
      0,
      "Masraf tutarı kredi anaparasından büyük olamaz.",
    );
  }

  const preview = buildLoanSummaryBase(normalized, 0);
  const totalRepayment = preview.totalInstallmentPayment + normalized.fee;
  return buildLoanSummaryBase(normalized, totalRepayment);
}

function compareValue(
  key: string,
  label: string,
  reference: number,
  project: number,
  format: "money" | "percent",
) {
  const tolerance = format === "money" ? 0.05 : 0.0001;
  const difference = project - reference;

  return {
    key,
    label,
    reference,
    project,
    difference,
    tolerance,
    status: Math.abs(difference) <= tolerance ? "OK" : "Kontrol Et",
    format,
  } satisfies LoanComparisonRow;
}

export function compareLoanEngines(input: LoanInput): LoanEngineComparison {
  const reference = calculateReferenceLoanFromHtmlLogic(input);
  const project = calculateLoanSummary(input);

  const rows: LoanComparisonRow[] = [
    compareValue(
      "effectiveMonthlyRate",
      "Kredi Faizi BSMV+KKDF",
      reference.effectiveMonthlyRate,
      project.effectiveMonthlyRate,
      "percent",
    ),
    compareValue(
      "effectiveMonthlyCostRate",
      "Efektif Aylık Maliyet",
      reference.effectiveMonthlyCostRate,
      project.effectiveMonthlyCostRate,
      "percent",
    ),
    compareValue(
      "effectiveAnnualCost",
      "Yıllık Faiz Maliyeti",
      reference.effectiveAnnualCost,
      project.effectiveAnnualCost,
      "percent",
    ),
    compareValue("monthlyPayment", "Taksit Tutarı", reference.monthlyPayment, project.monthlyPayment, "money"),
    compareValue("totalInterest", "Toplam Faiz Ödeme", reference.totalInterest, project.totalInterest, "money"),
    compareValue("totalKKDF", "Toplam KKDF", reference.totalKKDF, project.totalKKDF, "money"),
    compareValue("totalBSMV", "Toplam BSMV", reference.totalBSMV, project.totalBSMV, "money"),
    compareValue(
      "totalWithInterest",
      "Toplam Faizli Geri Ödeme",
      reference.totalWithInterest,
      project.totalWithInterest,
      "money",
    ),
    compareValue(
      "netDisbursed",
      "Kredi Kullandırım Sonrası Ele Geçen",
      reference.netDisbursed,
      project.netDisbursed,
      "money",
    ),
    compareValue("fee", "Kredi Hariç Masraf", reference.fee, project.fee, "money"),
    compareValue(
      "totalInstallmentPayment",
      "Toplam Taksit Ödemesi",
      reference.totalInstallmentPayment,
      project.totalInstallmentPayment,
      "money",
    ),
    compareValue(
      "totalRepayment",
      "Toplam Geri Ödeme",
      reference.totalRepayment,
      project.totalRepayment,
      "money",
    ),
    compareValue(
      "totalCreditCost",
      "Toplam Kredi Maliyeti",
      reference.totalCreditCost,
      project.totalCreditCost,
      "money",
    ),
  ];

  const maxLength = Math.max(reference.schedule.length, project.schedule.length);
  const scheduleRows: LoanScheduleComparisonRow[] = [];

  for (let index = 0; index < maxLength; index += 1) {
    const referenceRow = reference.schedule[index];
    const projectRow = project.schedule[index];

    scheduleRows.push({
      period: referenceRow?.period ?? projectRow?.period ?? index + 1,
      referencePayment: referenceRow?.payment ?? 0,
      projectPayment: projectRow?.payment ?? 0,
      paymentDiff: (projectRow?.payment ?? 0) - (referenceRow?.payment ?? 0),
      referencePrincipal: referenceRow?.principalPayment ?? 0,
      projectPrincipal: projectRow?.principalPayment ?? 0,
      principalDiff: (projectRow?.principalPayment ?? 0) - (referenceRow?.principalPayment ?? 0),
      referenceInterest: referenceRow?.interest ?? 0,
      projectInterest: projectRow?.interest ?? 0,
      interestDiff: (projectRow?.interest ?? 0) - (referenceRow?.interest ?? 0),
      referenceKKDF: referenceRow?.kkdfAmount ?? 0,
      projectKKDF: projectRow?.kkdfAmount ?? 0,
      kkdfDiff: (projectRow?.kkdfAmount ?? 0) - (referenceRow?.kkdfAmount ?? 0),
      referenceBSMV: referenceRow?.bsmvAmount ?? 0,
      projectBSMV: projectRow?.bsmvAmount ?? 0,
      bsmvDiff: (projectRow?.bsmvAmount ?? 0) - (referenceRow?.bsmvAmount ?? 0),
      referenceRemaining: referenceRow?.remainingPrincipal ?? 0,
      projectRemaining: projectRow?.remainingPrincipal ?? 0,
      remainingDiff: (projectRow?.remainingPrincipal ?? 0) - (referenceRow?.remainingPrincipal ?? 0),
      status:
        Math.abs((projectRow?.payment ?? 0) - (referenceRow?.payment ?? 0)) <= 0.05 &&
        Math.abs((projectRow?.principalPayment ?? 0) - (referenceRow?.principalPayment ?? 0)) <= 0.05 &&
        Math.abs((projectRow?.interest ?? 0) - (referenceRow?.interest ?? 0)) <= 0.05 &&
        Math.abs((projectRow?.kkdfAmount ?? 0) - (referenceRow?.kkdfAmount ?? 0)) <= 0.05 &&
        Math.abs((projectRow?.bsmvAmount ?? 0) - (referenceRow?.bsmvAmount ?? 0)) <= 0.05 &&
        Math.abs((projectRow?.remainingPrincipal ?? 0) - (referenceRow?.remainingPrincipal ?? 0)) <= 0.05
          ? "OK"
          : "Kontrol Et",
    });
  }

  const warnings = [reference.warning, project.warning].filter(Boolean) as string[];
  return { reference, project, rows, scheduleRows, warnings };
}

export function formatLoanResult(summary: LoanSummary) {
  return {
    fee: summary.fee,
    monthlyPayment: summary.monthlyPayment,
    totalInstallmentPayment: summary.totalInstallmentPayment,
    totalRepayment: summary.totalRepayment,
    totalWithInterest: summary.totalWithInterest,
    totalInterest: summary.totalInterest,
    totalKKDF: summary.totalKKDF,
    totalBSMV: summary.totalBSMV,
    totalCreditCost: summary.totalCreditCost,
    netDisbursed: summary.netDisbursed,
    effectiveMonthlyRate: summary.effectiveMonthlyRate,
    effectiveMonthlyCostRate: summary.effectiveMonthlyCostRate,
    effectiveAnnualCost: summary.effectiveAnnualCost,
  };
}
