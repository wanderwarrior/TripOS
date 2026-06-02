"use client";

import { useState } from "react";
import { Check, Download, Link2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { generateShareTokenAction } from "@/server/actions/quotes";
import { SendProposalDialog } from "@/components/quotes/send-proposal-dialog";

export function PreviewActions({
  tripId,
  quoteId,
  recipientPhone,
  recipientName,
  recipientEmail,
  destination,
  agencyName,
  total,
  perPerson,
  version,
  dateRange,
  validityDays,
  preparedAt,
  shareToken,
}: {
  tripId: string;
  quoteId?: string | null;
  recipientPhone?: string | null;
  recipientName?: string | null;
  recipientEmail?: string | null;
  destination?: string | null;
  agencyName?: string;
  total?: number | null;
  perPerson?: number | null;
  version?: number | null;
  dateRange?: string | null;
  validityDays?: number;
  preparedAt?: string | null;
  shareToken?: string | null;
}) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  // Cache the resolved public token so repeat clicks don't re-hit the server.
  const [resolvedToken, setResolvedToken] = useState<string | null>(
    shareToken ?? null
  );

  async function copyLink() {
    if (busy) return;
    // The /trips/{id}/preview route is auth-gated — copying it sends the
    // recipient to a sign-in page. Share the public /share/{token} URL.
    let token = resolvedToken;
    if (!token) {
      if (!quoteId) {
        toast.error("Save a quote first to create a shareable link.");
        return;
      }
      try {
        setBusy(true);
        const r = await generateShareTokenAction(quoteId);
        token = r.token;
        setResolvedToken(token);
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : "Couldn't create a share link"
        );
        return;
      } finally {
        setBusy(false);
      }
    }
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/share/${token}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={copyLink} disabled={busy}>
        {copied ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Link2 className="h-3.5 w-3.5" />
        )}
        {copied ? "Link copied" : busy ? "Creating…" : "Share link"}
      </Button>
      {quoteId ? (
        <a
          href={`/api/proposals/${quoteId}/pdf`}
          target="_blank"
          rel="noopener"
        >
          <Button variant="outline" size="sm">
            <Download className="h-3.5 w-3.5" />
            PDF
          </Button>
        </a>
      ) : null}
      {quoteId ? (
        <SendProposalDialog
          tripId={tripId}
          quoteId={quoteId}
          recipientName={recipientName}
          recipientPhone={recipientPhone}
          recipientEmail={recipientEmail}
          destination={destination}
          agencyName={agencyName}
          total={total}
          perPerson={perPerson}
          version={version}
          dateRange={dateRange}
          validityDays={validityDays}
          preparedAt={preparedAt}
          shareToken={shareToken}
          trigger={
            <Button variant="accent" size="sm">
              <Send className="h-3.5 w-3.5" />
              Send proposal
            </Button>
          }
        />
      ) : null}
    </div>
  );
}
