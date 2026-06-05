import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/brand/mark";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-5 text-center">
      <Link
        href="/"
        className="flex items-center text-ink"
        aria-label="tripOS home"
      >
        <Logo size={30} wordClassName="text-xl" />
      </Link>

      <p className="mt-12 font-mono text-sm uppercase tracking-[0.3em] text-gold-deep">
        Error 404
      </p>
      <h1 className="mt-3 font-display text-4xl text-ink md:text-5xl">
        This page wandered off the map
      </h1>
      <p className="mt-4 max-w-md text-ink/70">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
        Let&apos;s get you back on route.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-[8px] bg-inkwash px-6 py-3 text-sm font-medium text-[var(--on-dark)] transition-colors hover:bg-inkwash/90"
        >
          Back to home
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/help"
          className="inline-flex items-center gap-2 rounded-[8px] border border-line bg-paper px-6 py-3 text-sm font-medium text-ink transition-colors hover:border-line-2"
        >
          Visit help centre
        </Link>
      </div>
    </div>
  );
}
