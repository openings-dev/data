/**
 * @param {string} rawValue
 */
export function parseAmount(rawValue) {
  const value = String(rawValue ?? "").trim().toLowerCase();
  const hasK = value.endsWith("k");
  const hasM = value.endsWith("m");
  const base = value.replace(/[km]$/, "").replace(/\s+/g, "");
  const standardized = base
    .replace(/\.(?=\d{3}(\D|$))/g, "")
    .replace(/,(?=\d{3}(\D|$))/g, "")
    .replace(",", ".");
  const parsed = Number.parseFloat(standardized);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  const multiplier = hasM ? 1_000_000 : hasK ? 1_000 : 1;
  return Math.round(parsed * multiplier);
}
