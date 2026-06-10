import { listBlogPosts } from "@/lib/blog-content";
import { siteUrl, SITE_NAME } from "@/lib/structured-data";

// RSS 2.0 feed for the blog — feeds readers, aggregators and some AI/search
// crawlers. Autodiscovered via the <link rel="alternate"> in app/layout.tsx.
export const dynamic = "force-dynamic";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const base = siteUrl();
  const posts = listBlogPosts();
  const items = posts
    .map((p) => {
      const url = `${base}/blog/${p.slug}`;
      const pub = new Date(`${p.updated ?? p.date}T00:00:00Z`).toUTCString();
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pub}</pubDate>
      <category>${esc(p.category)}</category>
      <description>${esc(p.description)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE_NAME)} — Guides for travel agencies</title>
    <link>${base}/blog</link>
    <atom:link href="${base}/blog/feed.xml" rel="self" type="application/rss+xml" />
    <description>Guides, playbooks and tips for travel agencies — from tripOS.</description>
    <language>en-IN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
