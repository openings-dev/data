const NON_ALPHANUMERIC = /[^a-z0-9]+/g;

/**
 * @param {string} repositoryFullName
 */
export function repositoryToFileName(repositoryFullName) {
  const normalized = String(repositoryFullName ?? "")
    .trim()
    .toLowerCase()
    .replace("/", "__")
    .replace(NON_ALPHANUMERIC, "-")
    .replace(/^-+|-+$/g, "");

  if (!normalized) {
    throw new Error(`Invalid repository name: ${repositoryFullName}`);
  }

  return `${normalized}.json`;
}
