import { staticApiJobBucketPath } from "./paths.mjs";

export function buildJobBuckets(items, generatedAt) {
  const buckets = new Map();

  for (const item of items) {
    const file = staticApiJobBucketPath(item.id);
    const bucket = buckets.get(file) ?? { generatedAt, items: {} };
    bucket.items[item.id] = item;
    buckets.set(file, bucket);
  }

  return [...buckets.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([file, payload]) => ({ file, payload }));
}
