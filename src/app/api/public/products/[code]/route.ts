import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPhotoUrls } from "@/lib/product-shape";

// Full detail (all photos) for one product — fetched only when a customer
// opens it, so the catalog list doesn't have to ship every photo up front.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const product = await prisma.product.findUnique({
    where: { code },
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
      photos: { orderBy: { sortOrder: "asc" }, select: { url: true } },
    },
  });
  if (!product) return NextResponse.json({ error: "Không tìm thấy sản phẩm" }, { status: 404 });
  return NextResponse.json(withPhotoUrls(product), {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}
