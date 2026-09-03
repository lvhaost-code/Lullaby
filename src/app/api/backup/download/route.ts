import { NextResponse } from "next/server";
import { buildDownloadSnapshot } from "@/lib/backup";

// Staff-triggered on-demand backup — builds a fresh full snapshot
// (including photos) and returns it as a downloadable JSON file. Doesn't
// write to the DB, so clicking it repeatedly never costs storage; the
// daily cron job handles persisted, pruned retention separately.
export async function GET() {
  const snapshot = await buildDownloadSnapshot();
  const filename = `lullaby-backup-${snapshot.createdAt.slice(0, 10)}.json`;
  return new NextResponse(JSON.stringify(snapshot), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
