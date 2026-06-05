import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { BlogBody } from "@/components/blog/blog-body";
import { JsonLd } from "@/components/seo/json-ld";
import { blogPostingSchema, breadcrumbSchema } from "@/lib/structured-data";
import { blogPostBySlug, listBlogPosts } from "@/lib/blog-content";

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: { slug: string } }) {
  const post = blogPostBySlug(params.slug);
  if (!post) return { title: "Guide · tripOS" };
  return {
    title: `${post.title} · tripOS`,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: `/blog/${post.slug}`,
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      authors: [post.author],
    },
  };
}

function fmtDate(iso: string): string {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = blogPostBySlug(params.slug);
  if (!post) notFound();

  const related = listBlogPosts()
    .filter((p) => p.slug !== post.slug)
    .slice(0, 2);

  return (
    <MarketingShell>
      <JsonLd
        data={[
          blogPostingSchema(post),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Guides", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
        ]}
      />

      <article className="mx-auto max-w-2xl px-5 md:px-10 pt-14 md:pt-20 pb-16">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          All guides
        </Link>

        <div className="mt-8 flex items-center gap-3 text-xs text-muted">
          <span className="uppercase tracking-[0.18em] text-gold-deep font-semibold">
            {post.category}
          </span>
          <span>·</span>
          <time dateTime={post.date}>{fmtDate(post.date)}</time>
          <span>·</span>
          <span>{post.readingMinutes} min read</span>
        </div>

        <h1 className="mt-3 font-display text-3xl md:text-4xl text-ink leading-tight">
          {post.title}
        </h1>
        <p className="mt-4 text-lg text-ink/70 leading-relaxed">
          {post.description}
        </p>

        <hr className="my-8 border-line" />

        <BlogBody blocks={post.body} />

        <p className="mt-10 text-xs text-muted">
          Written by {post.author}.
        </p>
      </article>

      {related.length > 0 && (
        <section className="border-t border-line bg-paper">
          <div className="mx-auto max-w-2xl px-5 md:px-10 py-12">
            <p className="text-[10px] uppercase tracking-[0.22em] text-gold-deep mb-4">
              Keep reading
            </p>
            <ul className="space-y-3">
              {related.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/blog/${p.slug}`}
                    className="group flex items-center justify-between gap-3 rounded-lg border border-line bg-canvas px-5 py-4 hover:shadow-soft transition-all"
                  >
                    <span className="font-display text-lg text-ink leading-snug group-hover:text-gold-deep transition-colors">
                      {p.title}
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted group-hover:text-ink transition-colors" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </MarketingShell>
  );
}
