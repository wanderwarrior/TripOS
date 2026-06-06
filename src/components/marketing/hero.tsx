"use client";

import Link from "next/link";
import { ArrowRight, ChevronDown, Sparkles } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { TRIAL_DAYS } from "@/lib/plans";
import { parseYouTubeId, youTubeBackgroundEmbedUrl } from "@/lib/video";
import { Mark } from "@/components/brand";
import { HeroTripGenerator } from "@/components/marketing/hero-trip-generator";

const EASE = [0.22, 1, 0.36, 1] as const;

// Bundled fallbacks — used when the platform admin hasn't configured a hero
// video in the owner console (see /admin → Marketing site).
const DEFAULT_VIDEO = "/videos/hero.mp4";
const DEFAULT_POSTER = "/videos/hero-poster.jpg";

export function Hero({
  isAuthed = false,
  videoUrl,
  posterUrl,
}: {
  isAuthed?: boolean;
  videoUrl?: string | null;
  posterUrl?: string | null;
}) {
  const reduce = useReducedMotion();

  const video = videoUrl?.trim() || DEFAULT_VIDEO;
  const poster = posterUrl?.trim() || DEFAULT_POSTER;
  // A configured URL points at a single file; the bundled default ships in two
  // formats, so only the default gets the extra <source>.
  const isDefaultVideo = video === DEFAULT_VIDEO;
  // A YouTube link can't play in a bare <video>; embed it as a muted, looping,
  // chrome-free background iframe instead.
  const youTubeId = parseYouTubeId(video);

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
  };
  const item: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 28 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
  };

  return (
    <section className="relative isolate flex min-h-[92vh] items-center overflow-hidden">
      {/* Animated fallback — always present, so the hero is never blank even
          before /videos/hero.mp4 exists. The video (when it loads) sits on
          top and covers it. */}
      <div aria-hidden className="marketing-hero-aurora absolute inset-0 -z-20" />

      {/* Background video. Configured by the platform admin in the owner
          console, falling back to the bundled /public/videos files. Muted +
          playsInline so mobile browsers autoplay it. A YouTube link renders as
          a chrome-free background iframe; anything else as a real <video>. */}
      {!reduce &&
        (youTubeId ? (
          <div
            aria-hidden
            className="absolute inset-0 -z-10 overflow-hidden bg-inkwash"
          >
            <iframe
              key={youTubeId}
              title="Hero background"
              src={youTubeBackgroundEmbedUrl(youTubeId)}
              allow="autoplay; encrypted-media; picture-in-picture"
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              // Scale a 16:9 frame to always cover the viewport.
              style={{
                width: "100vw",
                height: "56.25vw",
                minWidth: "177.78vh",
                minHeight: "100vh",
              }}
            />
          </div>
        ) : (
          <video
            key={video}
            className="absolute inset-0 -z-10 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={poster}
          >
            <source src={video} type="video/mp4" />
            {isDefaultVideo && (
              <source src="/videos/hero.webm" type="video/webm" />
            )}
          </video>
        ))}

      {/* Scrim for legibility + a soft gold glow top-right. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(8,14,20,0.55)_0%,rgba(8,14,20,0.68)_50%,rgba(8,14,20,0.94)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_80%_0%,rgba(200,169,106,0.22),transparent_60%)]"
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative mx-auto max-w-3xl px-5 py-24 text-center md:px-10 md:py-28"
      >
        {/* Brand intro — the C·Stack mark stacks itself in on first paint. */}
        <div className="brand-intro run mb-5 flex justify-center text-white">
          <Mark size={42} title="tripOS" />
        </div>

        <motion.span
          variants={item}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm"
        >
          <Sparkles className="h-3.5 w-3.5 text-[#e3c98f]" />
          The operating system for travel agencies
        </motion.span>

        <motion.h1
          variants={item}
          className="mt-5 font-display text-4xl leading-[1.02] tracking-tight text-white md:text-6xl"
        >
          From idea to itinerary
          <br className="hidden md:block" /> in seconds.
        </motion.h1>

        <motion.p
          variants={item}
          className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/80 md:text-lg"
        >
          AI itineraries are just the start. tripOS runs your whole agency —{" "}
          <span className="text-white">CRM &amp; lead pipeline, branded
          proposals, bookings, WhatsApp, payments and GST invoicing</span> — on
          one platform.
        </motion.p>

        {isAuthed ? (
          <>
            <motion.div
              variants={item}
              className="mt-8 flex flex-wrap items-center justify-center gap-3"
            >
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2 rounded-[10px] bg-[#e3c98f] px-6 py-3.5 text-sm font-semibold text-[#1a1205] shadow-[0_8px_30px_-8px_rgba(200,169,106,0.6)] transition-all hover:bg-[#ecd6a4]"
              >
                Go to dashboard
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center gap-2 rounded-[10px] border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/10"
              >
                Explore features
              </Link>
            </motion.div>
            <motion.p variants={item} className="mt-5 text-xs text-white/55">
              Welcome back — pick up right where you left off.
            </motion.p>
          </>
        ) : (
          <>
            {/* Product-led "try it" widget — the centerpiece, above the fold. */}
            <motion.div variants={item}>
              <HeroTripGenerator />
            </motion.div>
            <motion.p
              variants={item}
              className="mt-5 text-xs text-white/65"
            >
              <Link
                href="/signup"
                className="font-medium text-white underline-offset-4 hover:underline"
              >
                Start your {TRIAL_DAYS}-day free trial
              </Link>
              <span className="mx-2 text-white/30">·</span>
              <Link href="/pricing" className="hover:text-white">
                See pricing
              </Link>
              <span className="mx-2 text-white/30">·</span>
              No card required
            </motion.p>
          </>
        )}
      </motion.div>

      {/* Scroll cue */}
      {!reduce && (
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="absolute inset-x-0 bottom-7 flex justify-center"
        >
          <motion.span
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 text-white/70"
          >
            <ChevronDown className="h-4 w-4" />
          </motion.span>
        </motion.div>
      )}
    </section>
  );
}
