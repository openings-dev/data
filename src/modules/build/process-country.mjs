import { RateLimitError } from "../../shared/errors/rate-limit-error.mjs";
import { sleep } from "../../shared/utils/time.mjs";
import { processRepository } from "./process-repository.mjs";

/**
 * @param {{countryGroup: {country: string; countryCode: string; region: string; repositories: Array<Record<string, any>>}; githubClient: ReturnType<import("../github/github-client.mjs").createGitHubClient>; requestDelayMs: number; logger: ReturnType<import("../observability/logger.mjs").createLogger>;}} params
 */
export async function processCountry(params) {
  const { countryGroup, githubClient, requestDelayMs, logger } = params;
  const byRepository = [];
  const failedRepositories = [];

  for (let index = 0; index < countryGroup.repositories.length; index += 1) {
    const repository = countryGroup.repositories[index];

    try {
      const result = await processRepository({ repository, githubClient });
      byRepository.push(result);
      logger.info("repository-processed", {
        country_code: countryGroup.countryCode,
        repository: result.repository,
        opportunities: result.items.length,
      });
    } catch (error) {
      if (error instanceof RateLimitError) {
        throw error;
      }

      const message = error instanceof Error ? error.message : "Unknown error";
      failedRepositories.push({ repository: repository.repository, error: message });
      logger.warn("repository-failed", {
        country_code: countryGroup.countryCode,
        repository: repository.repository,
        error: message,
      });
    }

    if (requestDelayMs > 0 && index < countryGroup.repositories.length - 1) {
      await sleep(requestDelayMs);
    }
  }

  return {
    country: countryGroup.country,
    countryCode: countryGroup.countryCode,
    region: countryGroup.region,
    repositories: byRepository,
    failedRepositories,
  };
}
