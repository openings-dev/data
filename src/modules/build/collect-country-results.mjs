import { RateLimitError } from "../../shared/errors/rate-limit-error.mjs";
import { groupRepositoriesByCountry } from "./group-repositories-by-country.mjs";
import { processCountry } from "./process-country.mjs";

/**
 * @param {{repositories: Array<Record<string, any>>; githubClient: ReturnType<import("../github/github-client.mjs").createGitHubClient>; requestDelayMs: number; logger: ReturnType<import("../observability/logger.mjs").createLogger>;}} params
 */
export async function collectCountryResults(params) {
  const { repositories, githubClient, requestDelayMs, logger } = params;
  const countryGroups = groupRepositoriesByCountry(repositories);
  const countries = [];
  const failedRepositories = [];
  let repositoriesScanned = 0;

  for (let index = 0; index < countryGroups.length; index += 1) {
    const countryGroup = countryGroups[index];
    const countryLogger = logger.child({
      country_code: countryGroup.countryCode,
      progress: `${index + 1}/${countryGroups.length}`,
    });

    try {
      const countryResult = await processCountry({
        countryGroup,
        githubClient,
        requestDelayMs,
        logger: countryLogger,
      });

      countries.push(countryResult);
      failedRepositories.push(...countryResult.failedRepositories);
      repositoriesScanned += countryResult.repositories.length;
    } catch (error) {
      if (error instanceof RateLimitError) {
        logger.error("build-aborted-rate-limit", {
          country_code: countryGroup.countryCode,
          retry_after_seconds: error.retryAfterSeconds,
          reset_at: error.resetAt,
        });
        throw error;
      }

      throw error;
    }
  }

  return {
    countries,
    failedRepositories,
    repositoriesScanned,
  };
}
