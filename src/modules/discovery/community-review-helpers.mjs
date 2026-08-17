const LOCATION_FIELDS = ["country", "countryCode", "region", "locale", "scope"];

export function candidateMap(report) {
  if (!report || report.status !== "complete") {
    throw new Error("Community reviews require a complete discovery report.");
  }
  const candidates = [...(report.candidates ?? []), ...(report.lowConfidence ?? [])];
  return new Map(candidates.map((item) => [item.repository.toLowerCase(), item]));
}

export function validateApproval(review, candidate) {
  for (const field of LOCATION_FIELDS) {
    if (typeof review[field] !== "string" || review[field].trim().length === 0) {
      throw new Error(`Approved review requires ${field}: ${review.repository}`);
    }
  }
  if (candidate.confidence === "low" && review.confirmEvidence !== true) {
    throw new Error(`Low-confidence approval requires confirmEvidence: ${review.repository}`);
  }
  let evidence;
  try { evidence = new URL(review.evidenceUrl); } catch { /* handled below */ }
  const issuePath = `/${candidate.repository.toLowerCase()}/issues/`;
  if (
    evidence?.protocol !== "https:"
    || evidence.hostname !== "github.com"
    || !evidence.pathname.toLowerCase().startsWith(issuePath)
    || !candidate.evidence.some((item) => item.url === evidence.href)
  ) {
    throw new Error(`Approval requires report-backed GitHub Issue evidence: ${review.repository}`);
  }
}

export function toCatalogEntry(review, candidate) {
  const [owner, name] = candidate.repository.split("/");
  return {
    repository: candidate.repository, owner, name, url: candidate.url,
    country: review.country, countryCode: review.countryCode,
    region: review.region, locale: review.locale, scope: review.scope,
    source: "github-discovery",
    queryHints: [...new Set(candidate.matchedQueryIds)].sort(),
  };
}

export function toDecision(review, today) {
  return {
    repository: review.repository,
    decision: review.decision,
    decidedAt: today,
    reason: review.reason,
    reviewAfter: review.decision === "snoozed" ? review.reviewAfter : null,
  };
}
