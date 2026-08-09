export function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://hhgoa-frame.vercel.app"
  const content = `# Hacker House Goa 2026 — Frame / ID Card Generator

> HH GOA is a 4-day experimental hackathon in Goa, India (28–31 Oct 2026). This app is the official Frame / ID Card generator for the event — upload a photo, get an on-brand HH Goa 2026 graphic, and share it with #FrameInGoa. Available at ${appUrl}

## About

Hacker House Goa is an experimental build-station for 500 elite builders: less noise, more signal. This generator is part of the shortlisting task — instantly recognizable HH Goa identity, 1-click download, 1-click share to X, works on any photo with no manual cropping.

Key facts:
- Free, no login, no signup gate — works in one pass
- Two formats: PFP Frame / Overlay (Format A) and Builder ID Card (Format B)
- Handles portrait, landscape, off-center crops, and different aspect ratios
- HEIC (iPhone) photos supported
- Built with Next.js, canvas rendering in the browser
- Powered by the HH Goa design system (forest green, electric yellow, hot pink)

## How to use

1. Go to ${appUrl}
2. Pick a format: PFP Frame or Builder ID Card
3. Upload a photo (jpg, png, HEIC from iPhone)
4. (ID Card only) Add your name, stack/role — get a generated builder title
5. Download the image, or hit Share to X with the caption already written
6. Tag #FrameInGoa

## Technology

- **Framework**: Next.js (App Router)
- **Rendering**: Client-side HTML Canvas (instant, no loading screen)
- **Share**: Pre-filled X/Twitter share intent with the generated graphic
- **Design**: HH Goa brand tokens (Imbue + Victor Mono, #0b6839 / #fee101 / #ff0080)

## Links

- [HH Goa](https://hhgoa.com): The official event site
- [Apply on Devfolio](https://hacker-house-goa-2026.devfolio.co/): Applications
- [The Generator](${appUrl}): Make your frame
`

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  })
}
