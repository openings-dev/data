import { resolve } from "node:path";
import {
  readDiscoveryDecisions,
  readDiscoveryQueries,
} from "../discovery/read-discovery-contract.mjs";

export async function validateDiscoveryContract(rootDir) {
  const discoveryDir = resolve(rootDir, "src", "modules", "discovery");
  const queries = await readDiscoveryQueries(resolve(discoveryDir, "discovery-queries.json"));
  const decisions = await readDiscoveryDecisions(
    resolve(discoveryDir, "discovery-decisions.json"),
  );

  console.log(
    `discovery-contract-ok: ${queries.queries.length} queries, ${decisions.decisions.length} decisions`,
  );
}
