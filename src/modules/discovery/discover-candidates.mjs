import { RateLimitError } from "../../shared/errors/rate-limit-error.mjs";
import { sleep } from "../../shared/utils/time.mjs";
import { buildCandidate } from "./build-candidate.mjs";
import { classifyIssue } from "./classify-issue.mjs";
import {
  activeDecisionKeys,
  aggregateMatch,
  repositoryFromIssue,
} from "./discovery-groups.mjs";
import { rankCandidates } from "./rank-candidates.mjs";

export async function discoverCandidates(options) {
  const { queries, decisions, catalog, githubClient, limits, logger } = options;
  const catalogKeys = new Set(catalog.repositories.map((item) => item.repository.toLowerCase()));
  const today = new Date().toISOString().slice(0, 10);
  const reviewedKeys = activeDecisionKeys(decisions.decisions, today);
  const groups = new Map();
  const failures = [];
  let queriesCompleted = 0;
  let rateLimit = { remaining: null, resetAt: null };

  for (const query of queries) {
    try {
      const result = await githubClient.searchOpenIssues(query.query, {
        perPage: limits.maxSearchResultsPerQuery,
      });
      rateLimit = result.rateLimit;
      for (const issue of result.items) {
        const repository = repositoryFromIssue(issue);
        if (repository) aggregateMatch(groups, repository, query, issue);
      }
      queriesCompleted += 1;
      await sleep(Math.max(limits.requestDelayMs, 2100));
    } catch (error) {
      failures.push({ stage: "search", queryId: query.id, error: error.message });
      if (error instanceof RateLimitError) {
        rateLimit = { remaining: 0, resetAt: error.resetAt };
        break;
      }
    }
  }

  const catalogDuplicates = [...groups.keys()].filter((key) => catalogKeys.has(key)).length;
  const reviewedDuplicates = [...groups.keys()].filter((key) => reviewedKeys.has(key)).length;
  const pendingGroups = [...groups.values()].filter((group) => (
    !catalogKeys.has(group.repository.toLowerCase())
    && !reviewedKeys.has(group.repository.toLowerCase())
    && group.matchedIssues.some((issue) => classifyIssue(issue).eligible)
  ));
  const rawCandidates = [];
  let repositoriesEvaluated = 0;

  for (const group of pendingGroups) {
    try {
      const repository = await githubClient.fetchRepository(group.repository);
      await sleep(limits.requestDelayMs);
      if (!repository || repository.archived || repository.disabled || !repository.has_issues) continue;
      const issues = await githubClient.fetchOpenIssues(group.repository);
      await sleep(limits.requestDelayMs);
      repositoriesEvaluated += 1;
      const candidate = buildCandidate({ repository, issues, queryMatches: group.queryMatches });
      if (candidate) rawCandidates.push(candidate);
    } catch (error) {
      failures.push({ stage: "repository", repository: group.repository, error: error.message });
      logger.warn("discovery-repository-failed", { repository: group.repository, error: error.message });
      if (error instanceof RateLimitError) {
        rateLimit = { remaining: 0, resetAt: error.resetAt };
        break;
      }
    }
  }

  const ranked = rankCandidates({
    candidates: rawCandidates,
    catalogRepositories: catalog.repositories,
    qualifiedLimit: limits.qualifiedLimit,
    lowConfidenceLimit: limits.lowConfidenceLimit,
  });
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    status: failures.length === 0 ? "complete" : "partial",
    summary: {
      queriesRequested: queries.length,
      queriesCompleted,
      repositoriesMatched: groups.size,
      repositoriesEvaluated,
      qualifiedCandidates: ranked.candidates.length,
      lowConfidenceCandidates: ranked.lowConfidence.length,
      catalogDuplicates,
      reviewedDuplicates,
    },
    rateLimit,
    failures,
    candidates: ranked.candidates,
    lowConfidence: ranked.lowConfidence,
  };
}
