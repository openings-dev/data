import { readFile } from "node:fs/promises";

/**
 * @param {string} filePath
 */
export async function readJsonIfExists(filePath) {
  try {
    const content = await readFile(filePath, "utf8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}
