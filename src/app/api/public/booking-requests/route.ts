import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const customerName = String(body.customerName ?? "").trim();
  const customerPhone = String(body.customerPhone ?? "").trim();
  const pickupDate = String(body.pickupDate ?? "");
  const returnDate = String(body.returnDate ?? "");
  const note = body.note ? String(body.note).trim() : null;
  const items: { code: string }[] = Array.isArray(body.items) ? body.items : [];

  if (!customerName || !customerPhone || !pickupDate || !returnDate || items.length === 0) {
    return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
  }
  if (pickupDate > returnDate) {
    return NextResponse.json({ error: "Ngày lấy phải trước ngày trả" }, { status: 400 });
  }

  const request = await prisma.bookingRequest.create({
    data: {
      customerName,
      customerPhone,
      pickupDate,
      returnDate,
      note,
      items: { create: items.map((it) => ({ code: String(it.code) })) },
    },
  });

  return NextResponse.json({ id: request.id }, { status: 201 });
}
