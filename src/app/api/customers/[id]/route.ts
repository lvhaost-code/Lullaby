import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const name = String(body.name ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  if (!name || !phone) return NextResponse.json({ error: "Thiếu tên hoặc số điện thoại" }, { status: 400 });

  const conflict = await prisma.customer.findFirst({ where: { phone, NOT: { id } } });
  if (conflict) return NextResponse.json({ error: "Số điện thoại này đã có trong danh sách khách hàng" }, { status: 409 });

  const customer = await prisma.customer.update({
    where: { id },
    data: {
      name,
      phone,
      rentalCount: body.rentalCount === "" || body.rentalCount === null || body.rentalCount === undefined ? null : Number(body.rentalCount),
      rentedItems: body.rentedItems || null,
      preferences: body.preferences || null,
      notes: body.notes || null,
    },
  });
  return NextResponse.json(customer);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.customer.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
