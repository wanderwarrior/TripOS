"use client";

import { useState } from "react";
import { Check, Link2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PreviewActions({ tripId }: { tripId: string }) {
  const [copied, setCopied] = useState(false);

  function copyLink() {
    const url = `${window.location.origin}/trips/${tripId}/preview`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={copyLink}>
        {copied ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Link2 className="h-3.5 w-3.5" />
        )}
        {copied ? "Link copied" : "Share link"}
      </Button>
      <Button size="sm" onClick={() => window.print()}>
        <Printer className="h-3.5 w-3.5" />
        Export PDF
      </Button>
    </div>
  );
}
