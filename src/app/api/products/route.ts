import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { photosInclude, withPhotoUrls } from "@/lib/product-shape";
import { makeThumbnail } from "@/lib/thumbnail";

// List view: thumbUrl only, not the full photos — a page of this used to
// ship every product's full-size photo (tens of MB) just to render cards.
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
  return NextResponse.json(products);
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
