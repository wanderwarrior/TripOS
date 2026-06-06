/* eslint-disable jsx-a11y/alt-text */
// PDF rendering of a travel proposal via @react-pdf/renderer — the "Atelier
// Editorial" treatment, mirroring the customer web proposal
// ([preview-renderer.tsx](src/components/preview-renderer.tsx)) paginated for
// A4. Each agency's theme + accent + logo + section toggles flow through
// [proposal-pdf.ts](src/server/services/proposal-pdf.ts); this file is pure
// presentation. @react-pdf has no gradients / CSS vars / ::after / reliable
// gap — so: explicit values, nested <View>s, Times-Roman for the serif and
// Helvetica for the sans.

import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { ProposalPdfSnapshot } from "@/server/services/proposal-pdf";
import {
  formatJourneyDuration,
  formatSegmentDate,
  formatSegmentTime,
  formatStopSummary,
} from "@/lib/segment-format";

// --- design tokens --------------------------------------------------------

const PAPER = "#FFFFFF";
const INK = "#16191D";
const INK2 = "#3C434B";
const MUTED = "#6B7077";
const FAINT = "#9BA0A6";
const LINE = "#E6E2D8";
const ON_DARK = "#EFEAE0";
const OK = "#5C8C69";

// --- helpers --------------------------------------------------------------

function formatINR(n: number): string {
  // "Rs." not the ₹ glyph (U+20B9): @react-pdf's built-in fonts have no rupee
  // glyph, so ₹ renders as a stray "¹". "Rs." is glyph-safe.
  return (
    "Rs. " +
    new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(Math.round(n))
  );
}

function fmtDate(d: Date | string | null | undefined): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function fmtDayLabel(d: Date): string {
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function addDays(d: Date, days: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + days);
  return out;
}

function stripDayPrefix(t: string): string {
  return t.replace(/^Day\s*\d+\s*[:\-—]\s*/i, "").trim() || t;
}

function hasAnyMealsPdf(
  m?: { breakfast?: boolean; lunch?: boolean; dinner?: boolean } | null
): boolean {
  return !!(m && (m.breakfast || m.lunch || m.dinner));
}

function isGenericMealNote(note?: string | null): boolean {
  if (!note) return false;
  const remainder = note
    .toLowerCase()
    .replace(
      /breakfast|lunch|dinner|supper|\bmeal[s]?\s*plan\b|\bmeal[s]?\b|will be (?:provided|served)|included|provided|served|at (?:the )?hotel|\band\b|\bthe\b|\bare\b|\bis\b|\ball\b|\bboth\b/g,
      ""
    )
    .replace(/[\s.,;:()\-+&/]/g, "");
  return remainder.length < 4;
}

function collectInclusions(snap: ProposalPdfSnapshot): {
  included: string[];
  excluded: string[];
} {
  if (!snap.itinerary) return { included: [], excluded: [] };
  const dedupe = (lists: (string[] | undefined)[]) => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const list of lists) {
      for (const raw of list ?? []) {
        const v = raw.trim();
        if (!v) continue;
        const key = v.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(v);
      }
    }
    return out;
  };
  // Trip-level lists win; each falls back independently to the union of
  // per-day entries when the agent left the trip-wide field empty.
  const tripIncluded = dedupe([snap.itinerary.inclusions]);
  const tripExcluded = dedupe([snap.itinerary.exclusions]);
  return {
    included:
      tripIncluded.length > 0
        ? tripIncluded
        : dedupe(snap.itinerary.days.map((d) => d.inclusions)),
    excluded:
      tripExcluded.length > 0
        ? tripExcluded
        : dedupe(snap.itinerary.days.map((d) => d.exclusions)),
  };
}

