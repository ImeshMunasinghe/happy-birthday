/**
 * Root layout: loads fonts (UI + one per theme), sets site metadata, and
 * establishes the base document structure shared by all routes.
 */
import type { Metadata } from "next";
import {
  Baloo_2,
  Chewy,
  Fredoka,
  Geist,
  Playfair_Display,
} from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// One variable font per theme; consumed by .font-theme-* rules in globals.css.
// next/font self-hosts the files, avoiding external requests and layout shift.
const fontPastel = Baloo_2({
  variable: "--font-pastel",
  subsets: ["latin"],
});

const fontFireworks = Fredoka({
  variable: "--font-fireworks",
  subsets: ["latin"],
});

const fontFunny = Chewy({
  variable: "--font-funny",
  weight: "400",
  subsets: ["latin"],
});

const fontElegant = Playfair_Display({
  variable: "--font-elegant",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Birthday Wish",
    template: "%s · Birthday Wish",
  },
  description:
    "Create a beautiful, shareable birthday wish and send it with one link.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${fontPastel.variable} ${fontFireworks.variable} ${fontFunny.variable} ${fontElegant.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}