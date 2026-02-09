import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flip 7 Scoreboard - Digital Score Tracker for Flip 7 Board Game",
  description: "Free mobile-optimized digital scoreboard for the Flip 7 board game. Track scores, manage rounds, and declare winners with our easy-to-use score tracker. Perfect for game nights!",
  keywords: ["Flip 7", "board game", "scoreboard", "score tracker", "game night", "Flip 7 scoreboard", "digital scoreboard", "party game"],
  authors: [{ name: "Kevin" }],
  creator: "Kevin",
  publisher: "Kevin",
  metadataBase: new URL("https://flip7.kevincxy.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Flip 7 Scoreboard - Digital Score Tracker",
    description: "Free mobile-optimized digital scoreboard for the Flip 7 board game. Track scores, manage rounds, and declare winners with ease.",
    url: "https://flip7.kevincxy.com",
    siteName: "Flip 7 Scoreboard",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Flip 7 Scoreboard App",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Flip 7 Scoreboard - Digital Score Tracker",
    description: "Free mobile-optimized digital scoreboard for the Flip 7 board game. Perfect for game nights!",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-code",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Flip 7 Scoreboard",
    "description": "Free mobile-optimized digital scoreboard for the Flip 7 board game. Track scores, manage rounds, and declare winners with ease.",
    "url": "https://flip7.kevincxy.com",
    "applicationCategory": "GameApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Track scores across multiple rounds",
      "Support for multiple players",
      "Automatic score calculation",
      "Mobile-optimized design",
      "Automatic save/restore of game state"
    ]
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
