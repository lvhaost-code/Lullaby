import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

// Public: the customer-facing catalog + its API, the login screen, and the
// Vercel Cron endpoint (which authenticates itself via CRON_SECRET instead
// of a session — see src/app/api/cron/backup/route.ts).
function isPublicPath(pathname: string) {
  return (
    pathname === "/login" ||
    pathname === "/catalog" ||
    pathname.startsWith("/catalog/") ||
    pathname.startsWith("/api/public/") ||
    pathname.startsWith("/api/cron/")
  );
}

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const pathname = req.nextUrl.pathname;
  const isLoginPage = pathname === "/login";
  const isApiRoute = pathname.startsWith("/api/");

  if (isPublicPath(pathname)) {
    if (isLoggedIn && isLoginPage) {
      const url = new URL("/", req.nextUrl.origin);
      return NextResponse.redirect(url);
    }
    return;
  }

  if (!isLoggedIn) {
    if (isApiRoute) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const url = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(url);
  }
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
