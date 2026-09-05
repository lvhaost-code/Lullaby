import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public catalog listing — no cost price, no internal-only fields, and
// only the small thumbnail (not every full-size photo — see the [code]
// route for the full gallery, fetched only when a product is opened).
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
  return NextResponse.json(products, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}
