// Schema.org JSON-LD builders for SEO + AI-agent comprehension. Pure data
// builders (no server-only imports) so they can run in any server component.
// Rendered via <JsonLd> (src/components/seo/json-ld.tsx).

import { PRICING_ORDER, PLANS } from "@/lib/plans";
import {
  verifiedReviews,
  MIN_REVIEWS_FOR_AGGREGATE,
  type Review,
} from "@/lib/reviews";

export const SITE_NAME = "tripOS";
export const SITE_TAGLINE = "Run your travel agency on one platform";
export const SITE_DESCRIPTION =
  "The all-in-one platform for travel agencies — AI itineraries, branded proposals, WhatsApp, GST invoicing, payments and operations. Start a free trial.";

export function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    "https://thetripos.com"
  ).replace(/\/+$/, "");
}

/**
 * Official brand social profiles — single source of truth, consumed by the
 * footer AND the Organization `sameAs` (which is how Google/Gemini bind these
 * profiles to the brand entity in the knowledge graph). Add new profiles here.
 */
export const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/tripos_app/",
  linkedin: "https://www.linkedin.com/in/trip-os-b19842413/",
} as const;

/** Stable @id for the Organization node so other nodes can reference it. */
function orgId(base: string) {
  return `${base}/#organization`;
}

/** The agency-software company behind the product. */
export function organizationSchema() {
  const base = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": orgId(base),
    name: SITE_NAME,
    alternateName: "tripOS — Travel agency platform",
    url: base,
    logo: `${base}/icon`,
    image: `${base}/opengraph-image`,
    description: SITE_DESCRIPTION,
    slogan: SITE_TAGLINE,
    areaServed: { "@type": "Country", name: "India" },
    sameAs: Object.values(SOCIAL_LINKS),
    knowsAbout: [
      "Travel agency software",
      "Travel CRM",
      "AI itinerary builder",
      "Travel proposal software",
      "GST invoicing for travel agencies",
      "WhatsApp customer communication",
    ],
  };
}

/** The site itself — helps search engines model the brand + canonical home. */
export function websiteSchema() {
  const base = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${base}/#website`,
    name: SITE_NAME,
    url: base,
    description: SITE_DESCRIPTION,
    inLanguage: "en-IN",
    publisher: { "@id": orgId(base) },
  };
}

/** One schema.org Review node from a real, approved customer review. */
function reviewNode(base: string, r: Review) {
  return {
    "@type": "Review",
    author: { "@type": "Person", name: r.name },
    reviewBody: r.body,
    ...(r.date ? { datePublished: r.date } : {}),
    reviewRating: {
      "@type": "Rating",
      ratingValue: String(r.rating ?? 5),
      bestRating: "5",
      worstRating: "1",
    },
    itemReviewed: { "@id": `${base}/#software` },
  };
}

/**
 * AggregateRating + Review nodes — emitted ONLY from verified reviews, and the
 * aggregate only once we clear MIN_REVIEWS_FOR_AGGREGATE genuine reviews (a lone
 * self-hosted rating reads as self-serving and risks a Google manual action).
 * Returns the fragment to spread into softwareApplicationSchema, or {} when
 * there's nothing honest to show. This is the gate that keeps fabricated proof
 * impossible — there's simply no code path that invents a rating.
 */
function reviewSchemaFragment(base: string) {
  const reviews = verifiedReviews();
  if (reviews.length === 0) return {};
  const reviewNodes = reviews.map((r) => reviewNode(base, r));
  if (reviews.length < MIN_REVIEWS_FOR_AGGREGATE) {
    // Individual reviews only — no aggregate yet.
    return { review: reviewNodes };
  }
  const avg =
    reviews.reduce((s, r) => s + (r.rating ?? 5), 0) / reviews.length;
  return {
    review: reviewNodes,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: avg.toFixed(1),
      reviewCount: String(reviews.length),
      bestRating: "5",
      worstRating: "1",
    },
  };
}

/** The product, with a paid Offer per public plan — drives rich results. */
export function softwareApplicationSchema() {
  const base = siteUrl();
  const offers = PRICING_ORDER.map((tier) => {
    const p = PLANS[tier];
    return {
      "@type": "Offer",
      name: p.name,
      description: p.tagline,
      price: String(p.priceMonthly),
      priceCurrency: "INR",
      url: `${base}/pricing`,
      availability: "https://schema.org/InStock",
      category: "subscription",
    };
  });
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${base}/#software`,
    name: SITE_NAME,
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Travel agency software",
    operatingSystem: "Web, iOS, Android (web app)",
    url: base,
    description: SITE_DESCRIPTION,
    image: `${base}/opengraph-image`,
    softwareHelp: `${base}/help`,
    featureList: [
      "AI itinerary generation",
      "White-labelled proposals & PDFs",
      "Quotes, bookings and GST tax invoices",
      "WhatsApp messaging and automations",
      "Online payment collection",
      "Travel CRM and operations dashboard",
    ],
    offers,
    provider: { "@id": orgId(base) },
    ...reviewSchemaFragment(base),
  };
}

/** FAQPage — eligible for FAQ rich results and heavily used by AI answerers. */
export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/** BlogPosting — drives article rich results and is prime AI-citation fodder. */
export function blogPostingSchema(post: {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated?: string;
  author: string;
  keywords: string[];
}) {
  const base = siteUrl();
  const url = `${base}/blog/${post.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    inLanguage: "en-IN",
    keywords: post.keywords.join(", "),
    image: `${base}/opengraph-image`,
    author: { "@type": "Organization", name: post.author, url: base },
    publisher: { "@id": orgId(base) },
    isPartOf: { "@id": `${base}/#website` },
  };
}

/** BreadcrumbList for a non-home page. Pass the trail excluding the domain. */
export function breadcrumbSchema(
  items: { name: string; path: string }[]
) {
  const base = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${base}${it.path}`,
    })),
  };
}
