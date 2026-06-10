import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { SeoLanding } from "@/components/marketing/seo-landing";
import { getSeoLanding, seoLandingMetadata } from "@/lib/seo-landings";

// Catch-all renderer for keyword-targeted SEO landing pages defined in
// src/lib/seo-landings.ts — so adding an entry there is all it takes to ship a
// new /<slug> page (sitemap + route both flow from the data). Explicit static
// folders that pre-date this (e.g. /travel-agency-crm) still take precedence for
// their own paths; this handles everything else and 404s unknown slugs.
//
// NOTE: also keep the public allowlist in src/lib/auth-edge.ts in sync, or
// logged-out visitors/crawlers get redirected to /login.

export const dynamic = "force-dynamic";

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  return seoLandingMetadata(params.slug);
}

export default function Page({ params }: { params: { slug: string } }) {
  if (!getSeoLanding(params.slug)) notFound();
  return (
    <MarketingShell>
      <SeoLanding slug={params.slug} />
    </MarketingShell>
  );
}
