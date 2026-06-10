import { ImageResponse } from "next/og";

// Shared Open Graph / social-share image renderer (1200x630), used by the
// per-route opengraph-image files so landing pages, comparisons, city pages and
// blog posts each get a branded card with their own title — what shows when a
// page is shared or cited. Matches the site-wide default in
// app/opengraph-image.tsx. Satori (next/og) needs explicit styles + flex.

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

export function renderOg({
  title,
  subtitle,
  badge = "thetripos.com",
}: {
  title: string;
  subtitle?: string;
  badge?: string;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background:
            "radial-gradient(60% 60% at 80% 0%, rgba(200,169,106,0.28), transparent 60%), linear-gradient(135deg, #0b1622 0%, #0c1620 100%)",
          color: "#efeae0",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#e3c98f",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#1a1205",
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            T
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: 1 }}>
            tripOS
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {subtitle ? (
            <div
              style={{
                fontSize: 24,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: "#e3c98f",
              }}
            >
              {subtitle}
            </div>
          ) : null}
          <div
            style={{
              fontSize: 60,
              fontWeight: 700,
              lineHeight: 1.08,
              maxWidth: 1010,
              color: "#ffffff",
            }}
          >
            {title}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 24,
            color: "rgba(239,234,224,0.8)",
          }}
        >
          <div>{badge}</div>
          <div
            style={{
              padding: "10px 22px",
              borderRadius: 999,
              border: "1px solid rgba(200,169,106,0.5)",
              color: "#e3c98f",
            }}
          >
            The OS for Indian travel agencies
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE }
  );
}
