import { classifyIssue } from "./classify-issue.mjs";
import { REPOSITORY_JOB_SIGNALS } from "./issue-signals.mjs";

function uniqueEvidence(issues) {
  const byUrl = new Map();
  for (const issue of issues) {
    const result = classifyIssue(issue);
    if (result.eligible && result.evidence) {
      byUrl.set(result.evidence.url, result);
    }
  }
  return [...byUrl.values()].sort((left, right) =>
    String(right.evidence.updatedAt).localeCompare(String(left.evidence.updatedAt)));
}

function resolveLocation(queryMatches) {
  const hints = queryMatches
    .map((match) => match.locationHint)
    .filter(Boolean);
  if (hints.length === 0) return { location: null, evidence: null };
  const countries = new Set(hints.map((hint) => hint.countryCode));
  if (countries.size !== 1) return { location: null, evidence: null };
  return { location: hints[0], evidence: "query-hint" };
}

function confidenceFor(points) {
  if (points >= 75) return "high";
  if (points >= 45) return "medium";
  return "low";
}

export function buildCandidate({ repository, issues, queryMatches }) {
  const classified = uniqueEvidence(issues);
  if (classified.length === 0) return null;

  const repositorySignal = REPOSITORY_JOB_SIGNALS.test(repository.name ?? "");
  const evidencePoints = Math.max(...classified.map((item) => item.points));
  const multipleIssuePoints = Math.min(Math.max(classified.length - 1, 0) * 5, 20);
  const confidencePoints = evidencePoints + (repositorySignal ? 10 : 0) + multipleIssuePoints;
  const location = resolveLocation(queryMatches);
  const reasons = new Set(classified.flatMap((item) => item.reasons));
  if (repositorySignal) reasons.add("repository-name");
  if (classified.length > 1) reasons.add("multiple-open-jobs");

  return {
    repository: repository.full_name,
    url: repository.html_url,
    confidence: confidenceFor(confidencePoints),
    confidencePoints,
    openJobsFound: classified.length,
    lastActivityAt: classified[0].evidence.updatedAt,
    suggestedLocation: location.location,
    locationEvidence: location.evidence,
    reasons: [...reasons].sort(),
    evidence: classified.map((item) => item.evidence),
    matchedQueryIds: [...new Set(queryMatches.map((match) => match.queryId))].sort(),
  };
}
