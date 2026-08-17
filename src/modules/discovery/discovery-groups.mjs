export function repositoryFromIssue(issue) {
  try {
    const parts = new URL(issue.repository_url).pathname.split("/").filter(Boolean);
    return parts[0] === "repos" && parts.length === 3 ? `${parts[1]}/${parts[2]}` : null;
  } catch {
    return null;
  }
}

function isActiveDecision(item, today) {
  if (item.decision !== "snoozed") return true;
  return typeof item.reviewAfter === "string" && item.reviewAfter > today;
}

export function activeDecisionKeys(decisions, today) {
  return new Set(decisions
    .filter((item) => isActiveDecision(item, today))
    .map((item) => item.repository.toLowerCase()));
}

export function aggregateMatch(groups, repository, query, issue) {
  const key = repository.toLowerCase();
  const group = groups.get(key) ?? { repository, queryMatches: [], matchedIssues: [] };
  group.queryMatches.push({ queryId: query.id, locationHint: query.locationHint ?? null });
  group.matchedIssues.push(issue);
  groups.set(key, group);
}
