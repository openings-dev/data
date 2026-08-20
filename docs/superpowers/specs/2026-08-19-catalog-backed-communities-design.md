# Catalog-backed communities

## Goal

Show every configured source repository on the Openings communities page, including communities with no open opportunities and communities that have never produced a snapshot item.

## Current behavior

The data repository publishes opportunity artifacts, while the frontend derives communities by grouping open snapshot items. This makes a configured repository disappear whenever all of its issues are closed. It also makes a newly configured repository invisible until it produces its first open opportunity.

For example, `Gommunity/vagas` and `rustdevbr/vagas` are configured sources with historical snapshot items, but both currently have zero open opportunities and therefore do not appear on the communities page.

## Data contract

The data pipeline will publish `snapshots/opportunities/api/communities.json`. The artifact belongs to the same generated view as the other static API files and contains:

- `generatedAt`, matching the manifest and other artifacts;
- one entry for every repository in `src/modules/catalog/repositories.json`;
- the repository identifier and URL;
- the configured country, country code, region, locale, and scope;
- the source owner as the stable fallback display name;
- the GitHub owner avatar URL derived without an authenticated API request;
- `opportunitiesCount` and `lastPostedAt`, calculated from currently open opportunities, with `0` and `null` when none are open.

The manifest will reference the communities artifact in `files.communities`. Its data hash will include the community payload so a catalog-only change creates a new coherent artifact view.

Entries will be deterministic and unique by case-insensitive repository identifier. Catalog validation remains responsible for rejecting duplicate sources.

## Frontend behavior

The frontend will load and validate the communities artifact through the existing static-artifact view and recovery mechanism. The communities route will stop deriving its source list from snapshot items.

All configured communities will be displayed. Communities with open opportunities retain their count and recency metadata. Communities with no open opportunities display a zero count and no last-posted date. Existing sorting remains count-first, then recency, then repository identifier, which naturally places zero-opportunity communities after active ones.

Community profile routes remain valid for zero-opportunity communities because lookup uses the published catalog-backed artifact. Opportunity lists on those profiles may be empty.

## Compatibility and rollout

This is an intentional static API schema change. The data pipeline and frontend will be updated together. Existing opportunity artifacts, routes, filtering, and opportunity detail behavior remain unchanged.

The generated snapshot files are rebuilt only after source and consumer changes pass their focused tests. No local fallback dataset or GitHub runtime request will be added to the frontend.

## Testing

Data tests will prove that:

- a catalog repository with no items is present with a zero count;
- a repository with only closed items is present with a zero count;
- an active repository has the correct count and latest timestamp;
- the manifest references the communities artifact and its hash changes with catalog community data.

Frontend validation tests or the existing validation tooling will prove that:

- valid zero-count communities are accepted;
- malformed community entries are rejected;
- the communities loader participates in static-artifact consistency and recovery;
- community listing and lookup include zero-opportunity entries.

Repository validation, frontend linting, the outreach test, and the static frontend build will run before completion.

## Follow-up source expansion

Adding newly discovered repositories is a separate catalog change after this contract ships. Candidates must publish one opportunity per GitHub Issue; README-only job lists and repositories whose issues are used for software maintenance are excluded because they are incompatible with the ingestion model.
