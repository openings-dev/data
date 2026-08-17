import { resolve } from "node:path";
import { clampInt } from "../shared/utils/number.mjs";

export function loadDiscoveryConfig() {
  const rootDir = process.cwd();
  const discoveryDir = resolve(rootDir, "src", "modules", "discovery");

  return {
    paths: {
      rootDir,
      repositoriesFile: resolve(rootDir, "src", "modules", "catalog", "repositories.json"),
      queriesFile: resolve(discoveryDir, "discovery-queries.json"),
      decisionsFile: resolve(discoveryDir, "discovery-decisions.json"),
      outputDir: resolve(
        rootDir,
        process.env.DISCOVERY_OUTPUT_DIR || ".artifacts/community-discovery",
      ),
    },
    github: {
      token: process.env.OPENINGS_GITHUB_TOKEN || process.env.GITHUB_TOKEN || "",
    },
    limits: {
      maxQueries: clampInt(process.env.DISCOVERY_MAX_QUERIES, 0, 0, 1000),
      maxSearchResultsPerQuery: clampInt(
        process.env.DISCOVERY_MAX_RESULTS_PER_QUERY,
        50,
        1,
        100,
      ),
      requestDelayMs: clampInt(process.env.DISCOVERY_REQUEST_DELAY_MS, 1000, 250, 10000),
    },
  };
}
