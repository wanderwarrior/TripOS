"use client";

import { useState, useTransition } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { submitContactAction } from "@/server/actions/contact";

export function ContactForm() {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await submitContactAction({
        name: String(fd.get("name") ?? ""),
        email: String(fd.get("email") ?? ""),
        agency: String(fd.get("agency") ?? ""),
        message: String(fd.get("message") ?? ""),
        company: String(fd.get("company") ?? ""),
      });
      if (res.ok) {
        setDone(true);
        toast.success("Message sent — we'll be in touch soon.");
      } else {
        toast.error(res.error);
      }
    });
  }

  if (done) {
    return (
      <div className="rounded-xl border border-line bg-paper p-8 text-center shadow-soft">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-ok-soft text-ok">
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <h3 className="mt-4 font-display text-xl text-ink">Message sent</h3>
        <p className="mt-2 text-sm text-ink/70">
          Thanks for reaching out. A member of our team will get back to you
          shortly — check your inbox for a confirmation.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-xl border border-line bg-paper p-6 shadow-soft md:p-8"
    >
      {/* Honeypot — hidden from humans */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="hidden"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" name="name" placeholder="Ananya Rao" required />
        <Field
          label="Work email"
          name="email"
          type="email"
          placeholder="you@agency.com"
          required
        />
      </div>
      <Field label="Agency (optional)" name="agency" placeholder="Wanderloom Travel" />
      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-ink">
          How can we help?
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          placeholder="Tell us about your agency and what you're looking for…"
          className="w-full rounded-[10px] border border-line bg-paper-2/60 px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-[var(--gold-line)]"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-inkwash px-6 py-3 text-sm font-medium text-[var(--on-dark)] transition-colors hover:bg-inkwash/90 disabled:opacity-70 sm:w-auto"
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ArrowRight className="h-4 w-4" />
        )}
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-[10px] border border-line bg-paper-2/60 px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-[var(--gold-line)]"
      />
    </div>
  );
}
