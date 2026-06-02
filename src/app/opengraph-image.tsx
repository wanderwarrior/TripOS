import { ImageResponse } from "next/og";

// Site-wide default Open Graph / social share image. Rendered at build/request
// time by next/og — no static asset to maintain. Individual routes can export
// their own opengraph-image to override this.

export const runtime = "edge";
export const alt = "TripCraft — Run your travel agency on one platform";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
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
          <div
            style={{
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            TripCraft
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 68,
              fontWeight: 700,
              lineHeight: 1.05,
              maxWidth: 900,
              color: "#ffffff",
            }}
          >
            Run your travel agency on one beautiful platform.
          </div>
          <div style={{ fontSize: 30, color: "rgba(239,234,224,0.8)", maxWidth: 940 }}>
            AI itineraries · branded proposals · WhatsApp · GST invoicing ·
            payments · operations
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 24,
            color: "#e3c98f",
          }}
        >
          <div
            style={{
              padding: "10px 22px",
              borderRadius: 999,
              border: "1px solid rgba(200,169,106,0.5)",
            }}
          >
            Start your free trial
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
