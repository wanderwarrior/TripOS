import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "tripOS — Travel agency platform",
    short_name: "tripOS",
    description:
      "AI itineraries, branded proposals, WhatsApp, GST invoicing, payments and operations — for travel agencies.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f2ec",
    theme_color: "#0c1620",
    icons: [{ src: "/icon", sizes: "64x64", type: "image/png" }],
  };
}
