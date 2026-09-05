import { NextResponse } from "next/server";

// Turns a stored data URL (data:image/jpeg;base64,...) into a real binary
// image HTTP response, so the browser can request/cache it like any other
// <img src>, instead of it being embedded as text inside a JSON list
// response that everyone pays for on every page load regardless of
// whether that particular image is even scrolled into view.
export function dataUrlToImageResponse(dataUrl: string | null): NextResponse {
  if (!dataUrl) return NextResponse.json({ error: "Không có ảnh" }, { status: 404 });
  const match = dataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
  if (!match) return NextResponse.json({ error: "Ảnh không hợp lệ" }, { status: 500 });
  const [, contentType, base64] = match;
  const buffer = Buffer.from(base64, "base64");
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
