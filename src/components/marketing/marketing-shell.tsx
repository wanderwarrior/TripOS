import Link from "next/link";
import { Compass } from "lucide-react";
import { getSessionUser } from "@/lib/session";

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
    <div className="min-h-screen bg-ivory text-ink flex flex-col">
      <header className="sticky top-0 z-30 border-b border-line/70 bg-ivory/85 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-5 md:px-10 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-ivory">
              <Compass className="h-4 w-4" />
            </span>
            <span className="font-display text-xl tracking-tight text-navy">
              TripCraft
            </span>
          </Link>

          <nav className="hidden sm:flex items-center gap-7 text-sm text-navy/80">
            <Link href="/#features" className="hover:text-navy transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="hover:text-navy transition-colors">
              Pricing
            </Link>
          </nav>

          <div className="flex items-center gap-2.5">
            {user ? (
              <Link
                href="/"
                className="rounded-full bg-navy px-4 py-2 text-sm font-medium text-ivory hover:bg-navy/90 transition-colors"
              >
                Go to dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden sm:inline text-sm text-navy/80 hover:text-navy transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-full bg-navy px-4 py-2 text-sm font-medium text-ivory hover:bg-navy/90 transition-colors"
                >
                  Start free trial
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-line/70 bg-white">
        <div className="mx-auto max-w-6xl px-5 md:px-10 py-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-ivory">
                <Compass className="h-4 w-4" />
              </span>
              <span className="font-display text-xl tracking-tight text-navy">
                TripCraft
              </span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground max-w-xs">
              The all-in-one platform for modern travel agencies — itineraries,
              proposals, payments and operations.
            </p>
          </div>

          <FooterCol
            title="Product"
            links={[
              { label: "Features", href: "/#features" },
              { label: "Pricing", href: "/pricing" },
              { label: "Sign in", href: "/login" },
              { label: "Start free trial", href: "/signup" },
            ]}
          />
          <FooterCol
            title="Legal"
            links={[
              { label: "Terms of Service", href: "/legal/terms" },
              { label: "Privacy Policy", href: "/legal/privacy" },
              { label: "Refund Policy", href: "/legal/refund" },
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              { label: "hello@tripcraft.app", href: "mailto:hello@tripcraft.app" },
              { label: "Support", href: "mailto:support@tripcraft.app" },
            ]}
          />
        </div>
        <div className="border-t border-line/60">
          <div className="mx-auto max-w-6xl px-5 md:px-10 h-14 flex items-center justify-between text-xs text-muted-foreground">
            <span>© {new Date().getFullYear()} TripCraft</span>
            <span className="uppercase tracking-[0.2em] hidden sm:inline">
              Crafted for premium travel
            </span>
          </div>
        </div>
      </footer>
    </div>
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
      <p className="text-[10px] uppercase tracking-[0.22em] text-sand-700 mb-3">
        {title}
      </p>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="text-sm text-muted-foreground hover:text-navy transition-colors"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
