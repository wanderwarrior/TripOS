import type { MetadataRoute } from "next";

const APP_URL = (
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.APP_URL ||
  "http://localhost:3000"
).replace(/\/$/, "");

// Allow the public marketing + help surface; keep the authenticated app,
// APIs, and per-customer share/voucher links out of search indexes.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/admin",
        "/dashboard",
        "/trips",
        "/contacts",
        "/customers",
        "/bookings",
        "/invoices",
        "/vendors",
        "/operations",
        "/follow-ups",
        "/communications",
        "/reports",
        "/settings",
        "/share/",
        "/v/",
      ],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
    host: APP_URL,
  };
}
