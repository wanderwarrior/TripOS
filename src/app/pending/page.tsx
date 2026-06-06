import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Logo } from "@/components/brand/mark";
import { PendingApproval } from "@/components/auth/pending-approval";
import { getHeroMedia } from "@/server/services/platform";

export const dynamic = "force-dynamic";

export const metadata = { title: "Trial under review · tripOS" };

// Holding page for agencies awaiting manual trial approval. Uses
// getSessionUser (not requireUser) so it never loops through the approval gate.
export default async function PendingPage() {
  const u = await getSessionUser();
  if (!u) redirect("/login");

  const [agency, hero] = await Promise.all([
    prisma.agency.findUnique({
      where: { id: u.activeAgencyId },
      select: { status: true, requestPhone: true },
    }),
    getHeroMedia(),
  ]);
  // Already approved (or no agency) → straight into the app.
  if (!agency || agency.status === "APPROVED") redirect("/dashboard");

  const supportWhatsapp = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || null;

  return (
    <main className="min-h-screen bg-canvas flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center justify-center w-full mb-10 text-ink"
          aria-label="tripOS home"
        >
          <Logo size={34} wordClassName="text-2xl" />
        </Link>

        <div className="rounded-lg border border-line bg-paper p-8 shadow-soft">
          <PendingApproval
            status={agency.status === "REJECTED" ? "REJECTED" : "PENDING"}
            hasPhone={!!agency.requestPhone?.trim()}
            demoVideoUrl={hero.videoUrl}
            demoPosterUrl={hero.posterUrl}
            supportWhatsapp={supportWhatsapp}
          />
        </div>

        <p className="mt-6 text-center text-[10px] uppercase tracking-[0.2em] text-muted">
          Crafted for premium travel
        </p>
      </div>
    </main>
  );
}
