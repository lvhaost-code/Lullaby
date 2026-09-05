import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { photosInclude, withPhotoUrls } from "@/lib/product-shape";
import { makeThumbnail } from "@/lib/thumbnail";

// Full detail (all photos) — fetched on demand when the edit form opens,
// so the list view doesn't have to carry every product's full photos.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id }, include: photosInclude });
  if (!product) return NextResponse.json({ error: "Không tìm thấy sản phẩm" }, { status: 404 });
  return NextResponse.json(withPhotoUrls(product));
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const code = String(body.code ?? "").trim();
  if (!code) return NextResponse.json({ error: "Thiếu mã sản phẩm" }, { status: 400 });

  const conflict = await prisma.product.findFirst({ where: { code, NOT: { id } } });
  if (conflict) return NextResponse.json({ error: "Mã sản phẩm đã tồn tại" }, { status: 409 });

  const photos: string[] | undefined = Array.isArray(body.photos) ? body.photos : undefined;
  const thumbUrl = photos !== undefined ? (photos.length > 0 ? await makeThumbnail(photos[0]) : null) : undefined;

  const product = await prisma.$transaction(async (tx) => {
    if (photos !== undefined) {
      await tx.productPhoto.deleteMany({ where: { productId: id } });
    }
    return tx.product.update({
      where: { id },
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
        ...(thumbUrl !== undefined ? { thumbUrl } : {}),
        ...(photos !== undefined ? { photos: { create: photos.map((url, i) => ({ url, sortOrder: i })) } } : {}),
      },
      include: photosInclude,
    });
  });
  return NextResponse.json(withPhotoUrls(product));
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
