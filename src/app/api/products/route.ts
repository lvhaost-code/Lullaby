import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const code = String(body.code ?? "").trim();
  if (!code) return NextResponse.json({ error: "Thiếu mã sản phẩm" }, { status: 400 });

  const existing = await prisma.product.findUnique({ where: { code } });
  if (existing) return NextResponse.json({ error: "Mã sản phẩm đã tồn tại" }, { status: 409 });

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
      photoUrl: body.photoUrl ?? null,
    },
  });
  return NextResponse.json(product, { status: 201 });
}
