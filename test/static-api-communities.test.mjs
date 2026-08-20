import assert from "node:assert/strict";
import test from "node:test";

import { buildCommunities } from "../src/modules/snapshot/static-api/communities.mjs";

const repositories = [
  {
    repository: "zero/jobs",
    owner: "zero",
    name: "jobs",
    url: "https://github.com/zero/jobs",
    country: "Global",
    countryCode: "GLOBAL",
    region: "Global",
    locale: "en",
    scope: "global",
  },
  {
    repository: "active/jobs",
    owner: "active",
    name: "jobs",
    url: "https://github.com/active/jobs",
    country: "Brazil",
    countryCode: "BR",
    region: "South America",
    locale: "pt-BR",
    scope: "national",
  },
  {
    repository: "closed/jobs",
    owner: "closed",
    name: "jobs",
    url: "https://github.com/closed/jobs",
    country: "Mexico",
    countryCode: "MX",
    region: "North America",
    locale: "es-MX",
    scope: "national",
  },
];

const items = [
  {
    repository: "closed/jobs",
    issueState: "closed",
    createdAt: "2026-01-01T00:00:00.000Z",
    community: { name: "Closed Jobs", avatarUrl: "https://example.com/closed.png" },
  },
  {
    repository: "active/jobs",
    issueState: "open",
    createdAt: "2026-02-01T00:00:00.000Z",
    community: { name: "Active Jobs", avatarUrl: "https://example.com/active.png" },
  },
  {
    repository: "active/jobs",
    issueState: "open",
    createdAt: "2026-03-01T00:00:00.000Z",
    community: { name: "Active Jobs", avatarUrl: "https://example.com/active.png" },
  },
];

test("buildCommunities includes inactive catalog sources and open opportunity metadata", () => {
  assert.deepEqual(buildCommunities(repositories, items), {
    items: [
      {
        repository: "active/jobs",
        repositoryUrl: "https://github.com/active/jobs",
        name: "Active Jobs",
        avatarUrl: "https://example.com/active.png",
        region: "South America",
        country: "Brazil",
        countryCode: "BR",
        locale: "pt-BR",
        scope: "national",
        opportunitiesCount: 2,
        lastPostedAt: "2026-03-01T00:00:00.000Z",
      },
      {
        repository: "closed/jobs",
        repositoryUrl: "https://github.com/closed/jobs",
        name: "closed",
        avatarUrl: "https://github.com/closed.png",
        region: "North America",
        country: "Mexico",
        countryCode: "MX",
        locale: "es-MX",
        scope: "national",
        opportunitiesCount: 0,
        lastPostedAt: null,
      },
      {
        repository: "zero/jobs",
        repositoryUrl: "https://github.com/zero/jobs",
        name: "zero",
        avatarUrl: "https://github.com/zero.png",
        region: "Global",
        country: "Global",
        countryCode: "GLOBAL",
        locale: "en",
        scope: "global",
        opportunitiesCount: 0,
        lastPostedAt: null,
      },
    ],
  });
});
