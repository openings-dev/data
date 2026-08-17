const CONFIDENCE_ORDER = { high: 0, medium: 1, low: 2 };

function countByCountry(repositories) {
  const counts = new Map();
  for (const repository of repositories) {
    const code = String(repository.countryCode ?? "").toUpperCase();
    if (code) counts.set(code, (counts.get(code) ?? 0) + 1);
  }
  return counts;
}

function timestamp(value) {
  const parsed = Date.parse(value ?? "");
  return Number.isFinite(parsed) ? parsed : 0;
}

function compareCandidates(left, right) {
  const confidence = CONFIDENCE_ORDER[left.confidence] - CONFIDENCE_ORDER[right.confidence];
  if (confidence !== 0) return confidence;
  if (left.balanceScore !== right.balanceScore) return right.balanceScore - left.balanceScore;
  const activity = timestamp(right.lastActivityAt) - timestamp(left.lastActivityAt);
  if (activity !== 0) return activity;
  return left.repository.localeCompare(right.repository);
}

export function rankCandidates(options) {
  const {
    candidates,
    catalogRepositories,
    qualifiedLimit,
    lowConfidenceLimit,
  } = options;
  const countryCounts = countByCountry(catalogRepositories);
  const ranked = candidates.map((candidate) => {
    const code = candidate.suggestedLocation?.countryCode;
    const existingCountryCount = code ? (countryCounts.get(code) ?? 0) : 20;
    const balanceScore = (
      candidate.confidencePoints
      + Math.min(candidate.openJobsFound * 5, 20)
      - Math.min(existingCountryCount * 2, 40)
    );
    return { ...candidate, balanceScore, existingCountryCount };
  }).sort(compareCandidates);

  return {
    candidates: ranked
      .filter((candidate) => candidate.confidence !== "low")
      .slice(0, qualifiedLimit),
    lowConfidence: ranked
      .filter((candidate) => candidate.confidence === "low")
      .slice(0, lowConfidenceLimit),
  };
}
