/**
 * @param {string | undefined} rawValue
 * @param {number} fallback
 * @param {number} min
 * @param {number} max
 */
export function clampInt(rawValue, fallback, min, max) {
  const parsed = Number.parseInt(rawValue ?? "", 10);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, parsed));
}

