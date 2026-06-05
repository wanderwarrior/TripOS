"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Loader2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateLeadAction } from "@/server/actions/contacts";
import { LEAD_SOURCE_LABEL } from "@/lib/crm";
import type { LeadSource } from "@prisma/client";

const SOURCES: LeadSource[] = [
  "MANUAL",
  "INSTAGRAM",
  "WHATSAPP",
  "REFERRAL",
  "WEBSITE",
  "GOOGLE",
  "OTHER",
];

export type EditableContact = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  source: LeadSource;
  destination: string | null;
  /** ISO date (yyyy-mm-dd) or null. */
  travelStartDate: string | null;
  travelEndDate: string | null;
  adults: number;
  budget: number | null;
  gstin: string | null;
  notes: string | null;
};

type FormState = {
  name: string;
  phone: string;
  email: string;
  source: LeadSource;
  destination: string;
  travelStartDate: string;
  travelEndDate: string;
  adults: number;
  budget: string;
  gstin: string;
  notes: string;
};

function toForm(c: EditableContact): FormState {
  return {
    name: c.name,
    phone: c.phone ?? "",
    email: c.email ?? "",
    source: c.source,
    destination: c.destination ?? "",
    travelStartDate: c.travelStartDate ?? "",
    travelEndDate: c.travelEndDate ?? "",
    adults: c.adults,
    budget: c.budget != null ? String(c.budget) : "",
    gstin: c.gstin ?? "",
    notes: c.notes ?? "",
  };
}

/** "Customer" toggles the dialog copy — it's the same underlying contact. */
export function EditContactDialog({
  contact,
  isCustomer = false,
  trigger,
}: {
  contact: EditableContact;
  isCustomer?: boolean;
  trigger?: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<FormState>(() => toForm(contact));

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // Re-seed from the latest server data whenever the dialog is (re)opened.
  function onOpenChange(next: boolean) {
    if (next) setForm(toForm(contact));
    setOpen(next);
  }

  function submit() {
    startTransition(async () => {
      try {
        await updateLeadAction(contact.id, {
          name: form.name.trim(),
          phone: form.phone.trim() || null,
          email: form.email.trim() || null,
          source: form.source,
          destination: form.destination.trim() || null,
          travelStartDate: form.travelStartDate || null,
          travelEndDate: form.travelEndDate || null,
          adults: form.adults,
          budget: form.budget === "" ? null : Number(form.budget),
          gstin: form.gstin.trim() || null,
          notes: form.notes.trim() || null,
        });
        toast.success("Details updated");
        setOpen(false);
        router.refresh();
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Couldn't save changes";
        toast.error(msg);
      }
    });
  }

  const noun = isCustomer ? "customer" : "contact";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline">
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit {noun}</DialogTitle>
          <DialogDescription>
            Update contact and inquiry details. Changes apply everywhere this{" "}
            {noun} appears.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-phone">Phone (WhatsApp)</Label>
            <Input
              id="edit-phone"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+91 …"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Source</Label>
            <Select
              value={form.source}
              onValueChange={(v) => update("source", v as LeadSource)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SOURCES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {LEAD_SOURCE_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-dest">Destination interest</Label>
            <Input
              id="edit-dest"
              value={form.destination}
              onChange={(e) => update("destination", e.target.value)}
              placeholder="e.g. Bali, Andamans"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-start">Travel from</Label>
            <Input
              id="edit-start"
              type="date"
              value={form.travelStartDate}
              onChange={(e) => update("travelStartDate", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-end">Travel to</Label>
            <Input
              id="edit-end"
              type="date"
              value={form.travelEndDate}
              onChange={(e) => update("travelEndDate", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-adults">Adults</Label>
            <Input
              id="edit-adults"
              type="number"
              min={1}
              max={40}
              value={form.adults}
              onChange={(e) => update("adults", Number(e.target.value || 1))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-budget">Budget (₹)</Label>
            <Input
              id="edit-budget"
              type="number"
              min={0}
              value={form.budget}
              onChange={(e) => update("budget", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-gstin">
              GSTIN
              <span className="ml-1 text-[10px] text-muted-foreground">
                (for B2B invoices)
              </span>
            </Label>
            <Input
              id="edit-gstin"
              value={form.gstin}
              onChange={(e) => update("gstin", e.target.value.toUpperCase())}
              maxLength={15}
              placeholder="27AAACT1234A1ZS"
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="edit-notes">Notes</Label>
            <Textarea
              id="edit-notes"
              rows={3}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4">
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={isPending || form.name.trim().length === 0}
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
