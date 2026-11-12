import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "@/providers";
import { OfflineIndicator } from "@/components/shared/offline-indicator";
import { UpdatePrompt } from "@/components/shared/update-prompt";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CycleCare",
    template: "%s | CycleCare",
  },
  description:
    "Your personal menstrual health companion. Track cycles, understand your body, and get personalized wellness guidance.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CycleCare",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9fd" },
    { media: "(prefers-color-scheme: dark)", color: "#13111c" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakarta.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
      </head>
      <body className="min-h-full bg-background text-foreground font-sans">
        <Providers>
          <OfflineIndicator />
          {children}
          <UpdatePrompt />
        </Providers>
      </body>
    </html>
  );
}
