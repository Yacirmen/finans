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
  displayName: string;
  defaultServiceFeeRate: number;
  deliverySpeedFactor: number;
  riskFactor: number;
  campaignDiscountRate: number;
  notes: string;
};

const defaultNote = "Varsayılan tahmini parametre kullanılıyor.";

const baseCompanyParams: Record<CompanyName, CompanyParam> = {
  Eminevim: {
    displayName: "Eminevim",
    defaultServiceFeeRate: 11.8,
    deliverySpeedFactor: 1.02,
    riskFactor: 1.02,
    campaignDiscountRate: 0.2,
    notes: defaultNote,
  },
  "Fuzul Ev": {
    displayName: "Fuzul Ev",
    defaultServiceFeeRate: 11.4,
    deliverySpeedFactor: 1.05,
    riskFactor: 0.98,
    campaignDiscountRate: 0.3,
    notes: defaultNote,
  },
  Katılımevim: {
    displayName: "Katılımevim",
    defaultServiceFeeRate: 11.6,
    deliverySpeedFactor: 1.01,
    riskFactor: 1.04,
    campaignDiscountRate: 0.15,
    notes: defaultNote,
  },
  "Sinpaş YTS": {
    displayName: "Sinpaş YTS",
    defaultServiceFeeRate: 10.9,
    deliverySpeedFactor: 1.08,
    riskFactor: 0.94,
    campaignDiscountRate: 0.4,
    notes: defaultNote,
  },
  "Emlak Katılım Tasarruf Finansmanı": {
    displayName: "Emlak Katılım Tasarruf Finansmanı",
    defaultServiceFeeRate: 10.6,
    deliverySpeedFactor: 1.06,
    riskFactor: 0.92,
    campaignDiscountRate: 0.45,
    notes: defaultNote,
  },
  Birevim: {
    displayName: "Birevim",
    defaultServiceFeeRate: 11.7,
    deliverySpeedFactor: 0.98,
    riskFactor: 1.06,
    campaignDiscountRate: 0.1,
    notes: defaultNote,
  },
  "İyi Finans": {
    displayName: "İyi Finans",
    defaultServiceFeeRate: 10.8,
    deliverySpeedFactor: 1.04,
    riskFactor: 0.95,
    campaignDiscountRate: 0.35,
    notes: defaultNote,
  },
  İmece: {
    displayName: "İmece",
    defaultServiceFeeRate: 11.2,
    deliverySpeedFactor: 1,
    riskFactor: 1,
    campaignDiscountRate: 0.2,
    notes: defaultNote,
  },
  "Albayrak Finans": {
    displayName: "Albayrak Finans",
    defaultServiceFeeRate: 10.7,
    deliverySpeedFactor: 1.03,
    riskFactor: 0.97,
    campaignDiscountRate: 0.3,
    notes: defaultNote,
  },
  Diğer: {
    displayName: "Diğer",
    defaultServiceFeeRate: 11.8,
    deliverySpeedFactor: 1,
    riskFactor: 1,
    campaignDiscountRate: 0,
    notes: defaultNote,
  },
};

export const companyParams: Record<string, CompanyParam> & Record<CompanyName, CompanyParam> = {
  ...baseCompanyParams,
  "DiÄŸer": baseCompanyParams["Diğer"],
  "KatÄ±lÄ±mevim": baseCompanyParams["Katılımevim"],
  "SinpaÅŸ YTS": baseCompanyParams["Sinpaş YTS"],
  "Emlak KatÄ±lÄ±m Tasarruf FinansmanÄ±": baseCompanyParams["Emlak Katılım Tasarruf Finansmanı"],
  "Ä°yi Finans": baseCompanyParams["İyi Finans"],
  "Ä°mece": baseCompanyParams["İmece"],
};
