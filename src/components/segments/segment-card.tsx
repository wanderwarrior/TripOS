import { Plane, Train } from "lucide-react";
import type { TravelSegment } from "@prisma/client";
import { cn } from "@/lib/utils";

function formatTime(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatDateShort(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export function SegmentInlineCard({
  segment,
  className,
}: {
  segment: TravelSegment;
  className?: string;
}) {
  const isFlight = segment.type === "FLIGHT";
  const Icon = isFlight ? Plane : Train;
  const identifier = isFlight
    ? [segment.airline, segment.flightNumber].filter(Boolean).join(" · ")
    : [segment.trainName, segment.trainNumber].filter(Boolean).join(" · ");

  return (
    <div
      className={cn(
        "rounded-2xl border border-sand-200 bg-sand-50/50 px-5 py-4",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-sand-200 text-sand-700 flex-shrink-0">
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="font-medium text-navy">
              {segment.from} <span className="text-sand-700">→</span>{" "}
              {segment.to}
            </p>
            {identifier && (
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mt-0.5">
                {identifier}
              </p>
            )}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm tabular-nums text-navy">
            {formatTime(segment.departureTime)}
            <span className="text-muted-foreground"> → </span>
            {formatTime(segment.arrivalTime)}
          </p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-0.5">
            {formatDateShort(segment.departureTime)}
          </p>
        </div>
      </div>
    </div>
  );
}
