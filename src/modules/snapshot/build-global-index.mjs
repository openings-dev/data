import { sha256Json } from "../../shared/utils/hash.mjs";

/**
 * @param {{generatedAt: string; catalogGeneratedAt: string | null; request: Record<string, unknown>; repositoriesRequested: number; repositoriesScanned: number; failedRepositories: Array<Record<string, unknown>>; countrySnapshots: Array<any>;}} params
 */
export function buildGlobalIndex(params) {
  const {
    generatedAt,
    catalogGeneratedAt,
    request,
    repositoriesRequested,
    repositoriesScanned,
    failedRepositories,
    countrySnapshots,
  } = params;

  const countries = countrySnapshots
    .map((snapshot) => ({
      country: snapshot.country,
      countryCode: snapshot.countryCode,
      region: snapshot.region,
      opportunities: snapshot.totals.opportunities,
      repositories: snapshot.totals.repositories,
      openIssues: snapshot.totals.openIssues,
      closedIssues: snapshot.totals.closedIssues,
      indexFile: snapshot.index.relativePath,
    }))
    .sort((left, right) => left.countryCode.localeCompare(right.countryCode));

  const totals = countries.reduce(
    (accumulator, country) => ({
      opportunities: accumulator.opportunities + country.opportunities,
      uniqueRepositories: accumulator.uniqueRepositories + country.repositories,
      uniqueCountries: accumulator.uniqueCountries + 1,
      uniqueRegions: accumulator.uniqueRegions.add(country.region),
    }),
    { opportunities: 0, uniqueRepositories: 0, uniqueCountries: 0, uniqueRegions: new Set() },
  );

  return {
    relativePath: "index.json",
    payload: {
      generatedAt,
      schemaVersion: 2,
      dataHash: sha256Json({ countries, repositoriesRequested, repositoriesScanned, failedRepositories }),
      catalogGeneratedAt,
      request,
      repositoriesRequested,
      repositoriesScanned,
      totals: {
        opportunities: totals.opportunities,
        uniqueRepositories: totals.uniqueRepositories,
        uniqueCountries: totals.uniqueCountries,
        uniqueRegions: totals.uniqueRegions.size,
        failedRepositories: failedRepositories.length,
      },
      failedRepositories,
      countries,
    },
  };
}
