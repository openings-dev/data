import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

/**
 * @param {string} filePath
 * @param {unknown} value
 */
export async function writeJsonIfChanged(filePath, value) {
  const nextContent = `${JSON.stringify(value, null, 2)}\n`;

  try {
    const currentContent = await readFile(filePath, "utf8");

    if (currentContent === nextContent) {
      return false;
    }
  } catch {
    // file does not exist, will be written
  }

  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, nextContent, "utf8");
  return true;
}
