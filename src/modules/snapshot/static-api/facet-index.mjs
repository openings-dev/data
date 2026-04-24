import { canonicalTagValue } from "./tag-normalization.mjs";

function emptyDimensions() {
  return {
    repositories: {},
    regions: {},
    countries: {},
    tags: {},
    authors: {},
  };
}

function pushId(target, key, id) {
  if (!key) return;
  target[key] = target[key] ?? [];
  target[key].push(id);
}

function sortedCountRecord(values) {
  return Object.fromEntries(
    Object.entries(values)
      .map(([key, ids]) => [key, ids.length])
      .sort(([left], [right]) => left.localeCompare(right)),
  );
}

export function buildFacetIndex(items) {
  const dimensions = emptyDimensions();
  const authorLabels = {};
  const tagLabels = {};

  for (const item of items) {
    pushId(dimensions.repositories, item.repository, item.id);
    pushId(dimensions.regions, item.region, item.id);
    pushId(dimensions.countries, item.country, item.id);
    pushId(dimensions.authors, item.author?.handle, item.id);

    if (item.author?.handle) {
      authorLabels[item.author.handle] = item.author.name || item.author.handle;
    }

    for (const rawTag of item.tags ?? []) {
      const tag = canonicalTagValue(rawTag);
      if (!tag) continue;
      pushId(dimensions.tags, tag, item.id);
      tagLabels[tag] = tagLabels[tag] ?? rawTag;
    }
  }

  return { dimensions, labels: { authors: authorLabels, tags: tagLabels } };
}

export function buildFacetSummary(facetIndex) {
  return {
    repositories: sortedCountRecord(facetIndex.dimensions.repositories),
    regions: sortedCountRecord(facetIndex.dimensions.regions),
    countries: sortedCountRecord(facetIndex.dimensions.countries),
    tags: sortedCountRecord(facetIndex.dimensions.tags),
    authors: sortedCountRecord(facetIndex.dimensions.authors),
    authorLabels: facetIndex.labels.authors,
  };
}
