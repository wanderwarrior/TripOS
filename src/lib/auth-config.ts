// Central Auth.js v5 configuration.
//
// Strategy: Credentials provider (email + password), JWT sessions. JWT keeps
// session reads cheap (no DB round-trip per request) which matters because
// every server action and server component reads the session. The user's
// active agencyId is also stuffed into the JWT so we don't need to fetch
// memberships on every request — only when the user switches agency.
//
// Note: NEXTAUTH_SECRET / AUTH_SECRET must be set in .env. Generate one
// with `openssl rand -base64 32`.

import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authEdgeConfig } from "@/lib/auth-edge";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      activeAgencyId: string;
      activeAgencyRole: "OWNER" | "STAFF" | "VIEWER";
      activeAgencyName: string;
    };
  }
  interface User {
    activeAgencyId?: string;
    activeAgencyRole?: "OWNER" | "STAFF" | "VIEWER";
    activeAgencyName?: string;
  }
}

// JWT extra claims. Auth.js v5's `next-auth/jwt` module augmentation is
// flaky to resolve in the beta, so we type the token locally and cast in
// the callbacks rather than relying on a module augmentation.
type AppJwt = Record<string, unknown> & {
  uid?: string;
  activeAgencyId?: string;
  activeAgencyRole?: "OWNER" | "STAFF" | "VIEWER";
  activeAgencyName?: string;
};

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

async function resolveActiveMembership(userId: string) {
  // Pick the most recently created membership as default. Future: persist
  // the user's last-active agency in a UserPreferences table.
  return prisma.membership.findFirst({
    where: { userId, suspendedAt: null },
    include: { agency: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });
}

export const authConfig: NextAuthConfig = {
  ...authEdgeConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email: email.trim().toLowerCase() },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            hashedPassword: true,
          },
        });
        if (!user || !user.hashedPassword) return null;

        const ok = await bcrypt.compare(password, user.hashedPassword);
        if (!ok) return null;

        const membership = await resolveActiveMembership(user.id);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          activeAgencyId: membership?.agencyId,
          activeAgencyRole: membership?.role,
          activeAgencyName: membership?.agency.name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      const t = token as AppJwt;
      // First login — copy from authorize() result onto the token.
      if (user) {
        t.uid = user.id ?? undefined;
        t.activeAgencyId = user.activeAgencyId;
        t.activeAgencyRole = user.activeAgencyRole;
        t.activeAgencyName = user.activeAgencyName;
      }
      // `update()` from the client (used for agency switching) reloads
      // the membership from the DB so role + name stay fresh.
      if (trigger === "update" && t.uid) {
        const membership = await resolveActiveMembership(t.uid);
        t.activeAgencyId = membership?.agencyId;
        t.activeAgencyRole = membership?.role;
        t.activeAgencyName = membership?.agency.name;
      }
      return t;
    },
    async session({ session, token }) {
      const t = token as AppJwt;
      if (!t.uid || !t.activeAgencyId) return session;
      session.user = {
        ...session.user,
        id: t.uid,
        activeAgencyId: t.activeAgencyId,
        activeAgencyRole: t.activeAgencyRole ?? "VIEWER",
        activeAgencyName: t.activeAgencyName ?? "",
      };
      return session;
    },
    // `authorized` is inherited from authEdgeConfig via the spread above.
    authorized: authEdgeConfig.callbacks!.authorized,
  },
};
