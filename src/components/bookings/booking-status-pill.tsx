"use client";

import { useTransition } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { BookingStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  BOOKING_STATUS_LABEL,
  BOOKING_STATUS_ORDER,
  BOOKING_STATUS_TONE,
} from "@/lib/crm";
import { updateBookingStatusAction } from "@/server/actions/bookings";

export function BookingStatusPill({
  bookingId,
  status,
}: {
  bookingId: string;
  status: BookingStatus;
}) {
  const [isPending, startTransition] = useTransition();

  function setStatus(next: BookingStatus) {
    if (next === status) return;
    startTransition(async () => {
      try {
        await updateBookingStatusAction({ bookingId, status: next });
        toast.success(`Booking ${BOOKING_STATUS_LABEL[next]}`);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Couldn't update status");
      }
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none focus-visible:ring-2 focus-visible:ring-sand-300 rounded-full">
        <Badge
          variant={BOOKING_STATUS_TONE[status]}
          className="cursor-pointer hover:opacity-90"
        >
          {BOOKING_STATUS_LABEL[status]}
          {isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <ChevronDown className="h-3 w-3 opacity-70" />
          )}
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Move to</DropdownMenuLabel>
        {BOOKING_STATUS_ORDER.map((s) => (
          <DropdownMenuItem
            key={s}
            disabled={s === status}
            onSelect={() => setStatus(s)}
          >
            <Badge variant={BOOKING_STATUS_TONE[s]} className="mr-2">
              {BOOKING_STATUS_LABEL[s]}
            </Badge>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
