import { Mail, MessageCircle, LifeBuoy } from "lucide-react";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { ContactForm } from "@/components/marketing/contact-form";
import { Reveal } from "@/components/marketing/motion-primitives";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Contact",
  description:
    "Talk to the tripOS team — book a demo, ask a question, or get help moving your travel agency onto one platform.",
};

const CHANNELS = [
  {
    icon: Mail,
    label: "Email us",
    value: "hello@tripcraft.app",
    href: "mailto:hello@tripcraft.app",
  },
  {
    icon: LifeBuoy,
    label: "Support",
    value: "support@tripcraft.app",
    href: "mailto:support@tripcraft.app",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "Chat with us",
    href: "https://wa.me/910000000000",
  },
];

export default function ContactPage() {
  return (
    <MarketingShell>
      <section className="relative overflow-hidden border-b border-line">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(200,169,106,0.1),transparent_55%)]" />
        <div className="relative mx-auto max-w-4xl px-5 py-20 text-center md:px-10 md:py-24">
          <Reveal>
            <h1 className="font-display text-4xl text-ink md:text-6xl">
              Let&apos;s talk
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-ink/75">
              Want a walkthrough, have a question, or ready to move your agency
              onto tripOS? Send us a note — we usually reply within a business
              day.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-16 md:px-10">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr] md:gap-14">
          <Reveal>
            <ContactForm />
          </Reveal>

          <Reveal delay={0.1} className="space-y-4">
            <h2 className="font-display text-xl text-ink">Other ways to reach us</h2>
            {CHANNELS.map((c) => (
              <a
                key={c.label}
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel={c.href.startsWith("http") ? "noopener" : undefined}
                className="flex items-center gap-4 rounded-lg border border-line bg-paper p-4 transition-colors hover:border-[var(--gold-line)]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-gold-soft border border-[var(--gold-line)] text-gold-deep">
                  <c.icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-xs uppercase tracking-wide text-muted">
                    {c.label}
                  </span>
                  <span className="block text-sm font-medium text-ink">
                    {c.value}
                  </span>
                </span>
              </a>
            ))}
            <p className="pt-2 text-xs text-muted">
              Prefer to explore on your own? You can start a free trial anytime —
              no card required.
            </p>
          </Reveal>
        </div>
      </section>
    </MarketingShell>
  );
}
