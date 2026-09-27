import NextAuth, { type NextAuthRequest } from "next-auth";
import { NextResponse, type NextRequest, type NextFetchEvent, type NextMiddleware } from "next/server";
import { authConfig } from "@/auth.config";

type NextAuthMiddleware = (request: NextAuthRequest, event: NextFetchEvent) => ReturnType<NextMiddleware>;

const { auth } = NextAuth(authConfig);

// Public: the customer-facing catalog + its API, and the Vercel Cron
// endpoint (which authenticates itself via CRON_SECRET instead of a
// session — see src/app/api/cron/backup/route.ts).
//
// These paths bypass the NextAuth `auth()` wrapper entirely below —
// not just returned early from inside it — because `auth()` always
// reads/writes its session cookie before your callback ever runs. A
// response with Set-Cookie is never cached by Vercel's CDN, so every
// catalog visit and every product-photo request was hitting the
// database fresh on every request instead of being served from the
// edge cache, which blew through Neon's free-tier monthly
// network-transfer allowance well before month-end.
function isPublicPath(pathname: string) {
  return pathname === "/catalog" || pathname.startsWith("/catalog/") || pathname.startsWith("/api/public/") || pathname.startsWith("/api/cron/");
}

const withAuth = auth(((req) => {
  const isLoggedIn = !!req.auth;
  const pathname = req.nextUrl.pathname;
  const isLoginPage = pathname === "/login";
  const isApiRoute = pathname.startsWith("/api/");

  if (isLoginPage) {
    if (isLoggedIn) {
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
}) as NextAuthMiddleware);

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  if (isPublicPath(req.nextUrl.pathname)) return NextResponse.next();
  return withAuth(req, event);
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
