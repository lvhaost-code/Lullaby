import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public catalog listing — no cost price, no internal-only fields, and no
// embedded image bytes at all (not even a thumbnail). Instead each card
// points its <img> at GET /api/public/products/[code]/thumb, a real image
// URL the browser fetches, caches, and lazy-loads on its own — so a page
// only pays for the ~24 thumbnails actually visible, not all of them
// jammed into this one JSON response regardless of pagination.
export async function GET() {
  const products = await prisma.product.findMany({
    where: { status: { in: ["available", "cleaning"] } },
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
      thumbUrl: true,
    },
    orderBy: { createdAt: "desc" },
  });
  const shaped = products.map(({ thumbUrl, ...rest }) => ({ ...rest, hasPhoto: !!thumbUrl }));
  return NextResponse.json(shaped, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}
