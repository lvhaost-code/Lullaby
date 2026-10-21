import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public catalog listing — no cost price, no internal-only fields, and no
// embedded image bytes at all (not even a thumbnail). Instead each card
// points its <img> at GET /api/public/products/[code]/thumb, a real image
// URL the browser fetches, caches, and lazy-loads on its own — so a page
// only pays for the ~24 thumbnails actually visible, not all of them
// jammed into this one JSON response regardless of pagination.
//
// thumbUrl is never selected here: it's ~21 MB of base64 across the catalog,
// and pulling it just to compute hasPhoto cost that much Neon network
// transfer on every uncached call. A second query returns only the ids.
export async function GET() {
  const where = { status: { in: ["available", "cleaning"] } };
  const [products, withThumb] = await Promise.all([
    prisma.product.findMany({
      where,
      select: {
        id: true,
        code: true,
        category: true,
        brand: true,
        notes: true,
        rentPrice3: true,
        rentPriceDay: true,
        size: true,
        deposit: true,
        status: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({ where: { ...where, thumbUrl: { not: null } }, select: { id: true } }),
  ]);
  const hasThumb = new Set(withThumb.map((p) => p.id));
  const shaped = products.map((p) => ({ ...p, hasPhoto: hasThumb.has(p.id) }));
  return NextResponse.json(shaped, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}
