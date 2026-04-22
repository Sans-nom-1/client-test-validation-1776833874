import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PWARegister } from "@/components/PWARegister";

export const metadata: Metadata = {
  title: "Test Health Check",
  description: "Test - sera supprimé",
  keywords: ["barber", "Paris", "reservation", "rendez-vous", "Test Health Check", "en ligne"],
  authors: [{ name: "Test Health Check" }],
  creator: "Test Health Check",
  publisher: "Test Health Check",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: '/',
    title: "Test Health Check",
    description: "Test - sera supprimé",
    siteName: "Test Health Check",
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Test Health Check',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Test Health Check",
    description: "Test - sera supprimé",
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-180.png', sizes: '180x180', type: 'image/png' },
      { url: '/icons/icon-167.png', sizes: '167x167', type: 'image/png' },
      { url: '/icons/icon-152.png', sizes: '152x152', type: 'image/png' },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Test Health Check',
    startupImage: [
      {
        url: '/icons/icon-512.png',
        media: '(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)',
      },
    ],
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: '#111111',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark" style={{ colorScheme: 'dark' }}>
      <head>
        {/* PWA Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Test Health Check" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Test Health Check" />
        <meta name="msapplication-TileColor" content="#111111" />
        <meta name="msapplication-TileImage" content="/icons/icon-144.png" />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/icons/icon-180.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-167.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152.png" />

        {/* Splash screens for iOS */}
        <link rel="apple-touch-startup-image" href="/icons/icon-512.png" />
      </head>
      <body className="min-h-screen bg-background-primary text-label-primary antialiased">
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
