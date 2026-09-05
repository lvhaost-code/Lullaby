import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { dataUrlToImageResponse } from "@/lib/image-response";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id }, select: { thumbUrl: true } });
  return dataUrlToImageResponse(product?.thumbUrl ?? null);
}
