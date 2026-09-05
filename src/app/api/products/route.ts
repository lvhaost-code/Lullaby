import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { photosInclude, withPhotoUrls } from "@/lib/product-shape";
import { makeThumbnail } from "@/lib/thumbnail";

// List view carries no image bytes at all — each row's thumbnail is a real
// URL (GET /api/products/[id]/thumb) the browser fetches, caches, and
// lazy-loads on its own, so a page only pays for the rows actually
// rendered instead of every product's thumbnail regardless of pagination.
export async function GET() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      code: true,
      category: true,
      brand: true,
      costPrice: true,
      rentPrice3: true,
      rentPriceDay: true,
      size: true,
      deposit: true,
      notes: true,
      status: true,
      thumbUrl: true,
    },
    orderBy: { createdAt: "desc" },
  });
  const shaped = products.map(({ thumbUrl, ...rest }) => ({ ...rest, hasPhoto: !!thumbUrl }));
  return NextResponse.json(shaped);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const code = String(body.code ?? "").trim();
  if (!code) return NextResponse.json({ error: "Thiếu mã sản phẩm" }, { status: 400 });

  const existing = await prisma.product.findUnique({ where: { code } });
  if (existing) return NextResponse.json({ error: "Mã sản phẩm đã tồn tại" }, { status: 409 });

  const photos: string[] = Array.isArray(body.photos) ? body.photos : [];
  const thumbUrl = photos.length > 0 ? await makeThumbnail(photos[0]) : null;

  const product = await prisma.product.create({
    data: {
      code,
      category: body.category || "Váy đầm",
      brand: body.brand || null,
      costPrice: body.costPrice ?? null,
      rentPrice3: body.rentPrice3 ?? null,
      rentPriceDay: body.rentPriceDay ?? null,
      size: body.size || null,
      deposit: body.deposit || null,
      notes: body.notes || null,
      status: body.status || "available",
      thumbUrl,
      photos: { create: photos.map((url, i) => ({ url, sortOrder: i })) },
    },
    include: photosInclude,
  });
  return NextResponse.json(withPhotoUrls(product), { status: 201 });
}
