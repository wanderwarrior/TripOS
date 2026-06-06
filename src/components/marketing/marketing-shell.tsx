import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { WhatsappFab } from "@/components/marketing/whatsapp-fab";
import { Logo, BrandIntro } from "@/components/brand";

// Public, logged-out chrome for the marketing surface (landing, pricing,
// legal). Distinct from PageShell (the authenticated app frame with the
// sidebar). Reuses the app's design tokens so the brand reads consistently
// from first touch through to the product.
export async function MarketingShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  return (
    // First-load brand splash — plays once per session (shared with the app
    // dashboard via the same sessionStorage gate). It gates the page: the
    // content stays hidden until the animation finishes, then fades in.
    <BrandIntro>
      <div className="min-h-screen bg-canvas text-ink flex flex-col">
        <MarketingNav isAuthed={!!user} />

        <main className="flex-1">{children}</main>

        <WhatsappFab />

        <footer className="border-t border-line bg-paper">
        <div className="mx-auto max-w-6xl px-5 md:px-10 py-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo size={28} wordClassName="text-xl" className="text-ink" />
            <p className="mt-3 text-sm text-muted max-w-xs">
              The all-in-one platform for modern travel agencies — itineraries,
              proposals, payments and operations.
            </p>
          </div>

          <FooterCol
            title="Product"
            links={[
              { label: "Features", href: "/#features" },
              { label: "Pricing", href: "/pricing" },
              { label: "Changelog", href: "/changelog" },
              { label: "Security", href: "/security" },
              { label: "Start free trial", href: "/signup" },
            ]}
          />
          <FooterCol
            title="Solutions"
            links={[
              { label: "Travel agency software", href: "/travel-agency-software-india" },
              { label: "Travel agency CRM", href: "/travel-agency-crm" },
              { label: "Travel proposal software", href: "/travel-proposal-software" },
              { label: "GST invoicing", href: "/gst-invoicing-for-travel-agents" },
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              { label: "About", href: "/about" },
              { label: "Guides", href: "/blog" },
              { label: "Contact", href: "/contact" },
              { label: "Help centre", href: "/help" },
              { label: "Sign in", href: "/login" },
            ]}
          />
          <FooterCol
            title="Legal"
            links={[
              { label: "Terms of Service", href: "/legal/terms" },
              { label: "Privacy Policy", href: "/legal/privacy" },
              { label: "Refund Policy", href: "/legal/refund" },
              { label: "Security", href: "/security" },
            ]}
          />
        </div>
        <div className="border-t border-line/60">
          <div className="mx-auto max-w-6xl px-5 md:px-10 h-14 flex items-center justify-between text-xs text-muted">
            <span>© {new Date().getFullYear()} tripOS</span>
            <span className="uppercase tracking-[0.2em] hidden sm:inline">
              Crafted for premium travel
            </span>
          </div>
        </div>
      </footer>
      </div>
    </BrandIntro>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.22em] text-gold-deep mb-3">
        {title}
      </p>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="text-sm text-muted hover:text-ink transition-colors"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
