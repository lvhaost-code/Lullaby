import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const status = String(body.status ?? "");
  if (!["pending", "confirmed", "dismissed"].includes(status)) {
    return NextResponse.json({ error: "Trạng thái không hợp lệ" }, { status: 400 });
  }
  const request = await prisma.bookingRequest.update({ where: { id }, data: { status } });
  return NextResponse.json(request);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.bookingRequest.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
