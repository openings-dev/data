import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { renderDiscoveryReport } from "./render-discovery-report.mjs";

export async function writeDiscoveryReport({ outputDir, report }) {
  const jsonPath = resolve(outputDir, "report.json");
  const markdownPath = resolve(outputDir, "report.md");
  const suffix = `${process.pid}-${Date.now()}.tmp`;
  const jsonTempPath = `${jsonPath}.${suffix}`;
  const markdownTempPath = `${markdownPath}.${suffix}`;
  const json = `${JSON.stringify(report, null, 2)}\n`;
  const markdown = renderDiscoveryReport(report);

  await mkdir(outputDir, { recursive: true });
  try {
    await Promise.all([
      writeFile(jsonTempPath, json, "utf8"),
      writeFile(markdownTempPath, markdown, "utf8"),
    ]);
    await rename(jsonTempPath, jsonPath);
    await rename(markdownTempPath, markdownPath);
  } catch (error) {
    await Promise.all([
      rm(jsonTempPath, { force: true }),
      rm(markdownTempPath, { force: true }),
    ]);
    throw error;
  }

  return { jsonPath, markdownPath };
}
