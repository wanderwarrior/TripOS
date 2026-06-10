import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Playfair_Display } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { AnalyticsProvider } from "@/components/analytics-provider";
import { CookieConsent } from "@/components/cookie-consent";
import { JsonLd } from "@/components/seo/json-ld";
import {
  organizationSchema,
  websiteSchema,
  softwareApplicationSchema,
} from "@/lib/structured-data";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

// NEW — figures, IDs, codes, deltas. A key part of the "pro tool" character;
// used (with tabular-nums) for every currency value, count, %, code, timestamp.
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const APP_URL = (
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.APP_URL ||
  "http://localhost:3000"
).replace(/\/$/, "");

const TITLE = "tripOS — Run your travel agency on one platform";
const DESCRIPTION =
  "The all-in-one platform for travel agencies — AI itineraries, branded proposals, WhatsApp, GST invoicing, payments and operations. Start a free trial.";

// Search-engine site verification — paste the codes into env (no redeploy of
// code needed). Google Search Console feeds Google/Gemini; Bing Webmaster feeds
// Bing, which is the index behind ChatGPT search and Copilot.
const GOOGLE_SITE_VERIFICATION = process.env.GOOGLE_SITE_VERIFICATION;
const BING_SITE_VERIFICATION = process.env.BING_SITE_VERIFICATION;
const verification =
  GOOGLE_SITE_VERIFICATION || BING_SITE_VERIFICATION
    ? {
        ...(GOOGLE_SITE_VERIFICATION
          ? { google: GOOGLE_SITE_VERIFICATION }
          : {}),
        ...(BING_SITE_VERIFICATION
          ? { other: { "msvalidate.01": BING_SITE_VERIFICATION } }
          : {}),
      }
    : undefined;

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: TITLE,
    template: "%s · tripOS",
  },
  description: DESCRIPTION,
  // Self-referencing canonical for the home page; per-page metadata overrides.
  // RSS autodiscovery points at the blog feed.
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": `${APP_URL}/blog/feed.xml` },
  },
  verification,
  applicationName: "tripOS",
  keywords: [
    "travel agency software",
    "travel CRM",
    "AI itinerary builder",
    "travel proposal software",
    "GST invoice travel agency",
    "WhatsApp travel agency",
    "tour operator software India",
  ],
  authors: [{ name: "tripOS" }],
  openGraph: {
    type: "website",
    siteName: "tripOS",
    title: TITLE,
    description: DESCRIPTION,
    url: APP_URL,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#0c1620",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-sans">
        <JsonLd
          data={[
            organizationSchema(),
            websiteSchema(),
            softwareApplicationSchema(),
          ]}
        />
        {children}
        <Toaster />
        <CookieConsent />
        <AnalyticsProvider />
      </body>
    </html>
  );
}
