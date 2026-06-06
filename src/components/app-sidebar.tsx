"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Rocket } from "lucide-react";
import { NAV_GROUPS, isNavActive } from "@/lib/nav";
import { Logo } from "@/components/brand";
import { cn } from "@/lib/utils";

export type SidebarPlan = {
  tier: "TRIAL" | "STARTER" | "PRO";
  trialActive: boolean;
  trialDaysLeft: number | null;
  needsUpgrade: boolean;
};

const TRIAL_TOTAL_DAYS = 14;

// Desktop left rail — "Atelier Pro": full-height inkwash panel with a warm
// gold edge-glow, gold brand mark, and a gold left-edge bar on the active
// item. Hidden below md ([mobile-nav.tsx](src/components/mobile-nav.tsx)
// covers small screens). Sticky full-height flex child so it stays put while
// the content scrolls.
export function AppSidebar({
  agencyName,
  userName,
  plan,
}: {
  agencyName: string;
  userName?: string;
  plan?: SidebarPlan;
}) {
  const pathname = usePathname();
  const initials = (userName ?? agencyName)
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <aside
      className="relative hidden md:flex sticky top-0 h-screen shrink-0 flex-col bg-inkwash text-[var(--on-dark)] print:hidden"
      style={{ width: "var(--side-w)", borderRight: "1px solid rgba(255,255,255,.06)" }}
    >
      {/* warm gold edge glow on the right */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 h-full w-px"
        style={{
          background:
            "linear-gradient(180deg, transparent, rgba(200,169,106,.25), transparent)",
        }}
      />

      <Link
        href="/dashboard"
        className="flex items-center gap-3 px-[18px]"
        style={{
          height: "var(--top-h)",
          borderBottom: "1px solid rgba(255,255,255,.07)",
        }}
      >
        <Logo size={30} wordClassName="text-[19px] text-white" />
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 py-3.5 space-y-4">
        {NAV_GROUPS.map((group, gi) => (
          <div key={group.label ?? `g${gi}`}>
            {group.label ? (
              <p className="px-2.5 pb-1.5 text-[9.5px] font-semibold uppercase tracking-[0.24em] text-[rgba(157,176,190,.55)]">
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
                      title={item.desc}
                      className={cn(
                        "group relative flex items-center gap-[11px] rounded-[9px] px-2.5 py-2 text-[13px] transition-colors",
                        active
                          ? "bg-white/[0.08] font-medium text-white"
                          : "font-normal text-[var(--on-dark-mut)] hover:bg-white/5 hover:text-white"
                      )}
                    >
                      {active ? (
                        <span
                          aria-hidden
                          className="absolute -left-3 top-1/2 -translate-y-1/2 rounded-r-[3px] bg-gold"
                          style={{ width: 3, height: 20 }}
                        />
                      ) : null}
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          active
                            ? "text-gold"
                            : "text-[rgba(157,176,190,.7)] group-hover:text-[var(--on-dark)]"
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

      {plan ? <PlanChip plan={plan} /> : null}

      <div
        className="flex items-center gap-2.5 px-3.5 py-[11px]"
        style={{ borderTop: "1px solid rgba(255,255,255,.07)" }}
      >
        <span
          className="flex h-8 w-8 flex-none items-center justify-center rounded-[9px] text-xs font-semibold text-gold"
          style={{
            background: "linear-gradient(150deg,#2a3b49,#16242f)",
            border: "1px solid rgba(255,255,255,.08)",
          }}
        >
          {initials || "TC"}
        </span>
        <div className="min-w-0">
          {userName ? (
            <div className="truncate text-[12.5px] font-medium leading-tight text-white">
              {userName}
            </div>
          ) : null}
          <div className="truncate text-[10.5px] leading-tight text-[var(--on-dark-mut)]">
            {agencyName}
          </div>
        </div>
      </div>
    </aside>
  );
}

// Persistent plan/trial status — always visible (like the best SaaS sidebars),
// so trial days left + the upgrade path are never more than a glance away.
function PlanChip({ plan }: { plan: SidebarPlan }) {
  const pct = Math.min(
    100,
    Math.max(6, Math.round(((plan.trialDaysLeft ?? 0) / TRIAL_TOTAL_DAYS) * 100))
  );
  const paidLabel = plan.tier === "PRO" ? "Pro" : "Starter";

  return (
    <div className="px-3.5 pt-3">
      <div className="rounded-[10px] border border-white/10 bg-white/[0.04] p-3">
        {plan.needsUpgrade ? (
          <>
            <p className="text-[11.5px] font-medium text-white">Trial ended</p>
            <p className="mt-0.5 text-[10.5px] leading-snug text-[var(--on-dark-mut)]">
              Upgrade to keep full access.
            </p>
          </>
        ) : plan.trialActive ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-[11.5px] font-medium text-white">
                Free trial
              </span>
              <span className="text-[10.5px] font-medium text-gold">
                {plan.trialDaysLeft === 0
                  ? "ends today"
                  : `${plan.trialDaysLeft}d left`}
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gold"
                style={{ width: `${pct}%` }}
              />
            </div>
          </>
        ) : (
          <p className="text-[11.5px] font-medium text-white">
            {paidLabel} plan ·{" "}
            <span className="text-[var(--on-dark-mut)]">active</span>
          </p>
        )}

        {plan.needsUpgrade || plan.trialActive ? (
          <Link
            href="/settings/billing"
            className="mt-2.5 flex items-center justify-center gap-1.5 rounded-[8px] bg-gold px-3 py-1.5 text-[11px] font-semibold text-inkwash transition-[filter] hover:brightness-105"
          >
            <Rocket className="h-3 w-3" />
            Upgrade
          </Link>
        ) : (
          <Link
            href="/settings/billing"
            className="mt-2 block text-[10.5px] text-[var(--on-dark-mut)] hover:text-white"
          >
            Manage plan →
          </Link>
        )}
      </div>
    </div>
  );
}
