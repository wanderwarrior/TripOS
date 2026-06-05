/* eslint-disable jsx-a11y/alt-text */
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import type { VoucherSnapshot } from "@/server/services/vouchers";

const NAVY = "#0B1C2C";
const SAND = "#C8A96A";
const SAND_TINT = "#DFC795";
const INK = "#1A1A1A";
const MUTED = "#565656";
const LINE = "#E8E4DB";
const ACCENT_TINT = "#F7F0E1";
const ACCENT_INK = "#9A7B3C";
// Built-in react-pdf serif stands in for Playfair Display (no fonts registered).
const SERIF = "Times-Bold";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#FFFFFF",
    fontFamily: "Helvetica",
    fontSize: 10,
    color: INK,
    paddingTop: 0,
    paddingBottom: 40,
    paddingHorizontal: 0,
  },

  // Hero (imagery-off: solid navy)
  hero: {
    backgroundColor: NAVY,
    paddingHorizontal: 40,
    paddingTop: 28,
    paddingBottom: 26,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  brandRow: { flexDirection: "row", alignItems: "center" },
  brandText: { marginLeft: 10 },
  wordmark: {
    color: "#FFFFFF",
    fontFamily: "Helvetica-Bold",
    fontSize: 13,
    letterSpacing: 3,
  },
  tagline: {
    color: SAND_TINT,
    fontSize: 7,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginTop: 3,
  },
  heroRight: { alignItems: "flex-end" },
  metaKicker: {
    color: SAND_TINT,
    fontSize: 7,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  voucherNumber: {
    color: "#FFFFFF",
    fontFamily: "Helvetica-Bold",
    fontSize: 13,
    marginTop: 3,
    letterSpacing: 1,
  },
  issued: { color: SAND_TINT, fontSize: 8, marginTop: 4 },

  // Seal
  seal: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(200,169,106,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  sealInner: {
    position: "absolute",
    top: 3,
    left: 3,
    right: 3,
    bottom: 3,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "rgba(200,169,106,0.32)",
  },
  sealText: { color: SAND, fontFamily: SERIF, fontSize: 15 },

  heroTitleBlock: { marginTop: 30 },
  category: {
    fontSize: 9,
    color: SAND,
    letterSpacing: 3,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
  },
  serviceTitle: {
    fontSize: 28,
    fontFamily: SERIF,
    color: "#FFFFFF",
    marginTop: 8,
    lineHeight: 1.1,
    maxWidth: 420,
  },

  // Hero meta strip
  metaStrip: {
    flexDirection: "row",
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.16)",
  },
  metaItem: { marginRight: 28 },
  metaLabel: {
    color: SAND_TINT,
    fontSize: 7,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  metaValue: { color: "#FFFFFF", fontSize: 11, marginTop: 3 },

  // Gold rule
  rule: { height: 3, backgroundColor: SAND },

  // Confirmation bar
  confBar: {
    backgroundColor: ACCENT_TINT,
    borderBottomWidth: 0.5,
    borderBottomColor: LINE,
    paddingHorizontal: 40,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  confLabel: {
    color: ACCENT_INK,
    fontSize: 7,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
  },
  confValue: {
    color: NAVY,
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    letterSpacing: 1,
    marginTop: 3,
  },
  confPill: {
    backgroundColor: NAVY,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  confDot: {
    width: 5,
    height: 5,
    borderRadius: 5,
    backgroundColor: SAND,
    marginRight: 6,
  },
  confPillText: {
    color: "#FFFFFF",
    fontSize: 8,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
  },

  // Body
  body: { paddingHorizontal: 40, paddingTop: 22 },
  cols: { flexDirection: "row" },
  colMain: { flex: 1.5, marginRight: 22 },
  colSide: { flex: 1 },

  // Section
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 7.5,
    color: MUTED,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
    marginRight: 8,
  },
  sectionRule: { flex: 1, height: 0.5, backgroundColor: LINE },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: LINE,
    padding: 14,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 15, fontFamily: SERIF, color: NAVY },
  cardSub: { fontSize: 9, color: MUTED, marginTop: 3 },

  // Field row
  fieldRow: {
    flexDirection: "row",
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: LINE,
  },
  fieldRowLast: { flexDirection: "row", paddingVertical: 5 },
  fieldLabel: {
    width: 78,
    fontSize: 8,
    color: MUTED,
    letterSpacing: 1,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
    paddingTop: 1,
  },
  fieldValue: { flex: 1, fontSize: 10, color: INK, lineHeight: 1.4 },
  fieldValueStrong: {
    flex: 1,
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
  },
  vendorLine: { fontSize: 9.5, color: INK, lineHeight: 1.4, marginTop: 6 },

  // Check-in stub
  stub: {
    borderWidth: 1,
    borderColor: "rgba(200,169,106,0.45)",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 16,
  },
  stubHead: {
    backgroundColor: NAVY,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  stubHeadLabel: {
    color: SAND,
    fontSize: 8,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
  },
  stubBody: { padding: 14, alignItems: "center" },
  qrBox: {
    width: 124,
    height: 124,
    backgroundColor: "#FFFFFF",
    borderWidth: 0.5,
    borderColor: LINE,
    borderRadius: 8,
    padding: 6,
  },
  qrImage: { width: "100%", height: "100%" },
  stubHeading: {
    fontFamily: SERIF,
    fontSize: 13,
    color: NAVY,
    marginTop: 10,
    textAlign: "center",
  },
  stubCopy: {
    fontSize: 8.5,
    color: MUTED,
    lineHeight: 1.5,
    textAlign: "center",
    marginTop: 5,
  },
  stubFacts: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: LINE,
    width: "100%",
  },
  stubFact: { alignItems: "center", marginHorizontal: 12 },
  stubFactLabel: {
    color: ACCENT_INK,
    fontSize: 7,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
  },
  stubFactValue: {
    color: NAVY,
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginTop: 3,
  },

  // Support band
  support: {
    backgroundColor: NAVY,
    borderRadius: 10,
    padding: 16,
    overflow: "hidden",
  },
  ringOuter: {
    position: "absolute",
    top: -34,
    right: -34,
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: "rgba(200,169,106,0.18)",
  },
  ringInner: {
    position: "absolute",
    top: -10,
    right: -10,
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 1,
    borderColor: "rgba(200,169,106,0.14)",
  },
  supportLabel: {
    color: SAND_TINT,
    fontSize: 7.5,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
  },
  supportPhone: {
    color: "#FFFFFF",
    fontFamily: SERIF,
    fontSize: 20,
    marginTop: 6,
  },
  supportDivider: {
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.16)",
    marginVertical: 12,
  },
  supportEmail: { color: "rgba(255,255,255,0.85)", fontSize: 9.5, marginTop: 6 },

  // Footer
  footer: {
    position: "absolute",
    bottom: 18,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: LINE,
  },
  footerText: { fontSize: 7.5, color: MUTED, letterSpacing: 1 },
});

