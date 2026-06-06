import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { RequestDemoDialog } from "@/components/marketing/request-demo-dialog";
import { breadcrumbSchema, faqSchema } from "@/lib/structured-data";
import { getSeoLanding, type SeoLandingContent } from "@/lib/seo-landings";

const INLINE = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;

function inline(text: string, k: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let last = 0;
  let i = 0;
  let m: RegExpExecArray | null;
  INLINE.lastIndex = 0;
  while ((m = INLINE.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] && m[2]) {
      out.push(
        <Link
          key={`${k}-${i}`}
          href={m[2]}
          className="text-gold-deep underline underline-offset-2 hover:text-ink"
        >
          {m[1]}
        </Link>
      );
    } else if (m[3]) {
      out.push(
        <strong key={`${k}-${i}`} className="font-semibold text-ink">
          {m[3]}
        </strong>
      );
    }
    last = m.index + m[0].length;
    i++;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function SeoLanding({ slug }: { slug: string }) {
  const l = getSeoLanding(slug);
  if (!l) return null;
  return <Render l={l} />;
}

function Render({ l }: { l: SeoLandingContent }) {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: l.eyebrow, path: `/${l.slug}` },
          ]),
          faqSchema(l.faqs),
        ]}
      />

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-5 md:px-10 pt-16 md:pt-24 pb-6 text-center">
        <p className="text-[11px] uppercase tracking-[0.25em] text-gold-deep font-semibold">
          {l.eyebrow}
        </p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl text-ink leading-tight">
          {l.h1}
        </h1>
        <p className="mt-5 text-base md:text-lg text-ink/75 leading-relaxed">
          {inline(l.intro, "intro")}
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-[8px] bg-inkwash px-6 py-3 text-sm font-medium text-[var(--on-dark)] hover:bg-inkwash/90 transition-colors"
          >
            Start free trial
            <ArrowRight className="h-4 w-4" />
          </Link>
          <RequestDemoDialog
            trigger={
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-[8px] border border-line px-6 py-3 text-sm font-medium text-ink hover:bg-paper-2 transition-colors"
              >
                Get a free demo
              </button>
            }
          />
        </div>
        <p className="mt-3 text-xs text-muted">
          14-day free trial · no card required
        </p>
      </section>

      {/* Body */}
      <section className="mx-auto max-w-3xl px-5 md:px-10 py-10 space-y-10">
        {l.sections.map((s, i) => (
          <div key={i}>
            <h2 className="font-display text-2xl md:text-3xl text-ink leading-tight">
              {s.h2}
            </h2>
            <p className="mt-3 text-[15px] md:text-base text-ink/80 leading-relaxed">
              {inline(s.body, `s-${i}`)}
            </p>
            {s.bullets ? (
              <ul className="mt-4 space-y-2.5">
                {s.bullets.map((b, j) => (
                  <li
                    key={j}
                    className="flex gap-3 text-[15px] md:text-base text-ink/80 leading-relaxed"
                  >
                    <Check className="mt-1 h-4 w-4 shrink-0 text-[var(--ok)]" />
                    <span>{inline(b, `s-${i}-${j}`)}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-5 md:px-10 py-10">
        <h2 className="font-display text-2xl md:text-3xl text-ink mb-6">
          Frequently asked questions
        </h2>
        <div className="divide-y divide-line rounded-xl border border-line bg-paper">
          {l.faqs.map((f, i) => (
            <div key={i} className="p-5 md:p-6">
              <h3 className="font-display text-lg text-ink">{f.q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/75">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related internal links */}
      <section className="mx-auto max-w-3xl px-5 md:px-10 pb-12">
        <p className="text-[10px] uppercase tracking-[0.22em] text-gold-deep mb-3">
          Explore more
        </p>
        <ul className="flex flex-wrap gap-2">
          {l.related.map((r) => (
            <li key={r.href}>
              <Link
                href={r.href}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-4 py-2 text-sm text-ink hover:bg-paper-2 transition-colors"
              >
                {r.label}
                <ArrowRight className="h-3.5 w-3.5 text-muted" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto max-w-5xl px-5 md:px-10 pb-24">
        <div className="rounded-2xl border border-[var(--gold-line)] bg-inkwash px-6 py-12 text-center text-[var(--on-dark)] md:px-12">
          <h2 className="font-display text-3xl md:text-4xl">
            Run your travel agency on one platform
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-[var(--on-dark)]/75">
            Start your free trial today, or get a quick walkthrough on your own
            trips.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-[8px] bg-paper px-6 py-3 text-sm font-medium text-ink hover:bg-paper-2 transition-colors"
            >
              Request your free trial
              <ArrowRight className="h-4 w-4" />
            </Link>
            <RequestDemoDialog
              trigger={
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-[8px] border border-white/30 px-6 py-3 text-sm font-medium text-white hover:bg-white/10 transition-colors"
                >
                  Get a free demo
                </button>
              }
            />
          </div>
        </div>
      </section>
    </>
  );
}
