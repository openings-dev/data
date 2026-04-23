import { resolve } from "node:path";
import { clampInt } from "../shared/utils/number.mjs";

const DEFAULT_MAX_ISSUES_PER_REPOSITORY = 30;
const DEFAULT_MAX_REPOSITORIES = 0;
const DEFAULT_REQUEST_DELAY_MS = 120;

export function loadBuildConfig() {
  const rootDir = process.cwd();

  return {
    paths: {
      rootDir,
      repositoriesFile: resolve(rootDir, "src", "modules", "catalog", "repositories.json"),
      snapshotFile: resolve(rootDir, "snapshots", "opportunities.json"),
    },
    github: {
      token: process.env.OPENINGS_GITHUB_TOKEN || process.env.GITHUB_TOKEN || "",
    },
    limits: {
      maxIssuesPerRepository: clampInt(
        process.env.MAX_ISSUES_PER_REPOSITORY,
        DEFAULT_MAX_ISSUES_PER_REPOSITORY,
        1,
        100,
      ),
      maxRepositories: clampInt(process.env.MAX_REPOSITORIES, DEFAULT_MAX_REPOSITORIES, 0, 50000),
      requestDelayMs: clampInt(process.env.REQUEST_DELAY_MS, DEFAULT_REQUEST_DELAY_MS, 0, 10000),
    },
  };
}
