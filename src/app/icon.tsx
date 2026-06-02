import { ImageResponse } from "next/og";

// Generated favicon — Next auto-serves this at /icon and injects the <link>.
// The tripOS C·Stack mark: three offset rounded "records" on the brand
// inkwash, top one live in gold. Rendered with positioned blocks (Satori-
// friendly) so we don't ship a binary .ico. Geometry mirrors the canonical
// mark (100-unit viewBox) scaled 0.5 and centred in a 64px tile.

export const runtime = "edge";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

const INKWASH = "#0c1620";
const GOLD = "#c8a96a";
const FG = "#efeae0";

// rec = [x, y, w, h] in the 100-unit viewBox → ×0.5 +7 offset to centre.
const rec = (x: number, y: number, w: number, h: number, fill: string) => ({
  position: "absolute" as const,
  left: x * 0.5 + 7,
  top: y * 0.5 + 7,
  width: w * 0.5,
  height: h * 0.5,
  borderRadius: 4,
  background: fill,
});

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          display: "flex",
          background: INKWASH,
          borderRadius: 14,
        }}
      >
        <div style={rec(22, 22, 44, 15, GOLD)} />
        <div style={rec(30, 43, 52, 15, FG)} />
        <div style={rec(18, 64, 48, 15, FG)} />
      </div>
    ),
    { ...size }
  );
}
