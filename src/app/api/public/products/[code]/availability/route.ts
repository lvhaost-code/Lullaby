import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { todayISO } from "@/lib/format";

// Upcoming booked date ranges for one product — dates only, no customer
// info, so the public catalog can show "đã có lịch" without leaking orders.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const today = todayISO();

  const items = await prisma.orderItem.findMany({
    where: {
      code,
      order: { status: { not: "Đã hủy" }, returnDate: { gte: today } },
    },
    select: { order: { select: { pickupDate: true, returnDate: true } } },
    orderBy: { order: { pickupDate: "asc" } },
  });

  const ranges = items.map((i) => ({ pickupDate: i.order.pickupDate, returnDate: i.order.returnDate }));
  return NextResponse.json(ranges);
}
