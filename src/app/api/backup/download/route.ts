import { NextResponse } from "next/server";
import { createBackup } from "@/lib/backup";
import { prisma } from "@/lib/prisma";

// Staff-triggered on-demand backup — creates a fresh snapshot (so it's
// never stale) and returns it as a downloadable JSON file.
export async function GET() {
  const result = await createBackup();
  const row = await prisma.backup.findUnique({ where: { id: result.id } });
  if (!row) return NextResponse.json({ error: "Không tạo được backup" }, { status: 500 });

  const filename = `lullaby-backup-${row.createdAt.toISOString().slice(0, 10)}.json`;
  return new NextResponse(row.data, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
