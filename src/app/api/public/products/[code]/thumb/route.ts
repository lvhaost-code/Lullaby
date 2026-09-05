import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { dataUrlToImageResponse } from "@/lib/image-response";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const product = await prisma.product.findUnique({ where: { code }, select: { thumbUrl: true } });
  return dataUrlToImageResponse(product?.thumbUrl ?? null);
}
