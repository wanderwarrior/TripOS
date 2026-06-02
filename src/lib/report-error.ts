// Central error-reporting hook. Today it logs; it also forwards to a Sentry
// browser SDK if one is present on `window`. Wiring @sentry/nextjs is the
// recommended production step — when you do, call sites here don't change.

type Context = Record<string, unknown>;

export function reportError(error: unknown, context?: Context): void {
  // eslint-disable-next-line no-console
  console.error("[error]", error, context ?? "");

  if (typeof window !== "undefined") {
    const sentry = (window as unknown as { Sentry?: { captureException?: (e: unknown, o?: unknown) => void } }).Sentry;
    if (sentry?.captureException) {
      try {
        sentry.captureException(error, context ? { extra: context } : undefined);
      } catch {
        /* never let reporting throw */
      }
    }
  }
}
