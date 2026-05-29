"use client";

import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Placeholder upgrade CTA. Online subscription checkout (Razorpay
// Subscriptions) is the next sub-feature; until it's wired, this captures
// intent and points the owner at billing support so no one is blocked.
export function UpgradeButton({
  planName,
  variant = "default",
}: {
  planName: string;
  variant?: "default" | "outline";
}) {
  function onClick() {
    toast.info(
      `Online checkout for ${planName} is launching shortly. Email billing@tripcraft.app and we'll switch you over today.`,
      { duration: 6000 }
    );
  }
  return (
    <Button onClick={onClick} variant={variant} className="w-full">
      Choose {planName}
      <ArrowRight className="h-4 w-4" />
    </Button>
  );
}
