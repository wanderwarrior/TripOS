import { MarketingShell } from "@/components/marketing/marketing-shell";
import { SeoLanding } from "@/components/marketing/seo-landing";
import { seoLandingMetadata } from "@/lib/seo-landings";

export const dynamic = "force-dynamic";
export const metadata = seoLandingMetadata("travel-proposal-software");

export default function Page() {
  return (
    <MarketingShell>
      <SeoLanding slug="travel-proposal-software" />
    </MarketingShell>
  );
}
