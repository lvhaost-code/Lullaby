import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isLoginPage = req.nextUrl.pathname === "/login";
  const isApiRoute = req.nextUrl.pathname.startsWith("/api/");

  if (!isLoggedIn && !isLoginPage) {
    if (isApiRoute) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const url = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(url);
  }
  if (isLoggedIn && isLoginPage) {
    const url = new URL("/", req.nextUrl.origin);
    return NextResponse.redirect(url);
  }
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
