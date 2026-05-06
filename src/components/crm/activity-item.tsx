import {
  FilePen,
  MessageCircle,
  Phone,
  Mail,
  StickyNote,
  RefreshCw,
  Sparkles,
  FileText,
  Send,
  Check,
  Briefcase,
  Wallet,
} from "lucide-react";
import type { Activity, ActivityType } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";

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

export function ActivityItem({ activity }: { activity: Activity }) {
  return (
    <article className="flex gap-4">
      <div className="relative">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ivory border border-line text-sand-700">
          {ICONS[activity.type]}
        </span>
        <span className="absolute left-1/2 top-8 h-full w-px -translate-x-1/2 bg-line" />
      </div>
      <div className="flex-1 pb-6">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-medium text-navy text-sm">{activity.title}</p>
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground whitespace-nowrap">
            {formatDistanceToNow(activity.createdAt, { addSuffix: true })}
          </span>
        </div>
        {activity.body && (
          <p className="mt-1 text-sm text-ink/80 whitespace-pre-line leading-relaxed">
            {activity.body}
          </p>
        )}
      </div>
    </article>
  );
}
