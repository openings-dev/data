import { loadDiscoveryConfig } from "../config/discovery-env.mjs";
import { readRepositoryCatalog } from "../modules/catalog/catalog-repository.mjs";
import { discoverCandidates } from "../modules/discovery/discover-candidates.mjs";
import {
  readDiscoveryDecisions,
  readDiscoveryQueries,
} from "../modules/discovery/read-discovery-contract.mjs";
import { writeDiscoveryReport } from "../modules/discovery/write-discovery-report.mjs";
import { createGitHubDiscoveryClient } from "../modules/github/github-discovery-client.mjs";
import { createLogger } from "../modules/observability/logger.mjs";

export async function runCommunityDiscovery() {
  const config = loadDiscoveryConfig();
  const logger = createLogger({ component: "community-discovery" });
  const [queryContract, decisions, catalog] = await Promise.all([
    readDiscoveryQueries(config.paths.queriesFile),
    readDiscoveryDecisions(config.paths.decisionsFile),
    readRepositoryCatalog(config.paths.repositoriesFile),
  ]);
  const queries = config.limits.maxQueries > 0
    ? queryContract.queries.slice(0, config.limits.maxQueries)
    : queryContract.queries;
  logger.info("discovery-started", {
    queries: queries.length,
    authenticated_requests: Boolean(config.github.token),
    request_delay_ms: config.limits.requestDelayMs,
  });
  const githubClient = createGitHubDiscoveryClient({
    token: config.github.token,
    logger: logger.child({ module: "github" }),
  });
  const report = await discoverCandidates({
    queries,
    decisions,
    catalog,
    githubClient,
    limits: {
      ...config.limits,
      qualifiedLimit: queryContract.qualifiedLimit,
      lowConfidenceLimit: queryContract.lowConfidenceLimit,
    },
    logger,
  });
  const paths = await writeDiscoveryReport({ outputDir: config.paths.outputDir, report });
  logger.info("discovery-finished", {
    status: report.status,
    qualified_candidates: report.summary.qualifiedCandidates,
    low_confidence_candidates: report.summary.lowConfidenceCandidates,
    json_path: paths.jsonPath,
    markdown_path: paths.markdownPath,
  });
  return { report, ...paths };
}
