import { getSeoLanding } from "@/lib/seo-landings";
import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

// Per-page OG image for every SEO landing (/<slug>): renders the page's own
// headline so shares/citations look bespoke. Next wires this into og:image
// automatically for the [slug] route.

export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "tripOS — travel agency software";

export default function Image({ params }: { params: { slug: string } }) {
  const l = getSeoLanding(params.slug);
  return renderOg({
    title: l?.h1 ?? "Travel agency software, built for India",
    subtitle: l?.eyebrow,
  });
}
