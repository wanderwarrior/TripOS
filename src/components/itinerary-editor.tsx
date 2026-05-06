"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import {
  Loader2,
  RotateCcw,
  Save,
  Sparkles,
  Sun,
  Sunrise,
  Sunset,
  UtensilsCrossed,
  StickyNote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { SegmentInlineCard } from "@/components/segments/segment-card";
import {
  regenerateItineraryAction,
  saveItineraryAction,
} from "@/server/actions/itineraries";
import type { ItineraryContent, ItineraryDay } from "@/lib/ai";
import type { TravelSegment } from "@prisma/client";

type Props = {
  tripId: string;
  destination: string;
  initial: ItineraryContent | null;
  segments?: TravelSegment[];
};

export function ItineraryEditor({
  tripId,
  destination,
  initial,
  segments = [],
}: Props) {
  const [content, setContent] = useState<ItineraryContent | null>(initial);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [isSaving, startSave] = useTransition();
  const [isRegenerating, startRegen] = useTransition();

  function updateDay(index: number, day: ItineraryDay) {
    if (!content) return;
    setContent({
      ...content,
      days: content.days.map((d, i) => (i === index ? day : d)),
    });
  }

  function updateSummary(summary: string) {
    if (!content) return;
    setContent({ ...content, summary });
  }

  function save() {
    if (!content) return;
    startSave(async () => {
      await saveItineraryAction(tripId, content);
      setSavedAt(new Date().toLocaleTimeString());
    });
  }

  function regenerate() {
    startRegen(async () => {
      await regenerateItineraryAction(tripId);
      window.location.reload();
    });
  }

  if (!content) {
    return (
      <EmptyItinerary
        destination={destination}
        onGenerate={regenerate}
        isGenerating={isRegenerating}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-sand-600">
            Itinerary
          </p>
          <h2 className="font-display text-3xl text-navy">{destination}</h2>
        </div>
        <div className="flex items-center gap-2 pt-2 flex-shrink-0">
          {savedAt && (
            <span className="text-xs text-muted-foreground">
              Saved {savedAt}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={regenerate}
            disabled={isRegenerating}
          >
            {isRegenerating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RotateCcw className="h-3.5 w-3.5" />
            )}
            Regenerate
          </Button>
          <Button size="sm" onClick={save} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-white shadow-soft p-6 md:p-8">
        <Label htmlFor="trip-summary">Trip summary</Label>
        <Textarea
          id="trip-summary"
          value={content.summary}
          onChange={(e) => updateSummary(e.target.value)}
          rows={3}
          className="mt-2 border-0 bg-ivory/60"
        />
      </div>

      <div className="space-y-5">
        {content.days.map((day, i) => (
          <DayCard
            key={i}
            day={day}
            index={i}
            onChange={(d) => updateDay(i, d)}
            segments={segments.filter((s) => s.dayNumber === i + 1)}
          />
        ))}
      </div>
    </div>
  );
}

function DayCard({
  day,
  index,
  onChange,
  segments = [],
}: {
  day: ItineraryDay;
  index: number;
  onChange: (d: ItineraryDay) => void;
  segments?: TravelSegment[];
}) {
  const blocks: {
    key: keyof ItineraryDay;
    label: string;
    icon: React.ReactNode;
    rows: number;
    placeholder: string;
  }[] = [
    {
      key: "morning",
      label: "Morning",
      icon: <Sunrise className="h-3.5 w-3.5" />,
      rows: 3,
      placeholder: "9:00 AM — …",
    },
    {
      key: "afternoon",
      label: "Afternoon",
      icon: <Sun className="h-3.5 w-3.5" />,
      rows: 3,
      placeholder: "1:30 PM — …",
    },
    {
      key: "evening",
      label: "Evening",
      icon: <Sunset className="h-3.5 w-3.5" />,
      rows: 3,
      placeholder: "7:00 PM — …",
    },
    {
      key: "food",
      label: "Food",
      icon: <UtensilsCrossed className="h-3.5 w-3.5" />,
      rows: 2,
      placeholder: "Specific local recommendations.",
    },
    {
      key: "notes",
      label: "Logistics & insider tips",
      icon: <StickyNote className="h-3.5 w-3.5" />,
      rows: 2,
      placeholder: "Distance, transport, travel time, hidden gems.",
    },
  ];

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.05,
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="rounded-2xl border border-line bg-white shadow-soft p-6 md:p-8"
    >
      <div className="flex items-center gap-3 pb-4 border-b border-line">
        <span className="font-display text-sand-600 text-xs tracking-[0.2em] uppercase">
          Day {index + 1}
        </span>
        <Input
          value={day.title}
          onChange={(e) => onChange({ ...day, title: e.target.value })}
          className="border-0 shadow-none bg-transparent font-display text-2xl text-navy h-auto px-0 focus-visible:ring-0 flex-1"
        />
      </div>

      {segments.length > 0 && (
        <div className="mt-5 space-y-2">
          {segments.map((s) => (
            <SegmentInlineCard key={s.id} segment={s} />
          ))}
        </div>
      )}

      <div className="mt-6 space-y-5">
        {blocks.map((b) => (
          <div key={b.key} className="grid grid-cols-[140px_1fr] gap-4">
            <div className="flex items-center gap-2 pt-2 text-xs uppercase tracking-[0.18em] text-sand-700">
              {b.icon}
              {b.label}
            </div>
            <Textarea
              rows={b.rows}
              value={(day[b.key] as string) ?? ""}
              placeholder={b.placeholder}
              onChange={(e) => onChange({ ...day, [b.key]: e.target.value })}
              className="text-sm leading-relaxed"
            />
          </div>
        ))}
      </div>
    </motion.article>
  );
}

function EmptyItinerary({
  destination,
  onGenerate,
  isGenerating,
}: {
  destination: string;
  onGenerate: () => void;
  isGenerating: boolean;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-line bg-white/60 p-12 md:p-16 text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-sand-700">
        Itinerary
      </p>
      <h2 className="mt-3 font-display text-3xl text-navy">{destination}</h2>
      <p className="mt-3 max-w-md mx-auto text-sm text-muted-foreground">
        We haven't generated this itinerary yet. Click below to draft a
        day-by-day plan you can shape.
      </p>
      <div className="mt-8">
        <Button onClick={onGenerate} disabled={isGenerating}>
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate itinerary
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export function ItinerarySkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-8 w-1/3" />
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-line bg-white p-6 md:p-8 space-y-4"
        >
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <div className="space-y-3 pt-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
