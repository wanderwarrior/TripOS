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
        // Public marketing surface. "/" branches in the page itself
        // (landing for guests, dashboard for authed users).
        path === "/" ||
        path.startsWith("/pricing") ||
        path.startsWith("/blog") ||
        // Public SEO landing pages (keep in sync with lib/seo-landings.ts —
        // these are served by app/[slug]/page.tsx and the explicit folders).
        path === "/travel-agency-software-india" ||
        path === "/travel-agency-crm" ||
        path === "/gst-invoicing-for-travel-agents" ||
        path === "/travel-proposal-software" ||
        // Comparison / alternative landing pages.
        path === "/best-travel-agency-software-india" ||
        path === "/sembark-alternative" ||
        path === "/hellogtx-alternative" ||
        path === "/crmtravel-alternative" ||
        path === "/travefy-alternative-india" ||
        path === "/tourwriter-alternative-india" ||
        path === "/zoho-crm-for-travel-agency-alternative" ||
        path.startsWith("/legal") ||
        path.startsWith("/login") ||
        path.startsWith("/signup") ||
        path.startsWith("/forgot-password") ||
        path.startsWith("/reset-password") ||
        path.startsWith("/accept-invite") ||
        path.startsWith("/share/") ||
        path.startsWith("/v/") ||
        path.startsWith("/api/share/") ||
        // Invoice + voucher PDFs are token-gated inside the route handler
        // (a `?token=` matching the resource's shareToken, or an owning
        // session). They must be reachable cookieless so Meta/customers can
        // fetch them — auth lives in the handler, not here.
        path.startsWith("/api/invoices/") ||
        path.startsWith("/api/vouchers/") ||
        path.startsWith("/api/auth") ||
        path.startsWith("/api/webhooks") ||
        path.startsWith("/api/cron") ||
        path.startsWith("/_next") ||
        path === "/favicon.ico" ||
        // Public metadata / icon routes — browsers and crawlers fetch these
        // cookieless, so they must never redirect to /login.
        path === "/icon" ||
        path === "/apple-icon" ||
        path === "/manifest.webmanifest" ||
        path === "/sitemap.xml" ||
        path === "/robots.txt" ||
        path === "/llms.txt" ||
        path === "/opengraph-image" ||
        path.startsWith("/uploads/");
      if (isPublic) return true;
      return Boolean(auth?.user);
    },
  },
};
