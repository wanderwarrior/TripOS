import Link from "next/link";
import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Logo } from "@/components/brand/mark";
import { SignupForm } from "@/components/auth/signup-form";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { getSessionUser } from "@/lib/session";
import { isGoogleConfigured } from "@/lib/google/oauth";

export const dynamic = "force-dynamic";

export const metadata = { title: "Create account · tripOS" };

export default async function SignupPage() {
  const u = await getSessionUser();
  if (u) redirect("/dashboard");

  const googleEnabled = isGoogleConfigured();

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
            <p className="tc-eyebrow gold inline-flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" />
              Start free
            </p>
            <h1 className="mt-2 font-display text-3xl text-ink">
              Spin up your agency
            </h1>
            <p className="text-sm text-muted mt-1">
              You'll be the Owner — invite teammates after.
            </p>
          </div>
          {googleEnabled ? (
            <div className="mb-5">
              <GoogleAuthButton label="Sign up with Google" />
              <p className="mt-2 text-center text-[11px] text-muted">
                We&apos;ll set up your agency automatically — rename it anytime
                in settings.
              </p>
              <div className="my-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-line" />
                <span className="text-[11px] uppercase tracking-[0.2em] text-muted">
                  or
                </span>
                <span className="h-px flex-1 bg-line" />
              </div>
            </div>
          ) : null}
          <SignupForm />
          <p className="mt-6 text-center text-xs text-muted">
            Already onboard?{" "}
            <Link href="/login" className="text-ink underline">
              Sign in
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-[10px] uppercase tracking-[0.2em] text-muted">
          Crafted for premium travel
        </p>
      </div>
    </main>
  );
}
