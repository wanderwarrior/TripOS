"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand";
import { cn } from "@/lib/utils";

// Scroll- and hover-aware marketing header. Over the landing hero it floats
// transparent with light text; it turns solid once you scroll past the hero,
// on hover, or on any page that doesn't have the dark hero (pricing, legal…).
export function MarketingNav({ isAuthed }: { isAuthed: boolean }) {
  const pathname = usePathname();
  // Only the landing page renders the dark full-viewport hero.
  const hasHero = pathname === "/";

  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!hasHero) return;
    // Flip to solid once we've scrolled roughly a viewport (past the hero).
    const onScroll = () => {
      setScrolledPastHero(window.scrollY > window.innerHeight - 72);
    };
    onScroll(); // sync on mount in case we load already scrolled / via #hash
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [hasHero]);

  // Solid whenever there's no hero, we've scrolled past it, or it's hovered.
  const solid = !hasHero || scrolledPastHero || hovered;

  return (
    <header
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "inset-x-0 top-0 z-30",
        // Over the hero we overlay (fixed, no reserved space) so the hero shows
        // through. Elsewhere we stay sticky so content flows below normally.
        hasHero ? "fixed" : "sticky"
      )}
    >
      {/* Solid background on its own layer — fading opacity animates the bg AND
          the backdrop-blur together, so there's no blur "pop" on transition. */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 border-b border-line bg-canvas/90 backdrop-blur-md transition-opacity duration-300 ease-out",
          solid ? "opacity-100" : "opacity-0"
        )}
      />

      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 md:px-10">
        <Link
          href="/"
          className={cn(
            "flex items-center transition-colors duration-200",
            solid ? "text-ink" : "text-white"
          )}
        >
          <Logo size={28} wordClassName="text-xl" />
        </Link>

        <nav
          className={cn(
            "hidden items-center gap-7 text-sm transition-colors duration-200 sm:flex",
            solid ? "text-ink/70" : "text-white/80"
          )}
        >
          <Link
            href="/#features"
            className={cn(
              "transition-colors",
              solid ? "hover:text-ink" : "hover:text-white"
            )}
          >
            Features
          </Link>
          <Link
            href="/pricing"
            className={cn(
              "transition-colors",
              solid ? "hover:text-ink" : "hover:text-white"
            )}
          >
            Pricing
          </Link>
          <Link
            href="/blog"
            className={cn(
              "transition-colors",
              solid ? "hover:text-ink" : "hover:text-white"
            )}
          >
            Guides
          </Link>
        </nav>

        <div className="flex items-center gap-2.5">
          {isAuthed ? (
            <Link
              href="/dashboard"
              className={cn(
                "rounded-[8px] px-4 py-2 text-sm font-medium transition-colors duration-200",
                solid
                  ? "bg-inkwash text-[var(--on-dark)] hover:bg-inkwash/90"
                  : "border border-white/25 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
              )}
            >
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(
                  "hidden text-sm transition-colors duration-200 sm:inline",
                  solid
                    ? "text-ink/70 hover:text-ink"
                    : "text-white/85 hover:text-white"
                )}
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className={cn(
                  "rounded-[8px] px-4 py-2 text-sm font-medium transition-colors duration-200",
                  solid
                    ? "bg-inkwash text-[var(--on-dark)] hover:bg-inkwash/90"
                    : "border border-white/25 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
                )}
              >
                Start free trial
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
