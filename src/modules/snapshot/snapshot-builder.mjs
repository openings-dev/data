import { sha256Json } from "../../shared/utils/hash.mjs";

/**
 * @param {{
 *  catalogGeneratedAt: string | null;
 *  opportunities: Array<Record<string, unknown>>;
 *  byRepository: Array<Record<string, unknown>>;
 *  failedRepositories: Array<Record<string, unknown>>;
 *  repositoriesRequested: number;
 *  repositoriesScanned: number;
 *  request: {
 *    maxIssuesPerRepository: number;
 *    maxRepositories: number;
 *    requestDelayMs: number;
 *    usedAuthenticatedRequests: boolean;
 *  };
 * }} params
 */
export function buildSnapshot(params) {
  const {
    catalogGeneratedAt,
    opportunities,
    byRepository,
    failedRepositories,
    repositoriesRequested,
    repositoriesScanned,
    request,
  } = params;

  const uniqueCountries = new Set(opportunities.map((item) => item.country)).size;
  const uniqueRegions = new Set(opportunities.map((item) => item.region)).size;
  const uniqueRepositories = new Set(opportunities.map((item) => item.repository)).size;

  const dataHash = sha256Json({
    opportunities,
    byRepository,
    failedRepositories,
    repositoriesRequested,
    repositoriesScanned,
  });

  return {
    generatedAt: new Date().toISOString(),
    dataHash,
    catalogGeneratedAt,
    request,
    repositoriesRequested,
    repositoriesScanned,
    totals: {
      opportunities: opportunities.length,
      uniqueRepositories,
      uniqueCountries,
      uniqueRegions,
      failedRepositories: failedRepositories.length,
    },
    failedRepositories,
    byRepository,
    items: opportunities,
  };
}

/**
 * @param {any | null} previousSnapshot
 * @param {any} nextSnapshot
 */
export function hasSnapshotChanged(previousSnapshot, nextSnapshot) {
  return previousSnapshot?.dataHash !== nextSnapshot.dataHash;
}

