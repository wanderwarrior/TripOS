"use client";

import { useState } from "react";
import { Check, Download, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareOnWhatsappButton } from "@/components/whatsapp/share-on-whatsapp-button";

export function PreviewActions({
  tripId,
  quoteId,
  recipientPhone,
  recipientName,
  destination,
}: {
  tripId: string;
  quoteId?: string | null;
  recipientPhone?: string | null;
  recipientName?: string | null;
  destination?: string | null;
}) {
  const [copied, setCopied] = useState(false);

  function copyLink() {
    const url = `${window.location.origin}/trips/${tripId}/preview`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const firstName = recipientName?.trim().split(/\s+/)[0] ?? "";

  return (
    <div className="flex items-center gap-2">
      {quoteId ? (
        <ShareOnWhatsappButton
          kind="proposal"
          tripId={tripId}
          quoteId={quoteId}
          recipientPhone={recipientPhone ?? null}
          fallbackMessage={
            firstName
              ? `Hi ${firstName} ✨ your ${destination ?? "trip"} proposal is ready.`
              : undefined
          }
          label="Share on WhatsApp"
        />
      ) : null}
      <Button variant="outline" size="sm" onClick={copyLink}>
        {copied ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Link2 className="h-3.5 w-3.5" />
        )}
        {copied ? "Link copied" : "Share link"}
      </Button>
      {quoteId ? (
        <a
          href={`/api/proposals/${quoteId}/pdf`}
          target="_blank"
          rel="noopener"
        >
          <Button size="sm">
            <Download className="h-3.5 w-3.5" />
            Download PDF
          </Button>
        </a>
      ) : null}
    </div>
  );
}
