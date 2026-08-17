import { readFile } from "node:fs/promises";

const DECISIONS = new Set(["approved", "rejected", "snoozed"]);
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/u;

function assertText(value, label) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Invalid review ${label}: expected non-empty string.`);
  }
}

function validateReview(item) {
  if (!item || typeof item !== "object" || Array.isArray(item)) {
    throw new Error("Invalid community review: expected object.");
  }
  assertText(item.repository, "repository");
  assertText(item.reason, "reason");
  if (!DECISIONS.has(item.decision)) {
    throw new Error(`Invalid review decision for ${item.repository}.`);
  }
  if (item.decision === "snoozed" && !ISO_DATE.test(item.reviewAfter ?? "")) {
    throw new Error(`Snoozed review requires reviewAfter: ${item.repository}`);
  }
}

export async function readCommunityReviews(filePath) {
  const value = JSON.parse(await readFile(filePath, "utf8"));
  if (!value || typeof value !== "object" || !Array.isArray(value.decisions)) {
    throw new Error("Invalid community reviews: expected decisions array.");
  }
  const seen = new Set();
  for (const item of value.decisions) {
    validateReview(item);
    const key = item.repository.toLowerCase();
    if (seen.has(key)) throw new Error(`Duplicate community review: ${item.repository}`);
    seen.add(key);
  }
  return value;
}
