import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HH GOA | Hacker House Goa 2026",
    short_name: "HH Goa",
    description: "Design your HH Goa 2026 frame / ID card and share it with #FrameInGoa",
    start_url: "/",
    display: "standalone",
    background_color: "#0b6839",
    theme_color: "#0b6839",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  }
}
