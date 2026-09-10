import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const customers = await prisma.customer.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json(customers);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const name = String(body.name ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  if (!name || !phone) return NextResponse.json({ error: "Thiếu tên hoặc số điện thoại" }, { status: 400 });

  const existing = await prisma.customer.findUnique({ where: { phone } });
  if (existing) return NextResponse.json({ error: "Số điện thoại này đã có trong danh sách khách hàng" }, { status: 409 });

  const customer = await prisma.customer.create({
    data: {
      name,
      phone,
      rentalCount: body.rentalCount === "" || body.rentalCount === null || body.rentalCount === undefined ? null : Number(body.rentalCount),
      rentedItems: body.rentedItems || null,
      preferences: body.preferences || null,
      notes: body.notes || null,
    },
  });
  return NextResponse.json(customer, { status: 201 });
}
