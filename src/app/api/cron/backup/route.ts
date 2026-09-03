import { NextRequest, NextResponse } from "next/server";
import { createBackup } from "@/lib/backup";

// Called by Vercel Cron (see vercel.json). Vercel sends
// "Authorization: Bearer $CRON_SECRET" on scheduled invocations when
// CRON_SECRET is set in the project's environment variables.
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [metadata, full] = await Promise.all([createBackup("metadata"), createBackup("full")]);
  return NextResponse.json({ metadata, full });
}
