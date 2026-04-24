function normalizeText(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildSearchText(item) {
  return normalizeText(
    [
      item.title,
      item.excerpt,
      item.companyName,
      item.repository,
      item.country,
      item.region,
      item.author?.name,
      item.author?.handle,
      ...(Array.isArray(item.tags) ? item.tags : []),
    ]
      .filter(Boolean)
      .join(" "),
  );
}

export function buildSearchIndex(items) {
  return items.map((item) => ({
    id: item.id,
    text: buildSearchText(item),
  }));
}
