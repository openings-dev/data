/**
 * @param {string} token
 * @param {{countryCode?: string}} repository
 */
export function parseCurrency(token, repository) {
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
