import sharp from "sharp";

// Small copy of a photo for list/grid views, so those don't have to ship
// every product's full-size photo just to render a card. See
// src/app/api/products/route.ts and src/app/api/public/products/route.ts.
// 600px gives real retina sharpness at the catalog grid card size
// (~280px); free-tier DB storage has plenty of headroom for it. Still a
// fraction of the 720px full photo, and the list/detail split (only the
// full gallery is fetched on demand) is what actually keeps page loads
// fast — this resolution bump doesn't undo that.
export async function makeThumbnail(dataUrl: string, maxDim = 600, quality = 80): Promise<string | null> {
  const match = dataUrl.match(/^data:image\/[a-zA-Z+]+;base64,(.+)$/);
  if (!match) return null;
  const buffer = Buffer.from(match[1], "base64");
  const out = await sharp(buffer)
    .resize({ width: maxDim, height: maxDim, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality })
    .toBuffer();
  return `data:image/jpeg;base64,${out.toString("base64")}`;
}
