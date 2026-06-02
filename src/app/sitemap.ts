import type { MetadataRoute } from "next";
import { HELP_ARTICLES } from "@/lib/help-content";

const APP_URL = (
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.APP_URL ||
  "http://localhost:3000"
).replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPaths: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", priority: 1, freq: "weekly" },
    { path: "/pricing", priority: 0.9, freq: "weekly" },
    { path: "/security", priority: 0.7, freq: "monthly" },
    { path: "/about", priority: 0.6, freq: "monthly" },
    { path: "/contact", priority: 0.7, freq: "monthly" },
    { path: "/changelog", priority: 0.6, freq: "weekly" },
    { path: "/help", priority: 0.6, freq: "weekly" },
    { path: "/legal/terms", priority: 0.3, freq: "yearly" },
    { path: "/legal/privacy", priority: 0.3, freq: "yearly" },
    { path: "/legal/refund", priority: 0.3, freq: "yearly" },
    { path: "/login", priority: 0.4, freq: "yearly" },
    { path: "/signup", priority: 0.8, freq: "monthly" },
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((p) => ({
    url: `${APP_URL}${p.path}`,
    lastModified: now,
    changeFrequency: p.freq,
    priority: p.priority,
  }));

  const helpEntries: MetadataRoute.Sitemap = HELP_ARTICLES.map((a) => ({
    url: `${APP_URL}/help/${a.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.4,
  }));

  return [...staticEntries, ...helpEntries];
}
