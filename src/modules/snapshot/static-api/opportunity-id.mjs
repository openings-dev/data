import { sha256Json } from "../../../shared/utils/hash.mjs";

const PUBLIC_ID_PREFIX = "gh_";

function stringOrNull(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function sourceKeyFromOpportunity(item) {
  const existingSourceId = stringOrNull(item.sourceId);

  if (existingSourceId) {
    return existingSourceId;
  }

  const currentId = stringOrNull(item.id);

  if (currentId && !currentId.startsWith(PUBLIC_ID_PREFIX)) {
    return currentId;
  }

  return [
    stringOrNull(item.sourceType) ?? "github-issue",
    stringOrNull(item.repository) ?? "unknown",
    stringOrNull(item.url) ?? currentId ?? "unknown",
  ].join("#");
}

export function toPublicOpportunityId(item) {
  const currentId = stringOrNull(item.id);
  const existingSourceId = stringOrNull(item.sourceId);

  if (currentId?.startsWith(PUBLIC_ID_PREFIX) && !existingSourceId) {
    return currentId;
  }

  const sourceKey = sourceKeyFromOpportunity(item);
  const githubIssueMatch = sourceKey.match(/^(.+)#(\d+)$/);

  if (githubIssueMatch) {
    return `${PUBLIC_ID_PREFIX}${sha256Json({
      source: "github-issue",
      repository: githubIssueMatch[1],
      number: Number(githubIssueMatch[2]),
    }).slice(0, 24)}`;
  }

  return `${PUBLIC_ID_PREFIX}${sha256Json({
    source: "opportunity",
    key: sourceKey,
  }).slice(0, 24)}`;
}

export function withPublicOpportunityId(item) {
  const id = toPublicOpportunityId(item);
  const sourceId = sourceKeyFromOpportunity(item);

  return {
    ...item,
    id,
    sourceId,
  };
}
