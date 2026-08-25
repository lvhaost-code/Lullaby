// Shared shaping for Product rows that include their photos, so the admin
// and public API routes stay consistent about ordering (sortOrder asc,
// first = cover) and the flat `photos: string[]` shape the client expects.
export const photosInclude = { photos: { orderBy: { sortOrder: "asc" as const }, select: { url: true } } };

export function withPhotoUrls<T extends { photos: { url: string }[] }>(product: T): Omit<T, "photos"> & { photos: string[] } {
  const { photos, ...rest } = product;
  return { ...rest, photos: photos.map((p) => p.url) };
}
