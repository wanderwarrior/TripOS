import { getSessionUser } from "@/lib/session";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Landing } from "@/components/marketing/landing";
import { getHeroMedia } from "@/server/services/platform";

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
      <Landing
        isAuthed={!!sessionUser}
        heroVideoUrl={hero.videoUrl}
        heroPosterUrl={hero.posterUrl}
      />
    </MarketingShell>
  );
}