const CATEGORY_LABEL: Record<string, string> = {
  HOTEL: "Hotel voucher",
  TRANSFER: "Transfer voucher",
  SIGHTSEEING: "Sightseeing voucher",
  ACTIVITY: "Activity voucher",
  GUIDE: "Guide voucher",
  FLIGHT: "Flight voucher",
  TRAIN: "Train voucher",
  OTHER: "Service voucher",
};

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
function nightsBetween(a: string | null, b: string | null): number | null {
  if (!a || !b) return null;
  const ms = new Date(b).getTime() - new Date(a).getTime();
  if (!Number.isFinite(ms) || ms <= 0) return null;
  return Math.round(ms / 86_400_000);
}
function paxLabel(n: number) {
  return `${n} ${n === 1 ? "guest" : "guests"}`;
}
function compactRange(a: string | null, b: string | null): string | null {
  if (!a) return null;
  const da = new Date(a);
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  if (!b) return da.toLocaleDateString("en-IN", opts);
  const db = new Date(b);
  if (da.getMonth() === db.getMonth() && da.getFullYear() === db.getFullYear()) {
    return `${da.getDate()}–${db.toLocaleDateString("en-IN", opts)}`;
  }
  return `${da.toLocaleDateString("en-IN", opts)} – ${db.toLocaleDateString("en-IN", opts)}`;
}
function locationLine(v: VoucherSnapshot["vendor"]) {
  return [v.city, v.state, v.country].filter(Boolean).join(", ");
}

