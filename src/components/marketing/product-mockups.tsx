import { Check, CreditCard, FileText, Sparkles } from "lucide-react";

// Shared CSS-only product mockups (no screenshots). Used by the interactive
// PlatformShowcase (second fold) and the deeper FeatureShowcase, so the whole
// page shows one consistent, premium product UI. Pure presentational — safe in
// both server and client components.

export type StageKey =
  | "capture"
  | "plan"
  | "propose"
  | "book"
  | "operate"
  | "grow";

/** Browser-chrome frame so a mockup reads as the real product. */
export function Frame({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-paper shadow-lift">
      <div className="flex items-center gap-1.5 border-b border-line bg-paper-2 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#e06c60]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#e9b44c]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#5bbf7b]" />
        <span className="ml-2 text-[11px] font-medium text-muted">
          {label} · tripOS
        </span>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

export function StageMock({ stage }: { stage: StageKey }) {
  switch (stage) {
    case "capture":
      return <MockCapture />;
    case "plan":
      return <MockPlan />;
    case "propose":
      return <MockPropose />;
    case "book":
      return <MockBook />;
    case "operate":
      return <MockOperate />;
    case "grow":
      return <MockGrow />;
  }
}

function LeadCard({ name, trip }: { name: string; trip: string }) {
  return (
    <div className="rounded-lg border border-line bg-paper px-2.5 py-2 shadow-soft">
      <p className="text-[12px] font-medium text-ink leading-tight">{name}</p>
      <p className="text-[10px] text-muted">{trip}</p>
    </div>
  );
}

export function MockCapture() {
  const cols: { h: string; tone: string; cards: [string, string][] }[] = [
    { h: "New", tone: "text-muted", cards: [["Aarav S.", "Bali · honeymoon"], ["Meera K.", "Dubai · family"]] },
    { h: "Quoted", tone: "text-gold-deep", cards: [["Tara M.", "Japan · 2 pax"]] },
    { h: "Won", tone: "text-[var(--ok)]", cards: [["Rohit K.", "Goa · group"]] },
  ];
  return (
    <div className="grid grid-cols-3 gap-2">
      {cols.map((c) => (
        <div key={c.h} className="rounded-lg bg-paper-2 p-2">
          <p className={"mb-1.5 text-[10px] font-semibold uppercase tracking-wide " + c.tone}>
            {c.h}
          </p>
          <div className="space-y-1.5">
            {c.cards.map(([n, t]) => (
              <LeadCard key={n} name={n} trip={t} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function MockPlan() {
  return (
    <div className="space-y-2.5">
      <div className="inline-flex items-center gap-1.5 rounded-full bg-gold-soft px-2.5 py-1 text-[11px] font-medium text-gold-deep">
        <Sparkles className="h-3 w-3" /> AI itinerary · generated in 8s
      </div>
      {[
        ["Day 1 · Arrival in Ubud", "Settle into a riverside villa, sunset at the rice terraces and a chef-led welcome dinner."],
        ["Day 2 · Temples & waterfalls", "A guided morning at Tirta Empul, hidden waterfalls by afternoon, free evening in town."],
        ["Day 3 · Islands & snorkelling", "Speedboat to Nusa Penida, snorkel Manta Point, beach club at golden hour."],
      ].map(([t, d]) => (
        <div key={t} className="rounded-lg border border-line bg-paper-2 p-3">
          <p className="text-[12.5px] font-semibold text-ink">{t}</p>
          <p className="mt-0.5 text-[11.5px] leading-snug text-muted">{d}</p>
        </div>
      ))}
    </div>
  );
}

export function MockPropose() {
  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <div className="relative bg-inkwash p-4 text-white">
        <p className="text-[10px] uppercase tracking-[0.18em] text-gold">
          Wanderlust Travel
        </p>
        <p className="mt-1 font-display text-xl">Bali — 6 nights</p>
        <p className="text-[11px] text-white/70">Boutique villas · private transfers</p>
      </div>
      <div className="flex items-center justify-between gap-2 bg-paper px-4 py-3">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted">From</p>
          <p className="text-base font-semibold text-ink">₹1,24,000</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="inline-flex items-center gap-1 rounded-full bg-gold-soft px-2 py-0.5 text-[10px] font-medium text-gold-deep">
            White-label PDF
          </span>
          <span className="text-[10px] text-[var(--ok)]">Sent on WhatsApp ✓✓</span>
        </div>
      </div>
    </div>
  );
}

export function MockBook() {
  return (
    <div className="space-y-2.5">
      <div className="rounded-lg border border-line bg-paper-2 p-3">
        <div className="flex items-center justify-between text-[12.5px]">
          <span className="font-medium text-ink">Bali booking</span>
          <span className="font-semibold text-ink">₹1,24,000</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-[var(--ok)]" style={{ width: "40%" }} />
        </div>
        <p className="mt-1 text-[10.5px] text-muted">₹50,000 paid · ₹74,000 due</p>
      </div>
      <div className="flex items-center justify-between rounded-lg border border-line bg-paper px-3 py-2 text-[12px]">
        <span className="inline-flex items-center gap-1.5 text-ink">
          <CreditCard className="h-3.5 w-3.5 text-gold-deep" /> Razorpay payment link
        </span>
        <span className="rounded-md bg-paper-2 px-2 py-0.5 text-[10px] text-muted">Copy</span>
      </div>
      <div className="flex items-center justify-between rounded-lg border border-line bg-paper px-3 py-2 text-[12px]">
        <span className="inline-flex items-center gap-1.5 text-ink">
          <FileText className="h-3.5 w-3.5 text-gold-deep" /> GST invoice · WL/26-27/0042
        </span>
        <Check className="h-3.5 w-3.5 text-[var(--ok)]" />
      </div>
    </div>
  );
}

export function MockOperate() {
  const rows: [string, boolean][] = [
    ["Hotel — Tugu Bali (confirmed)", true],
    ["Airport transfers (confirmed)", true],
    ["Voucher sent to traveller", true],
    ["Day-1 pickup — assign driver", false],
  ];
  return (
    <ul className="space-y-2">
      {rows.map(([t, done]) => (
        <li
          key={t}
          className="flex items-center gap-2.5 rounded-lg border border-line bg-paper-2 px-3 py-2 text-[12.5px] text-ink"
        >
          <span
            className={
              "flex h-4 w-4 items-center justify-center rounded-full " +
              (done ? "bg-[var(--ok)] text-white" : "border border-line bg-paper")
            }
          >
            {done ? <Check className="h-2.5 w-2.5" /> : null}
          </span>
          <span className={done ? "" : "text-muted"}>{t}</span>
        </li>
      ))}
    </ul>
  );
}

export function MockGrow() {
  const bars = [40, 62, 50, 78, 66, 90];
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {[
          ["Collected", "₹8.4L"],
          ["Conversion", "32%"],
        ].map(([l, v]) => (
          <div key={l} className="rounded-lg border border-line bg-paper-2 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-muted">{l}</p>
            <p className="text-base font-semibold text-ink tabular-nums">{v}</p>
          </div>
        ))}
      </div>
      <div className="flex h-24 items-end gap-1.5 rounded-lg border border-line bg-paper-2 p-3">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-gradient-to-t from-gold-deep to-[#e3c98f]"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}
