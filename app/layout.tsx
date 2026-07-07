import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — 1-to-1 Tutoring`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  keywords: [
    "tutoring",
    "phonics",
    "maths tutor",
    "GCSE science",
    "A-level maths",
    "reading",
    "1-to-1 tuition",
  ],
  openGraph: {
    title: `${site.name} — 1-to-1 Tutoring`,
    description: site.description,
    url: site.url,
    siteName: site.name,
    images: [{ url: "/social-banner.png", width: 1200, height: 630 }],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — 1-to-1 Tutoring`,
    description: site.description,
    images: ["/social-banner.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/favicon-180.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
