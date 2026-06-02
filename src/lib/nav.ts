// Single source of truth for the app's primary navigation. Consumed by
// both the desktop sidebar ([app-sidebar.tsx](src/components/app-sidebar.tsx))
// and the mobile drawer ([mobile-nav.tsx](src/components/mobile-nav.tsx)) so
// the two never drift apart.

import {
  BarChart3,
  Building2,
  CalendarClock,
  Compass,
  FileText,
  Heart,
  LayoutDashboard,
  ClipboardList,
  MessageCircle,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  // One-line "what this section is for" — surfaced as a hover tooltip in the
  // sidebar so first-time users can orient without clicking around.
  desc: string;
};

export type NavGroup = {
  // null = no section header (the lone Dashboard item)
  label: string | null;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    label: null,
    items: [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        desc: "Your daily home — key numbers and your next best actions.",
      },
      {
        href: "/reports",
        label: "Reports",
        icon: BarChart3,
        desc: "Revenue, conversion and pipeline analytics.",
      },
    ],
  },
  {
    label: "Pipeline",
    items: [
      {
        href: "/contacts",
        label: "Contacts",
        icon: Users,
        desc: "Every lead — capture inquiries and work them down the funnel.",
      },
      {
        href: "/customers",
        label: "Customers",
        icon: Heart,
        desc: "Contacts who've booked — lifetime value and trip history.",
      },
      {
        href: "/trips",
        label: "Trips",
        icon: Compass,
        desc: "Build itineraries, price quotes and turn them into bookings.",
      },
      {
        href: "/bookings",
        label: "Bookings",
        icon: Wallet,
        desc: "Confirmed trips and the payments collected against them.",
      },
      {
        href: "/invoices",
        label: "Invoices",
        icon: FileText,
        desc: "GST invoices — send, track and reconcile what's outstanding.",
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        href: "/vendors",
        label: "Vendors",
        icon: Building2,
        desc: "Your supplier directory — hotels, transport, guides, DMCs.",
      },
      {
        href: "/operations",
        label: "Operations",
        icon: ClipboardList,
        desc: "Run trips in motion — confirmations, vouchers and tasks.",
      },
    ],
  },
  {
    label: "Engage",
    items: [
      {
        href: "/communications",
        label: "Communications",
        icon: MessageCircle,
        desc: "WhatsApp threads, templates and message history.",
      },
      {
        href: "/follow-ups",
        label: "Follow-ups",
        icon: CalendarClock,
        desc: "Scheduled nudges so no lead or customer goes cold.",
      },
    ],
  },
];

/**
 * True when `pathname` belongs to `href` — exact match for "/", prefix
 * match otherwise. Shared so the sidebar and drawer highlight identically.
 */
export function isNavActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}
