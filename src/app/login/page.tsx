import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/brand/mark";
import { LoginForm } from "@/components/auth/login-form";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { getSessionUser } from "@/lib/session";
import { isGoogleConfigured } from "@/lib/google/oauth";

export const dynamic = "force-dynamic";

export const metadata = { title: "Sign in · tripOS" };

export default async function LoginPage() {
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
            <p className="tc-eyebrow gold">Welcome back</p>
            <h1 className="mt-2 font-display text-3xl text-ink">Sign in</h1>
          </div>
          {googleEnabled ? (
            <div className="mb-5">
              <GoogleAuthButton label="Sign in with Google" />
              <div className="my-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-line" />
                <span className="text-[11px] uppercase tracking-[0.2em] text-muted">
                  or
                </span>
                <span className="h-px flex-1 bg-line" />
              </div>
            </div>
          ) : null}
          <LoginForm />
          <p className="mt-6 text-center text-xs text-muted">
            New to tripOS?{" "}
            <Link href="/signup" className="text-ink underline">
              Create an agency account
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
