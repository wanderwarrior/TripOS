"use client";

// Route-segment error boundary. Catches render/runtime errors in the app and
// shows a recoverable screen instead of a blank page. `reset()` re-renders the
// segment. When Sentry is wired (Batch 3), report here.

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { reportError } from "@/lib/report-error";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, { digest: error.digest });
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 text-center">
      <p className="font-mono text-sm uppercase tracking-[0.3em] text-gold-deep">
        Something went wrong
      </p>
      <h1 className="mt-3 font-display text-3xl text-ink md:text-4xl">
        We hit an unexpected snag
      </h1>
      <p className="mt-4 max-w-md text-ink/70">
        The error has been logged. You can try again, and if it keeps happening,
        reach out to support.
      </p>
      {error.digest ? (
        <p className="mt-2 font-mono text-xs text-muted">
          Reference: {error.digest}
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-[8px] bg-inkwash px-6 py-3 text-sm font-medium text-[var(--on-dark)] transition-colors hover:bg-inkwash/90"
        >
          <RotateCcw className="h-4 w-4" />
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-[8px] border border-line bg-paper px-6 py-3 text-sm font-medium text-ink transition-colors hover:border-line-2"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
