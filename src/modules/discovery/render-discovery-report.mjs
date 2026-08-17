function escapeMarkdown(value) {
  return String(value ?? "—").replaceAll("|", "\\|").replaceAll("\n", " ");
}

function locationLabel(candidate) {
  const location = candidate.suggestedLocation;
  return location ? `${location.country} / ${location.region}` : "Needs review";
}

function candidateTable(candidates) {
  const lines = [
    "| Repository | Location | Confidence | Open jobs | Latest activity |",
    "| --- | --- | --- | ---: | --- |",
  ];
  for (const item of candidates) {
    lines.push(`| [${escapeMarkdown(item.repository)}](${item.url}) | ${escapeMarkdown(locationLabel(item))} | ${item.confidence} | ${item.openJobsFound} | ${item.lastActivityAt ?? "—"} |`);
  }
  return lines.join("\n");
}

function candidateChecklist(candidate) {
  const lines = [
    `- [ ] \`${candidate.repository}\` — ${candidate.confidence} confidence, ${candidate.openJobsFound} open job(s) found`,
  ];
  for (const evidence of candidate.evidence) {
    lines.push(`  - Evidence: [#${evidence.number} — ${escapeMarkdown(evidence.title)}](${evidence.url})`);
  }
  lines.push(`  - Suggested location: ${escapeMarkdown(locationLabel(candidate))} (confirm before approval)`);
  lines.push(`  - Why: ${candidate.reasons.map(escapeMarkdown).join(", ")}`);
  return lines.join("\n");
}

function summaryLines(report) {
  const summary = report.summary;
  return [
    `- Status: **${report.status}**`,
    `- Generated: ${report.generatedAt}`,
    `- Queries: ${summary.queriesCompleted}/${summary.queriesRequested}`,
    `- Repositories matched: ${summary.repositoriesMatched}`,
    `- Repositories evaluated: ${summary.repositoriesEvaluated}`,
    `- Qualified candidates: ${summary.qualifiedCandidates}`,
    `- Low-confidence candidates: ${summary.lowConfidenceCandidates}`,
    `- Catalog duplicates: ${summary.catalogDuplicates}`,
    `- Reviewed duplicates: ${summary.reviewedDuplicates}`,
    `- Search quota remaining: ${report.rateLimit.remaining ?? "unknown"}`,
  ];
}

export function renderDiscoveryReport(report) {
  const lines = ["# Community discovery inbox", "", ...summaryLines(report), ""];
  if (report.status === "partial") {
    lines.push("> **Partial run:** one or more GitHub queries failed. Do not treat this report as complete.", "");
  }
  lines.push("## Qualified candidates", "");
  lines.push(report.candidates.length > 0 ? candidateTable(report.candidates) : "No qualified candidates found.", "");
  for (const candidate of report.candidates) {
    lines.push(candidateChecklist(candidate), "");
  }
  lines.push("## Low-confidence appendix", "");
  lines.push(report.lowConfidence.length > 0 ? candidateTable(report.lowConfidence) : "No low-confidence candidates.", "");
  for (const candidate of report.lowConfidence) {
    lines.push(candidateChecklist(candidate), "");
  }
  lines.push("## Failures", "");
  if (report.failures.length === 0) {
    lines.push("No failures.", "");
  } else {
    for (const failure of report.failures) {
      const subject = failure.queryId ?? failure.repository ?? "unknown";
      lines.push(`- ${failure.stage}: ${escapeMarkdown(subject)} — ${escapeMarkdown(failure.error)}`);
    }
    lines.push("");
  }
  return `${lines.join("\n").trim()}\n`;
}
