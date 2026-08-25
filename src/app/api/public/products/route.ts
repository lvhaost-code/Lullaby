import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPhotoUrls } from "@/lib/product-shape";

// Public catalog listing — no cost price, no internal-only fields.
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
      photos: { orderBy: { sortOrder: "asc" }, select: { url: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products.map(withPhotoUrls));
}
