export function parseLocaleNumber(value: string | number | null | undefined) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (!value) return 0;

  const raw = String(value).trim().replace(/\s/g, "");
  if (!raw) return 0;

  const normalized = raw.includes(",")
    ? raw.replace(/\./g, "").replace(",", ".")
    : /^-?\d+\.\d+$/.test(raw)
      ? raw
      : raw.replace(/\./g, "");

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function parsePercentInput(value: string | number | null | undefined) {
  return parseLocaleNumber(value);
}

export function formatNumberTr(value: number, maximumFractionDigits = 2) {
  if (!Number.isFinite(value)) return "Hesaplanamadı";
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(value);
}

export function formatNumberInput(value: number, maximumFractionDigits = 0) {
  if (!Number.isFinite(value)) return "";
  return formatNumberTr(value, maximumFractionDigits);
}

export function formatTRY(value: number, maximumFractionDigits = 0) {
  return formatTry(value, maximumFractionDigits);
}

export function formatTry(value: number, maximumFractionDigits = 2) {
  if (!Number.isFinite(value)) return "Hesaplanamadı";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(value);
}

export function formatPercentTr(value: number, maximumFractionDigits = 2) {
  if (!Number.isFinite(value)) return "Hesaplanamadı";
  return `${formatNumberTr(value, maximumFractionDigits)}%`;
}
