"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand";
import { RequestDemoDialog } from "@/components/marketing/request-demo-dialog";
import { cn } from "@/lib/utils";

// Shared button geometry so the demo + trial actions read as a matched pair.
const BTN_BASE =
  "rounded-[8px] px-4 py-2 text-sm font-medium transition-colors duration-200";
// Primary is the same gold in both states — clean, brand-forward, consistent.
const btnPrimary = `${BTN_BASE} bg-[#e3c98f] text-[#1a1205] hover:bg-[#ecd6a4]`;

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

      <div className="relative mx-auto grid h-16 max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 md:px-10">
        {/* Left: logo */}
        <div className="flex justify-start">
          <Link
            href="/"
            className={cn(
              "flex items-center transition-colors duration-200",
              solid ? "text-ink" : "text-white"
            )}
          >
            <Logo size={28} wordClassName="text-xl" />
          </Link>
        </div>

        {/* Center: nav */}
        <nav
          className={cn(
            "hidden items-center justify-center gap-8 text-sm transition-colors duration-200 sm:flex",
            solid ? "text-ink/70" : "text-white/80"
          )}
        >
          {[
            { label: "Features", href: "/#features" },
            { label: "Pricing", href: "/pricing" },
            { label: "Guides", href: "/blog" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "transition-colors",
                solid ? "hover:text-ink" : "hover:text-white"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right: actions — text link + matched secondary/primary buttons */}
        <div className="flex items-center justify-end gap-2">
          {isAuthed ? (
            <Link href="/dashboard" className={btnPrimary}>
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(
                  "hidden px-2 text-sm transition-colors duration-200 sm:inline",
                  solid
                    ? "text-ink/70 hover:text-ink"
                    : "text-white/85 hover:text-white"
                )}
              >
                Sign in
              </Link>
              <RequestDemoDialog
                trigger={
                  <button
                    type="button"
                    className={cn(
                      BTN_BASE,
                      "hidden sm:inline-flex",
                      solid
                        ? "border border-line text-ink hover:bg-paper-2"
                        : "border border-white/30 text-white hover:bg-white/10"
                    )}
                  >
                    Book a demo
                  </button>
                }
              />
              <Link href="/signup" className={btnPrimary}>
                Start free trial
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
