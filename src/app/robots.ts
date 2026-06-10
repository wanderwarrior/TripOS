import type { MetadataRoute } from "next";

const APP_URL = (
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.APP_URL ||
  "http://localhost:3000"
).replace(/\/$/, "");

// Allow the public marketing + help surface; keep the authenticated app,
// APIs, and per-customer share/voucher links out of search indexes.
//
// Private surface that no crawler (search OR AI) should index. AI answer
// engines (ChatGPT, Claude, Perplexity, Gemini, Copilot) are a deliberate
// discovery channel for us, so we explicitly WELCOME their crawlers on the
// public marketing surface rather than relying on the wildcard alone — some
// AI bots look for a block addressed to their own user-agent.
const PRIVATE_PATHS = [
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
];

// AI / answer-engine crawlers we explicitly invite onto the public surface.
const AI_CRAWLERS = [
  "GPTBot", // OpenAI training
  "OAI-SearchBot", // ChatGPT search index
  "ChatGPT-User", // ChatGPT live browsing
  "ClaudeBot", // Anthropic training
  "Claude-Web", // Anthropic browsing
  "anthropic-ai",
  "PerplexityBot", // Perplexity index
  "Perplexity-User", // Perplexity live fetch
  "Google-Extended", // Gemini / Bard training
  "Applebot-Extended", // Apple Intelligence
  "Bingbot", // Copilot / Bing
  "CCBot", // Common Crawl (feeds many models)
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE_PATHS },
      // Explicit, intentional allow for AI answer engines (still keeping the
      // private app surface out of their reach).
      { userAgent: AI_CRAWLERS, allow: "/", disallow: PRIVATE_PATHS },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
    host: APP_URL,
  };
}
