import { notFound } from "next/navigation";
import QRCode from "qrcode";
import {
  Building2,
  Download,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  ShieldAlert,
} from "lucide-react";
import {
  getVoucherByToken,
  publicShareUrl,
  type VoucherSnapshot,
} from "@/server/services/vouchers";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

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

const ACCENT_TINT = "#F7F0E1";
const ACCENT_INK = "#9A7B3C";

function fmt(iso: string | null) {
  return iso ? formatDate(iso) : null;
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
/** Compact range like "14–17 Jun" or "28 Jun – 2 Jul". */
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

/** Category-adaptive hero stats; omits any stat with no value. */
function heroStats(s: VoucherSnapshot): { k: string; v: string }[] {
  const out: { k: string; v: string }[] = [];
  const inDate = fmt(s.service.startDate);
  const outDate = fmt(s.service.endDate);
  if (s.service.category === "HOTEL") {
    if (inDate) out.push({ k: "Check-in", v: inDate });
    if (outDate) out.push({ k: "Check-out", v: outDate });
    out.push({ k: "Guests", v: paxLabel(s.traveler.travelers) });
  } else {
    if (inDate) out.push({ k: "Date", v: inDate });
    if (outDate && outDate !== inDate) out.push({ k: "Until", v: outDate });
    out.push({ k: "Pax", v: paxLabel(s.traveler.travelers) });
  }
  return out;
}

export default async function PublicVoucherPage({
  params,
}: {
  params: { token: string };
}) {
  const voucher = await getVoucherByToken(params.token);
  if (!voucher) notFound();

  const s = voucher.content as unknown as VoucherSnapshot;

  // Real QR — encodes this voucher's public URL so it can be scanned on arrival.
  let qrDataUrl: string | null = null;
  try {
    qrDataUrl = await QRCode.toDataURL(publicShareUrl(voucher.shareToken), {
      margin: 1,
      width: 240,
      color: { dark: "#0B1C2C", light: "#FFFFFF" },
    });
  } catch {
    qrDataUrl = null;
  }

  const stats = heroStats(s);
  const nights = nightsBetween(s.service.startDate, s.service.endDate);
  const datesLine = s.service.startDate
    ? `${formatDate(s.service.startDate)}${
        s.service.endDate ? ` → ${formatDate(s.service.endDate)}` : ""
      }${nights ? ` · ${nights} ${nights === 1 ? "night" : "nights"}` : ""}`
    : null;
  const stubRange = compactRange(s.service.startDate, s.service.endDate);
  const locationLine = [s.vendor.city, s.vendor.state, s.vendor.country]
    .filter(Boolean)
    .join(", ");
  const directionsQuery = encodeURIComponent(
    [s.vendor.name, s.vendor.address, locationLine].filter(Boolean).join(", ")
  );

  return (
    <div className="min-h-screen bg-ivory px-4 py-6 text-ink md:py-12">
      <article className="mx-auto w-full max-w-[460px] overflow-hidden rounded-[26px] border border-line bg-ivory shadow-lift">
        {/* Hero (imagery-off treatment: navy + gold radial glow) */}
        <div
          className="relative flex min-h-[248px] flex-col justify-between px-6 pb-6 pt-5 text-white"
          style={{
            background:
              "radial-gradient(120% 120% at 85% 0%, rgba(200,169,106,0.22) 0%, #0B1C2C 60%), #0B1C2C",
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Seal />
              <div>
                <div className="text-[13px] font-bold uppercase tracking-[0.34em]">
                  TripCraft
                </div>
                <div
                  className="mt-0.5 text-[8.5px] font-medium uppercase tracking-[0.24em]"
                  style={{ color: "#E4CFA0" }}
                >
                  Crafted Travel
                </div>
              </div>
            </div>
            <div className="text-right">
              <div
                className="text-[8.5px] font-semibold uppercase tracking-[0.24em]"
                style={{ color: "#DFC795" }}
              >
                Voucher
              </div>
              <div className="mt-0.5 whitespace-nowrap text-[13px] font-semibold tracking-[0.04em]">
                {s.voucherNumber}
              </div>
            </div>
          </div>

          <div>
            <div className="text-[10.5px] font-semibold uppercase tracking-[0.3em] text-sand">
              {CATEGORY_LABEL[s.service.category] ?? CATEGORY_LABEL.OTHER}
            </div>
            <h1 className="mt-2 font-display text-[27px] font-semibold leading-[1.08]">
              {s.service.title}
            </h1>
            {stats.length > 0 && (
              <div className="mt-3.5 flex flex-wrap gap-x-[18px] gap-y-2 border-t border-white/15 pt-3">
                {stats.map((st) => (
                  <div key={st.k}>
                    <div
                      className="text-[8.5px] font-semibold uppercase tracking-[0.2em]"
                      style={{ color: "#DFC795" }}
                    >
                      {st.k}
                    </div>
                    <div className="mt-0.5 text-[12.5px] font-medium">
                      {st.v}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Gold rule */}
        <div className="h-[3px] bg-gradient-to-r from-sand to-[#E2D2AC]" />

        <div className="flex flex-col gap-4 p-[22px]">
          {/* Confirmation bar */}
          {s.service.confirmationNumber ? (
            <div
              className="-mx-[22px] flex items-center justify-between border-b border-line px-[22px] py-3.5"
              style={{ backgroundColor: ACCENT_TINT }}
            >
              <div>
                <div
                  className="text-[9px] font-semibold uppercase tracking-[0.22em]"
                  style={{ color: ACCENT_INK }}
                >
                  Confirmation
                </div>
                <div className="mt-0.5 font-bold tracking-[0.06em] text-navy">
                  {s.service.confirmationNumber}
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-navy px-3 py-[7px] text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-sand" />
                Confirmed
              </span>
            </div>
          ) : null}

          {/* Check-in stub */}
          <section
            className="overflow-hidden rounded-[14px] border bg-white"
            style={{ borderColor: "rgba(200,169,106,0.45)" }}
          >
            <div className="flex items-center justify-between bg-navy px-4 py-2.5">
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.3em] text-sand">
                Present at check-in
              </span>
              <span className="font-display text-[13px] text-white">
                Boarding pass
              </span>
            </div>
            <div className="flex items-center gap-4 p-4">
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrDataUrl}
                  alt="Voucher QR code"
                  className="h-[108px] w-[108px] shrink-0 rounded-[10px] border border-line bg-white p-[7px]"
                />
              ) : null}
              <div className="flex-1">
                <h3 className="font-display text-[16px] leading-tight text-navy">
                  Show this to check in
                </h3>
                <p className="mt-1 text-[12px] leading-[1.5] text-muted-foreground">
                  Present this voucher — printed or on your phone — on arrival.
                  A government photo ID for the lead guest may be requested.
                </p>
                {(stubRange || s.traveler.travelers) && (
                  <div className="mt-2.5 flex gap-[18px] border-t border-line pt-2.5">
                    {stubRange ? (
                      <div>
                        <div
                          className="text-[8.5px] font-semibold uppercase tracking-[0.18em]"
                          style={{ color: ACCENT_INK }}
                        >
                          Dates
                        </div>
                        <div className="mt-0.5 text-[12.5px] font-semibold text-navy">
                          {stubRange}
                        </div>
                      </div>
                    ) : null}
                    <div>
                      <div
                        className="text-[8.5px] font-semibold uppercase tracking-[0.18em]"
                        style={{ color: ACCENT_INK }}
                      >
                        Pax
                      </div>
                      <div className="mt-0.5 text-[12.5px] font-semibold text-navy">
                        {paxLabel(s.traveler.travelers)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Download CTA */}
          <a
            href={`/api/vouchers/${voucher.id}/pdf?token=${voucher.shareToken}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2.5 rounded-xl bg-navy px-4 py-3.5 text-[13px] font-semibold tracking-[0.02em] text-white transition-colors hover:bg-navy/90"
          >
            <Download className="h-4 w-4 text-sand" />
            Download PDF voucher
          </a>

          {/* Service details */}
          <Section label="Service details">
            <Card>
              {datesLine ? (
                <Field label="Dates" strong>
                  {datesLine}
                </Field>
              ) : null}
              {s.service.quantity ? (
                <Field label="Quantity">{s.service.quantity}</Field>
              ) : null}
              {s.service.description ? (
                <Field label="Includes">{s.service.description}</Field>
              ) : null}
            </Card>
          </Section>

          {/* Vendor */}
          <Section label="Vendor">
            <Card>
              <h3 className="font-display text-[19px] leading-[1.15] text-navy">
                {s.vendor.name}
              </h3>
              <p
                className="mt-[3px] flex items-center gap-1.5 text-[11px]"
                style={{ color: "#565656" }}
              >
                <Building2 className="h-3 w-3" style={{ color: ACCENT_INK }} />
                {s.vendor.type}
              </p>
              {s.vendor.address || locationLine ? (
                <p className="mt-3 flex gap-2 text-[12.5px] leading-[1.5]">
                  <MapPin
                    className="mt-0.5 h-[15px] w-[15px] shrink-0"
                    style={{ color: ACCENT_INK }}
                  />
                  <span>
                    {s.vendor.address}
                    {locationLine ? (
                      <>
                        {s.vendor.address ? <br /> : null}
                        <span className="text-muted-foreground">
                          {locationLine}
                        </span>
                      </>
                    ) : null}
                  </span>
                </p>
              ) : null}
              <div className="mt-3.5 flex flex-wrap gap-2">
                {s.vendor.phone ? (
                  <Chip href={`tel:${s.vendor.phone}`}>
                    <Phone
                      className="h-[13px] w-[13px]"
                      style={{ color: ACCENT_INK }}
                    />
                    {s.vendor.phone}
                  </Chip>
                ) : null}
                {s.vendor.whatsapp ? (
                  <Chip
                    href={`https://wa.me/${s.vendor.whatsapp.replace(/\D/g, "")}`}
                    external
                  >
                    <MessageCircle className="h-[13px] w-[13px] text-[#1f9d55]" />
                    WhatsApp
                  </Chip>
                ) : null}
                {s.vendor.email ? (
                  <Chip href={`mailto:${s.vendor.email}`}>
                    <Mail
                      className="h-[13px] w-[13px]"
                      style={{ color: ACCENT_INK }}
                    />
                    Email
                  </Chip>
                ) : null}
                {directionsQuery ? (
                  <Chip
                    href={`https://www.google.com/maps/search/?api=1&query=${directionsQuery}`}
                    external
                  >
                    <Navigation
                      className="h-[13px] w-[13px]"
                      style={{ color: ACCENT_INK }}
                    />
                    Directions
                  </Chip>
                ) : null}
              </div>
            </Card>
          </Section>

          {/* Your trip */}
          <Section label="Your trip">
            <Card>
              <Field label="Destination" strong>
                {s.trip.destination}
              </Field>
              <Field label="Duration">
                {s.trip.days} {s.trip.days === 1 ? "day" : "days"}
              </Field>
              {s.traveler.leadName ? (
                <Field label="Lead guest">{s.traveler.leadName}</Field>
              ) : null}
              {s.trip.startDate ? (
                <Field label="Departs">{formatDate(s.trip.startDate)}</Field>
              ) : null}
            </Card>
          </Section>

          {/* Support band */}
          <div className="relative overflow-hidden rounded-[14px] bg-navy p-[18px] text-white">
            <span
              className="pointer-events-none absolute -right-[30px] -top-[30px] h-[130px] w-[130px] rounded-full border"
              style={{ borderColor: "rgba(200,169,106,0.18)" }}
            />
            <span
              className="pointer-events-none absolute -right-2 -top-2 h-[86px] w-[86px] rounded-full border"
              style={{ borderColor: "rgba(200,169,106,0.14)" }}
            />
            <div className="relative flex items-end justify-between gap-4">
              <div>
                <div
                  className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.2em]"
                  style={{ color: "#E4CFA0" }}
                >
                  <ShieldAlert className="h-3 w-3" />
                  24×7 Emergency
                </div>
                <div className="mt-1.5 font-display text-[22px]">
                  {s.agency.emergencyPhone}
                </div>
              </div>
              <div className="text-right">
                <div
                  className="text-[9px] font-semibold uppercase tracking-[0.2em]"
                  style={{ color: "#E4CFA0" }}
                >
                  Concierge
                </div>
                <div className="mt-1.5 text-[12px] text-white/85">
                  {s.agency.email}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3.5 text-[10px] tracking-[0.08em] text-muted-foreground">
            <span>
              {s.agency.name.toUpperCase()} · {s.agency.phone}
            </span>
            <span>Issued {formatDate(s.generatedAt)}</span>
          </div>
        </div>
      </article>
    </div>
  );
}

function Seal() {
  return (
    <span className="relative flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full border border-sand/70">
      <span className="absolute inset-[3px] rounded-full border border-sand/30" />
      <span className="font-display text-[15px] font-semibold tracking-[0.02em] text-sand">
        TC
      </span>
    </span>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-2.5 flex items-center gap-2">
        <span className="text-[9.5px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          {label}
        </span>
        <span className="h-px flex-1 bg-line" />
      </div>
      {children}
    </section>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[14px] border border-line bg-white p-5">
      {children}
    </div>
  );
}

function Field({
  label,
  children,
  strong = false,
}: {
  label: string;
  children: React.ReactNode;
  strong?: boolean;
}) {
  return (
    <div className="flex gap-3.5 border-b border-line/70 py-[9px] first:pt-0 last:border-b-0 last:pb-0">
      <span className="w-[84px] shrink-0 pt-0.5 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <span
        className={
          "flex-1 text-[13.5px] leading-[1.45] " +
          (strong ? "font-semibold text-navy" : "text-ink")
        }
      >
        {children}
      </span>
    </div>
  );
}

function Chip({
  href,
  external = false,
  children,
}: {
  href: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className="inline-flex items-center gap-[7px] rounded-full border border-line bg-white px-[13px] py-2 text-[11.5px] font-medium text-navy transition-colors hover:border-sand-200"
    >
      {children}
    </a>
  );
}
