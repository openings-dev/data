/**
 * @param {Array<Record<string, any>>} repositories
 */
export function groupRepositoriesByCountry(repositories) {
  const map = new Map();

  for (const repository of repositories) {
    const countryCode = String(repository.countryCode ?? "").trim().toUpperCase();

    if (!countryCode) {
      throw new Error(`Repository ${repository.repository} does not have countryCode.`);
    }

    if (!map.has(countryCode)) {
      map.set(countryCode, {
        countryCode,
        country: repository.country,
        region: repository.region,
        repositories: [],
      });
    }

    map.get(countryCode).repositories.push(repository);
  }

  return Array.from(map.values()).sort((left, right) =>
    left.countryCode.localeCompare(right.countryCode),
  );
}
