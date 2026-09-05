// Shared shaping for Product rows that include their photos, so the admin
// and public API routes stay consistent about ordering (sortOrder asc,
// first = cover) and the flat `photos: string[]` shape the client expects.
export const photosInclude = { photos: { orderBy: { sortOrder: "asc" as const }, select: { url: true } } };

// Detail responses (single product, full gallery) drop the raw thumbUrl
// data URL in favor of `hasPhoto` — keeps the shape structurally
// compatible with the list type (which never carries image bytes at all,
// only a real thumb URL each card fetches itself) so a detail response
// can be merged straight into list state after a save.
export function withPhotoUrls<T extends { thumbUrl: string | null; photos: { url: string }[] }>(
  product: T
): Omit<T, "photos" | "thumbUrl"> & { hasPhoto: boolean; photos: string[] } {
  const { photos, thumbUrl, ...rest } = product;
  return { ...rest, hasPhoto: !!thumbUrl, photos: photos.map((p) => p.url) };
}
