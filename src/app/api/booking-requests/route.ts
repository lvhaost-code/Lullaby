import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const requests = await prisma.bookingRequest.findMany({
    include: { items: { select: { code: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(requests);
}
