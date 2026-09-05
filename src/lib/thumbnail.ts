import sharp from "sharp";

// Small copy of a photo for list/grid views, so those don't have to ship
// every product's full-size photo just to render a card. See
// src/app/api/products/route.ts and src/app/api/public/products/route.ts.
export async function makeThumbnail(dataUrl: string, maxDim = 160, quality = 65): Promise<string | null> {
  const match = dataUrl.match(/^data:image\/[a-zA-Z+]+;base64,(.+)$/);
  if (!match) return null;
  const buffer = Buffer.from(match[1], "base64");
  const out = await sharp(buffer)
    .resize({ width: maxDim, height: maxDim, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality })
    .toBuffer();
  return `data:image/jpeg;base64,${out.toString("base64")}`;
}
