import Link from "next/link";
import { Compass } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-h-screen bg-ivory text-ink", className)}>
      <SiteHeader />
      <main className="container py-10 md:py-14">{children}</main>
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-ivory/80 backdrop-blur-md print:hidden">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-ivory">
            <Compass className="h-4 w-4" />
          </span>
          <span className="font-display text-xl tracking-tight text-navy">
            TripCraft
          </span>
        </Link>
        <nav className="flex items-center gap-5 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-navy transition-colors">
            Dashboard
          </Link>
          <Link href="/leads" className="hover:text-navy transition-colors">
            Leads
          </Link>
          <Link
            href="/customers"
            className="hover:text-navy transition-colors"
          >
            Customers
          </Link>
          <Link href="/trips" className="hover:text-navy transition-colors">
            Trips
          </Link>
          <Link
            href="/bookings"
            className="hover:text-navy transition-colors"
          >
            Bookings
          </Link>
          <Link
            href="/follow-ups"
            className="hover:text-navy transition-colors"
          >
            Follow-ups
          </Link>
        </nav>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line/70 bg-ivory print:hidden">
      <div className="container flex h-16 items-center justify-between text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} TripCraft</span>
        <span className="tracking-widest uppercase">
          Crafted for premium travel
        </span>
      </div>
    </footer>
  );
}
