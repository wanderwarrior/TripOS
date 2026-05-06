"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, CalendarDays, Users } from "lucide-react";
import { formatDate } from "@/lib/utils";

type Props = {
  id: string;
  destination: string;
  days: number;
  travelers: number;
  travelType: string;
  startDate: Date | string | null;
  createdAt: Date | string;
  index?: number;
};

export function TripCard({
  id,
  destination,
  days,
  travelers,
  travelType,
  startDate,
  createdAt,
  index = 0,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={`/trips/${id}`}
        className="group block rounded-2xl border border-line bg-white p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-sand-700">
              {travelType}
            </p>
            <h3 className="mt-2 font-display text-2xl text-navy leading-tight">
              {destination}
            </h3>
          </div>
          <span className="opacity-0 transition-opacity group-hover:opacity-100 text-navy">
            <ArrowUpRight className="h-5 w-5" />
          </span>
        </div>

        <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {days} days
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {travelers}
          </span>
          {startDate && (
            <span className="ml-auto text-[11px] uppercase tracking-widest">
              {formatDate(startDate)}
            </span>
          )}
        </div>
        <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
          Created {formatDate(createdAt)}
        </p>
      </Link>
    </motion.div>
  );
}
