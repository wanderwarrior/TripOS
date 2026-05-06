"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import type { PaymentType } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { recordPaymentAction } from "@/server/actions/payments";
import { PAYMENT_TYPE_LABEL } from "@/lib/crm";

const TYPES: PaymentType[] = ["ADVANCE", "PARTIAL", "FINAL"];

export function AddPaymentDialog({
  bookingId,
  pendingAmount,
}: {
  bookingId: string;
  pendingAmount: number;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [type, setType] = useState<PaymentType>("ADVANCE");
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState("");
  const [reference, setReference] = useState("");
  const [paidAt, setPaidAt] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );

  function reset() {
    setType("ADVANCE");
    setAmount(0);
    setMethod("");
    setReference("");
    setPaidAt(new Date().toISOString().slice(0, 10));
  }

  function submit() {
    if (!amount || amount <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }
    startTransition(async () => {
      try {
        await recordPaymentAction({
          bookingId,
          type,
          amount,
          method: method || null,
          reference: reference || null,
          paidAt,
        });
        toast.success("Payment recorded");
        setOpen(false);
        reset();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Couldn't record payment");
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v && amount === 0 && pendingAmount > 0) setAmount(pendingAmount);
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-3.5 w-3.5" />
          Record payment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record a payment</DialogTitle>
          <DialogDescription>
            Captures the payment and updates the booking's paid total.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select
              value={type}
              onValueChange={(v) => setType(v as PaymentType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {PAYMENT_TYPE_LABEL[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pay-amount">Amount (₹)</Label>
            <Input
              id="pay-amount"
              type="number"
              min={0}
              value={amount || ""}
              onChange={(e) => setAmount(Number(e.target.value || 0))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pay-method">Method</Label>
            <Input
              id="pay-method"
              placeholder="UPI / Card / Bank transfer"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pay-ref">Reference</Label>
            <Input
              id="pay-ref"
              placeholder="Transaction id"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="pay-date">Date</Label>
            <Input
              id="pay-date"
              type="date"
              value={paidAt}
              onChange={(e) => setPaidAt(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={submit} disabled={isPending || amount <= 0}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Record
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
