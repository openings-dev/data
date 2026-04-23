import { AppError } from "./app-error.mjs";

function parseResetWindow(response) {
  const retryAfterHeader = response.headers.get("retry-after");

  if (retryAfterHeader) {
    const retryAfterSeconds = Number.parseInt(retryAfterHeader, 10);

    if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
      return {
        retryAfterSeconds,
        resetAt: new Date(Date.now() + retryAfterSeconds * 1000).toISOString(),
      };
    }
  }

  const nowEpoch = Math.floor(Date.now() / 1000);
  const resetEpoch = Number.parseInt(response.headers.get("x-ratelimit-reset") ?? "", 10);

  if (!Number.isFinite(resetEpoch) || resetEpoch <= 0) {
    return {
      retryAfterSeconds: null,
      resetAt: null,
    };
  }

  return {
    retryAfterSeconds: Math.max(0, resetEpoch - nowEpoch),
    resetAt: new Date(resetEpoch * 1000).toISOString(),
  };
}

export class RateLimitError extends AppError {
  /**
   * @param {string} message
   * @param {number | null} retryAfterSeconds
   * @param {string | null} resetAt
   */
  constructor(message, retryAfterSeconds, resetAt) {
    super(message, "GITHUB_RATE_LIMIT_REACHED", {
      retryAfterSeconds,
      resetAt,
    });
    this.name = "RateLimitError";
    this.retryAfterSeconds = retryAfterSeconds;
    this.resetAt = resetAt;
  }

  /**
   * @param {Response} response
   */
  static fromResponse(response) {
    const window = parseResetWindow(response);
    return new RateLimitError(
      "GitHub API rate limit reached.",
      window.retryAfterSeconds,
      window.resetAt,
    );
  }
}

