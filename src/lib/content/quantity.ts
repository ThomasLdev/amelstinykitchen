export function formatQuantity(
  value: number,
  locale: string,
  maximumFractionDigits = value >= 10 ? 0 : 1,
): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits, useGrouping: false }).format(value);
}
