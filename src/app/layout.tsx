import { TempoInit } from "@/components/tempo-init";
import { Toaster } from "@/components/ui/toaster";
import InstallPrompt from '@/components/install-prompt';
import PWABackHandler from '@/components/pwa-back-handler';
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Jiwo.AI - Mental Wellness Companion",
  description: "Pendamping kesehatan mental berbasis AI - Life Coach AI + Professional. Tersedia 24/7, privat, dan terjangkau.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Jiwo.AI",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Jiwo.AI",
    title: "Jiwo.AI - Mental Wellness Companion",
    description: "Pendamping kesehatan mental berbasis AI - Life Coach AI + Professional",
  },
  twitter: {
    card: "summary",
    title: "Jiwo.AI - Mental Wellness Companion",
    description: "Pendamping kesehatan mental berbasis AI - Life Coach AI + Professional",
  },
};

export const viewport: Viewport = {
  themeColor: "#756657",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <PWABackHandler />
        {children}
        <InstallPrompt />
        <Toaster />
        <TempoInit />
      </body>
    </html>
  );
}