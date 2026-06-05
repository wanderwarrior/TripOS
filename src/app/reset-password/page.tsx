import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/brand/mark";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata = { title: "Set new password · tripOS" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const u = await getSessionUser();
  if (u) redirect("/dashboard");

  const token = searchParams.token ?? "";

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
          <div className="text-center mb-6">
            <p className="tc-eyebrow gold">Almost there</p>
            <h1 className="mt-2 font-display text-3xl text-ink">
              Set a new password
            </h1>
          </div>
          <ResetPasswordForm token={token} />
        </div>
      </div>
    </main>
  );
}
