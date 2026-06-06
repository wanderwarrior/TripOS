"use client";

// Small client-side motion primitives for the marketing surface. Kept generic
// so server-rendered content can be passed as `children` and only the wrapper
// animates — the copy stays in the RSC payload, the motion is progressive
// enhancement. All of these respect `prefers-reduced-motion`.

import {
  animate,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  type Variants,
} from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Fade + rise into view, once. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Premium reveal for product mockups — subtle scale + directional slide-in. */
export function MockReveal({
  children,
  className,
  from = "right",
}: {
  children: ReactNode;
  className?: string;
  from?: "left" | "right";
}) {
  const reduce = useReducedMotion();
  const dx = from === "left" ? -40 : 40;
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, x: dx, y: 16, scale: 0.96 }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.75, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Parent that staggers its <StaggerItem> children as the group scrolls in. */
export function Stagger({
  children,
  className,
  gap = 0.12,
}: {
  children: ReactNode;
  className?: string;
  gap?: number;
}) {
  const variants: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: gap } },
  };
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const variants: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 26 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
  };
  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  );
}

/** Counts up from 0 → `to` the first time it scrolls into view. */
export function CountUp({
  to,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1.8,
  className,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setValue(to);
      return;
    }
    const controls = animate(0, to, {
      duration,
      ease: EASE,
      onUpdate: (v) => setValue(v),
    });
    return () => controls.stop();
  }, [inView, to, duration, reduce]);

  const formatted =
    decimals > 0
      ? value.toFixed(decimals)
      : Math.round(value).toLocaleString("en-IN");

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

/** Thin gold bar pinned to the top of the viewport that fills with page scroll. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });
  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-50 h-[3px] origin-left bg-gradient-to-r from-[var(--gold-deep)] via-[#d8b876] to-[var(--gold-deep)]"
    />
  );
}
