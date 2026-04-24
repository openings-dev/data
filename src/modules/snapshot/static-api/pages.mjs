import { staticApiPagePath } from "./paths.mjs";

export const STATIC_API_PAGE_SIZE = 20;

function chunk(items, size) {
  const chunks = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

export function buildItemPages(items, generatedAt) {
  return chunk(items, STATIC_API_PAGE_SIZE).map((pageItems, index) => {
    const page = index + 1;
    const nextPage = index + 1 < Math.ceil(items.length / STATIC_API_PAGE_SIZE)
      ? staticApiPagePath(page + 1)
      : null;

    return {
      page,
      file: staticApiPagePath(page),
      payload: {
        generatedAt,
        page,
        pageSize: STATIC_API_PAGE_SIZE,
        nextPage,
        ids: pageItems.map((item) => item.id),
        items: pageItems,
      },
    };
  });
}

export function buildPageLookup(pages) {
  return Object.fromEntries(
    pages.flatMap((page) => page.payload.ids.map((id) => [id, page.file])),
  );
}
