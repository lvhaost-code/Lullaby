import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  if (!body.customerName?.trim() || !body.pickupDate || !body.returnDate) {
    return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
  }

  const order = await prisma.$transaction(async (tx) => {
    await tx.orderItem.deleteMany({ where: { orderId: id } });
    return tx.order.update({
      where: { id },
      data: {
        customerName: body.customerName.trim(),
        customerPhone: body.customerPhone || null,
        invoiceDate: body.invoiceDate,
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
  });
  return NextResponse.json(order);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.order.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
