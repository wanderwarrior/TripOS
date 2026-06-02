"use client";

import { useState, useTransition } from "react";
import {
  Check,
  ImageIcon,
  Loader2,
  Palette,
  Sparkles,
  Stamp,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  saveProposalBrandingAction,
  type ProposalBrandingInput,
} from "@/server/actions/proposal-branding";
import {
  PROPOSAL_THEMES,
  COVER_STYLES,
  PROPOSAL_PALETTES,
  DEFAULT_ACCENT,
  DEFAULT_SURFACE,
  DEFAULT_TINT,
} from "@/lib/proposal-branding";

type Theme = (typeof PROPOSAL_THEMES)[number];
type Cover = (typeof COVER_STYLES)[number];

const THEME_INFO: Record<
  Theme,
  { name: string; tagline: string; swatch: { bg: string; fg: string; accent: string } }
> = {
  classic: {
    name: "Classic",
    tagline: "Navy hero, gold accents, display fonts. The default look.",
    swatch: { bg: "#1A2238", fg: "#FAF7F0", accent: "#C8A96A" },
  },
  editorial: {
    name: "Editorial",
    tagline: "Light, magazine-style layout with lots of breathing room.",
    swatch: { bg: "#FAF7F0", fg: "#1A2238", accent: "#C8A96A" },
  },
  minimal: {
    name: "Minimal",
    tagline: "Monochrome, no cover photo, clean sans typography.",
    swatch: { bg: "#FFFFFF", fg: "#1A2238", accent: "#1A2238" },
  },
};

const COVER_INFO: Record<Cover, { name: string; tagline: string }> = {
  photo: { name: "Cover photo", tagline: "Use the itinerary's hero image." },
  gradient: { name: "Gradient", tagline: "Solid colour wash with depth." },
  solid: { name: "Solid", tagline: "Flat brand colour, no imagery." },
};

export type ProposalBrandingFormProps = {
  initial: {
    theme: Theme;
    accentColor: string | null;
    surfaceColor: string | null;
    tintColor: string | null;
    coverStyle: Cover;
    showAtAGlance: boolean;
    showInclusions: boolean;
    showTerms: boolean;
    tagline: string | null;
    showContactStrip: boolean;
    showRegisteredFooter: boolean;
    signatureNote: string | null;
    repeatLogo: boolean;
  };
  agencyName: string;
  logoUrl: string | null;
  logoLightUrl: string | null;
  logoDarkUrl: string | null;
  canEdit: boolean;
};

