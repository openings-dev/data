import { toSnapshotPath } from "./snapshot-paths.mjs";
import { buildCountrySnapshot } from "./build-country-snapshot.mjs";
import { buildGlobalIndex } from "./build-global-index.mjs";

/**
 * @param {{snapshotRootDir: string; generatedAt: string; catalogGeneratedAt: string | null; request: Record<string, unknown>; repositoriesRequested: number; repositoriesScanned: number; failedRepositories: Array<Record<string, unknown>>; countries: Array<any>;}} params
 */
export function prepareSegmentedSnapshot(params) {
  const {
    snapshotRootDir,
    generatedAt,
    catalogGeneratedAt,
    request,
    repositoriesRequested,
    repositoriesScanned,
    failedRepositories,
    countries,
  } = params;

  const countrySnapshots = countries
    .map((countryResult) => buildCountrySnapshot({ snapshotRootDir, generatedAt, countryResult }))
    .sort((left, right) => left.countryCode.localeCompare(right.countryCode));

  const globalIndex = buildGlobalIndex({
    generatedAt,
    catalogGeneratedAt,
    request,
    repositoriesRequested,
    repositoriesScanned,
    failedRepositories,
    countrySnapshots,
  });

  return {
    snapshotRootDir,
    globalIndex: {
      ...globalIndex,
      filePath: toSnapshotPath(snapshotRootDir, globalIndex.relativePath),
    },
    countrySnapshots,
  };
}
