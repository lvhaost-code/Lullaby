import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const orders = await prisma.order.findMany({
    include: { items: { select: { code: true, rentPrice3: true } } },
    orderBy: { invoiceDate: "desc" },
  });
  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.customerName?.trim() || !body.pickupDate || !body.returnDate) {
    return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
  }

  const order = await prisma.order.create({
    data: {
      customerName: body.customerName.trim(),
      customerPhone: body.customerPhone || null,
      invoiceDate: body.invoiceDate || new Date().toISOString().slice(0, 10),
      pickupDate: body.pickupDate,
      returnDate: body.returnDate,
      depositMethod: body.depositMethod || null,
      depositAmount: body.depositAmount ?? 0,
      paymentCash: body.paymentCash ?? 0,
      paymentTransfer: body.paymentTransfer ?? 0,
      note: body.note || null,
      status: body.status || "Đã đặt",
      items: {
        create: (body.items || []).map((it: { code: string; rentPrice3: number | null }) => ({
          code: it.code,
          rentPrice3: it.rentPrice3 ?? null,
        })),
      },
    },
    include: { items: { select: { code: true, rentPrice3: true } } },
  });
  return NextResponse.json(order, { status: 201 });
}
