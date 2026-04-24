import { calculateEffectiveMonthlyRate, calculateLoanSummary } from "../loanEngine";

export type CreditLimitType = "Konut" | "Taşıt" | "İhtiyaç";

export type CreditLimitInput = {
  monthlyIncome: number;
  currentDebtPayments: number;
  creditType: CreditLimitType;
  term: number;
  monthlyRate: number;
  maxPaymentRatio: number;
  fee: number;
};

export type CreditLimitResult = {
  maxAffordablePayment: number;
  remainingCapacity: number;
  estimatedMaxPrincipal: number;
  totalRepayment: number;
  monthlyPayment: number;
  riskLevel: "Düşük" | "Orta" | "Yüksek";
  debtRatio: number;
  warning?: string;
};

export function principalFromPayment(payment: number, rate: number, term: number) {
  const safePayment = Math.max(0, payment || 0);
  const safeTerm = Math.max(0, Math.round(term || 0));

  if (!safePayment || !safeTerm) return 0;
  if (!rate) return safePayment * safeTerm;

  return safePayment * ((1 - Math.pow(1 + rate, -safeTerm)) / rate);
}

export function calculateCreditLimit(input: CreditLimitInput): CreditLimitResult {
  const monthlyIncome = Math.max(0, input.monthlyIncome || 0);
  const currentDebtPayments = Math.max(0, input.currentDebtPayments || 0);
  const term = Math.max(0, Math.round(input.term || 0));
  const monthlyRate = Math.max(0, input.monthlyRate || 0);
  const maxPaymentRatio = Math.min(100, Math.max(0, input.maxPaymentRatio || 0));
  const fee = Math.max(0, input.fee || 0);

  const maxAffordablePayment = monthlyIncome * (maxPaymentRatio / 100);
  const remainingCapacity = Math.max(0, maxAffordablePayment - currentDebtPayments);
  const effectiveRate = calculateEffectiveMonthlyRate(
    monthlyRate,
    input.creditType === "Konut" ? 0 : 15,
    input.creditType === "İhtiyaç" || input.creditType === "Taşıt" ? 15 : 0,
  );
  const estimatedMaxPrincipal = Math.max(0, principalFromPayment(remainingCapacity, effectiveRate, term));
  const debtRatio = monthlyIncome > 0 ? (currentDebtPayments + remainingCapacity) / monthlyIncome : 0;

  let warning: string | undefined;
  if (!monthlyIncome || !term) {
    warning = "Gelir ve vade bilgisi sıfırdan büyük olmalıdır.";
  } else if (currentDebtPayments >= maxAffordablePayment) {
    warning = "Mevcut borç ödemeleri kabul edilen ödeme kapasitesini aşıyor.";
  } else if (fee > estimatedMaxPrincipal) {
    warning = "Masraf tutarı hesaplanan limitten yüksek görünüyor.";
  }

  const loan = calculateLoanSummary({
    principal: estimatedMaxPrincipal,
    term,
    rate: monthlyRate,
    fee,
    bsmv: input.creditType === "Konut" ? 0 : 15,
    kkdf: input.creditType === "İhtiyaç" || input.creditType === "Taşıt" ? 15 : 0,
  });

  const riskLevel =
    remainingCapacity <= 0 || currentDebtPayments >= maxAffordablePayment
      ? "Yüksek"
      : debtRatio >= 0.55
        ? "Yüksek"
        : debtRatio >= 0.4
          ? "Orta"
          : "Düşük";

  return {
    maxAffordablePayment,
    remainingCapacity,
    estimatedMaxPrincipal: Math.max(0, estimatedMaxPrincipal - fee),
    totalRepayment: loan.totalRepayment,
    monthlyPayment: loan.monthlyPayment,
    riskLevel,
    debtRatio,
    warning,
  };
}

