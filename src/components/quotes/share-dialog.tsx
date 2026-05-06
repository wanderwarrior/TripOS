"use client";

import { useState, useTransition } from "react";
import { Check, Copy, Link2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateShareTokenAction } from "@/server/actions/quotes";

export function ShareDialog({
  quoteId,
  existingToken,
  trigger,
}: {
  quoteId: string;
  existingToken: string | null;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState(existingToken);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  function ensureToken() {
    if (token) return;
    startTransition(async () => {
      try {
        const r = await generateShareTokenAction(quoteId);
        setToken(r.token);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Couldn't generate link";
        toast.error(msg);
      }
    });
  }

  function copy() {
    if (!token) return;
    const url = `${window.location.origin}/share/${token}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) ensureToken();
      }}
    >
      <span onClick={(e) => e.stopPropagation()}>{trigger}</span>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share this quote</DialogTitle>
          <DialogDescription>
            Anyone with this link can view the proposal. Re-generate if you
            need to invalidate it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {token ? (
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={
                  typeof window !== "undefined"
                    ? `${window.location.origin}/share/${token}`
                    : `/share/${token}`
                }
                className="font-mono text-xs"
                onFocus={(e) => e.currentTarget.select()}
              />
              <Button onClick={copy} size="sm" variant="outline">
                {copied ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Generating link…
                </>
              ) : (
                <>
                  <Link2 className="h-3.5 w-3.5" />
                  No link yet.
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ShareDialogTrigger({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <span className={className}>{children}</span>;
}
