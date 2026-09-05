/**
 * Root layout: loads fonts (UI + one per theme), sets site metadata, and
 * establishes the base document structure shared by all routes.
 */
import type { Metadata } from "next";
import {
  Baloo_2,
  Bebas_Neue,
  Chewy,
  Fredoka,
  Geist,
  Pacifico,
  Playfair_Display,
} from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";

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

const fontPacifico = Pacifico({
  variable: "--font-pacifico",
  weight: "400",
  subsets: ["latin"],
});

const fontBebas = Bebas_Neue({
  variable: "--font-bebas",
  weight: "400",
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
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Birthday Wish",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${fontPastel.variable} ${fontFireworks.variable} ${fontFunny.variable} ${fontElegant.variable} ${fontPacifico.variable} ${fontBebas.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ToastProvider>{children}</ToastProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
