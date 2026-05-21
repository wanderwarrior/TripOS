// Edge-runtime middleware. Imports ONLY the edge-safe auth config
// ([src/lib/auth-edge.ts](src/lib/auth-edge.ts)) — never auth-config.ts,
// which pulls in bcrypt/Prisma and would crash the Edge bundle.
//
// The `authorized()` callback decides which paths are public; everything
// else redirects to /login when there's no session.

import NextAuth from "next-auth";
import { authEdgeConfig } from "@/lib/auth-edge";

export const { auth: middleware } = NextAuth(authEdgeConfig);

export const config = {
  // Match everything except static asset paths Next handles itself.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads).*)"],
};
