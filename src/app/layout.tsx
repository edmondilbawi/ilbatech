import type { Metadata } from "next";
import { Manrope, Newsreader } from "next/font/google";
import { getSiteUrl, SITE } from "@/config/site";
import "./globals.css";
import "./polish.css";
import "./v4.css";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });
const newsreader = Newsreader({ variable: "--font-newsreader", subsets: ["latin"], style: ["normal", "italic"] });
const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: {
    default: `${SITE.shortName} | Digital Solutions for Business`,
    template: `%s | ${SITE.shortName}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.shortName} | Digital Solutions for Business`,
    description: SITE.description,
    ...(siteUrl ? { url: siteUrl } : {}),
  },
  twitter: {
    card: "summary",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${newsreader.variable}`}>
      <body>{children}</body>
    </html>
  );
}
