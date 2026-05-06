import Link from "next/link";
import {
  Briefcase,
  Check,
  FilePen,
  FileText,
  Mail,
  MessageCircle,
  Phone,
  RefreshCw,
  Send,
  Sparkles,
  StickyNote,
  Wallet,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Activity, ActivityType } from "@prisma/client";

const ICONS: Record<ActivityType, React.ReactNode> = {
  NOTE: <StickyNote className="h-3.5 w-3.5" />,
  CALL: <Phone className="h-3.5 w-3.5" />,
  WHATSAPP: <MessageCircle className="h-3.5 w-3.5" />,
  EMAIL: <Mail className="h-3.5 w-3.5" />,
  STATUS_CHANGED: <RefreshCw className="h-3.5 w-3.5" />,
  TRIP_CREATED: <Sparkles className="h-3.5 w-3.5" />,
  QUOTE_CREATED: <FileText className="h-3.5 w-3.5" />,
  QUOTE_SENT: <Send className="h-3.5 w-3.5" />,
  QUOTE_ACCEPTED: <Check className="h-3.5 w-3.5" />,
  BOOKING_CREATED: <Briefcase className="h-3.5 w-3.5" />,
  PAYMENT_RECORDED: <Wallet className="h-3.5 w-3.5" />,
  CUSTOM: <FilePen className="h-3.5 w-3.5" />,
};

export type ActivityFeedItem = Activity & {
  lead: { id: string; name: string };
};

export function ActivityFeed({ activities }: { activities: ActivityFeedItem[] }) {
  if (activities.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-white/60 p-8 text-center text-sm text-muted-foreground">
        No activity yet. Pipeline events show up here.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {activities.map((a) => (
        <li key={a.id}>
          <Link
            href={`/leads/${a.lead.id}`}
            className="group rounded-2xl border border-line bg-white p-4 flex items-start gap-3 hover:shadow-soft transition-all"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ivory border border-line text-sand-700 flex-shrink-0">
              {ICONS[a.type]}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-medium text-navy text-sm truncate">
                  {a.title}
                </p>
                <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(a.createdAt, { addSuffix: true })}
                </span>
              </div>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-sand-700">
                {a.lead.name}
              </p>
              {a.body && (
                <p className="mt-2 text-sm text-ink/70 line-clamp-2">
                  {a.body}
                </p>
              )}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
