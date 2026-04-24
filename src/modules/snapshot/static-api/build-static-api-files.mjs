import { sha256Json } from "../../../shared/utils/hash.mjs";
import { sortOpportunitiesByDate } from "../../opportunities/opportunity-mapper.mjs";
import { buildFacetIndex, buildFacetSummary } from "./facet-index.mjs";
import { buildJobBuckets } from "./jobs.mjs";
import { withPublicOpportunityId } from "./opportunity-id.mjs";
import { buildItemPages, buildPageLookup, STATIC_API_PAGE_SIZE } from "./pages.mjs";
import { staticApiFacetIndexPath, staticApiJobIdsPath, staticApiManifestPath, staticApiOrderPath, staticApiPageLookupPath, staticApiSearchIndexPath, toFile } from "./paths.mjs";
import { buildSearchIndex } from "./search-text.mjs";

function collectRepositoryItems(countrySnapshots) {
  return countrySnapshots.flatMap((country) =>
    country.repositoryShards.flatMap((shard) => shard.payload.items),
  );
}

function normalizeOpenItems(countrySnapshots) {
  const itemsById = new Map();
  for (const item of collectRepositoryItems(countrySnapshots)) {
    const normalized = withPublicOpportunityId(item);
    if (normalized.issueState !== "open") continue;
    itemsById.set(normalized.id, normalized);
  }
  return sortOpportunitiesByDate([...itemsById.values()]);
}

function manifestPayload(params) {
  const { generatedAt, items, pages, facetSummary, facetIndex } = params;
  const jobIds = items.map((item) => item.id);
  return {
    generatedAt,
    schemaVersion: 3,
    pageSize: STATIC_API_PAGE_SIZE,
    dataHash: sha256Json({ jobIds, facetSummary }),
    totals: {
      openOpportunities: items.length,
      pages: pages.length,
      repositories: Object.keys(facetIndex.dimensions.repositories).length,
      countries: Object.keys(facetIndex.dimensions.countries).length,
      regions: Object.keys(facetIndex.dimensions.regions).length,
    },
    files: {
      facets: staticApiFacetIndexPath(),
      pageLookup: staticApiPageLookupPath(),
      search: staticApiSearchIndexPath(),
      jobIds: staticApiJobIdsPath(),
      order: staticApiOrderPath(),
    },
    facets: facetSummary,
    pages: pages.map((page) => ({
      page: page.page,
      file: page.file,
      count: page.payload.items.length,
    })),
  };
}

export function buildStaticApiFiles(params) {
  const { snapshotRootDir, generatedAt, countrySnapshots } = params;
  const items = normalizeOpenItems(countrySnapshots);
  const pages = buildItemPages(items, generatedAt);
  const pageLookup = buildPageLookup(pages);
  const facetIndex = buildFacetIndex(items);
  const facetSummary = buildFacetSummary(facetIndex);
  const files = pages.map((page) =>
    toFile(snapshotRootDir, page.file, page.payload),
  );
  files.push(toFile(snapshotRootDir, staticApiPageLookupPath(), { generatedAt, pageLookup }));
  files.push(toFile(snapshotRootDir, staticApiFacetIndexPath(), { generatedAt, ...facetIndex }));
  files.push(toFile(snapshotRootDir, staticApiSearchIndexPath(), {
    generatedAt,
    items: buildSearchIndex(items),
  }));
  files.push(toFile(snapshotRootDir, staticApiJobIdsPath(), {
    generatedAt,
    ids: items.map((item) => item.id),
  }));
  files.push(toFile(snapshotRootDir, staticApiOrderPath(), {
    generatedAt,
    ids: items.map((item) => item.id),
  }));
  files.push(...buildJobBuckets(items, generatedAt).map((bucket) =>
    toFile(snapshotRootDir, bucket.file, bucket.payload),
  ));
  files.push(toFile(snapshotRootDir, staticApiManifestPath(), manifestPayload({
    generatedAt,
    items,
    pages,
    facetSummary,
    facetIndex,
  })));
  return files;
}
