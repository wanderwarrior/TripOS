"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createDemoRequestAction } from "@/server/actions/demo";

const EMPTY = {
  name: "",
  email: "",
  phone: "",
  agencyName: "",
  message: "",
  company: "", // honeypot
};

export function RequestDemoDialog({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [isPending, start] = useTransition();

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      // Reset shortly after close so the form is fresh next time.
      setTimeout(() => {
        setForm(EMPTY);
        setDone(false);
      }, 200);
    }
  }

  function submit() {
    start(async () => {
      const res = await createDemoRequestAction(form);
      if (res.ok) {
        setDone(true);
      } else {
        toast.error(res.error);
      }
    });
  }

  const valid =
    form.name.trim().length > 0 &&
    /.+@.+\..+/.test(form.email) &&
    form.phone.trim().length >= 7;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        {done ? (
          <div className="py-4 text-center">
            <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-ok-soft text-[var(--ok)]">
              <CheckCircle2 className="h-6 w-6" />
            </span>
            <DialogTitle className="font-display text-2xl">
              Request received 🎉
            </DialogTitle>
            <DialogDescription className="mt-2">
              Thanks{form.name ? `, ${form.name.split(/\s+/)[0]}` : ""}! Our team
              will reach out shortly to schedule your free demo.
            </DialogDescription>
            <Button className="mt-5" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Get a free demo</DialogTitle>
              <DialogDescription>
                See tripOS on your own trips. Leave your details and we&apos;ll
                set up a quick, no-obligation walkthrough.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4">
              {/* Honeypot — hidden from humans. */}
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={form.company}
                onChange={(e) => update("company", e.target.value)}
                className="hidden"
                aria-hidden
              />

              <div className="space-y-1.5">
                <Label htmlFor="demo-name">Your name</Label>
                <Input
                  id="demo-name"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  autoFocus
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="demo-email">Email</Label>
                  <Input
                    id="demo-email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="demo-phone">Phone (WhatsApp)</Label>
                  <Input
                    id="demo-phone"
                    type="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="+91 …"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="demo-agency">
                  Agency name
                  <span className="ml-1 text-[10px] text-muted-foreground">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="demo-agency"
                  value={form.agencyName}
                  onChange={(e) => update("agencyName", e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="demo-message">
                  Anything specific?
                  <span className="ml-1 text-[10px] text-muted-foreground">
                    (optional)
                  </span>
                </Label>
                <Textarea
                  id="demo-message"
                  rows={2}
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                  placeholder="e.g. mostly honeymoon & Bali packages, best time to call…"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button onClick={submit} disabled={isPending || !valid}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Request demo
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
