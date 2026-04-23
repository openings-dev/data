/**
 * @param {{repositories: Array<Record<string, any>>; maxRepositories: number; countryCodes: string[]}} params
 */
export function selectRepositories(params) {
  const { repositories, maxRepositories, countryCodes } = params;
  const normalizedCountryCodes = new Set(countryCodes.map((code) => code.toUpperCase()));

  const filteredByCountry =
    normalizedCountryCodes.size === 0
      ? repositories
      : repositories.filter((repository) =>
          normalizedCountryCodes.has(String(repository.countryCode ?? "").toUpperCase()),
        );

  if (maxRepositories <= 0) {
    return filteredByCountry;
  }

  return filteredByCountry.slice(0, maxRepositories);
}
