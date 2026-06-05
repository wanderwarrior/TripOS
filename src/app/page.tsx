import { getSessionUser } from "@/lib/session";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Landing } from "@/components/marketing/landing";
import { getHeroMedia } from "@/server/services/platform";
import { JsonLd } from "@/components/seo/json-ld";
import { faqSchema } from "@/lib/structured-data";
import { MARKETING_FAQS } from "@/lib/faq-content";

export const dynamic = "force-dynamic";

// Public marketing home. Signed-in users can still browse it (no forced
// redirect) — the landing surfaces "Go to dashboard" CTAs instead of signup
// ones when there's a session. The app itself lives at /dashboard.
export default async function HomePage() {
  const [sessionUser, hero] = await Promise.all([
    getSessionUser(),
    getHeroMedia(),
  ]);

  return (
    <MarketingShell>
      <JsonLd data={faqSchema(MARKETING_FAQS)} />
      <Landing
        isAuthed={!!sessionUser}
        heroVideoUrl={hero.videoUrl}
        heroPosterUrl={hero.posterUrl}
      />
    </MarketingShell>
  );
}
