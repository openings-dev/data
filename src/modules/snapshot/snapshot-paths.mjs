import { resolve } from "node:path";
import { repositoryToFileName } from "../../shared/utils/repository-file-name.mjs";

/**
 * @param {string} countryCode
 */
export function countrySlug(countryCode) {
  return String(countryCode ?? "").trim().toLowerCase();
}

/**
 * @param {string} countryCode
 */
export function countryIndexRelativePath(countryCode) {
  return `countries/${countrySlug(countryCode)}/index.json`;
}

/**
 * @param {string} countryCode
 * @param {string} repository
 */
export function repositoryShardRelativePath(countryCode, repository) {
  return `countries/${countrySlug(countryCode)}/repositories/${repositoryToFileName(repository)}`;
}

/**
 * @param {string} snapshotRootDir
 * @param {string} relativePath
 */
export function toSnapshotPath(snapshotRootDir, relativePath) {
  return resolve(snapshotRootDir, relativePath);
}
