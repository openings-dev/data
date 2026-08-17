import { runCommunityDiscovery } from "../app/run-community-discovery.mjs";
import { RateLimitError } from "../shared/errors/rate-limit-error.mjs";

try {
  const result = await runCommunityDiscovery();
  console.log(
    `community-discovery-${result.report.status}: ${result.report.summary.qualifiedCandidates} qualified candidates`,
  );
} catch (error) {
  if (error instanceof RateLimitError) {
    console.error(error.message);
    if (error.resetAt) console.error(`Rate limit resets at: ${error.resetAt}`);
  } else {
    console.error(error);
  }
  process.exitCode = 1;
}
