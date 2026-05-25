"use client";

import { useState } from "react";
import { Check, Link2, Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareOnWhatsappButton } from "@/components/whatsapp/share-on-whatsapp-button";

// Block the print dialog until every image on the page has actually loaded
// — window.print() doesn't wait, so a click right after page load would
// otherwise produce a PDF with blank image boxes.
async function waitForImages(): Promise<void> {
  const imgs = Array.from(document.images);
  await Promise.all(
    imgs.map((img) =>
      img.complete && img.naturalWidth > 0
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            const done = () => resolve();
            img.addEventListener("load", done, { once: true });
            img.addEventListener("error", done, { once: true });
          })
    )
  );
}

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
  const [printing, setPrinting] = useState(false);

  async function exportPdf() {
    setPrinting(true);
    try {
      await waitForImages();
      window.print();
    } finally {
      setPrinting(false);
    }
  }

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
      <Button size="sm" onClick={exportPdf} disabled={printing}>
        {printing ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Printer className="h-3.5 w-3.5" />
        )}
        Export PDF
      </Button>
    </div>
  );
}
