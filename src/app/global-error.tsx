"use client";

// Root error boundary — the last line of defence. Catches errors thrown in the
// root layout itself, where the normal error.tsx can't help, so it must render
// its own <html>/<body>. Kept dependency-free and inline-styled because the
// app shell (and its CSS) may have failed to load at this point.

import { useEffect } from "react";
import { reportError } from "@/lib/report-error";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, { digest: error.digest, scope: "global" });
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          background: "#f4f2ec",
          color: "#16191d",
          fontFamily: "system-ui, sans-serif",
          padding: 24,
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: 28, margin: 0 }}>Something went wrong</h1>
        <p style={{ color: "#6b7077", maxWidth: 420, margin: 0 }}>
          A critical error occurred. Please try reloading the page.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: 8,
            padding: "12px 24px",
            borderRadius: 8,
            border: "none",
            background: "#0c1620",
            color: "#efeae0",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Reload
        </button>
      </body>
    </html>
  );
}