// Soft tint of the accent for the inner seal ring — approximated since
// @react-pdf can't do color-mix. Accepts the accent and an alpha.
function alpha(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// Slightly deeper shade of a light tint — used for callout / terms panels that
// need to sit a touch darker than the page. @react-pdf has no color-mix, so we
// scale each channel toward black by `amt`.
function darken(hex: string, amt: number): string {
  const h = hex.replace("#", "");
  const f = Math.max(0, 1 - amt);
  const ch = (i: number) =>
    Math.round(parseInt(h.slice(i, i + 2), 16) * f)
      .toString(16)
      .padStart(2, "0");
  return `#${ch(0)}${ch(2)}${ch(4)}`;
}

// --- monogram seal (two concentric circles, no ::after) -------------------

function Seal({
  logoUrl,
  agencyName,
  size,
  accent,
  onDark,
}: {
  // Caller resolves which variant (light/dark) to pass for this surface.
  logoUrl: string | null;
  agencyName: string;
  size: number;
  accent: string;
  onDark?: boolean;
}) {
  // Logo wins if present. Render at its natural aspect ratio (height fixed,
  // width derived) with objectFit "contain" so the full mark shows — never
  // cropped into a circle the way a square cover crop would.
  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        style={{
          height: size,
          maxWidth: size * 3.4,
          objectFit: "contain",
        }}
      />
    );
  }
  const inset = 3;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1,
        borderColor: alpha(accent, 0.65),
        backgroundColor: onDark ? "rgba(255,255,255,0.05)" : PAPER,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          position: "absolute",
          top: inset,
          left: inset,
          right: inset,
          bottom: inset,
          borderRadius: (size - inset * 2) / 2,
          borderWidth: 1,
          borderColor: alpha(accent, 0.3),
        }}
      />
      <Text
        style={{
          fontFamily: "Times-Roman",
          color: accent,
          fontSize: size * 0.42,
        }}
      >
        {agencyName.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

// --- main document --------------------------------------------------------

export function ProposalDocument({
  snapshot,
}: {
  snapshot: ProposalPdfSnapshot;
}) {
  const accent = snapshot.branding.accent;
  const styles = makeStyles(accent, snapshot.branding.surface, snapshot.branding.tint);
  const { included, excluded } = collectInclusions(snapshot);
  const hasInclusions =
    snapshot.branding.showInclusions &&
    (included.length > 0 || excluded.length > 0);
  const hasTerms =
    snapshot.branding.showTerms && !!snapshot.agency.terms?.trim();

  return (
    <Document
      title={`${snapshot.agency.name} — ${snapshot.trip.destination}`}
      author={snapshot.agency.name}
    >
      <CoverPage snapshot={snapshot} styles={styles} accent={accent} />

      {/* Main content — one wrapping Page; header/footer repeat per sheet. */}
      <Page size="A4" style={styles.contentPage}>
        <RunningHeader snapshot={snapshot} styles={styles} accent={accent} />
        <RunningFooter snapshot={snapshot} styles={styles} />

        {snapshot.segments.length > 0 && (
          <TravelPlan snapshot={snapshot} styles={styles} accent={accent} />
        )}

        {snapshot.itinerary && (
          <DayByDay snapshot={snapshot} styles={styles} accent={accent} />
        )}

        {snapshot.pricing && (
          <PricingBlock snapshot={snapshot} styles={styles} accent={accent} />
        )}

        {hasInclusions && (
          <Inclusions
            included={included}
            excluded={excluded}
            styles={styles}
            accent={accent}
          />
        )}

        {hasTerms && (
          <TermsBlock terms={snapshot.agency.terms!} styles={styles} accent={accent} />
        )}
      </Page>

      <ClosingPage snapshot={snapshot} styles={styles} accent={accent} />
    </Document>
  );
}

// --- cover page -----------------------------------------------------------

function CoverPage({
  snapshot,
  styles,
  accent,
}: {
  snapshot: ProposalPdfSnapshot;
  styles: Styles;
  accent: string;
}) {
  const { trip, branding, agency, meta } = snapshot;
  const endDate = trip.startDate ? addDays(trip.startDate, trip.days - 1) : null;
  const dateRange =
    trip.startDate && endDate
      ? `${trip.startDate.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        })} – ${fmtDate(endDate)}`
      : "Dates flexible";

  const showPhoto =
    branding.coverStyle === "photo" && !!snapshot.itinerary?.coverImageUrl;

  const days = snapshot.itinerary?.days ?? [];
  const showIndex = branding.showAtAGlance && days.length > 0;
  const summary = snapshot.itinerary?.summary?.trim();

  return (
    <Page size="A4" style={styles.coverPage}>
      {showPhoto && (
        <Image src={snapshot.itinerary!.coverImageUrl!} style={styles.coverImage} />
      )}
      <View style={styles.coverScrim} />

      <View style={styles.coverInner}>
        {/* top: brand + version */}
        <View style={styles.coverTop}>
          <View style={styles.coverBrand}>
            <Seal
              logoUrl={agency.logoLight}
              agencyName={agency.name}
              size={52}
              accent={accent}
              onDark
            />
            <View>
              <Text style={styles.coverWord}>{agency.name.toUpperCase()}</Text>
              <Text style={[styles.coverTag, { color: accent }]}>
                {branding.tagline || "Crafted travel"}
              </Text>
            </View>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.coverVLabel}>Travel Proposal</Text>
            <Text style={styles.coverVValue}>v{meta.version}</Text>
          </View>
        </View>

        {/* headline + intro overview, over the image */}
        <View>
          <Text style={[styles.coverKicker, { color: accent }]}>
            A JOURNEY FOR {trip.travelers}
          </Text>
          <Text style={styles.coverTitle}>{trip.destination}</Text>
          <Text style={styles.coverSub}>
            {summary ||
              `A ${trip.days}-day ${trip.travelType.toLowerCase()} journey, crafted with care from first light to last sunset.`}
          </Text>

          <View style={styles.coverMetaRow}>
            <MetaItem label="Duration" value={`${trip.days}D / ${Math.max(0, trip.days - 1)}N`} accent={accent} styles={styles} />
            <MetaItem label="Travel dates" value={dateRange} accent={accent} styles={styles} />
            <MetaItem label="Travellers" value={`${trip.travelers} guests`} accent={accent} styles={styles} />
            <MetaItem label="Style" value={trip.travelType} accent={accent} styles={styles} />
          </View>

          {showIndex && (
            <View style={styles.heroIndexWrap}>
              <Text style={[styles.heroIndexEyebrow, { color: accent }]}>
                Your journey at a glance
              </Text>
              <View style={styles.heroIndex}>
                {days.map((day, i) => (
                  <View key={i} style={styles.heroIndexRow}>
                    <Text style={[styles.heroIndexNum, { color: accent }]}>
                      {String(i + 1).padStart(2, "0")}
                    </Text>
                    <View style={styles.heroIndexBody}>
                      <Text style={styles.heroIndexTitle}>
                        {day.city || stripDayPrefix(day.title) || "—"}
                      </Text>
                      {day.hotel ? (
                        <Text style={styles.heroIndexStay}>{day.hotel}</Text>
                      ) : null}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        <View>
          {branding.showContactStrip && (
            <Text style={[styles.coverContactStrip, { color: accent }]}>
              {[agency.phone, agency.email, agency.website]
                .filter(Boolean)
                .join("   ·   ")}
            </Text>
          )}
          <Text style={styles.coverFooterText}>
            Prepared {fmtDate(meta.preparedAt)} · Valid for {meta.validityDays}{" "}
            days
          </Text>
        </View>
      </View>
    </Page>
  );
}

function MetaItem({
  label,
  value,
  accent,
  styles,
}: {
  label: string;
  value: string;
  accent: string;
  styles: Styles;
}) {
  return (
    <View style={styles.metaItem}>
      <Text style={[styles.metaLabel, { color: accent }]}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

// --- running header / footer ----------------------------------------------

function RunningHeader({
  snapshot,
  styles,
  accent,
}: {
  snapshot: ProposalPdfSnapshot;
  styles: Styles;
  accent: string;
}) {
  return (
    <View style={styles.runningHeader} fixed>
      <Seal
        logoUrl={snapshot.agency.logoDark}
        agencyName={snapshot.agency.name}
        size={30}
        accent={accent}
      />
      <Text style={styles.runningHeaderAgency}>{snapshot.agency.name}</Text>
      <Text style={styles.runningHeaderTrip}>
        · {snapshot.trip.destination} · v{snapshot.meta.version}
      </Text>
      <View style={{ flex: 1 }} />
      <Text
        style={styles.runningPage}
        render={({ pageNumber, totalPages }) =>
          `Page ${pageNumber} of ${totalPages}`
        }
      />
    </View>
  );
}

function RunningFooter({
  snapshot,
  styles,
}: {
  snapshot: ProposalPdfSnapshot;
  styles: Styles;
}) {
  return (
    <View style={styles.runningFooter} fixed>
      <Text style={styles.runningFooterText}>
        Crafted with tripOS · for {snapshot.agency.name}
      </Text>
      <Text style={styles.runningFooterText}>
        {snapshot.agency.website || ""}
      </Text>
    </View>
  );
}

// --- section heading (left-aligned, gold rule) ----------------------------

function SectionHeading({
  eyebrow,
  title,
  styles,
  accent,
  breakBefore,
}: {
  eyebrow: string;
  title: string;
  styles: Styles;
  accent: string;
  breakBefore?: boolean;
}) {
  return (
    <View style={styles.sectionHeading} break={breakBefore}>
      <Text style={[styles.sectionEyebrow, { color: accent }]}>{eyebrow}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={[styles.ruleGold, { backgroundColor: accent }]} />
    </View>
  );
}

// --- travel plan ----------------------------------------------------------

function TravelPlan({
  snapshot,
  styles,
  accent,
}: {
  snapshot: ProposalPdfSnapshot;
  styles: Styles;
  accent: string;
}) {
  const flights = snapshot.segments.filter((s) => s.type === "FLIGHT");
  const trains = snapshot.segments.filter((s) => s.type === "TRAIN");
  const time = formatSegmentTime;

  const Group = ({
    title,
    segs,
  }: {
    title: string;
    segs: ProposalPdfSnapshot["segments"];
  }) => (
    <View style={styles.card} wrap={false}>
      <Text style={[styles.cardEyebrow, { color: accent }]}>{title}</Text>
      {segs.map((s) => {
        const isFlight = s.type === "FLIGHT";
        const id = isFlight
          ? [s.airline, s.flightNumber].filter(Boolean).join(" · ")
          : [s.trainName, s.trainNumber].filter(Boolean).join(" · ");
        const dep = new Date(s.departureTime);
        const arr = new Date(s.arrivalTime);
        const duration = formatJourneyDuration(dep, arr);
        const stopSummary = formatStopSummary(s.stops, s.type, s.flightNumber);
        return (
          <View key={s.id} style={styles.segmentRow}>
            <View style={styles.segmentRouteRow}>
              <Text style={styles.segmentRoute}>
                {s.from} → {s.to}
              </Text>
              <Text style={[styles.segmentDay, { color: accent }]}>
                Day {s.dayNumber}
              </Text>
            </View>
            {id ? <Text style={styles.segmentMeta}>{id}</Text> : null}
            <Text style={styles.segmentTime}>
              {formatSegmentDate(dep)} · {time(dep)} → {time(arr)}
              {duration ? ` · ${duration}` : ""}
            </Text>
            {stopSummary ? (
              <Text style={[styles.segmentTime, { color: accent }]}>
                {stopSummary}
              </Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );

  return (
    <View style={styles.section}>
      <SectionHeading eyebrow="Getting there" title="Travel plan" styles={styles} accent={accent} />
      {flights.length > 0 && <Group title="Flights" segs={flights} />}
      {trains.length > 0 && <Group title="Trains" segs={trains} />}
    </View>
  );
}

// --- day by day -----------------------------------------------------------

function DayByDay({
  snapshot,
  styles,
  accent,
}: {
  snapshot: ProposalPdfSnapshot;
  styles: Styles;
  accent: string;
}) {
  const { itinerary, trip } = snapshot;
  if (!itinerary) return null;

  return (
    <View style={styles.section}>
      <SectionHeading eyebrow="The Journey" title="Day by day" styles={styles} accent={accent} />
      {itinerary.days.map((day, i) => {
        const dateLabel = trip.startDate
          ? fmtDayLabel(addDays(trip.startDate, i))
          : null;
        const meals = hasAnyMealsPdf(day.meals)
          ? ([
              day.meals?.breakfast && "Breakfast",
              day.meals?.lunch && "Lunch",
              day.meals?.dinner && "Dinner",
            ].filter(Boolean) as string[])
          : [];
        const foodText =
          !isGenericMealNote(day.foodNote || day.food) &&
          (day.foodNote || day.food)
            ? day.foodNote || day.food
            : null;
        return (
          <View key={i} style={styles.pdfDay} wrap={false}>
            {/* rail */}
            <View style={styles.dayRail}>
              <Text style={[styles.dayNum, { color: accent }]}>
                {String(i + 1).padStart(2, "0")}
              </Text>
              {dateLabel && <Text style={styles.dayDate}>{dateLabel}</Text>}
            </View>
            {/* body */}
            <View style={styles.dayBody}>
              <View style={styles.dayTitleRow}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.dayTitle}>{stripDayPrefix(day.title)}</Text>
                  {day.city ? <Text style={styles.dayCity}>{day.city}</Text> : null}
                </View>
                {meals.length > 0 && (
                  <View style={styles.dayMeals}>
                    {meals.map((m) => (
                      <Text key={m} style={styles.mchip}>
                        {m}
                      </Text>
                    ))}
                  </View>
                )}
              </View>

              {day.summary?.trim() ? (
                <Text style={styles.dayText}>{day.summary.trim()}</Text>
              ) : null}

              {day.activities && day.activities.length > 0 ? (
                <View style={styles.dayExp}>
                  {day.activities.map((a, j) => (
                    <View key={j} style={styles.dayExpItem}>
                      <View style={[styles.dayBullet, { backgroundColor: accent }]} />
                      <Text style={styles.dayExpText}>{a}</Text>
                    </View>
                  ))}
                </View>
              ) : null}

              {day.hotel && (
                <View style={styles.dayStay}>
                  <Text style={[styles.dayStayLabel, { color: accent }]}>
                    Where you&apos;ll stay
                  </Text>
                  <Text style={styles.dayStayValue}>
                    {day.hotel}
                    {day.roomType ? ` · ${day.roomType}` : ""}
                  </Text>
                </View>
              )}

              {foodText ? (
                <View style={styles.calloutBox}>
                  <Text style={[styles.calloutLabel, { color: accent }]}>Dining</Text>
                  <Text style={styles.calloutText}>{foodText}</Text>
                </View>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

// --- pricing --------------------------------------------------------------

function PricingBlock({
  snapshot,
  styles,
  accent,
}: {
  snapshot: ProposalPdfSnapshot;
  styles: Styles;
  accent: string;
}) {
  const { pricing, meta } = snapshot;
  if (!pricing) return null;
  const validUntil = addDays(meta.preparedAt, meta.validityDays);

  return (
    <View style={styles.section} break>
      <SectionHeading eyebrow="Investment" title="Your package price" styles={styles} accent={accent} />

      <View style={styles.investCard} wrap={false}>
        <View style={[styles.investGlow, { backgroundColor: alpha(accent, 0.16) }]} />
        <Text style={[styles.investEyebrow, { color: accent }]}>Total package</Text>
        <Text style={styles.investTotal}>{formatINR(pricing.total)}</Text>
        {pricing.travelers > 1 && (
          <Text style={styles.investPp}>
            {formatINR(pricing.perPerson)} per person · {pricing.travelers}{" "}
            travellers
          </Text>
        )}
      </View>

      {pricing.categories.length > 0 && (
        <View style={styles.brk} wrap={false}>
          <Text style={[styles.brkTitle, { color: accent }]}>
            How it breaks down
          </Text>
          {pricing.categories.map((c) => (
            <View key={c.category} style={styles.brkRow}>
              <Text style={styles.brkCat}>{c.label}</Text>
              <Text style={styles.brkAmt}>{formatINR(c.amount)}</Text>
            </View>
          ))}
          <View style={styles.brkTotalRow}>
            <Text style={styles.brkTotalLabel}>Total</Text>
            <Text style={[styles.brkTotalAmt, { color: accent }]}>
              {formatINR(pricing.total)}
            </Text>
          </View>
          <Text style={styles.validity}>
            All amounts are in Indian Rupees and inclusive of applicable service
            charges. This quotation is valid until {fmtDate(validUntil)}.
          </Text>
        </View>
      )}
    </View>
  );
}

// --- inclusions -----------------------------------------------------------

function Inclusions({
  included,
  excluded,
  styles,
  accent,
}: {
  included: string[];
  excluded: string[];
  styles: Styles;
  accent: string;
}) {
  return (
    <View style={styles.section}>
      <SectionHeading eyebrow="The fine print" title="What's included" styles={styles} accent={accent} />
      <View style={styles.incGrid}>
        {included.length > 0 && (
          <View style={styles.incCol} wrap={false}>
            <Text style={[styles.incHead, { color: "#3c6b48" }]}>
              Your package includes
            </Text>
            {included.map((it, i) => (
              <Text key={i} style={styles.incItem}>
                ✓ {it}
              </Text>
            ))}
          </View>
        )}
        {excluded.length > 0 && (
          <View style={styles.incCol} wrap={false}>
            <Text style={styles.incHeadMuted}>Not included</Text>
            {excluded.map((it, i) => (
              <Text key={i} style={styles.incItemMuted}>
                ✗ {it}
              </Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

// --- terms ----------------------------------------------------------------

function TermsBlock({
  terms,
  styles,
  accent,
}: {
  terms: string;
  styles: Styles;
  accent: string;
}) {
  return (
    <View style={styles.section} wrap={false}>
      <View style={styles.termsBox}>
        <Text style={[styles.termsEyebrow, { color: accent }]}>
          Booking terms & conditions
        </Text>
        <Text style={styles.termsBody}>{terms}</Text>
      </View>
    </View>
  );
}

// --- closing --------------------------------------------------------------

function ClosingPage({
  snapshot,
  styles,
  accent,
}: {
  snapshot: ProposalPdfSnapshot;
  styles: Styles;
  accent: string;
}) {
  const { agency, branding } = snapshot;
  const contacts: { label: string; value: string }[] = [];
  if (agency.phone) contacts.push({ label: "Phone", value: agency.phone });
  if (agency.email) contacts.push({ label: "Email", value: agency.email });
  if (agency.website) contacts.push({ label: "Web", value: agency.website });

  const registeredLine = [
    agency.registeredAddress,
    agency.gstin ? `GSTIN ${agency.gstin}` : null,
  ]
    .filter(Boolean)
    .join("   ·   ");
  const showRegistered =
    branding.showRegisteredFooter && registeredLine.length > 0;

  return (
    <Page size="A4" style={styles.closingPage}>
      <View style={[styles.closingGlow, { backgroundColor: alpha(accent, 0.14) }]} />
      <View style={styles.closingInner}>
        <Seal
          logoUrl={agency.logoLight}
          agencyName={agency.name}
          size={78}
          accent={accent}
          onDark
        />
        <Text style={styles.closingSig}>
          {branding.signatureNote ??
            "When you're ready, we'll handle every detail — so all that's left for you is to arrive."}
        </Text>
        <Text style={[styles.closingEyebrow, { color: accent }]}>
          With warm regards
        </Text>
        <Text style={styles.closingAgency}>{agency.name}</Text>
        {contacts.length > 0 && (
          <View style={styles.closingContacts}>
            {contacts.map((c, i) => (
              <View key={i} style={styles.closingContactItem}>
                <Text style={[styles.closingContactLabel, { color: accent }]}>
                  {c.label}
                </Text>
                <Text style={styles.closingContactValue}>{c.value}</Text>
              </View>
            ))}
          </View>
        )}
        {showRegistered && (
          <Text style={styles.closingRegistered}>{registeredLine}</Text>
        )}
      </View>
      <Text style={styles.closingCraft}>Crafted with tripOS</Text>
    </Page>
  );
}

// --- styles ---------------------------------------------------------------

type Styles = ReturnType<typeof makeStyles>;

function makeStyles(accent: string, surface: string, tint: string) {
  // Local aliases so the style map below reads the same as before — `surface`
  // replaces the old hardcoded navy, `tint` the ivory, `IVORY2` a deeper paper.
  const NAVY = surface;
  const IVORY = tint;
  const IVORY2 = darken(tint, 0.05);
  return StyleSheet.create({
    // cover ----------------------------------------------------------------
    coverPage: { backgroundColor: NAVY, color: ON_DARK, padding: 0 },
    coverImage: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover",
      opacity: 0.5,
    },
    coverScrim: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: NAVY,
      opacity: 0.72,
    },
    coverInner: {
      padding: 50,
      height: "100%",
      flexDirection: "column",
      justifyContent: "space-between",
    },
    coverTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    coverBrand: { flexDirection: "row", alignItems: "center", gap: 12 },
    coverWord: {
      color: "#fff",
      fontFamily: "Helvetica-Bold",
      fontSize: 12,
      letterSpacing: 3,
    },
    coverTag: {
      fontSize: 7,
      letterSpacing: 2,
      textTransform: "uppercase",
      marginTop: 4,
    },
    coverVLabel: {
      fontSize: 8,
      letterSpacing: 2,
      textTransform: "uppercase",
      color: "rgba(255,255,255,0.6)",
    },
    coverVValue: {
      fontSize: 11,
      color: "#fff",
      marginTop: 3,
    },
    coverKicker: {
      fontSize: 10,
      letterSpacing: 4,
      textTransform: "uppercase",
      fontFamily: "Helvetica-Bold",
      marginBottom: 14,
    },
    coverTitle: {
      color: "#fff",
      fontSize: 60,
      fontFamily: "Times-Roman",
      lineHeight: 0.95,
    },
    coverSub: {
      marginTop: 14,
      color: "rgba(255,255,255,0.85)",
      fontFamily: "Times-Italic",
      fontSize: 14,
      lineHeight: 1.5,
      maxWidth: 460,
    },
    coverMetaRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 26,
      paddingTop: 20,
      borderTopWidth: 0.5,
      borderTopColor: "rgba(255,255,255,0.2)",
    },

    // hero "at a glance" index (over the cover image) ----------------------
    heroIndexWrap: {
      marginTop: 24,
      paddingTop: 20,
      borderTopWidth: 0.5,
      borderTopColor: "rgba(255,255,255,0.2)",
    },
    heroIndexEyebrow: {
      fontSize: 8,
      letterSpacing: 2.4,
      textTransform: "uppercase",
      fontFamily: "Helvetica-Bold",
      marginBottom: 12,
    },
    heroIndex: { flexDirection: "row", flexWrap: "wrap" },
    heroIndexRow: {
      width: "50%",
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
      paddingVertical: 4,
      paddingRight: 16,
    },
    heroIndexNum: {
      fontFamily: "Helvetica-Bold",
      fontSize: 9,
      letterSpacing: 0.5,
      width: 16,
      marginTop: 1,
    },
    heroIndexBody: { flex: 1 },
    heroIndexTitle: { fontFamily: "Times-Roman", fontSize: 11.5, color: "#fff" },
    heroIndexStay: {
      fontSize: 7.5,
      color: "rgba(255,255,255,0.6)",
      marginTop: 1,
    },
    metaItem: { width: "50%", marginBottom: 18 },
    metaLabel: {
      fontSize: 7,
      letterSpacing: 1.8,
      textTransform: "uppercase",
      fontFamily: "Helvetica-Bold",
    },
    metaValue: {
      marginTop: 5,
      color: "#fff",
      fontFamily: "Times-Roman",
      fontSize: 15,
    },
    coverContactStrip: {
      marginTop: 18,
      fontSize: 8.5,
      letterSpacing: 1.2,
      textTransform: "uppercase",
    },
    coverFooterText: {
      marginTop: 8,
      color: "rgba(255,255,255,0.5)",
      fontSize: 8,
      letterSpacing: 0.5,
    },

    // content page ---------------------------------------------------------
    contentPage: {
      backgroundColor: IVORY,
      color: INK,
      paddingTop: 60,
      paddingBottom: 48,
      paddingHorizontal: 44,
      fontFamily: "Helvetica",
    },
    runningHeader: {
      position: "absolute",
      top: 18,
      left: 44,
      right: 44,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingBottom: 8,
      borderBottomWidth: 0.5,
      borderBottomColor: LINE,
    },
    runningHeaderAgency: {
      color: INK,
      fontFamily: "Helvetica-Bold",
      fontSize: 9,
    },
    runningHeaderTrip: {
      color: MUTED,
      fontSize: 8,
    },
    runningPage: {
      fontSize: 8,
      color: MUTED,
    },
    runningFooter: {
      position: "absolute",
      bottom: 18,
      left: 44,
      right: 44,
      flexDirection: "row",
      justifyContent: "space-between",
      paddingTop: 6,
      borderTopWidth: 0.5,
      borderTopColor: LINE,
    },
    runningFooterText: {
      color: FAINT,
      fontSize: 7,
      letterSpacing: 1.4,
      textTransform: "uppercase",
    },

    // section heading ------------------------------------------------------
    section: { marginTop: 16, marginBottom: 6 },
    sectionHeading: { marginBottom: 16 },
    sectionEyebrow: {
      fontSize: 8,
      letterSpacing: 2.4,
      textTransform: "uppercase",
      fontFamily: "Helvetica-Bold",
      marginBottom: 7,
    },
    sectionTitle: {
      fontSize: 28,
      color: NAVY,
      fontFamily: "Times-Roman",
    },
    ruleGold: { marginTop: 12, width: 64, height: 2 },

    // card / segments ------------------------------------------------------
    card: {
      borderWidth: 0.5,
      borderColor: LINE,
      borderRadius: 4,
      padding: 12,
      marginBottom: 10,
      backgroundColor: PAPER,
    },
    cardEyebrow: {
      fontSize: 8,
      letterSpacing: 1.6,
      textTransform: "uppercase",
      fontFamily: "Helvetica-Bold",
      marginBottom: 8,
    },
    segmentRow: {
      paddingVertical: 6,
      borderBottomWidth: 0.5,
      borderBottomColor: LINE,
    },
    segmentRouteRow: { flexDirection: "row", justifyContent: "space-between" },
    segmentRoute: { fontFamily: "Helvetica-Bold", color: NAVY, fontSize: 10 },
    segmentDay: {
      fontSize: 7,
      letterSpacing: 1.2,
      textTransform: "uppercase",
    },
    segmentMeta: { marginTop: 2, fontSize: 9, color: INK },
    segmentTime: { marginTop: 1, fontSize: 9, color: MUTED },

    // day block ------------------------------------------------------------
    pdfDay: {
      flexDirection: "row",
      gap: 22,
      paddingVertical: 18,
      borderTopWidth: 0.5,
      borderTopColor: LINE,
    },
    dayRail: { width: 70 },
    dayNum: { fontFamily: "Times-Roman", fontSize: 40, lineHeight: 0.8 },
    dayDate: {
      fontSize: 8,
      letterSpacing: 0.6,
      textTransform: "uppercase",
      color: MUTED,
      marginTop: 8,
    },
    dayBody: { flex: 1 },
    dayTitleRow: { flexDirection: "row", justifyContent: "space-between" },
    dayTitle: { fontFamily: "Times-Roman", fontSize: 21, color: NAVY, lineHeight: 1.1 },
    dayCity: {
      fontSize: 8,
      color: MUTED,
      letterSpacing: 1,
      textTransform: "uppercase",
      marginTop: 4,
    },
    dayMeals: { flexDirection: "row", gap: 4, flexWrap: "wrap" },
    mchip: {
      backgroundColor: "#E7F0E8",
      color: "#3c6b48",
      fontSize: 7,
      fontFamily: "Helvetica-Bold",
      paddingVertical: 2,
      paddingHorizontal: 6,
      borderRadius: 3,
      textTransform: "uppercase",
    },
    dayText: { fontSize: 11, lineHeight: 1.65, color: INK2, marginTop: 10 },
    dayExp: { marginTop: 12 },
    dayExpItem: { flexDirection: "row", gap: 8, marginBottom: 4 },
    dayBullet: { width: 5, height: 5, borderRadius: 2.5, marginTop: 4 },
    dayExpText: { fontSize: 10, color: INK, flex: 1, lineHeight: 1.4 },
    dayStay: {
      marginTop: 12,
      paddingTop: 10,
      paddingHorizontal: 12,
      paddingBottom: 10,
      backgroundColor: PAPER,
      borderWidth: 0.5,
      borderColor: LINE,
      borderRadius: 5,
    },
    dayStayLabel: {
      fontSize: 7,
      letterSpacing: 1.4,
      textTransform: "uppercase",
      fontFamily: "Helvetica-Bold",
    },
    dayStayValue: { marginTop: 3, fontFamily: "Times-Roman", fontSize: 13, color: NAVY },
    calloutBox: {
      marginTop: 10,
      padding: 9,
      backgroundColor: IVORY2,
      borderRadius: 4,
    },
    calloutLabel: {
      fontSize: 7,
      letterSpacing: 1.2,
      textTransform: "uppercase",
      fontFamily: "Helvetica-Bold",
      marginBottom: 3,
    },
    calloutText: { fontSize: 9, color: INK2, lineHeight: 1.5 },

    // investment -----------------------------------------------------------
    investCard: {
      backgroundColor: NAVY,
      borderRadius: 8,
      paddingVertical: 30,
      paddingHorizontal: 32,
      marginBottom: 20,
      position: "relative",
      overflow: "hidden",
    },
    investGlow: {
      position: "absolute",
      top: -40,
      right: -40,
      width: 220,
      height: 220,
      borderRadius: 110,
    },
    investEyebrow: {
      fontSize: 9,
      letterSpacing: 2.4,
      textTransform: "uppercase",
      fontFamily: "Helvetica-Bold",
    },
    investTotal: {
      fontFamily: "Times-Roman",
      fontSize: 52,
      color: "#fff",
      marginTop: 12,
      lineHeight: 0.95,
    },
    investPp: {
      fontSize: 11,
      color: "rgba(255,255,255,0.66)",
      marginTop: 12,
    },
    brk: {},
    brkTitle: {
      fontSize: 8,
      letterSpacing: 1.6,
      textTransform: "uppercase",
      fontFamily: "Helvetica-Bold",
      marginBottom: 6,
    },
    brkRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 9,
      borderBottomWidth: 0.5,
      borderBottomColor: LINE,
    },
    brkCat: { fontSize: 11, color: INK2 },
    brkAmt: { fontSize: 11, color: INK, fontFamily: "Helvetica-Bold" },
    brkTotalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingTop: 12,
    },
    brkTotalLabel: {
      fontFamily: "Times-Roman",
      fontSize: 15,
      color: NAVY,
    },
    brkTotalAmt: { fontFamily: "Times-Roman", fontSize: 19 },
    validity: { marginTop: 14, fontSize: 9, color: MUTED, lineHeight: 1.6 },

    // inclusions -----------------------------------------------------------
    incGrid: { flexDirection: "row", gap: 18 },
    incCol: { flex: 1 },
    incHead: {
      fontSize: 9,
      letterSpacing: 1.8,
      textTransform: "uppercase",
      fontFamily: "Helvetica-Bold",
      paddingBottom: 10,
      borderBottomWidth: 0.5,
      borderBottomColor: LINE,
      marginBottom: 12,
    },
    incHeadMuted: {
      fontSize: 9,
      letterSpacing: 1.8,
      textTransform: "uppercase",
      fontFamily: "Helvetica-Bold",
      color: MUTED,
      paddingBottom: 10,
      borderBottomWidth: 0.5,
      borderBottomColor: LINE,
      marginBottom: 12,
    },
    incItem: { fontSize: 10, color: INK2, marginBottom: 6, lineHeight: 1.4 },
    incItemMuted: { fontSize: 10, color: MUTED, marginBottom: 6, lineHeight: 1.4 },

    // terms ----------------------------------------------------------------
    termsBox: {
      borderWidth: 0.5,
      borderColor: LINE,
      backgroundColor: IVORY2,
      padding: 16,
      borderRadius: 6,
    },
    termsEyebrow: {
      fontSize: 8,
      letterSpacing: 1.6,
      textTransform: "uppercase",
      fontFamily: "Helvetica-Bold",
      marginBottom: 8,
    },
    termsBody: { fontSize: 9.5, color: INK2, lineHeight: 1.7 },

    // closing --------------------------------------------------------------
    closingPage: {
      backgroundColor: NAVY,
      paddingVertical: 80,
      paddingHorizontal: 56,
      position: "relative",
    },
    closingGlow: {
      position: "absolute",
      top: 60,
      left: "50%",
      marginLeft: -150,
      width: 300,
      height: 300,
      borderRadius: 150,
    },
    closingInner: {
      alignItems: "center",
      justifyContent: "center",
      marginTop: 120,
    },
    closingSig: {
      fontFamily: "Times-Italic",
      fontSize: 22,
      color: "#fff",
      lineHeight: 1.5,
      textAlign: "center",
      maxWidth: 380,
      marginTop: 26,
    },
    closingEyebrow: {
      fontSize: 9,
      letterSpacing: 2.4,
      textTransform: "uppercase",
      fontFamily: "Helvetica-Bold",
      marginTop: 26,
    },
    closingAgency: {
      fontFamily: "Times-Roman",
      fontSize: 28,
      color: "#fff",
      marginTop: 8,
    },
    closingContacts: {
      flexDirection: "row",
      gap: 40,
      marginTop: 26,
      justifyContent: "center",
    },
    closingContactItem: { alignItems: "center" },
    closingContactLabel: {
      fontSize: 8,
      letterSpacing: 1.8,
      textTransform: "uppercase",
      fontFamily: "Helvetica-Bold",
    },
    closingContactValue: { marginTop: 5, fontSize: 11, color: "#fff" },
    closingRegistered: {
      marginTop: 28,
      maxWidth: 380,
      textAlign: "center",
      fontSize: 8,
      lineHeight: 1.6,
      letterSpacing: 0.4,
      color: "rgba(255,255,255,0.45)",
    },
    closingCraft: {
      position: "absolute",
      bottom: 44,
      left: 0,
      right: 0,
      textAlign: "center",
      fontSize: 8,
      letterSpacing: 2.4,
      textTransform: "uppercase",
      color: "rgba(255,255,255,0.38)",
    },
  });
}
