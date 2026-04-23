import { createHash } from "node:crypto";

/**
 * @param {unknown} payload
 */
export function sha256Json(payload) {
  const hash = createHash("sha256");
  hash.update(JSON.stringify(payload));
  return hash.digest("hex");
}

