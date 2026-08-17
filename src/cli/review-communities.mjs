import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { loadDiscoveryConfig } from "../config/discovery-env.mjs";
import { readRepositoryCatalog } from "../modules/catalog/catalog-repository.mjs";
import { applyCommunityReviews } from "../modules/discovery/apply-community-reviews.mjs";
import { readCommunityReviews } from "../modules/discovery/read-community-reviews.mjs";
import { readDiscoveryDecisions } from "../modules/discovery/read-discovery-contract.mjs";
import { writeJsonIfChanged } from "../modules/storage/write-json-if-changed.mjs";

function requiredPath(values, name) {
  const value = values[name];
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Missing required --${name} path.`);
  }
  return resolve(value);
}

function printResult(result) {
  const mode = result.apply ? "apply" : "preview";
  console.log(`community-review-${mode}`);
  console.log(`approved: ${result.counts.approved}`);
  console.log(`rejected: ${result.counts.rejected}`);
  console.log(`snoozed: ${result.counts.snoozed}`);
  console.log(`catalog additions: ${result.counts.catalogAdded}`);
  for (const repository of result.addedRepositories) console.log(`+ ${repository}`);
}

try {
  const { values } = parseArgs({
    options: {
      report: { type: "string" },
      reviews: { type: "string" },
      apply: { type: "boolean", default: false },
    },
  });
  const config = loadDiscoveryConfig();
  const reportPath = requiredPath(values, "report");
  const reviewsPath = requiredPath(values, "reviews");
  const [report, reviews, catalog, decisions] = await Promise.all([
    readFile(reportPath, "utf8").then(JSON.parse),
    readCommunityReviews(reviewsPath),
    readRepositoryCatalog(config.paths.repositoriesFile),
    readDiscoveryDecisions(config.paths.decisionsFile),
  ]);
  const result = applyCommunityReviews({ report, reviews, catalog, decisions, apply: values.apply });
  if (values.apply) {
    await Promise.all([
      writeJsonIfChanged(config.paths.repositoriesFile, result.catalog),
      writeJsonIfChanged(config.paths.decisionsFile, result.decisions),
    ]);
  }
  printResult(result);
  if (values.apply) console.log("Inspect the diff, then rebuild the snapshot explicitly.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
