import type React from "react"
import type { Metadata, Viewport } from "next"
import { Imbue, Victor_Mono } from "next/font/google"
import { Suspense } from "react"
import { Analytics } from "@vercel/analytics/react"
import { ErrorBoundary } from "@/components/error-boundary"
import "./globals.css"

const imbue = Imbue({
  subsets: ["latin"],
  variable: "--font-imbue",
  display: "swap",
})

const victorMono = Victor_Mono({
  subsets: ["latin"],
  variable: "--font-victor-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "HH GOA | Hacker House Goa 2026",
  description:
    "4 days. one rhythm. everything intentional. Join us for an experimental hackathon experience in Goa, India.",
  keywords: [
    "Hacker House Goa",
    "HH Goa",
    "HH GOA 2026",
    "FrameInGoa",
    "hackathon",
    "Goa hackathon",
    "hacker house india",
    "build in goa",
    "ID card generator",
    "photo frame generator",
  ],
  authors: [{ name: "2:47 pm Studio" }],
  creator: "2:47 pm Studio",
  publisher: "HH Goa",
  generator: "HH Goa",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://hhgoa-frame.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://hhgoa-frame.vercel.app",
    title: "HH GOA | Hacker House Goa 2026",
    description:
      "Design your own HH Goa 2026 themed photo frame. Upload a photo, get your builder ID card, and share it with #FrameInGoa.",
    siteName: "HH Goa",
    images: [
      {
        url: "/og?t=Builder&s=Terminal%20Citizen&f=idcard",
        width: 1200,
        height: 630,
        alt: "Hacker House Goa 2026 - Frame Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HH GOA | Hacker House Goa 2026",
    description:
      "Design your own HH Goa 2026 themed photo frame. Upload a photo, get your builder ID card, and share it with #FrameInGoa.",
    creator: "@247pmstudio",
    images: ["/og?t=Builder&s=Terminal%20Citizen&f=idcard"],
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
  icons: {
    icon: "/favicon.webp",
  },
}

export const viewport: Viewport = {
  themeColor: "#0b6839",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${imbue.variable} ${victorMono.variable} h-full w-full antialiased`}
      suppressHydrationWarning
      style={{ backgroundColor: "#0b6839" }}
    >
      <head>
        <link rel="dns-prefetch" href="https://api.vercel.com" />
      </head>
      <body className="min-h-full w-full font-mono antialiased" style={{ backgroundColor: "#0b6839" }}>
        <ErrorBoundary>
          <Suspense fallback={null}>{children}</Suspense>
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  )
}