export function ProposalBrandingForm({
  initial,
  agencyName,
  logoUrl,
  logoLightUrl,
  logoDarkUrl,
  canEdit,
}: ProposalBrandingFormProps) {
  const [form, setForm] = useState<ProposalBrandingFormProps["initial"]>(initial);
  const [isPending, startTransition] = useTransition();

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function submit() {
    startTransition(async () => {
      try {
        await saveProposalBrandingAction(form as ProposalBrandingInput);
        toast.success("Proposal branding saved");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Couldn't save");
      }
    });
  }

  const accent = form.accentColor || DEFAULT_ACCENT;
  const surface = form.surfaceColor || DEFAULT_SURFACE;
  const tint = form.tintColor || DEFAULT_TINT;
  // A preset is "active" when all three colours match it exactly.
  const activePresetId = PROPOSAL_PALETTES.find(
    (p) =>
      p.surface.toLowerCase() === surface.toLowerCase() &&
      p.accent.toLowerCase() === accent.toLowerCase() &&
      p.tint.toLowerCase() === tint.toLowerCase()
  )?.id;

  function applyPreset(p: (typeof PROPOSAL_PALETTES)[number]) {
    setForm((f) => ({
      ...f,
      surfaceColor: p.surface,
      accentColor: p.accent,
      tintColor: p.tint,
    }));
  }

  return (
    <div className="space-y-8">
      {/* Live mini-preview ----------------------------------------------- */}
      <section className="rounded-lg border border-line bg-paper p-5 shadow-soft">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] uppercase tracking-[0.22em] text-gold-deep">
            Live preview
          </p>
          <span
            className="text-[10px] uppercase tracking-[0.22em]"
            style={{ color: accent }}
          >
            {THEME_INFO[form.theme].name}
          </span>
        </div>
        <ThemePreview
          theme={form.theme}
          accent={accent}
          surface={surface}
          tint={tint}
          tagline={form.tagline}
          agencyName={agencyName}
          lightLogo={logoLightUrl || logoUrl}
          darkLogo={logoDarkUrl || logoUrl}
        />
      </section>

      {/* Theme picker --------------------------------------------------- */}
      <section className="space-y-3">
        <SectionHeading
          icon={<Sparkles className="h-3.5 w-3.5" />}
          title="Template"
          hint="The overall look of the customer-facing proposal."
        />
        <div className="grid gap-3 sm:grid-cols-3">
          {PROPOSAL_THEMES.map((t) => {
            const info = THEME_INFO[t];
            const active = form.theme === t;
            return (
              <button
                key={t}
                type="button"
                disabled={!canEdit}
                onClick={() => update("theme", t)}
                className={`relative text-left rounded-lg border p-4 transition-all ${
                  active
                    ? "border-[var(--gold-line)] ring-2 ring-[var(--gold-line)]/20 bg-paper shadow-soft"
                    : "border-line bg-paper hover:border-[var(--gold-line)]/60 hover:shadow-soft"
                } disabled:opacity-60`}
              >
                <div
                  className="h-16 rounded-[8px] mb-3 overflow-hidden flex items-end p-2"
                  style={{ backgroundColor: info.swatch.bg }}
                >
                  <span
                    className="text-[9px] uppercase tracking-[0.22em]"
                    style={{ color: info.swatch.accent }}
                  >
                    Travel proposal
                  </span>
                </div>
                <p className="font-display text-lg text-ink">{info.name}</p>
                <p className="mt-1 text-xs text-muted leading-relaxed">
                  {info.tagline}
                </p>
                {active && (
                  <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-[6px] bg-inkwash text-[var(--on-dark)]">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Palette -------------------------------------------------------- */}
      <section className="space-y-4">
        <SectionHeading
          icon={<Palette className="h-3.5 w-3.5" />}
          title="Colour palette"
          hint="Pick a ready-made combination, or fine-tune each colour below."
        />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {PROPOSAL_PALETTES.map((p) => {
            const active = activePresetId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                disabled={!canEdit}
                onClick={() => applyPreset(p)}
                className={`group rounded-[10px] border p-2.5 text-left transition-all ${
                  active
                    ? "border-[var(--gold-line)] ring-2 ring-[var(--gold-line)]/20 shadow-soft"
                    : "border-line hover:border-[var(--gold-line)]/60"
                } disabled:opacity-60`}
              >
                <div
                  className="flex h-10 items-center justify-end gap-1 rounded-[7px] px-2"
                  style={{ backgroundColor: p.surface }}
                >
                  <span
                    className="h-4 w-4 rounded-full border border-white/20"
                    style={{ backgroundColor: p.accent }}
                  />
                  <span
                    className="h-4 w-4 rounded-full border border-white/20"
                    style={{ backgroundColor: p.tint }}
                  />
                </div>
                <p className="mt-2 text-xs font-medium text-ink">{p.name}</p>
              </button>
            );
          })}
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <ColorField
            label="Dark surface"
            hint="Cover, price block & closing"
            value={form.surfaceColor}
            fallback={DEFAULT_SURFACE}
            onChange={(v) => update("surfaceColor", v)}
            canEdit={canEdit}
          />
          <ColorField
            label="Accent"
            hint="Eyebrows, rules & prices"
            value={form.accentColor}
            fallback={DEFAULT_ACCENT}
            onChange={(v) => update("accentColor", v)}
            canEdit={canEdit}
          />
          <ColorField
            label="Light tint"
            hint="Content page background"
            value={form.tintColor}
            fallback={DEFAULT_TINT}
            onChange={(v) => update("tintColor", v)}
            canEdit={canEdit}
          />
        </div>
      </section>

      {/* Cover ---------------------------------------------------------- */}
      <section className="space-y-3">
        <SectionHeading
          icon={<ImageIcon className="h-3.5 w-3.5" />}
          title="Cover treatment"
          hint="How the top of the proposal renders."
        />
        <div className="grid gap-2 sm:grid-cols-3">
          {COVER_STYLES.map((c) => {
              const info = COVER_INFO[c];
              const active = form.coverStyle === c;
              return (
                <button
                  key={c}
                  type="button"
                  disabled={!canEdit}
                  onClick={() => update("coverStyle", c)}
                  className={`flex items-start justify-between gap-3 rounded-[10px] border px-3.5 py-2.5 text-left transition-colors ${
                    active
                      ? "border-[var(--gold-line)] bg-paper-2"
                      : "border-line bg-paper hover:border-[var(--gold-line)]/60"
                  } disabled:opacity-60`}
                >
                  <span>
                    <span className="block text-sm text-ink font-medium">
                      {info.name}
                    </span>
                    <span className="block text-xs text-muted">
                      {info.tagline}
                    </span>
                  </span>
                  {active && <Check className="h-4 w-4 text-gold-deep shrink-0 mt-0.5" />}
                </button>
              );
            })}
          </div>
      </section>

      {/* Sections ------------------------------------------------------- */}
      <section className="space-y-3">
        <SectionHeading
          icon={<Stamp className="h-3.5 w-3.5" />}
          title="Sections"
          hint="Hide what isn't useful for your style of selling."
        />
        <div className="grid gap-2 sm:grid-cols-3">
          <ToggleRow
            label="Trip at a glance"
            description="Per-day summary table near the top"
            checked={form.showAtAGlance}
            onChange={(v) => update("showAtAGlance", v)}
            disabled={!canEdit}
          />
          <ToggleRow
            label="What's included / excluded"
            description="Trip-level inclusions summary"
            checked={form.showInclusions}
            onChange={(v) => update("showInclusions", v)}
            disabled={!canEdit}
          />
          <ToggleRow
            label="Booking terms"
            description="From your invoice terms field"
            checked={form.showTerms}
            onChange={(v) => update("showTerms", v)}
            disabled={!canEdit}
          />
          <ToggleRow
            label="Contact strip on cover"
            description="Phone · email · website on the cover"
            checked={form.showContactStrip}
            onChange={(v) => update("showContactStrip", v)}
            disabled={!canEdit}
          />
          <ToggleRow
            label="Registered footer"
            description="Address + GSTIN on the closing page"
            checked={form.showRegisteredFooter}
            onChange={(v) => update("showRegisteredFooter", v)}
            disabled={!canEdit}
          />
        </div>
        <div className="rounded-[10px] border border-line bg-paper-2 px-3.5 py-2.5">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.repeatLogo}
              onChange={(e) => update("repeatLogo", e.target.checked)}
              disabled={!canEdit}
              className="h-4 w-4 mt-0.5 rounded border-line accent-[var(--gold-line)]"
            />
            <span>
              <span className="block text-sm text-ink font-medium">
                Stamp the agency logo on every section
              </span>
              <span className="block text-xs text-muted">
                Keeps your brand visible throughout the document — especially
                on the printed / PDF version.
              </span>
            </span>
          </label>
        </div>
      </section>

      {/* Tagline ------------------------------------------------------- */}
      <section className="space-y-2">
        <Label htmlFor="prop-tagline">Brand tagline</Label>
        <Input
          id="prop-tagline"
          value={form.tagline ?? ""}
          onChange={(e) => update("tagline", e.target.value || null)}
          placeholder="Crafted travel"
          maxLength={80}
          disabled={!canEdit}
        />
        <p className="text-xs text-muted">
          Shown under your logo on the cover. Leave blank for the default
          “Crafted travel”.
        </p>
      </section>

      {/* Signature ----------------------------------------------------- */}
      <section className="space-y-2">
        <Label htmlFor="prop-signoff">Closing sign-off</Label>
        <Textarea
          id="prop-signoff"
          rows={3}
          value={form.signatureNote ?? ""}
          onChange={(e) => update("signatureNote", e.target.value || null)}
          placeholder="With warm regards,\nThe Wanderwarrior team"
          disabled={!canEdit}
        />
        <p className="text-xs text-muted">
          Shown above your contact block at the end of every proposal.
        </p>
      </section>

      {canEdit && (
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-line">
          <Button onClick={submit} disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save proposal settings
          </Button>
        </div>
      )}
    </div>
  );
}

// --- helpers -------------------------------------------------------------

function SectionHeading({
  icon,
  title,
  hint,
}: {
  icon: React.ReactNode;
  title: string;
  hint?: string;
}) {
  return (
    <div>
      <p className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.22em] text-gold-deep">
        {icon}
        {title}
      </p>
      {hint && (
        <p className="mt-0.5 text-xs text-muted">{hint}</p>
      )}
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label
      className={`flex items-start gap-2.5 rounded-[10px] border border-line bg-paper px-3.5 py-2.5 cursor-pointer ${
        disabled ? "opacity-60 cursor-not-allowed" : "hover:border-[var(--gold-line)]/60"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="h-4 w-4 mt-0.5 rounded border-line accent-[var(--gold-line)]"
      />
      <span>
        <span className="block text-sm text-navy font-medium">{label}</span>
        <span className="block text-xs text-muted-foreground">
          {description}
        </span>
      </span>
    </label>
  );
}

// A single colour swatch + hex input + reset, used three times in the palette.
function ColorField({
  label,
  hint,
  value,
  fallback,
  onChange,
  canEdit,
}: {
  label: string;
  hint: string;
  value: string | null;
  fallback: string;
  onChange: (v: string | null) => void;
  canEdit: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <div>
        <p className="text-xs font-medium text-ink">{label}</p>
        <p className="text-[11px] text-muted">{hint}</p>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value || fallback}
          onChange={(e) => onChange(e.target.value)}
          disabled={!canEdit}
          className="h-10 w-12 shrink-0 cursor-pointer rounded-[10px] border border-line bg-paper p-1 disabled:opacity-60"
          aria-label={label}
        />
        <Input
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
          placeholder={fallback}
          disabled={!canEdit}
          className="font-mono text-xs uppercase tabular-nums"
          maxLength={9}
        />
        <Button
          variant="ghost"
          size="sm"
          type="button"
          disabled={!canEdit || value === null}
          onClick={() => onChange(null)}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}

// Logo mark for the live preview — picks the variant matching the background.
function PreviewLogo({
  logo,
  agencyName,
  onDark,
}: {
  logo: string | null;
  agencyName: string;
  onDark: boolean;
}) {
  if (logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logo}
        alt={agencyName}
        className={`h-8 w-8 rounded-full object-cover border ${
          onDark ? "border-white/20" : "border-line"
        }`}
      />
    );
  }
  return (
    <span
      className={`h-8 w-8 rounded-full border ${
        onDark ? "bg-white/10 border-white/20" : "bg-paper-2 border-line"
      }`}
    />
  );
}

// Tiny inline mock of the proposal hero so the user sees their changes live.
function ThemePreview({
  theme,
  accent,
  surface,
  tint,
  tagline,
  agencyName,
  lightLogo,
  darkLogo,
}: {
  theme: Theme;
  accent: string;
  surface: string;
  tint: string;
  tagline: string | null;
  agencyName: string;
  lightLogo: string | null;
  darkLogo: string | null;
}) {
  const tag = tagline?.trim() || "Crafted travel";

  if (theme === "minimal") {
    return (
      <div className="rounded-[10px] border border-line bg-paper p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PreviewLogo logo={darkLogo} agencyName={agencyName} onDark={false} />
            <span className="text-xs text-ink font-medium">{agencyName}</span>
          </div>
          <span className="text-[9px] uppercase tracking-[0.22em]" style={{ color: accent }}>
            Proposal
          </span>
        </div>
        <p className="mt-4 font-display text-2xl text-ink leading-tight">
          Bali · 7 days
        </p>
        <p className="mt-1 text-xs text-muted">{tag}</p>
      </div>
    );
  }

  if (theme === "editorial") {
    return (
      <div className="rounded-[10px] border border-line p-6" style={{ backgroundColor: tint }}>
        <div className="flex items-center gap-2">
          <PreviewLogo logo={darkLogo} agencyName={agencyName} onDark={false} />
          <div>
            <span className="block text-[10px] uppercase tracking-[0.22em]" style={{ color: accent }}>
              {agencyName}
            </span>
            <span className="block text-[10px] text-muted">{tag}</span>
          </div>
        </div>
        <p className="mt-6 font-display text-3xl text-ink leading-tight">
          Bali — Seven days, two travellers
        </p>
        <div className="mt-3 h-px w-12" style={{ backgroundColor: accent }} />
        <p className="mt-3 text-xs text-muted italic">
          A curated journey through Ubud and Uluwatu.
        </p>
      </div>
    );
  }

  // classic (default) — dark surface
  return (
    <div
      className="rounded-[10px] text-[var(--on-dark)] p-6 overflow-hidden relative"
      style={{ backgroundColor: surface }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at top right, ${accent}2e, transparent 60%)`,
        }}
      />
      <div className="relative flex items-center gap-2">
        <PreviewLogo logo={lightLogo} agencyName={agencyName} onDark />
        <div>
          <span className="block text-[10px] uppercase tracking-[0.25em] text-white/90">
            {agencyName}
          </span>
          <span className="block text-[10px] uppercase tracking-[0.2em]" style={{ color: accent }}>
            {tag}
          </span>
        </div>
      </div>
      <p className="relative mt-6 font-display text-3xl leading-tight">Bali</p>
      <p className="relative mt-2 text-xs text-[var(--on-dark)]/70">
        7 days · 2 travellers · Luxury
      </p>
    </div>
  );
}
