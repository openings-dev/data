import { normalizeText } from "../../shared/utils/text.mjs";

function parseCurrency(token, repository) {
  const normalized = String(token ?? "").toUpperCase();

  if (normalized === "R$" || normalized === "BRL") {
    return "BRL";
  }

  if (normalized === "€" || normalized === "EUR") {
    return "EUR";
  }

  if (normalized === "£" || normalized === "GBP") {
    return "GBP";
  }

  if (normalized === "CAD") {
    return "CAD";
  }

  if (normalized === "USD" || normalized === "US$") {
    return "USD";
  }

  if (normalized === "$") {
    if (repository.countryCode === "CA") {
      return "CAD";
    }

    if (repository.countryCode === "BR") {
      return "BRL";
    }

    return "USD";
  }

  return null;
}

function parseAmount(rawValue) {
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

function detectSalaryPeriod(text) {
  const lower = text.toLowerCase();

  if (/(hour|hr|hora|\/h)/i.test(lower)) {
    return "hour";
  }

  if (/(month|monthly|mês|mes|\/m)/i.test(lower)) {
    return "month";
  }

  return "year";
}

/**
 * @param {string} text
 * @param {{countryCode?: string}} repository
 */
export function parseSalary(text, repository) {
  const content = normalizeText(text);

  const rangeMatch = content.match(
    /(R\$|US\$|USD|BRL|EUR|CAD|€|\$|£)\s*([0-9][0-9.,\s]*[kKmM]?)\s*(?:-|–|—|to|a|até)\s*(?:R\$|US\$|USD|BRL|EUR|CAD|€|\$|£)?\s*([0-9][0-9.,\s]*[kKmM]?)/i,
  );

  if (rangeMatch) {
    const currency = parseCurrency(rangeMatch[1], repository);
    const min = parseAmount(rangeMatch[2]);
    const max = parseAmount(rangeMatch[3]);

    if (currency && min && max) {
      return {
        currency,
        min: Math.min(min, max),
        max: Math.max(min, max),
        period: detectSalaryPeriod(content),
      };
    }
  }

  const singleMatch = content.match(
    /(?:salary|sal[aá]rio|compensation|pay|faixa)[^\dRUSBECAD€$£]{0,24}(R\$|US\$|USD|BRL|EUR|CAD|€|\$|£)\s*([0-9][0-9.,\s]*[kKmM]?)/i,
  );

  if (singleMatch) {
    const currency = parseCurrency(singleMatch[1], repository);
    const amount = parseAmount(singleMatch[2]);

    if (currency && amount) {
      return {
        currency,
        min: amount,
        period: detectSalaryPeriod(content),
      };
    }
  }

  return undefined;
}

