"use client";

import { motion } from "framer-motion";
import {
  CalendarDays,
  Map,
  Plane,
  Sun,
  Sunrise,
  Sunset,
  Train,
  Users,
  UtensilsCrossed,
  Compass,
} from "lucide-react";
import type { TravelSegment } from "@prisma/client";
import type { ItineraryContent, ItineraryDay } from "@/lib/ai";
import type { PricingItem } from "@/types";
import { formatDate, formatINR } from "@/lib/utils";

type Trip = {
  destination: string;
  days: number;
  travelers: number;
  startDate: Date | string | null;
  travelType: string;
};

type Pricing = {
  items: PricingItem[];
  markupPct: number;
  discountPct?: number;
  markupAmount?: number;
  discountAmount?: number;
  totalCost: number;
  sellingPrice: number;
  profit: number;
  version?: number;
  status?: string;
} | null;

export function PreviewRenderer({
  trip,
  itinerary,
  pricing,
  segments = [],
}: {
  trip: Trip;
  itinerary: ItineraryContent | null;
  pricing: Pricing;
  segments?: TravelSegment[];
}) {
  return (
    <div className="space-y-20 print:space-y-10">
      <Hero trip={trip} summary={itinerary?.summary} />
      {segments.length > 0 && <TravelPlan segments={segments} />}
      {itinerary && <Itinerary itinerary={itinerary} />}
      {pricing && <PricingBlock pricing={pricing} />}
      <Footer />
    </div>
  );
}

function TravelPlan({ segments }: { segments: TravelSegment[] }) {
  const flights = segments.filter((s) => s.type === "FLIGHT");
  const trains = segments.filter((s) => s.type === "TRAIN");

  return (
    <section className="space-y-12">
      <SectionHeading eyebrow="Getting there" title="Travel plan" />

      <div className="grid gap-6 md:grid-cols-2 print:grid-cols-2">
        {flights.length > 0 && (
          <SegmentGroup
            title="Flights"
            icon={<Plane className="h-3.5 w-3.5" />}
            segments={flights}
          />
        )}
        {trains.length > 0 && (
          <SegmentGroup
            title="Trains"
            icon={<Train className="h-3.5 w-3.5" />}
            segments={trains}
          />
        )}
      </div>
    </section>
  );
}

function SegmentGroup({
  title,
  icon,
  segments,
}: {
  title: string;
  icon: React.ReactNode;
  segments: TravelSegment[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6 }}
      className="rounded-3xl border border-line bg-white p-6 md:p-8 shadow-soft print:break-inside-avoid"
    >
      <p className="text-[11px] uppercase tracking-[0.22em] text-sand-700 flex items-center gap-2 mb-5">
        {icon}
        {title}
      </p>
      <ul className="space-y-5">
        {segments.map((s) => (
          <SegmentLine key={s.id} segment={s} />
        ))}
      </ul>
    </motion.div>
  );
}

function SegmentLine({ segment }: { segment: TravelSegment }) {
  const isFlight = segment.type === "FLIGHT";
  const identifier = isFlight
    ? [segment.airline, segment.flightNumber].filter(Boolean).join(" · ")
    : [segment.trainName, segment.trainNumber].filter(Boolean).join(" · ");
  const seatLine = !isFlight
    ? [
        segment.coach && `Coach ${segment.coach}`,
        segment.seat && `Seat ${segment.seat}`,
      ]
        .filter(Boolean)
        .join(" · ")
    : null;

  const dep = new Date(segment.departureTime);
  const arr = new Date(segment.arrivalTime);

  return (
    <li>
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-medium text-navy">
          {segment.from} <span className="text-sand-700">→</span> {segment.to}
        </p>
        <span className="text-[10px] uppercase tracking-[0.2em] text-sand-600 whitespace-nowrap">
          Day {segment.dayNumber}
        </span>
      </div>
      {identifier && (
        <p className="mt-0.5 text-sm text-ink/80">{identifier}</p>
      )}
      <p className="mt-1 text-sm tabular-nums text-ink/75">
        {dep.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        {" · "}
        {dep.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}
        <span className="text-muted-foreground"> → </span>
        {arr.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}
      </p>
      {seatLine && (
        <p className="mt-0.5 text-xs text-muted-foreground">{seatLine}</p>
      )}
    </li>
  );
}

function Hero({ trip, summary }: { trip: Trip; summary?: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-3xl bg-navy text-ivory print:rounded-none"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(200,169,106,0.18),transparent_60%)]" />
      <div className="relative px-8 py-16 md:px-16 md:py-24">
        <p className="text-xs uppercase tracking-[0.3em] text-sand">
          A bespoke proposal
        </p>
        <h1 className="mt-6 font-display text-5xl md:text-7xl leading-[0.95] tracking-tight">
          {trip.destination}
        </h1>
        <p className="mt-6 max-w-2xl text-ivory/75 text-lg leading-relaxed">
          {summary?.trim()
            ? summary
            : `A ${trip.days}-day ${trip.travelType.toLowerCase()} journey curated for ${
                trip.travelers === 1
                  ? "a solo traveler"
                  : `${trip.travelers} travelers`
              }.`}
        </p>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-6 max-w-xl">
          <Meta
            icon={<CalendarDays className="h-4 w-4" />}
            label="Duration"
            value={`${trip.days} days`}
          />
          <Meta
            icon={<Users className="h-4 w-4" />}
            label="Travelers"
            value={`${trip.travelers}`}
          />
          <Meta
            icon={<Map className="h-4 w-4" />}
            label="Departure"
            value={trip.startDate ? formatDate(trip.startDate) : "Flexible"}
          />
        </div>
      </div>
    </motion.section>
  );
}

function Meta({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-sand">
        {icon}
        <span className="text-[10px] uppercase tracking-[0.25em]">{label}</span>
      </div>
      <p className="mt-2 font-display text-xl text-ivory">{value}</p>
    </div>
  );
}

function Itinerary({ itinerary }: { itinerary: ItineraryContent }) {
  return (
    <section className="space-y-12">
      <SectionHeading eyebrow="The Journey" title="Day by day" />
      <div className="space-y-12">
        {itinerary.days.map((day, i) => (
          <DayBlock key={i} day={day} index={i} />
        ))}
      </div>
    </section>
  );
}

function DayBlock({ day, index }: { day: ItineraryDay; index: number }) {
  const blocks: {
    key: keyof ItineraryDay;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      key: "morning",
      label: "Morning",
      icon: <Sunrise className="h-3.5 w-3.5" />,
    },
    {
      key: "afternoon",
      label: "Afternoon",
      icon: <Sun className="h-3.5 w-3.5" />,
    },
    {
      key: "evening",
      label: "Evening",
      icon: <Sunset className="h-3.5 w-3.5" />,
    },
  ];

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="grid md:grid-cols-[180px_1fr] gap-6 md:gap-12 print:break-inside-avoid"
    >
      <div className="md:border-r md:border-line md:pr-6">
        <p className="text-xs uppercase tracking-[0.25em] text-sand-600">
          Day {index + 1}
        </p>
        <h3 className="mt-3 font-display text-2xl text-navy leading-tight">
          {stripDayPrefix(day.title)}
        </h3>
      </div>

      <div className="space-y-6">
        {blocks.map((b) => {
          const value = (day[b.key] as string)?.trim();
          if (!value) return null;
          return (
            <div
              key={b.key}
              className="grid grid-cols-[110px_1fr] gap-4 border-l-2 border-sand-200 pl-5"
            >
              <div className="flex items-center gap-2 pt-0.5 text-[11px] uppercase tracking-[0.2em] text-sand-700">
                {b.icon}
                {b.label}
              </div>
              <p className="text-ink/80 text-base leading-relaxed whitespace-pre-line">
                {value}
              </p>
            </div>
          );
        })}

        {day.food?.trim() && (
          <Callout
            icon={<UtensilsCrossed className="h-3.5 w-3.5" />}
            label="Food"
            text={day.food}
          />
        )}
        {day.notes?.trim() && (
          <Callout
            icon={<Compass className="h-3.5 w-3.5" />}
            label="Logistics & insider tips"
            text={day.notes}
            tone="ivory"
          />
        )}
      </div>
    </motion.article>
  );
}

