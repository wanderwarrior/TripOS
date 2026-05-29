import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Compass,
  CreditCard,
  FileText,
  LifeBuoy,
  MessageCircle,
  Rocket,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { HelpSearch } from "@/components/help/help-search";
import {
  HELP_ARTICLES,
  HELP_CATEGORIES,
  HELP_FAQS,
  articlesInCategory,
  categoryById,
  type HelpIconKey,
} from "@/lib/help-content";

export const dynamic = "force-dynamic";
export const metadata = { title: "Help · TripCraft" };

const ICONS: Record<HelpIconKey, LucideIcon> = {
  rocket: Rocket,
  users: Users,
  compass: Compass,
  fileText: FileText,
  wallet: Wallet,
  messageCircle: MessageCircle,
  building: Building2,
  barChart: BarChart3,
  creditCard: CreditCard,
};

export default function HelpPage() {
  const searchItems = HELP_ARTICLES.map((a) => ({
    slug: a.slug,
    title: a.title,
    summary: a.summary,
    categoryTitle: categoryById(a.categoryId)?.title ?? "",
  }));

  return (
    <PageShell>
      <header className="mb-8 text-center max-w-2xl mx-auto">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-navy text-ivory mx-auto">
          <LifeBuoy className="h-5 w-5" />
        </span>
        <h1 className="mt-4 font-display text-4xl md:text-5xl text-navy leading-tight">
          How can we help?
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Guides and fixes for everything in TripCraft. Search, or browse by
          topic.
        </p>
        <div className="mt-6 text-left">
          <HelpSearch articles={searchItems} />
        </div>
      </header>

      {/* Browse by category */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {HELP_CATEGORIES.map((cat) => {
          const Icon = ICONS[cat.icon];
          const articles = articlesInCategory(cat.id);
          return (
            <div
              key={cat.id}
              className="rounded-2xl border border-line bg-white p-5 shadow-soft"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ivory border border-line text-sand-700">
                  <Icon className="h-4 w-4" />
                </span>
                <h2 className="font-display text-lg text-navy">{cat.title}</h2>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {cat.description}
              </p>
              <ul className="mt-4 space-y-1.5">
                {articles.map((a) => (
                  <li key={a.slug}>
                    <Link
                      href={`/help/${a.slug}`}
                      className="group flex items-center justify-between gap-2 text-sm text-ink/80 hover:text-navy transition-colors"
                    >
                      <span className="truncate">{a.title}</span>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      {/* Troubleshooting */}
      <section className="mt-12">
        <h2 className="font-display text-2xl text-navy mb-5">
          Stuck? Common fixes
        </h2>
        <div className="space-y-2.5">
          {HELP_FAQS.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl border border-line bg-white px-5 py-4 [&_summary]:cursor-pointer"
            >
              <summary className="flex items-center justify-between gap-3 text-sm font-medium text-navy list-none">
                {f.q}
                <span className="text-muted-foreground transition-transform group-open:rotate-45 text-lg leading-none">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm text-ink/75 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* New here? */}
      <section className="mt-12 rounded-2xl border border-sand-200 bg-sand-50/50 p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white border border-line text-sand-700">
            <Rocket className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-medium text-navy">New to TripCraft?</p>
            <p className="text-xs text-muted-foreground">
              Replay the quick welcome walkthrough.
            </p>
          </div>
        </div>
        <Link
          href="/?tour=1"
          className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-navy hover:border-navy/40 transition-colors"
        >
          Replay the tour
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* Contact */}
      <section className="mt-6 rounded-3xl border border-line bg-navy text-ivory p-8 text-center">
        <h2 className="font-display text-2xl">Still need a hand?</h2>
        <p className="mt-2 text-sm text-ivory/75 max-w-md mx-auto">
          Can&apos;t find what you&apos;re looking for? Our team is one message
          away.
        </p>
        <a
          href="mailto:support@tripcraft.app"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-ivory px-5 py-2.5 text-sm font-medium text-navy hover:bg-white transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          Email support
        </a>
      </section>
    </PageShell>
  );
}
