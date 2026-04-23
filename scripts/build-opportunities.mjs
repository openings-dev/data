import { runBuild } from "../src/app/run-build.mjs";
import { RateLimitError } from "../src/shared/errors/rate-limit-error.mjs";

try {
  await runBuild();
} catch (error) {
  if (error instanceof RateLimitError) {
    console.error(error.message);

    if (error.resetAt) {
      console.error(`Rate limit resets at: ${error.resetAt}`);
    }

    if (typeof error.retryAfterSeconds === "number") {
      console.error(`Retry after seconds: ${error.retryAfterSeconds}`);
    }

    process.exit(1);
  }

  console.error(error);
  process.exit(1);
}

