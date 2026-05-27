/* eslint-disable jsx-a11y/alt-text */
// PDF rendering of a travel proposal via @react-pdf/renderer. Each
// agency's theme + accent + logo + section toggles flow through
// [proposal-pdf.ts](src/server/services/proposal-pdf.ts), so this file is
// pure presentation — given a snapshot, produce the document.

import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { ProposalPdfSnapshot } from "@/server/services/proposal-pdf";

// --- design tokens --------------------------------------------------------

const NAVY = "#0B1C2C";
const IVORY = "#FAF7F0";
const INK = "#1A1A1A";
const MUTED = "#6E6E6E";
const LINE = "#E6E1D7";
const WHITE = "#FFFFFF";

// --- helpers --------------------------------------------------------------

function formatINR(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(n));
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

/** Mirror of preview-renderer's helper — keeps the two outputs in sync. */
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
  return {
    included: dedupe(snap.itinerary.days.map((d) => d.inclusions)),
    excluded: dedupe(snap.itinerary.days.map((d) => d.exclusions)),
  };
}

// --- main document --------------------------------------------------------

export function ProposalDocument({
  snapshot,
}: {
  snapshot: ProposalPdfSnapshot;
}) {
  const styles = makeStyles(snapshot.branding.theme, snapshot.branding.accent);
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
      {/* Cover page — full bleed, brand-forward */}
      <CoverPage snapshot={snapshot} styles={styles} />

      {/* Main content — one Page that wraps; logo header repeats on each
          rendered sheet via <View fixed>. */}
      <Page size="A4" style={styles.contentPage}>
        <RunningHeader snapshot={snapshot} styles={styles} />
        <RunningFooter snapshot={snapshot} styles={styles} />

        {snapshot.branding.showAtAGlance &&
          snapshot.itinerary &&
          snapshot.itinerary.days.length > 0 && (
            <AtAGlance snapshot={snapshot} styles={styles} />
          )}

        {snapshot.segments.length > 0 && (
          <TravelPlan snapshot={snapshot} styles={styles} />
        )}

        {snapshot.itinerary && (
          <DayByDay snapshot={snapshot} styles={styles} />
        )}

        {hasInclusions && (
          <Inclusions
            included={included}
            excluded={excluded}
            styles={styles}
          />
        )}

        {snapshot.pricing && (
          <PricingBlock snapshot={snapshot} styles={styles} />
        )}

        {hasTerms && (
          <TermsBlock
            terms={snapshot.agency.terms!}
            styles={styles}
          />
        )}
      </Page>

      {/* Closing on its own page — always */}
      <ClosingPage snapshot={snapshot} styles={styles} />
    </Document>
  );
}

// --- cover page -----------------------------------------------------------

