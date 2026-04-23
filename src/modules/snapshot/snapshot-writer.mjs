import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

/**
 * @param {string} filePath
 */
async function readJsonFile(filePath) {
  const content = await readFile(filePath, "utf8");
  return JSON.parse(content);
}

/**
 * @param {string} filePath
 */
export async function readPreviousSnapshot(filePath) {
  try {
    return await readJsonFile(filePath);
  } catch {
    return null;
  }
}

/**
 * @param {string} filePath
 * @param {unknown} snapshot
 */
export async function writeSnapshot(filePath, snapshot) {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
}

