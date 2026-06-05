import Link from "next/link";
import {
  ArrowRight,
  CreditCard,
  DatabaseZap,
  FileCheck2,
  KeyRound,
  Lock,
  ServerCog,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Reveal, Stagger, StaggerItem } from "@/components/marketing/motion-primitives";

export const dynamic = "force-dynamic";

export const metadata = {
  alternates: { canonical: "/security" },
  title: "Security",
  description:
    "How tripOS protects your agency and your customers' data — tenant isolation, encryption, role-based access, secure payments and compliance.",
};

const PILLARS = [
  {
    icon: DatabaseZap,
    title: "Tenant isolation",
    body: "Every agency's data is scoped to its own workspace. Queries are filtered by agency on the server, so one agency can never read another's contacts, trips or invoices.",
  },
  {
    icon: UserCheck,
    title: "Role-based access",
    body: "Owner, Staff and Viewer roles gate every sensitive action server-side. Viewers can read; only authorised roles can issue invoices, take payments or manage the team.",
  },
  {
    icon: Lock,
    title: "Encryption in transit",
    body: "All traffic is served over HTTPS/TLS. Passwords are hashed with bcrypt — never stored or logged in plain text.",
  },
  {
    icon: CreditCard,
    title: "Secure payments",
    body: "Card and payment processing is handled by PCI-DSS compliant gateways (Razorpay). We never see or store raw card numbers.",
  },
  {
    icon: KeyRound,
    title: "Customer-safe by design",
    body: "Shared proposals and invoices use unguessable tokens and only ever expose customer-safe figures — your cost, markup and margins never leave your workspace.",
  },
  {
    icon: ServerCog,
    title: "Resilient infrastructure",
    body: "Hosted on managed, auto-scaling infrastructure with a managed Postgres database, automated backups and monitored uptime.",
  },
];

export default function SecurityPage() {
  return (
    <MarketingShell>
      <section className="relative overflow-hidden border-b border-line">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(200,169,106,0.1),transparent_55%)]" />
        <div className="relative mx-auto max-w-4xl px-5 py-20 text-center md:px-10 md:py-28">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--gold-line)] bg-gold-soft px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] text-gold-deep">
              <ShieldCheck className="h-3.5 w-3.5" />
              Security & trust
            </span>
            <h1 className="mt-6 font-display text-4xl text-ink md:text-6xl">
              Your agency&apos;s data, protected
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-ink/75">
              You&apos;re trusting us with your customers, their passports and
              their payments. We take that seriously — here&apos;s how we keep it
              safe.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 md:px-10">
        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((p) => (
            <StaggerItem key={p.title}>
              <div className="h-full rounded-lg border border-line bg-paper p-6 shadow-soft">
                <span className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-gold-soft border border-[var(--gold-line)] text-gold-deep">
                  <p.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-xl text-ink">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/75">
                  {p.body}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="border-y border-line bg-paper-2">
        <div className="mx-auto max-w-4xl px-5 py-16 md:px-10">
          <Reveal>
            <div className="flex items-start gap-4 rounded-xl border border-line bg-paper p-6">
              <FileCheck2 className="mt-1 h-6 w-6 shrink-0 text-gold-deep" />
              <div>
                <h3 className="font-display text-xl text-ink">
                  Compliance & data rights
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/75">
                  tripOS issues GST-compliant tax invoices and is built with
                  India&apos;s DPDP Act in mind. We act as a processor for the
                  customer data your agency stores, and as a controller for your
                  account and billing data. See our{" "}
                  <Link href="/legal/privacy" className="text-ink underline">
                    Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link href="/legal/terms" className="text-ink underline">
                    Terms
                  </Link>
                  .
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-20 text-center md:px-10">
        <Reveal>
          <h2 className="font-display text-3xl text-ink md:text-4xl">
            Found a vulnerability?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-ink/75">
            We welcome responsible disclosure. Email our team and we&apos;ll
            respond promptly — no agency or customer data is worth more than your
            trust.
          </p>
          <a
            href="mailto:security@tripcraft.app"
            className="mt-7 inline-flex items-center gap-2 rounded-[8px] bg-inkwash px-6 py-3 text-sm font-medium text-[var(--on-dark)] transition-colors hover:bg-inkwash/90"
          >
            security@tripcraft.app
            <ArrowRight className="h-4 w-4" />
          </a>
        </Reveal>
      </section>
    </MarketingShell>
  );
}
