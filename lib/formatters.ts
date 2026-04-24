export function parseLocaleNumber(value: string | number | null | undefined) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (!value) return 0;

  const normalized = String(value)
    .trim()
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
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

export function formatNumberTr(value: number, maximumFractionDigits = 2) {
  if (!Number.isFinite(value)) return "Hesaplanamadı";
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(value);
}

export function formatPercentTr(value: number, maximumFractionDigits = 2) {
  if (!Number.isFinite(value)) return "Hesaplanamadı";
  return `${formatNumberTr(value, maximumFractionDigits)}%`;
}

