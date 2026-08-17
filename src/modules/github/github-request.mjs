import { RateLimitError } from "../../shared/errors/rate-limit-error.mjs";

function buildHeaders(token) {
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "openings-community-discovery",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function isRateLimited(response) {
  if (response.status === 429) return true;
  if (response.status !== 403) return false;
  return (
    response.headers.get("x-ratelimit-remaining") === "0"
    || response.headers.has("retry-after")
  );
}

/**
 * @param {{url: URL; token: string; logger: ReturnType<import("../observability/logger.mjs").createLogger>; allowNotFound?: boolean}} options
 */
export async function requestGitHubJson(options) {
  const { url, token, logger, allowNotFound = false } = options;
  const startedAt = Date.now();
  const response = await fetch(url, {
    headers: buildHeaders(token),
    cache: "no-store",
  });

  if (allowNotFound && (response.status === 404 || response.status === 451)) {
    logger.warn("github-resource-unavailable", { path: url.pathname, status: response.status });
    return null;
  }

  if (isRateLimited(response)) {
    throw RateLimitError.fromResponse(response);
  }

  if (!response.ok) {
    throw new Error(`GitHub request failed: GET ${url.pathname} (${response.status}).`);
  }

  logger.info("github-request-ok", {
    path: url.pathname,
    status: response.status,
    duration_ms: Date.now() - startedAt,
  });

  return {
    payload: await response.json(),
    headers: response.headers,
    status: response.status,
  };
}
