import type { NextAuthConfig } from "next-auth";

// Edge-safe config used by middleware — must not import anything that pulls
// in Prisma/Node built-ins. The Credentials provider (which does the DB
// lookup) is added separately in auth.ts, used only by route handlers and
// server components that run in the Node.js runtime.
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.sub = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string;
        session.user.id = token.sub as string;
      }
      return session;
    },
  },
};
