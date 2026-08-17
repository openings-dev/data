import { requestGitHubJson } from "./github-request.mjs";

function repositoryUrl(repository, suffix = "") {
  const [owner, name, ...extra] = String(repository).split("/");
  if (!owner || !name || extra.length > 0) {
    throw new Error(`Invalid repository: ${repository}`);
  }
  return new URL(
    `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}${suffix}`,
  );
}

function headerNumber(headers, name) {
  const value = headers.get(name);
  if (value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function rateLimitFrom(headers) {
  const reset = headerNumber(headers, "x-ratelimit-reset");
  return {
    remaining: headerNumber(headers, "x-ratelimit-remaining"),
    resetAt: reset === null ? null : new Date(reset * 1000).toISOString(),
  };
}

export function createGitHubDiscoveryClient({ token, logger }) {
  const request = (url, options = {}) => requestGitHubJson({
    url,
    token,
    logger,
    ...options,
  });

  return {
    async searchOpenIssues(query, { page = 1, perPage = 50 } = {}) {
      const url = new URL("https://api.github.com/search/issues");
      url.searchParams.set("q", query);
      url.searchParams.set("sort", "updated");
      url.searchParams.set("order", "desc");
      url.searchParams.set("page", String(page));
      url.searchParams.set("per_page", String(perPage));
      const result = await request(url);
      if (!result.payload || !Array.isArray(result.payload.items)) {
        throw new Error("Invalid GitHub Issue search response.");
      }
      return {
        totalCount: Number(result.payload.total_count) || 0,
        items: result.payload.items.filter((item) => !item.pull_request),
        rateLimit: rateLimitFrom(result.headers),
      };
    },

    async fetchRepository(repository) {
      const result = await request(repositoryUrl(repository), { allowNotFound: true });
      if (result === null) return null;
      if (!result.payload || typeof result.payload.full_name !== "string") {
        throw new Error(`Invalid GitHub repository response: ${repository}`);
      }
      return result.payload;
    },

    async fetchOpenIssues(repository, { perPage = 30 } = {}) {
      const url = repositoryUrl(repository, "/issues");
      url.searchParams.set("state", "open");
      url.searchParams.set("sort", "updated");
      url.searchParams.set("direction", "desc");
      url.searchParams.set("per_page", String(perPage));
      const result = await request(url, { allowNotFound: true });
      if (result === null) return [];
      if (!Array.isArray(result.payload)) {
        throw new Error(`Invalid GitHub Issues response: ${repository}`);
      }
      return result.payload.filter((item) => !item.pull_request);
    },
  };
}
