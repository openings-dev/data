import { loadBuildConfig } from "../config/env.mjs";
import { readRepositoryCatalog } from "../modules/catalog/catalog-repository.mjs";
import { createGitHubClient } from "../modules/github/github-client.mjs";
import { createLogger } from "../modules/observability/logger.mjs";
import {
  mapIssueToOpportunity,
  sortOpportunitiesByDate,
} from "../modules/opportunities/opportunity-mapper.mjs";
import {
  buildSnapshot,
  hasSnapshotChanged,
} from "../modules/snapshot/snapshot-builder.mjs";
import {
  readPreviousSnapshot,
  writeSnapshot,
} from "../modules/snapshot/snapshot-writer.mjs";
import { sleep } from "../shared/utils/time.mjs";
import { RateLimitError } from "../shared/errors/rate-limit-error.mjs";

export async function runBuild() {
  const config = loadBuildConfig();
  const logger = createLogger({ component: "snapshot-builder" });

  const catalog = await readRepositoryCatalog(config.paths.repositoriesFile);
  const allRepositories = catalog.repositories;
  const repositories =
    config.limits.maxRepositories > 0
      ? allRepositories.slice(0, config.limits.maxRepositories)
      : allRepositories;

  if (repositories.length === 0) {
    throw new Error(
      `No repositories found in catalog file: ${config.paths.repositoriesFile}.`,
    );
  }

  logger.info("build-started", {
    repositories_requested: repositories.length,
    max_issues_per_repository: config.limits.maxIssuesPerRepository,
    request_delay_ms: config.limits.requestDelayMs,
    authenticated_requests: Boolean(config.github.token),
  });

  const githubClient = createGitHubClient({
    token: config.github.token,
    maxIssuesPerRepository: config.limits.maxIssuesPerRepository,
    logger: logger.child({ module: "github" }),
  });

  /** @type {Array<Record<string, unknown>>} */
  const opportunities = [];
  /** @type {Array<{ repository: string; country: string; region: string; issues: number }>} */
  const byRepository = [];
  /** @type {Array<{ repository: string; error: string }>} */
  const failedRepositories = [];

  for (let index = 0; index < repositories.length; index += 1) {
    const repository = repositories[index];
    const repositoryLogger = logger.child({
      repository: repository.repository,
      progress: `${index + 1}/${repositories.length}`,
    });

    try {
      const issues = await githubClient.fetchRecentIssues(repository.repository);
      const mapped = issues.map((issue) => mapIssueToOpportunity(issue, repository));
      const openIssues = mapped.filter((item) => item.issueState === "open").length;
      const closedIssues = mapped.length - openIssues;

      opportunities.push(...mapped);
      byRepository.push({
        repository: repository.repository,
        country: repository.country,
        region: repository.region,
        issues: mapped.length,
        openIssues,
        closedIssues,
      });

      repositoryLogger.info("repository-processed", {
        opportunities: mapped.length,
        open_issues: openIssues,
        closed_issues: closedIssues,
      });
    } catch (error) {
      if (error instanceof RateLimitError) {
        logger.error("build-aborted-rate-limit", {
          repository: repository.repository,
          retry_after_seconds: error.retryAfterSeconds,
          reset_at: error.resetAt,
        });
        throw error;
      }

      const message = error instanceof Error ? error.message : "Unknown error";
      failedRepositories.push({
        repository: repository.repository,
        error: message,
      });

      repositoryLogger.warn("repository-failed", {
        error: message,
      });
    }

    if (config.limits.requestDelayMs > 0 && index < repositories.length - 1) {
      await sleep(config.limits.requestDelayMs);
    }
  }

  const sortedOpportunities = sortOpportunitiesByDate(opportunities);

  if (byRepository.length === 0 && failedRepositories.length > 0) {
    throw new Error(
      "No repositories were processed successfully. Snapshot update aborted.",
    );
  }

  const previousSnapshot = await readPreviousSnapshot(config.paths.snapshotFile);
  const snapshot = buildSnapshot({
    catalogGeneratedAt: catalog.generatedAt ?? null,
    opportunities: sortedOpportunities,
    byRepository,
    failedRepositories,
    repositoriesRequested: repositories.length,
    repositoriesScanned: byRepository.length,
    request: {
      maxIssuesPerRepository: config.limits.maxIssuesPerRepository,
      maxRepositories: config.limits.maxRepositories,
      requestDelayMs: config.limits.requestDelayMs,
      usedAuthenticatedRequests: Boolean(config.github.token),
    },
  });

  if (!hasSnapshotChanged(previousSnapshot, snapshot)) {
    logger.info("build-no-changes", {
      opportunities: sortedOpportunities.length,
      repositories_scanned: byRepository.length,
    });
    return {
      updated: false,
      snapshot,
    };
  }

  await writeSnapshot(config.paths.snapshotFile, snapshot);

  logger.info("build-updated", {
    opportunities: sortedOpportunities.length,
    repositories_scanned: byRepository.length,
    failed_repositories: failedRepositories.length,
    snapshot_file: config.paths.snapshotFile,
  });

  return {
    updated: true,
    snapshot,
  };
}
