import {
  APPLICATION_SIGNALS,
  EMPLOYMENT_DETAIL_SIGNALS,
  JOB_LABEL_SIGNALS,
  NEGATIVE_TITLE_SIGNALS,
  STRONG_TITLE_SIGNALS,
} from "./issue-signals.mjs";

function matchesAny(value, signals) {
  return signals.some((signal) => signal.test(value));
}

function normalizeLabels(labels) {
  if (!Array.isArray(labels)) return [];
  return labels
    .map((label) => (typeof label === "string" ? label : label?.name))
    .filter((label) => typeof label === "string" && label.trim().length > 0)
    .map((label) => label.trim());
}

/**
 * @param {Record<string, any>} issue
 */
export function classifyIssue(issue) {
  const title = typeof issue?.title === "string" ? issue.title.trim() : "";
  const body = typeof issue?.body === "string" ? issue.body : "";
  const url = typeof issue?.html_url === "string" ? issue.html_url : "";
  const labels = normalizeLabels(issue?.labels);

  if (issue?.pull_request || issue?.state !== "open" || !title || !url) {
    return { eligible: false, points: 0, reasons: [], evidence: null };
  }

  const strongLabel = labels.some((label) => matchesAny(label, JOB_LABEL_SIGNALS));
  const strongTitle = matchesAny(title, STRONG_TITLE_SIGNALS);
  const applicationEvidence = matchesAny(body, APPLICATION_SIGNALS);
  const employmentDetails = matchesAny(body, EMPLOYMENT_DETAIL_SIGNALS);
  const negativeTitle = matchesAny(title, NEGATIVE_TITLE_SIGNALS);
  if (negativeTitle) {
    return { eligible: false, points: 0, reasons: ["negative-title"], evidence: null };
  }

  const reasons = [];
  let points = 0;
  if (strongLabel) { points += 50; reasons.push("job-label"); }
  if (strongTitle) { points += 35; reasons.push("job-title"); }
  if (applicationEvidence) { points += 15; reasons.push("application-details"); }
  if (employmentDetails) { points += 15; reasons.push("employment-details"); }

  const eligible = applicationEvidence && employmentDetails && (strongTitle || strongLabel);

  return {
    eligible,
    points,
    reasons,
    evidence: eligible ? {
      number: issue.number,
      title,
      url,
      updatedAt: issue.updated_at ?? null,
      labels,
    } : null,
  };
}