function Callout({
  icon,
  label,
  text,
  tone = "white",
}: {
  icon: React.ReactNode;
  label: string;
  text: string;
  tone?: "white" | "ivory";
}) {
  return (
    <div
      className={`rounded-xl border border-line px-5 py-4 ${
        tone === "ivory" ? "bg-ivory" : "bg-white"
      }`}
    >
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-sand-700">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-sm text-ink/80 leading-relaxed whitespace-pre-line">
        {text}
      </p>
    </div>
  );
}

function stripDayPrefix(title: string) {
  return title.replace(/^Day\s*\d+\s*[:\-—]\s*/i, "").trim() || title;
}

function PricingBlock({
  pricing,
}: {
  pricing: NonNullable<Pricing>;
}) {
  return (
    <section className="space-y-10 print:break-before-page">
      <SectionHeading eyebrow="Investment" title="Your quotation" />
      <div className="rounded-3xl border border-line bg-white p-8 md:p-12 shadow-soft">
        <table className="w-full">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-[0.2em] text-muted-foreground border-b border-line">
              <th className="pb-3 font-medium">Category</th>
              <th className="pb-3 font-medium">Detail</th>
              <th className="pb-3 font-medium text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {pricing.items.map((it) => (
              <tr key={it.id} className="border-b border-line/60">
                <td className="py-4 text-sm text-sand-700">{it.category}</td>
                <td className="py-4 text-ink">{it.label || "—"}</td>
                <td className="py-4 text-right tabular-nums">
                  {formatINR(it.cost)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-10 flex justify-end">
          <div className="w-full max-w-sm space-y-2">
            <Line label="Subtotal" value={formatINR(pricing.totalCost)} />
            <Line
              label={`Service & curation (${pricing.markupPct}%)`}
              value={`+${formatINR(
                pricing.markupAmount ??
                  Math.round(pricing.totalCost * (pricing.markupPct / 100))
              )}`}
            />
            {!!pricing.discountPct && pricing.discountPct > 0 && (
              <Line
                label={`Discount (${pricing.discountPct}%)`}
                value={`−${formatINR(pricing.discountAmount ?? 0)}`}
              />
            )}
            <div className="my-3 h-px bg-line" />
            <div className="flex items-baseline justify-between">
              <span className="text-xs uppercase tracking-[0.2em] text-navy">
                Total
              </span>
              <span className="font-display text-3xl text-navy">
                {formatINR(pricing.sellingPrice)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6 }}
      className="text-center"
    >
      <p className="text-xs uppercase tracking-[0.3em] text-sand-700">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-display text-4xl md:text-5xl text-navy">
        {title}
      </h2>
    </motion.div>
  );
}

function Footer() {
  return (
    <div className="text-center pt-10 border-t border-line">
      <p className="font-display text-2xl text-navy">TripCraft</p>
      <p className="mt-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
        Curated travel, end to end
      </p>
    </div>
  );
}
