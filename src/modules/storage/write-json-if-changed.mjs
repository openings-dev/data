import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

function omitComparisonFields(value, fields) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return value;
  }

  const comparable = { ...value };

  for (const field of fields) {
    delete comparable[field];
  }

  return comparable;
}

function hasEquivalentJson(currentContent, nextValue, ignoredComparisonFields) {
  if (ignoredComparisonFields.length === 0) {
    return false;
  }

  try {
    const currentValue = JSON.parse(currentContent);
    return JSON.stringify(omitComparisonFields(currentValue, ignoredComparisonFields))
      === JSON.stringify(omitComparisonFields(nextValue, ignoredComparisonFields));
  } catch {
    return false;
  }
}

/**
 * @param {string} filePath
 * @param {unknown} value
 * @param {{ignoredComparisonFields?: Array<string>}} [options]
 */
export async function writeJsonIfChanged(filePath, value, options = {}) {
  const ignoredComparisonFields = options.ignoredComparisonFields ?? [];
  const nextContent = `${JSON.stringify(value, null, 2)}\n`;

  try {
    const currentContent = await readFile(filePath, "utf8");

    if (
      currentContent === nextContent
      || hasEquivalentJson(currentContent, value, ignoredComparisonFields)
    ) {
      return false;
    }
  } catch {
    // file does not exist, will be written
  }

  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, nextContent, "utf8");
  return true;
}
