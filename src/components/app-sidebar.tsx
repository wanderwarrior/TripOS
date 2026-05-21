"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass } from "lucide-react";
import { NAV_GROUPS, isNavActive } from "@/lib/nav";
import { cn } from "@/lib/utils";

// Desktop left rail. Hidden below md — the mobile drawer
// ([mobile-nav.tsx](src/components/mobile-nav.tsx)) covers small screens.
// Sticky full-height flex child so it stays put while the content scrolls.
export function AppSidebar({ agencyName }: { agencyName: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex sticky top-0 h-screen w-60 shrink-0 flex-col border-r border-line/70 bg-white/60 print:hidden">
      <Link
        href="/"
        className="flex items-center gap-2 px-5 h-16 border-b border-line/70"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-ivory">
          <Compass className="h-4 w-4" />
        </span>
        <span className="font-display text-xl tracking-tight text-navy">
          TripCraft
        </span>
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
        {NAV_GROUPS.map((group, gi) => (
          <div key={group.label ?? `g${gi}`}>
            {group.label ? (
              <p className="px-3 mb-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
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
                        "group flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-navy text-ivory font-medium shadow-soft"
                          : "text-navy/80 hover:bg-white hover:text-navy"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0",
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

      <div className="border-t border-line/70 px-5 py-3">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Agency
        </p>
        <p className="text-sm text-navy font-medium truncate">{agencyName}</p>
      </div>
    </aside>
  );
}
