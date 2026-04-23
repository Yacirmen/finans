export type HousingEnergyClass = "A-B" | "C" | "Diger";

type HousingRule = {
  max: number;
  noHome: Record<HousingEnergyClass, number>;
  hasHome: Record<HousingEnergyClass, number>;
};

const housingRules: HousingRule[] = [
  { max: 5_000_000, noHome: { "A-B": 0.9, C: 0.8, Diger: 0.7 }, hasHome: { "A-B": 0.225, C: 0.2, Diger: 0.175 } },
  { max: 7_000_000, noHome: { "A-B": 0.8, C: 0.7, Diger: 0.6 }, hasHome: { "A-B": 0.2, C: 0.175, Diger: 0.15 } },
  { max: 10_000_000, noHome: { "A-B": 0.7, C: 0.6, Diger: 0.5 }, hasHome: { "A-B": 0.175, C: 0.15, Diger: 0.125 } },
  { max: 20_000_000, noHome: { "A-B": 0.5, C: 0.4, Diger: 0.3 }, hasHome: { "A-B": 0.125, C: 0.1, Diger: 0.075 } },
  { max: Number.POSITIVE_INFINITY, noHome: { "A-B": 0.4, C: 0.3, Diger: 0.2 }, hasHome: { "A-B": 0.1, C: 0.075, Diger: 0.05 } },
];

export function calculateHousingLoanLimit(expertiseValue: number, energyClass: HousingEnergyClass, hasAnotherHome: boolean) {
  const safeValue = Math.max(0, expertiseValue || 0);
  const rule = housingRules.find((item) => safeValue <= item.max) ?? housingRules[housingRules.length - 1];
  const ratio = hasAnotherHome ? rule.hasHome[energyClass] : rule.noHome[energyClass];

  return {
    ratio,
    maxCreditAmount: safeValue * ratio,
  };
}

export function calculateVehicleLoanLimit(vehicleValue: number) {
  const safeValue = Math.max(0, vehicleValue || 0);

  if (safeValue > 2_000_000) {
    return {
      eligible: false,
      ratio: 0,
      maxCreditAmount: 0,
      message: "2.000.000 TL üstü taşıt bedelinde kredi kullandırılamaz.",
    };
  }

  let ratio = 0.7;
  if (safeValue > 1_200_000) ratio = 0.2;
  else if (safeValue > 800_000) ratio = 0.3;
  else if (safeValue > 400_000) ratio = 0.5;

  return {
    eligible: true,
    ratio,
    maxCreditAmount: safeValue * ratio,
    message: "",
  };
}

export function calculateNeedLoanTerm(requestedAmount: number) {
  const safeValue = Math.max(0, requestedAmount || 0);

  if (safeValue <= 125_000) return 36;
  if (safeValue <= 250_000) return 24;
  return 12;
}
