// Edge-safe Auth.js config slice. This is the ONLY auth config the
// middleware imports — it must not pull in bcrypt, Prisma, or any other
// Node-only / native module, because middleware runs on the Edge runtime.
//
// The full config ([src/lib/auth-config.ts](src/lib/auth-config.ts))
// spreads this and adds the Credentials provider + jwt/session callbacks
// that DO touch the database. That full config runs only in the Node.js
// runtime (route handler + server actions + server components).

import type { NextAuthConfig } from "next-auth";

export const authEdgeConfig: NextAuthConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  // Providers are added in the full config. Empty here so the Edge bundle
  // stays free of bcrypt.
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const path = request.nextUrl.pathname;
      const isPublic =
        path.startsWith("/login") ||
        path.startsWith("/signup") ||
        path.startsWith("/accept-invite") ||
        path.startsWith("/share/") ||
        path.startsWith("/v/") ||
        path.startsWith("/api/share/") ||
        path.startsWith("/api/auth") ||
        path.startsWith("/api/webhooks") ||
        path.startsWith("/api/cron") ||
        path.startsWith("/_next") ||
        path === "/favicon.ico" ||
        path.startsWith("/uploads/");
      if (isPublic) return true;
      return Boolean(auth?.user);
    },
  },
};