function CoverPage({
  snapshot,
  styles,
}: {
  snapshot: ProposalPdfSnapshot;
  styles: Styles;
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

  const isMinimal = branding.theme === "minimal";
  const isEditorial = branding.theme === "editorial";
  const onDark = !isMinimal && !isEditorial;

  return (
    <Page size="A4" style={styles.coverPage}>
      {/* Cover background — photo, gradient, or solid depending on theme */}
      {branding.coverStyle === "photo" &&
        snapshot.itinerary?.coverImageUrl && (
          <>
            <Image
              src={snapshot.itinerary.coverImageUrl}
              style={styles.coverImage}
            />
            {!isEditorial && <View style={styles.coverScrim} />}
          </>
        )}

      <View style={styles.coverInner}>
        {/* Header — agency logo prominent top-left */}
        <View style={styles.coverHeader}>
          <View style={styles.coverHeaderLeft}>
            {agency.logoUrl ? (
              <Image src={agency.logoUrl} style={styles.coverLogo} />
            ) : (
              <View style={styles.coverLogoFallback}>
                <Text style={styles.coverLogoFallbackText}>
                  {agency.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View>
              <Text
                style={{
                  ...styles.eyebrow,
                  color: branding.accent,
                }}
              >
                Travel proposal
              </Text>
              <Text
                style={onDark ? styles.coverAgencyOnDark : styles.coverAgency}
              >
                {agency.name}
              </Text>
            </View>
          </View>
          <Text
            style={onDark ? styles.coverVersionOnDark : styles.coverVersion}
          >
            v{meta.version}
          </Text>
        </View>

        {/* Destination + summary */}
        <View style={styles.coverBody}>
          <Text
            style={
              onDark
                ? styles.coverDestinationOnDark
                : styles.coverDestination
            }
          >
            {trip.destination}
          </Text>
          {isEditorial && (
            <View
              style={{
                width: 56,
                height: 2,
                backgroundColor: branding.accent,
                marginTop: 14,
              }}
            />
          )}
          {snapshot.itinerary?.summary?.trim() ? (
            <Text
              style={
                onDark ? styles.coverSummaryOnDark : styles.coverSummary
              }
            >
              {snapshot.itinerary.summary.trim()}
            </Text>
          ) : (
            <Text
              style={
                onDark ? styles.coverSummaryOnDark : styles.coverSummary
              }
            >
              A {trip.days}-day {trip.travelType.toLowerCase()} journey for{" "}
              {trip.travelers === 1
                ? "a solo traveller"
                : `${trip.travelers} travellers`}
              .
            </Text>
          )}

          {/* Meta row */}
          <View style={styles.coverMetaRow}>
            <MetaItem
              label="Duration"
              value={`${trip.days}D / ${Math.max(0, trip.days - 1)}N`}
              onDark={onDark}
              accent={branding.accent}
              styles={styles}
            />
            <MetaItem
              label="Travel dates"
              value={dateRange}
              onDark={onDark}
              accent={branding.accent}
              styles={styles}
            />
            <MetaItem
              label="Travellers"
              value={`${trip.travelers}`}
              onDark={onDark}
              accent={branding.accent}
              styles={styles}
            />
            <MetaItem
              label="Style"
              value={trip.travelType}
              onDark={onDark}
              accent={branding.accent}
              styles={styles}
            />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.coverFooter}>
          <Text
            style={
              onDark ? styles.coverFooterTextOnDark : styles.coverFooterText
            }
          >
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
  onDark,
  accent,
  styles,
}: {
  label: string;
  value: string;
  onDark: boolean;
  accent: string;
  styles: Styles;
}) {
  return (
    <View style={styles.metaItem}>
      <Text style={{ ...styles.metaLabel, color: accent }}>{label}</Text>
      <Text style={onDark ? styles.metaValueOnDark : styles.metaValue}>
        {value}
      </Text>
    </View>
  );
}

// --- running header / footer (repeat on every content page) ---------------

function RunningHeader({
  snapshot,
  styles,
}: {
  snapshot: ProposalPdfSnapshot;
  styles: Styles;
}) {
  return (
    <View style={styles.runningHeader} fixed>
      {snapshot.agency.logoUrl ? (
        <Image src={snapshot.agency.logoUrl} style={styles.runningLogo} />
      ) : (
        <View style={styles.runningLogoFallback}>
          <Text style={styles.runningLogoFallbackText}>
            {snapshot.agency.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      <View style={styles.runningHeaderTextWrap}>
        <Text style={styles.runningHeaderAgency}>{snapshot.agency.name}</Text>
        <Text style={styles.runningHeaderTrip}>
          {snapshot.trip.destination} · v{snapshot.meta.version}
        </Text>
      </View>
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
        Crafted with TripCraft · for {snapshot.agency.name}
      </Text>
      <Text
        style={styles.runningFooterText}
        render={({ pageNumber, totalPages }) =>
          `Page ${pageNumber} of ${totalPages}`
        }
      />
    </View>
  );
}

// --- at a glance ----------------------------------------------------------

function AtAGlance({
  snapshot,
  styles,
}: {
  snapshot: ProposalPdfSnapshot;
  styles: Styles;
}) {
  const { itinerary, trip, branding, agency } = snapshot;
  if (!itinerary) return null;
  const startDate = trip.startDate;

  return (
    <View style={styles.section}>
      <SectionHeading
        eyebrow="Overview"
        title="Trip at a glance"
        agencyName={agency.name}
        logoUrl={agency.logoUrl}
        repeat={branding.repeatLogo}
        styles={styles}
        accent={branding.accent}
      />
      <View style={styles.atGlanceTable} wrap>
        <View style={styles.atGlanceRowHeader} fixed>
          <Text style={[styles.atGlanceCellDay, styles.atGlanceHeaderText]}>
            Day
          </Text>
          <Text style={[styles.atGlanceCellWide, styles.atGlanceHeaderText]}>
            Where
          </Text>
          <Text style={[styles.atGlanceCellWide, styles.atGlanceHeaderText]}>
            Stay
          </Text>
          <Text
            style={[styles.atGlanceCellHighlights, styles.atGlanceHeaderText]}
          >
            Highlights
          </Text>
        </View>
        {itinerary.days.map((day, i) => (
          <View key={i} style={styles.atGlanceRow} wrap={false}>
            <View style={styles.atGlanceCellDay}>
              <Text style={styles.atGlanceDayNum}>
                {String(i + 1).padStart(2, "0")}
              </Text>
              {startDate && (
                <Text style={styles.atGlanceDayDate}>
                  {fmtDayLabel(addDays(startDate, i))}
                </Text>
              )}
            </View>
            <Text style={styles.atGlanceCellWide}>
              {day.city || stripDayPrefix(day.title) || "—"}
            </Text>
            <Text style={styles.atGlanceCellWide}>
              {day.hotel || "—"}
            </Text>
            <Text style={styles.atGlanceCellHighlights}>
              {day.activities && day.activities.length > 0
                ? day.activities.slice(0, 3).join(" · ")
                : "—"}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// --- travel plan ----------------------------------------------------------

function TravelPlan({
  snapshot,
  styles,
}: {
  snapshot: ProposalPdfSnapshot;
  styles: Styles;
}) {
  const flights = snapshot.segments.filter((s) => s.type === "FLIGHT");
  const trains = snapshot.segments.filter((s) => s.type === "TRAIN");

  return (
    <View style={styles.section}>
      <SectionHeading
        eyebrow="Getting there"
        title="Travel plan"
        agencyName={snapshot.agency.name}
        logoUrl={snapshot.agency.logoUrl}
        repeat={snapshot.branding.repeatLogo}
        styles={styles}
        accent={snapshot.branding.accent}
      />
      {flights.length > 0 && (
        <SegmentGroup
          title="Flights"
          segments={flights}
          styles={styles}
          accent={snapshot.branding.accent}
        />
      )}
      {trains.length > 0 && (
        <SegmentGroup
          title="Trains"
          segments={trains}
          styles={styles}
          accent={snapshot.branding.accent}
        />
      )}
    </View>
  );
}

function SegmentGroup({
  title,
  segments,
  styles,
  accent,
}: {
  title: string;
  segments: ProposalPdfSnapshot["segments"];
  styles: Styles;
  accent: string;
}) {
  return (
    <View style={styles.card} wrap={false}>
      <Text style={[styles.cardEyebrow, { color: accent }]}>{title}</Text>
      {segments.map((s) => {
        const isFlight = s.type === "FLIGHT";
        const identifier = isFlight
          ? [s.airline, s.flightNumber].filter(Boolean).join(" · ")
          : [s.trainName, s.trainNumber].filter(Boolean).join(" · ");
        const dep = new Date(s.departureTime);
        const arr = new Date(s.arrivalTime);
        const time = (d: Date) =>
          d.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });
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
            {identifier ? (
              <Text style={styles.segmentMeta}>{identifier}</Text>
            ) : null}
            <Text style={styles.segmentTime}>
              {dep.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
              })}{" "}
              · {time(dep)} → {time(arr)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// --- day by day -----------------------------------------------------------

function DayByDay({
  snapshot,
  styles,
}: {
  snapshot: ProposalPdfSnapshot;
  styles: Styles;
}) {
  const { itinerary, trip, agency, branding } = snapshot;
  if (!itinerary) return null;

  return (
    <View style={styles.section}>
      <SectionHeading
        eyebrow="The journey"
        title="Day by day"
        agencyName={agency.name}
        logoUrl={agency.logoUrl}
        repeat={branding.repeatLogo}
        styles={styles}
        accent={branding.accent}
      />
      {itinerary.days.map((day, i) => {
        const dateLabel = trip.startDate
          ? fmtDayLabel(addDays(trip.startDate, i))
          : null;
        return (
          <View key={i} style={styles.dayBlock} wrap={false}>
            <View style={styles.dayHeader}>
              <View>
                <Text
                  style={[styles.dayBadge, { color: branding.accent }]}
                >
                  Day {i + 1}
                  {dateLabel ? ` · ${dateLabel}` : ""}
                </Text>
                <Text style={styles.dayTitle}>{stripDayPrefix(day.title)}</Text>
                {day.city ? (
                  <Text style={styles.dayCity}>{day.city}</Text>
                ) : null}
              </View>
            </View>

            {day.summary?.trim() ? (
              <Text style={styles.daySummary}>{day.summary.trim()}</Text>
            ) : null}

            {day.activities && day.activities.length > 0 ? (
              <View style={styles.dayList}>
                <Text style={[styles.dayListEyebrow, { color: branding.accent }]}>
                  Experiences
                </Text>
                {day.activities.map((a, j) => (
                  <Text key={j} style={styles.dayListItem}>
                    • {a}
                  </Text>
                ))}
              </View>
            ) : null}

            {day.hotel && (
              <View style={styles.stayLine}>
                <Text style={[styles.stayLabel, { color: branding.accent }]}>
                  Stay
                </Text>
                <Text style={styles.stayValue}>
                  {day.hotel}
                  {day.roomType ? ` · ${day.roomType}` : ""}
                </Text>
              </View>
            )}

            {/* Meals included — only the chips themselves, never a
                shorthand restatement. */}
            {hasAnyMealsPdf(day.meals) && (
              <View style={styles.mealsLine}>
                <Text style={[styles.mealsLabel, { color: branding.accent }]}>
                  Meals included
                </Text>
                <Text style={styles.mealsValue}>
                  {(
                    [
                      day.meals?.breakfast && "Breakfast",
                      day.meals?.lunch && "Lunch",
                      day.meals?.dinner && "Dinner",
                    ].filter(Boolean) as string[]
                  ).join(" · ")}
                </Text>
              </View>
            )}

            {!isGenericMealNote(day.foodNote || day.food) &&
            (day.foodNote || day.food) ? (
              <View style={styles.calloutBox}>
                <Text style={[styles.calloutLabel, { color: branding.accent }]}>
                  Dining
                </Text>
                <Text style={styles.calloutText}>
                  {day.foodNote || day.food}
                </Text>
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

// --- inclusions / exclusions ---------------------------------------------

function Inclusions({
  included,
  excluded,
  styles,
}: {
  included: string[];
  excluded: string[];
  styles: Styles;
}) {
  return (
    <View style={styles.section}>
      <SectionHeading
        eyebrow="The fine print"
        title="What's included"
        styles={styles}
        accent={styles._accent}
      />
      <View style={styles.inclusionsGrid}>
        {included.length > 0 && (
          <View style={styles.inclusionsCol} wrap={false}>
            <Text style={[styles.inclusionsHeading, { color: "#0E6B41" }]}>
              Your package includes
            </Text>
            {included.map((it, i) => (
              <Text key={i} style={styles.inclusionsItem}>
                ✓ {it}
              </Text>
            ))}
          </View>
        )}
        {excluded.length > 0 && (
          <View style={styles.inclusionsCol} wrap={false}>
            <Text style={styles.inclusionsHeadingMuted}>Not included</Text>
            {excluded.map((it, i) => (
              <Text key={i} style={styles.inclusionsItemMuted}>
                ✗ {it}
              </Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

// --- pricing --------------------------------------------------------------

function PricingBlock({
  snapshot,
  styles,
}: {
  snapshot: ProposalPdfSnapshot;
  styles: Styles;
}) {
  const { pricing, branding, meta, agency } = snapshot;
  if (!pricing) return null;
  const validUntil = addDays(meta.preparedAt, meta.validityDays);

  return (
    <View style={styles.section} break>
      <SectionHeading
        eyebrow="Investment"
        title="Your package price"
        agencyName={agency.name}
        logoUrl={agency.logoUrl}
        repeat={branding.repeatLogo}
        styles={styles}
        accent={branding.accent}
      />
      <View style={styles.pricingShell} wrap={false}>
        {/* Headline */}
        <View style={styles.pricingHeadline}>
          {agency.logoUrl ? (
            <Image src={agency.logoUrl} style={styles.pricingLogo} />
          ) : null}
          <Text
            style={[
              styles.pricingHeadlineEyebrow,
              { color: branding.accent },
            ]}
          >
            Total package
          </Text>
          <Text style={styles.pricingHeadlineAmount}>
            {formatINR(pricing.total)}
          </Text>
          {pricing.travelers > 1 && (
            <Text style={styles.pricingHeadlineSub}>
              {formatINR(pricing.perPerson)} per person ·{" "}
              {pricing.travelers} travellers
            </Text>
          )}
        </View>

        {/* Breakdown */}
        {pricing.categories.length > 0 && (
          <View style={styles.pricingBreakdown}>
            <Text
              style={[styles.pricingBreakdownTitle, { color: branding.accent }]}
            >
              How it breaks down
            </Text>
            {pricing.categories.map((c) => (
              <View key={c.category} style={styles.pricingRow}>
                <Text style={styles.pricingCategory}>{c.label}</Text>
                <Text style={styles.pricingAmount}>
                  {formatINR(c.amount)}
                </Text>
              </View>
            ))}
            <View style={styles.pricingTotalRow}>
              <Text style={styles.pricingTotalLabel}>Total</Text>
              <Text style={styles.pricingTotalAmount}>
                {formatINR(pricing.total)}
              </Text>
            </View>
            <Text style={styles.pricingValidity}>
              All amounts are in Indian Rupees and inclusive of applicable
              service charges. This quotation is valid until{" "}
              {fmtDate(validUntil)}.
            </Text>
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
}: {
  terms: string;
  styles: Styles;
}) {
  return (
    <View style={styles.section} wrap={false}>
      <View style={styles.termsBox}>
        <Text style={[styles.termsEyebrow, { color: styles._accent }]}>
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
}: {
  snapshot: ProposalPdfSnapshot;
  styles: Styles;
}) {
  const { agency, branding } = snapshot;
  const contacts: { label: string; value: string }[] = [];
  if (agency.phone) contacts.push({ label: "Phone", value: agency.phone });
  if (agency.email) contacts.push({ label: "Email", value: agency.email });
  if (agency.website) contacts.push({ label: "Web", value: agency.website });

  return (
    <Page size="A4" style={styles.closingPage}>
      <View style={styles.closingInner}>
        {agency.logoUrl ? (
          <Image src={agency.logoUrl} style={styles.closingLogo} />
        ) : (
          <View style={styles.closingLogoFallback}>
            <Text style={styles.closingLogoFallbackText}>
              {agency.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        {branding.signatureNote ? (
          <Text style={styles.closingSignature}>{branding.signatureNote}</Text>
        ) : (
          <Text style={[styles.closingEyebrow, { color: branding.accent }]}>
            Ready when you are
          </Text>
        )}

        <Text style={styles.closingAgency}>{agency.name}</Text>

        {contacts.length > 0 && (
          <View style={styles.closingContacts}>
            {contacts.map((c, i) => (
              <View key={i} style={styles.closingContactItem}>
                <Text style={[styles.closingContactLabel, { color: branding.accent }]}>
                  {c.label}
                </Text>
                <Text style={styles.closingContactValue}>{c.value}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.closingCraft}>Crafted with TripCraft</Text>
      </View>
    </Page>
  );
}

// --- section heading (used inside content) --------------------------------

function SectionHeading({
  eyebrow,
  title,
  agencyName,
  logoUrl,
  repeat,
  styles,
  accent,
}: {
  eyebrow: string;
  title: string;
  agencyName?: string;
  logoUrl?: string | null;
  repeat?: boolean;
  styles: Styles;
  accent: string;
}) {
  return (
    <View style={styles.sectionHeading}>
      {repeat && agencyName ? (
        logoUrl ? (
          <Image src={logoUrl} style={styles.sectionLogo} />
        ) : (
          <View style={styles.sectionLogoFallback}>
            <Text style={styles.sectionLogoFallbackText}>
              {agencyName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )
      ) : null}
      <Text style={[styles.sectionEyebrow, { color: accent }]}>{eyebrow}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

// --- styles ---------------------------------------------------------------

type Theme = "classic" | "editorial" | "minimal";
type Styles = ReturnType<typeof makeStyles>;

function makeStyles(theme: Theme, accent: string) {
  const isMinimal = theme === "minimal";
  const isEditorial = theme === "editorial";
  // Cover surface — dark navy for classic, ivory for editorial, white for minimal.
  const coverBg = isMinimal ? WHITE : isEditorial ? IVORY : NAVY;
  const coverFg = isMinimal || isEditorial ? NAVY : IVORY;

  const base = StyleSheet.create({
    // Cover page ---------------------------------------------------------
    coverPage: {
      backgroundColor: coverBg,
      color: coverFg,
      padding: 0,
    },
    coverImage: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover",
      opacity: isEditorial ? 0.25 : 0.45,
    },
    coverScrim: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: NAVY,
      opacity: 0.55,
    },
    coverInner: {
      padding: 48,
      height: "100%",
      flexDirection: "column",
      justifyContent: "space-between",
    },
    coverHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    coverHeaderLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
    },
    coverLogo: {
      width: 48,
      height: 48,
      borderRadius: 24,
      objectFit: "cover",
    },
    coverLogoFallback: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: NAVY,
      alignItems: "center",
      justifyContent: "center",
    },
    coverLogoFallbackText: {
      color: IVORY,
      fontSize: 18,
      fontFamily: "Helvetica-Bold",
    },
    eyebrow: {
      fontSize: 8,
      letterSpacing: 2,
      textTransform: "uppercase",
      fontFamily: "Helvetica-Bold",
    },
    coverAgency: {
      color: NAVY,
      fontSize: 12,
      fontFamily: "Helvetica-Bold",
      marginTop: 2,
    },
    coverAgencyOnDark: {
      color: IVORY,
      fontSize: 12,
      fontFamily: "Helvetica-Bold",
      marginTop: 2,
    },
    coverVersion: {
      color: MUTED,
      fontSize: 8,
      letterSpacing: 2,
      textTransform: "uppercase",
    },
    coverVersionOnDark: {
      color: IVORY,
      opacity: 0.5,
      fontSize: 8,
      letterSpacing: 2,
      textTransform: "uppercase",
    },
    coverBody: {
      marginTop: 60,
    },
    coverDestination: {
      color: NAVY,
      fontSize: 56,
      fontFamily: "Times-Roman",
      lineHeight: 0.95,
    },
    coverDestinationOnDark: {
      color: IVORY,
      fontSize: 56,
      fontFamily: "Times-Roman",
      lineHeight: 0.95,
    },
    coverSummary: {
      marginTop: 18,
      color: INK,
      fontSize: 11,
      lineHeight: 1.6,
      maxWidth: 420,
    },
    coverSummaryOnDark: {
      marginTop: 18,
      color: IVORY,
      opacity: 0.85,
      fontSize: 11,
      lineHeight: 1.6,
      maxWidth: 420,
    },
    coverMetaRow: {
      flexDirection: "row",
      marginTop: 40,
      gap: 24,
      flexWrap: "wrap",
    },
    metaItem: {
      minWidth: 100,
    },
    metaLabel: {
      fontSize: 7,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      fontFamily: "Helvetica-Bold",
    },
    metaValue: {
      marginTop: 4,
      color: NAVY,
      fontFamily: "Times-Roman",
      fontSize: 12,
    },
    metaValueOnDark: {
      marginTop: 4,
      color: IVORY,
      fontFamily: "Times-Roman",
      fontSize: 12,
    },
    coverFooter: {
      marginTop: 30,
    },
    coverFooterText: {
      color: MUTED,
      fontSize: 8,
      letterSpacing: 1.5,
      textTransform: "uppercase",
    },
    coverFooterTextOnDark: {
      color: IVORY,
      opacity: 0.6,
      fontSize: 8,
      letterSpacing: 1.5,
      textTransform: "uppercase",
    },

    // Content page ------------------------------------------------------
    contentPage: {
      backgroundColor: WHITE,
      color: INK,
      paddingTop: 56,
      paddingBottom: 50,
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
      gap: 10,
      paddingBottom: 8,
      borderBottomWidth: 0.5,
      borderBottomColor: LINE,
    },
    runningLogo: {
      width: 22,
      height: 22,
      borderRadius: 11,
      objectFit: "cover",
    },
    runningLogoFallback: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: NAVY,
      alignItems: "center",
      justifyContent: "center",
    },
    runningLogoFallbackText: {
      color: IVORY,
      fontSize: 10,
      fontFamily: "Helvetica-Bold",
    },
    runningHeaderTextWrap: {
      flexDirection: "column",
    },
    runningHeaderAgency: {
      color: NAVY,
      fontFamily: "Helvetica-Bold",
      fontSize: 9,
    },
    runningHeaderTrip: {
      color: MUTED,
      fontSize: 7,
      letterSpacing: 1,
      textTransform: "uppercase",
      marginTop: 1,
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
      color: MUTED,
      fontSize: 7,
      letterSpacing: 1,
      textTransform: "uppercase",
    },

    // Section heading inside content -----------------------------------
    section: {
      marginTop: 18,
      marginBottom: 8,
    },
    sectionHeading: {
      alignItems: "center",
      marginBottom: 14,
    },
    sectionLogo: {
      width: 26,
      height: 26,
      borderRadius: 13,
      objectFit: "cover",
      marginBottom: 8,
    },
    sectionLogoFallback: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: NAVY,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
    },
    sectionLogoFallbackText: {
      color: IVORY,
      fontSize: 10,
      fontFamily: "Helvetica-Bold",
    },
    sectionEyebrow: {
      fontSize: 8,
      letterSpacing: 2,
      textTransform: "uppercase",
      fontFamily: "Helvetica-Bold",
      textAlign: "center",
    },
    sectionTitle: {
      marginTop: 4,
      fontSize: 22,
      color: NAVY,
      fontFamily: "Times-Roman",
      textAlign: "center",
    },

    // At-a-glance table ------------------------------------------------
    atGlanceTable: {
      borderWidth: 0.5,
      borderColor: LINE,
      borderRadius: 4,
    },
    atGlanceRowHeader: {
      flexDirection: "row",
      backgroundColor: IVORY,
      borderBottomWidth: 0.5,
      borderBottomColor: LINE,
      paddingVertical: 6,
      paddingHorizontal: 8,
    },
    atGlanceRow: {
      flexDirection: "row",
      borderBottomWidth: 0.5,
      borderBottomColor: LINE,
      paddingVertical: 7,
      paddingHorizontal: 8,
    },
    atGlanceHeaderText: {
      fontSize: 7,
      letterSpacing: 1.2,
      textTransform: "uppercase",
      color: MUTED,
      fontFamily: "Helvetica-Bold",
    },
    atGlanceCellDay: {
      width: 60,
      paddingRight: 6,
    },
    atGlanceCellWide: {
      flex: 1.2,
      paddingRight: 8,
      fontSize: 9,
      color: NAVY,
    },
    atGlanceCellHighlights: {
      flex: 1.8,
      fontSize: 9,
      color: INK,
    },
    atGlanceDayNum: {
      fontSize: 10,
      color: NAVY,
      fontFamily: "Helvetica-Bold",
    },
    atGlanceDayDate: {
      marginTop: 1,
      fontSize: 7,
      color: MUTED,
      letterSpacing: 1,
      textTransform: "uppercase",
    },

    // Card --------------------------------------------------------------
    card: {
      borderWidth: 0.5,
      borderColor: LINE,
      borderRadius: 4,
      padding: 12,
      marginBottom: 10,
    },
    cardEyebrow: {
      fontSize: 8,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      fontFamily: "Helvetica-Bold",
      marginBottom: 8,
    },
    segmentRow: {
      paddingVertical: 6,
      borderBottomWidth: 0.5,
      borderBottomColor: LINE,
    },
    segmentRouteRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    segmentRoute: {
      fontFamily: "Helvetica-Bold",
      color: NAVY,
      fontSize: 10,
    },
    segmentDay: {
      fontSize: 7,
      letterSpacing: 1.2,
      textTransform: "uppercase",
    },
    segmentMeta: {
      marginTop: 2,
      fontSize: 9,
      color: INK,
    },
    segmentTime: {
      marginTop: 1,
      fontSize: 9,
      color: MUTED,
    },

    // Day block ---------------------------------------------------------
    dayBlock: {
      marginBottom: 14,
      paddingBottom: 12,
      borderBottomWidth: 0.5,
      borderBottomColor: LINE,
    },
    dayHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 6,
    },
    dayBadge: {
      fontSize: 8,
      letterSpacing: 2,
      textTransform: "uppercase",
      fontFamily: "Helvetica-Bold",
    },
    dayTitle: {
      marginTop: 4,
      fontSize: 14,
      color: NAVY,
      fontFamily: "Times-Roman",
    },
    dayCity: {
      marginTop: 2,
      fontSize: 8,
      color: MUTED,
      letterSpacing: 1,
      textTransform: "uppercase",
    },
    daySummary: {
      marginTop: 4,
      fontSize: 10,
      lineHeight: 1.5,
      color: INK,
    },
    dayList: {
      marginTop: 8,
    },
    dayListEyebrow: {
      fontSize: 7,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      fontFamily: "Helvetica-Bold",
      marginBottom: 4,
    },
    dayListItem: {
      fontSize: 9,
      color: INK,
      marginBottom: 2,
    },
    stayLine: {
      marginTop: 8,
      flexDirection: "row",
      gap: 8,
      paddingTop: 6,
      borderTopWidth: 0.5,
      borderTopColor: LINE,
    },
    stayLabel: {
      fontSize: 7,
      letterSpacing: 1.2,
      textTransform: "uppercase",
      fontFamily: "Helvetica-Bold",
      width: 28,
    },
    stayValue: {
      fontSize: 9,
      color: NAVY,
      flex: 1,
    },
    mealsLine: {
      marginTop: 6,
      flexDirection: "row",
      gap: 8,
    },
    mealsLabel: {
      fontSize: 7,
      letterSpacing: 1.2,
      textTransform: "uppercase",
      fontFamily: "Helvetica-Bold",
      width: 70,
    },
    mealsValue: {
      fontSize: 9,
      color: INK,
      flex: 1,
    },
    calloutBox: {
      marginTop: 8,
      padding: 8,
      backgroundColor: IVORY,
      borderRadius: 4,
    },
    calloutLabel: {
      fontSize: 7,
      letterSpacing: 1.2,
      textTransform: "uppercase",
      fontFamily: "Helvetica-Bold",
      marginBottom: 3,
    },
    calloutText: {
      fontSize: 9,
      color: INK,
      lineHeight: 1.5,
    },

    // Inclusions --------------------------------------------------------
    inclusionsGrid: {
      flexDirection: "row",
      gap: 10,
    },
    inclusionsCol: {
      flex: 1,
      borderWidth: 0.5,
      borderColor: LINE,
      borderRadius: 4,
      padding: 10,
    },
    inclusionsHeading: {
      fontSize: 8,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      fontFamily: "Helvetica-Bold",
      marginBottom: 6,
    },
    inclusionsHeadingMuted: {
      fontSize: 8,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      fontFamily: "Helvetica-Bold",
      color: MUTED,
      marginBottom: 6,
    },
    inclusionsItem: {
      fontSize: 9,
      color: INK,
      marginBottom: 3,
    },
    inclusionsItemMuted: {
      fontSize: 9,
      color: MUTED,
      marginBottom: 3,
    },

    // Pricing -----------------------------------------------------------
    pricingShell: {
      borderWidth: 0.5,
      borderColor: LINE,
      borderRadius: 4,
      overflow: "hidden",
    },
    pricingHeadline: {
      backgroundColor: NAVY,
      color: IVORY,
      paddingVertical: 24,
      paddingHorizontal: 24,
      alignItems: "center",
    },
    pricingLogo: {
      width: 32,
      height: 32,
      borderRadius: 16,
      objectFit: "cover",
      marginBottom: 8,
    },
    pricingHeadlineEyebrow: {
      fontSize: 8,
      letterSpacing: 2,
      textTransform: "uppercase",
      fontFamily: "Helvetica-Bold",
    },
    pricingHeadlineAmount: {
      marginTop: 6,
      color: IVORY,
      fontSize: 36,
      fontFamily: "Times-Roman",
    },
    pricingHeadlineSub: {
      marginTop: 6,
      color: IVORY,
      opacity: 0.75,
      fontSize: 9,
    },
    pricingBreakdown: {
      padding: 18,
    },
    pricingBreakdownTitle: {
      fontSize: 8,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      fontFamily: "Helvetica-Bold",
      marginBottom: 8,
    },
    pricingRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 5,
      borderBottomWidth: 0.5,
      borderBottomColor: LINE,
    },
    pricingCategory: {
      fontSize: 10,
      color: INK,
    },
    pricingAmount: {
      fontSize: 10,
      color: NAVY,
      fontFamily: "Helvetica-Bold",
    },
    pricingTotalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingTop: 10,
    },
    pricingTotalLabel: {
      fontSize: 9,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      color: NAVY,
      fontFamily: "Helvetica-Bold",
    },
    pricingTotalAmount: {
      fontSize: 16,
      color: NAVY,
      fontFamily: "Times-Roman",
    },
    pricingValidity: {
      marginTop: 10,
      fontSize: 8,
      color: MUTED,
      lineHeight: 1.5,
    },

    // Terms -------------------------------------------------------------
    termsBox: {
      borderWidth: 0.5,
      borderColor: LINE,
      backgroundColor: IVORY,
      padding: 12,
      borderRadius: 4,
    },
    termsEyebrow: {
      fontSize: 8,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      fontFamily: "Helvetica-Bold",
      marginBottom: 6,
    },
    termsBody: {
      fontSize: 9,
      color: INK,
      lineHeight: 1.5,
    },

    // Closing page ------------------------------------------------------
    closingPage: {
      backgroundColor: WHITE,
      paddingVertical: 80,
      paddingHorizontal: 56,
    },
    closingInner: {
      alignItems: "center",
      justifyContent: "center",
      marginTop: 80,
    },
    closingLogo: {
      width: 110,
      height: 110,
      borderRadius: 55,
      objectFit: "cover",
      marginBottom: 24,
    },
    closingLogoFallback: {
      width: 110,
      height: 110,
      borderRadius: 55,
      backgroundColor: NAVY,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 24,
    },
    closingLogoFallbackText: {
      color: IVORY,
      fontSize: 44,
      fontFamily: "Helvetica-Bold",
    },
    closingEyebrow: {
      fontSize: 9,
      letterSpacing: 2,
      textTransform: "uppercase",
      fontFamily: "Helvetica-Bold",
      marginBottom: 10,
    },
    closingSignature: {
      fontSize: 11,
      color: INK,
      lineHeight: 1.6,
      fontStyle: "italic",
      textAlign: "center",
      maxWidth: 360,
      marginBottom: 16,
    },
    closingAgency: {
      fontSize: 28,
      color: NAVY,
      fontFamily: "Times-Roman",
    },
    closingContacts: {
      marginTop: 20,
      flexDirection: "row",
      gap: 36,
      flexWrap: "wrap",
      justifyContent: "center",
    },
    closingContactItem: {
      alignItems: "center",
    },
    closingContactLabel: {
      fontSize: 7,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      fontFamily: "Helvetica-Bold",
    },
    closingContactValue: {
      marginTop: 2,
      fontSize: 10,
      color: INK,
    },
    closingCraft: {
      marginTop: 40,
      fontSize: 7,
      letterSpacing: 2,
      textTransform: "uppercase",
      color: MUTED,
    },
  });

  // Attach the resolved accent so deeper components don't have to thread
  // it through props when they only need a single colour.
  return { ...base, _accent: accent } as typeof base & { _accent: string };
}
