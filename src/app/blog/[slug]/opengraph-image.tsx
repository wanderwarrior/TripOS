import { blogPostBySlug } from "@/lib/blog-content";
import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

// Per-post OG image for blog articles: renders the post title + category, so
// shared/cited guides get a branded card. Next wires this into og:image for the
// blog/[slug] route automatically.

export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "tripOS — guides for travel agencies";

export default function Image({ params }: { params: { slug: string } }) {
  const post = blogPostBySlug(params.slug);
  return renderOg({
    title: post?.title ?? "Guides for travel agencies",
    subtitle: post ? `tripOS · ${post.category}` : "tripOS · Guides",
  });
}
