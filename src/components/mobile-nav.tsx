"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Menu, Search, X } from "lucide-react";
import { NAV_GROUPS, isNavActive } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // lock body scroll while drawer is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // esc to close
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function fireSearch() {
    setOpen(false);
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event("tripos:open-search"));
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-navy hover:border-sand-200"
      >
        <Menu className="h-4 w-4" />
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            className="absolute inset-0 bg-navy/40 backdrop-blur-sm"
            aria-hidden
          />
          <aside
            role="dialog"
            aria-label="Menu"
            className="absolute left-0 top-0 h-full w-[82vw] max-w-xs bg-ivory shadow-lift flex flex-col"
          >
            <header className="flex items-center justify-between px-4 h-16 border-b border-line/70">
              <span className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-ivory">
                  <Compass className="h-4 w-4" />
                </span>
                <span className="font-display text-lg text-navy tracking-tight">
                  TripCraft
                </span>
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-navy hover:bg-white"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <button
              type="button"
              onClick={fireSearch}
              className="m-4 flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-sm text-muted-foreground hover:border-sand-200 hover:text-navy"
            >
              <Search className="h-4 w-4" />
              Search everything
            </button>

            <nav className="flex-1 px-3 pb-4 overflow-y-auto space-y-5">
              {NAV_GROUPS.map((group, gi) => (
                <div key={group.label ?? `g${gi}`}>
                  {group.label ? (
                    <p className="px-3 mb-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      {group.label}
                    </p>
                  ) : null}
                  <ul className="space-y-0.5">
                    {group.items.map((item) => {
                      const active = isNavActive(pathname, item.href);
                      const Icon = item.icon;
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={cn(
                              "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors",
                              active
                                ? "bg-navy text-ivory font-medium"
                                : "text-navy hover:bg-white"
                            )}
                          >
                            <Icon
                              className={cn(
                                "h-4 w-4",
                                active ? "text-ivory" : "text-sand-700"
                              )}
                            />
                            {item.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>

            <footer className="border-t border-line/70 px-4 py-3 text-[11px] text-muted-foreground">
              TripCraft · Crafted for premium travel
            </footer>
          </aside>
        </div>
      ) : null}
    </>
  );
}
