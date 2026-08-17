import { readFile } from "node:fs/promises";

const DECISIONS = new Set(["approved", "rejected", "snoozed"]);
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/u;

function assertObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Invalid ${label}: expected object.`);
  }
}

function assertText(value, label) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Invalid ${label}: expected non-empty string.`);
  }
}

function assertPositiveInt(value, label) {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`Invalid ${label}: expected a positive integer.`);
  }
}

async function readJson(filePath) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    throw new Error(`Could not read discovery contract ${filePath}.`, { cause: error });
  }
}

export async function readDiscoveryQueries(filePath) {
  const value = await readJson(filePath);
  assertObject(value, "discovery queries");
  if (value.schemaVersion !== 1 || !Array.isArray(value.queries)) {
    throw new Error("Invalid discovery queries: expected schemaVersion 1 and queries array.");
  }
  assertPositiveInt(value.qualifiedLimit, "qualifiedLimit");
  assertPositiveInt(value.lowConfidenceLimit, "lowConfidenceLimit");
  const ids = new Set();
  for (const query of value.queries) {
    assertObject(query, "discovery query");
    assertText(query.id, "query id");
    assertText(query.language, "query language");
    assertText(query.query, "query text");
    if (ids.has(query.id)) throw new Error(`Duplicate discovery query id: ${query.id}`);
    ids.add(query.id);
    if (query.locationHint !== undefined) {
      assertObject(query.locationHint, "query locationHint");
      for (const field of ["country", "countryCode", "region", "locale"]) {
        assertText(query.locationHint[field], `query locationHint ${field}`);
      }
    }
  }
  return value;
}

export async function readDiscoveryDecisions(filePath) {
  const value = await readJson(filePath);
  assertObject(value, "discovery decisions");
  if (value.schemaVersion !== 1 || !Array.isArray(value.decisions)) {
    throw new Error("Invalid discovery decisions: expected schemaVersion 1 and decisions array.");
  }
  const repositories = new Set();
  for (const item of value.decisions) {
    assertObject(item, "discovery decision");
    assertText(item.repository, "decision repository");
    assertText(item.reason, "decision reason");
    if (!DECISIONS.has(item.decision) || !ISO_DATE.test(item.decidedAt)) {
      throw new Error(`Invalid discovery decision for ${item.repository}.`);
    }
    if (item.decision === "snoozed" && !ISO_DATE.test(item.reviewAfter ?? "")) {
      throw new Error(`Snoozed decision requires reviewAfter: ${item.repository}`);
    }
    const key = item.repository.toLowerCase();
    if (repositories.has(key)) throw new Error(`Duplicate discovery decision: ${item.repository}`);
    repositories.add(key);
  }
  return value;
}
