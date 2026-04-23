import { normalizeText } from "../../shared/utils/text.mjs";

function resolveLabelName(label) {
  if (typeof label === "string") {
    return label;
  }

  return label?.name ?? "";
}

/**
 * @param {{labels?: unknown[]; title?: string; body?: string | null}} issue
 */
export function extractTags(issue) {
  const labels = (Array.isArray(issue.labels) ? issue.labels : [])
    .map(resolveLabelName)
    .map((name) => normalizeText(name).toLowerCase())
    .filter(Boolean);

  if (labels.length > 0) {
    return [...new Set(labels)].slice(0, 8);
  }

  const dictionary = [
    "remote",
    "hybrid",
    "onsite",
    "frontend",
    "backend",
    "fullstack",
    "react",
    "nextjs",
    "typescript",
    "node",
    "python",
    "golang",
    "java",
    "senior",
    "junior",
    "pleno",
    "staff",
    "principal",
    "devops",
    "data",
    "design",
  ];

  const text = normalizeText(`${issue.title ?? ""} ${issue.body ?? ""}`).toLowerCase();
  return dictionary.filter((tag) => text.includes(tag)).slice(0, 8);
}

