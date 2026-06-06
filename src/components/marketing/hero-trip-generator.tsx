"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight, Lock, Sparkles, Wand2 } from "lucide-react";
import {
  generateSampleItineraryAction,
} from "@/server/actions/sample-itinerary";
import type { SampleItinerary } from "@/lib/ai";

const EXAMPLES = [
  "A 5-day honeymoon in Bali",
  "Family trip to Singapore over school holidays",
  "10 days in Europe with kids",
  "A relaxed weekend in Goa",
];

export function HeroTripGenerator() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<SampleItinerary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, start] = useTransition();

  function generate(text: string) {
    const value = text.trim();
    if (value.length < 4) {
      setError("Tell us a little more about your trip");
      return;
    }
    setError(null);
    start(async () => {
      const res = await generateSampleItineraryAction(value);
      if (res.ok) setResult(res.itinerary);
      else setError(res.error);
    });
  }

  return (
    <div className="mx-auto mt-10 w-full max-w-2xl text-left">
      <div className="rounded-2xl border border-white/15 bg-white/10 p-3 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)] backdrop-blur-md">
        <div className="flex items-end gap-2">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                generate(prompt);
              }
            }}
            rows={2}
            maxLength={300}
            placeholder="Describe a trip — e.g. a 6-day honeymoon in Bali, boutique hotels…"
            className="min-h-[52px] flex-1 resize-none bg-transparent px-3 py-2.5 text-[15px] text-white placeholder:text-white/45 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => generate(prompt)}
            disabled={isPending}
            className="inline-flex shrink-0 items-center gap-2 rounded-[10px] bg-[#e3c98f] px-4 py-2.5 text-sm font-semibold text-[#1a1205] transition-all hover:bg-[#ecd6a4] disabled:opacity-70"
          >
            {isPending ? (
              <>
                <Wand2 className="h-4 w-4 animate-pulse" />
                Crafting…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate
              </>
            )}
          </button>
        </div>
      </div>

      {/* Example chips */}
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => {
              setPrompt(ex);
              generate(ex);
            }}
            disabled={isPending}
            className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80 transition-colors hover:bg-white/10 disabled:opacity-60"
          >
            {ex}
          </button>
        ))}
      </div>

      {error ? (
        <p className="mt-3 text-center text-sm text-[#f3c7c0]">{error}</p>
      ) : null}

      {isPending && !result ? <LoadingCards /> : null}

      {result ? (
        <div className="mt-6 rounded-2xl border border-white/15 bg-[rgba(8,14,20,0.6)] p-5 backdrop-blur-md">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#e3c98f]">
            Your AI itinerary · preview
          </p>
          <h3 className="mt-1 font-display text-2xl text-white">
            {result.destination}
          </h3>
          <div className="mt-4 space-y-3">
            {result.days.map((d, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <p className="text-sm font-semibold text-white">{d.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-white/75">
                  {d.summary}
                </p>
              </div>
            ))}
            {/* Locked teaser — the rest of the trip + branding behind signup */}
            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="pointer-events-none blur-[3px]">
                <p className="text-sm font-semibold text-white">
                  Day 4 &amp; beyond: hotels, bookings, pricing…
                </p>
                <p className="mt-1 text-sm leading-relaxed text-white/60">
                  The full day-by-day plan, your branded proposal, quotes and a
                  GST invoice — all generated for you.
                </p>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-[rgba(8,14,20,0.7)] px-3 py-1.5 text-xs font-medium text-white">
                  <Lock className="h-3.5 w-3.5" />
                  Free to unlock
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-[10px] bg-[#e3c98f] px-6 py-3 text-sm font-semibold text-[#1a1205] transition-all hover:bg-[#ecd6a4]"
            >
              Build the full itinerary — free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <p className="mt-2 text-center text-xs text-white/50">
            Sign up free — no card. This is a taste of what your agency sends
            clients.
          </p>
        </div>
      ) : null}
    </div>
  );
}

function LoadingCards() {
  return (
    <div className="mt-6 space-y-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border border-white/10 bg-white/5 p-4"
        >
          <div className="h-3.5 w-1/3 rounded bg-white/15" />
          <div className="mt-2.5 h-3 w-full rounded bg-white/10" />
          <div className="mt-1.5 h-3 w-4/5 rounded bg-white/10" />
        </div>
      ))}
      <p className="text-center text-xs text-white/55">
        Crafting your itinerary with AI…
      </p>
    </div>
  );
}
