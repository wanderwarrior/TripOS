import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/structured-data";
import { listBlogPosts } from "@/lib/blog-content";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Guides & insights for travel agencies · tripOS",
  description:
    "Practical guides for travel agencies — sending proposals that convert, GST invoicing in India, choosing software, and growing your agency.",
  alternates: { canonical: "/blog" },
};

function fmtDate(iso: string): string {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function BlogIndexPage() {
  const posts = listBlogPosts();
  const [featured, ...rest] = posts;

  return (
    <MarketingShell>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/blog" },
        ])}
      />

      <section className="mx-auto max-w-4xl px-5 md:px-10 pt-16 md:pt-20 pb-6 text-center">
        <p className="text-[11px] uppercase tracking-[0.25em] text-gold-deep font-semibold">
          tripOS Guides
        </p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl text-ink leading-tight">
          Run a sharper travel agency
        </h1>
        <p className="mt-4 text-base md:text-lg text-ink/70 max-w-2xl mx-auto">
          Practical playbooks on proposals, pricing, GST, WhatsApp and the tools
          that help Indian agencies sell more and operate cleaner.
        </p>
      </section>

      <section className="mx-auto max-w-4xl px-5 md:px-10 pb-20">
        {featured && (
          <Link
            href={`/blog/${featured.slug}`}
            className="group block rounded-2xl border border-line bg-paper p-7 md:p-9 shadow-soft hover:shadow-lift transition-all mb-6"
          >
            <div className="flex items-center gap-3 text-xs text-muted">
              <span className="uppercase tracking-[0.18em] text-gold-deep font-semibold">
                {featured.category}
              </span>
              <span>·</span>
              <span>{fmtDate(featured.date)}</span>
              <span>·</span>
              <span>{featured.readingMinutes} min read</span>
            </div>
            <h2 className="mt-3 font-display text-2xl md:text-3xl text-ink leading-tight group-hover:text-gold-deep transition-colors">
              {featured.title}
            </h2>
            <p className="mt-3 text-ink/70 leading-relaxed">
              {featured.description}
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink">
              Read guide
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        )}

        <ul className="grid gap-5 sm:grid-cols-2">
          {rest.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/blog/${p.slug}`}
                className="group flex h-full flex-col rounded-xl border border-line bg-paper p-6 shadow-soft hover:shadow-lift transition-all"
              >
                <div className="flex items-center gap-2 text-[11px] text-muted">
                  <span className="uppercase tracking-[0.18em] text-gold-deep font-semibold">
                    {p.category}
                  </span>
                  <span>·</span>
                  <span>{p.readingMinutes} min</span>
                </div>
                <h3 className="mt-2.5 font-display text-xl text-ink leading-snug group-hover:text-gold-deep transition-colors">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm text-ink/70 leading-relaxed flex-1">
                  {p.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-muted group-hover:text-ink transition-colors">
                  Read guide
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </MarketingShell>
  );
}