function heroStats(s: VoucherSnapshot): { k: string; v: string }[] {
  const out: { k: string; v: string }[] = [];
  const inDate = fmtDate(s.service.startDate);
  const outDate = fmtDate(s.service.endDate);
  const nights = nightsBetween(s.service.startDate, s.service.endDate);
  if (s.service.category === "HOTEL") {
    if (s.service.startDate) out.push({ k: "Check-in", v: inDate });
    if (s.service.endDate) out.push({ k: "Check-out", v: outDate });
    out.push({ k: "Guests", v: String(s.traveler.travelers) });
    if (nights) out.push({ k: "Nights", v: String(nights) });
  } else {
    if (s.service.startDate) out.push({ k: "Date", v: inDate });
    if (s.service.endDate && s.service.endDate !== s.service.startDate)
      out.push({ k: "Until", v: outDate });
    out.push({ k: "Pax", v: String(s.traveler.travelers) });
  }
  return out;
}

function SectionHead({ label }: { label: string }) {
  return (
    <View style={styles.sectionHead}>
      <Text style={styles.sectionLabel}>{label.toUpperCase()}</Text>
      <View style={styles.sectionRule} />
    </View>
  );
}

export function VoucherDocument({
  snapshot,
  qrDataUrl,
}: {
  snapshot: VoucherSnapshot;
  qrDataUrl: string | null;
}) {
  const s = snapshot;
  const cat = s.service.category;
  const stats = heroStats(s);
  const nights = nightsBetween(s.service.startDate, s.service.endDate);
  const datesLine = s.service.startDate
    ? `${fmtDate(s.service.startDate)}${
        s.service.endDate ? ` → ${fmtDate(s.service.endDate)}` : ""
      }${nights ? ` · ${nights} ${nights === 1 ? "night" : "nights"}` : ""}`
    : "—";
  const stubRange = compactRange(s.service.startDate, s.service.endDate);
  const loc = locationLine(s.vendor);

  return (
    <Document
      title={s.voucherNumber}
      author={s.agency.name}
      subject={`${s.vendor.name} — ${s.service.title}`}
    >
      <Page size="A4" style={styles.page}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.brandRow}>
              <View style={styles.seal}>
                <View style={styles.sealInner} />
                <Text style={styles.sealText}>tO</Text>
              </View>
              <View style={styles.brandText}>
                <Text style={styles.wordmark}>tripOS</Text>
                <Text style={styles.tagline}>Crafted travel · Voucher of service</Text>
              </View>
            </View>
            <View style={styles.heroRight}>
              <Text style={styles.metaKicker}>Voucher</Text>
              <Text style={styles.voucherNumber}>{s.voucherNumber}</Text>
              <Text style={styles.issued}>Issued {fmtDate(s.generatedAt)}</Text>
            </View>
          </View>

          <View style={styles.heroTitleBlock}>
            <Text style={styles.category}>
              {CATEGORY_LABEL[cat] ?? CATEGORY_LABEL.OTHER}
            </Text>
            <Text style={styles.serviceTitle}>{s.service.title}</Text>
            {stats.length > 0 ? (
              <View style={styles.metaStrip}>
                {stats.map((st) => (
                  <View key={st.k} style={styles.metaItem}>
                    <Text style={styles.metaLabel}>{st.k}</Text>
                    <Text style={styles.metaValue}>{st.v}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        </View>

        {/* Gold rule */}
        <View style={styles.rule} />

        {/* Confirmation bar */}
        {s.service.confirmationNumber ? (
          <View style={styles.confBar}>
            <View>
              <Text style={styles.confLabel}>Confirmation</Text>
              <Text style={styles.confValue}>{s.service.confirmationNumber}</Text>
            </View>
            <View style={styles.confPill}>
              <View style={styles.confDot} />
              <Text style={styles.confPillText}>Confirmed</Text>
            </View>
          </View>
        ) : null}

        {/* Body */}
        <View style={styles.body}>
          <View style={styles.cols}>
            {/* MAIN COLUMN */}
            <View style={styles.colMain}>
              <SectionHead label="Service details" />
              <View style={styles.card}>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Dates</Text>
                  <Text style={styles.fieldValueStrong}>{datesLine}</Text>
                </View>
                {s.service.quantity ? (
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Quantity</Text>
                    <Text style={styles.fieldValue}>{s.service.quantity}</Text>
                  </View>
                ) : null}
                {s.service.description ? (
                  <View style={styles.fieldRowLast}>
                    <Text style={styles.fieldLabel}>Includes</Text>
                    <Text style={styles.fieldValue}>{s.service.description}</Text>
                  </View>
                ) : null}
              </View>

              <SectionHead label="Vendor" />
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{s.vendor.name}</Text>
                <Text style={styles.cardSub}>{s.vendor.type}</Text>
                {s.vendor.address ? (
                  <Text style={styles.vendorLine}>{s.vendor.address}</Text>
                ) : null}
                {loc ? <Text style={styles.vendorLine}>{loc}</Text> : null}
                <View style={{ marginTop: 6 }}>
                  {s.vendor.phone ? (
                    <View style={styles.fieldRow}>
                      <Text style={styles.fieldLabel}>Call</Text>
                      <Text style={styles.fieldValue}>{s.vendor.phone}</Text>
                    </View>
                  ) : null}
                  {s.vendor.whatsapp ? (
                    <View style={styles.fieldRow}>
                      <Text style={styles.fieldLabel}>WhatsApp</Text>
                      <Text style={styles.fieldValue}>{s.vendor.whatsapp}</Text>
                    </View>
                  ) : null}
                  {s.vendor.email ? (
                    <View style={styles.fieldRowLast}>
                      <Text style={styles.fieldLabel}>Email</Text>
                      <Text style={styles.fieldValue}>{s.vendor.email}</Text>
                    </View>
                  ) : null}
                </View>
              </View>

              <SectionHead label="Your trip" />
              <View style={styles.card}>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Destination</Text>
                  <Text style={styles.fieldValueStrong}>{s.trip.destination}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Duration</Text>
                  <Text style={styles.fieldValue}>
                    {s.trip.days} {s.trip.days === 1 ? "day" : "days"}
                  </Text>
                </View>
                {s.traveler.leadName ? (
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Lead guest</Text>
                    <Text style={styles.fieldValue}>{s.traveler.leadName}</Text>
                  </View>
                ) : null}
                {s.trip.startDate ? (
                  <View style={styles.fieldRowLast}>
                    <Text style={styles.fieldLabel}>Departs</Text>
                    <Text style={styles.fieldValue}>{fmtDate(s.trip.startDate)}</Text>
                  </View>
                ) : null}
              </View>
            </View>

            {/* SIDE COLUMN */}
            <View style={styles.colSide}>
              {/* Check-in stub */}
              <View style={styles.stub}>
                <View style={styles.stubHead}>
                  <Text style={styles.stubHeadLabel}>Present at check-in</Text>
                </View>
                <View style={styles.stubBody}>
                  {qrDataUrl ? (
                    <View style={styles.qrBox}>
                      <Image src={qrDataUrl} style={styles.qrImage} />
                    </View>
                  ) : null}
                  <Text style={styles.stubHeading}>Show this to check in</Text>
                  <Text style={styles.stubCopy}>
                    Present this voucher — printed or on your phone — on arrival.
                    A government photo ID for the lead guest may be requested.
                  </Text>
                  {(stubRange || s.traveler.travelers) ? (
                    <View style={styles.stubFacts}>
                      {stubRange ? (
                        <View style={styles.stubFact}>
                          <Text style={styles.stubFactLabel}>Dates</Text>
                          <Text style={styles.stubFactValue}>{stubRange}</Text>
                        </View>
                      ) : null}
                      <View style={styles.stubFact}>
                        <Text style={styles.stubFactLabel}>Pax</Text>
                        <Text style={styles.stubFactValue}>
                          {paxLabel(s.traveler.travelers)}
                        </Text>
                      </View>
                    </View>
                  ) : null}
                </View>
              </View>

              {/* Support band */}
              <View style={styles.support}>
                <View style={styles.ringOuter} />
                <View style={styles.ringInner} />
                <Text style={styles.supportLabel}>24×7 Emergency</Text>
                <Text style={styles.supportPhone}>{s.agency.emergencyPhone}</Text>
                <View style={styles.supportDivider} />
                <Text style={styles.supportLabel}>Concierge</Text>
                <Text style={styles.supportEmail}>{s.agency.email}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {s.agency.name.toUpperCase()} · {s.agency.phone}
          </Text>
          <Text style={styles.footerText}>VOUCHER {s.voucherNumber}</Text>
        </View>
      </Page>
    </Document>
  );
}
