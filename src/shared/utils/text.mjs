/**
 * @param {string | null | undefined} text
 */
export function normalizeText(text) {
  return String(text ?? "").replace(/\s+/g, " ").trim();
}

/**
 * @param {string | null | undefined} body
 */
export function buildDescription(body) {
  return String(body ?? "").replace(/\r\n/g, "\n").trim();
}

/**
 * @param {string | null | undefined} title
 * @param {string | null | undefined} body
 */
export function buildExcerpt(title, body) {
  const source = normalizeText(body);

  if (!source) {
    return normalizeText(title);
  }

  if (source.length <= 220) {
    return source;
  }

  return `${source.slice(0, 217)}...`;
}
