import Link from "next/link";
import { redirect } from "next/navigation";
import { Compass } from "lucide-react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata = { title: "Set new password · TripCraft" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const u = await getSessionUser();
  if (u) redirect("/");

  const token = searchParams.token ?? "";

  return (
    <main className="min-h-screen bg-ivory flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-10 justify-center w-full"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-ivory">
            <Compass className="h-4 w-4" />
          </span>
          <span className="font-display text-2xl tracking-tight text-navy">
            TripCraft
          </span>
        </Link>

        <div className="rounded-3xl border border-line bg-white p-8 shadow-soft">
          <div className="text-center mb-6">
            <p className="text-[10px] uppercase tracking-[0.24em] text-sand-700">
              Almost there
            </p>
            <h1 className="mt-2 font-display text-3xl text-navy">
              Set a new password
            </h1>
          </div>
          <ResetPasswordForm token={token} />
        </div>
      </div>
    </main>
  );
}
