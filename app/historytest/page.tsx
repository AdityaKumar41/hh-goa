"use client"

import { HhGoaStudio } from "@/components/hhgoa/hhgoa-studio"

// Test harness: seeds localStorage history so rows render without manual generation.
export default function HistoryTestPage() {
  if (typeof window !== "undefined") {
    try {
      const existing = localStorage.getItem("hhgoa-card-history")
      if (!existing || JSON.parse(existing).length === 0) {
        localStorage.setItem(
          "hhgoa-card-history",
          JSON.stringify([
            {
              id: "seed-1",
              dataUrl:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
              format: "idcard",
              name: "aditya.eth",
              stack: "full-stack · AI",
              accent: "yellow",
              createdAt: Date.now() - 86400000,
            },
            {
              id: "seed-2",
              dataUrl:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
              format: "pfp",
              name: "@sara",
              stack: "design",
              accent: "pink",
              createdAt: Date.now() - 3600000,
            },
          ]),
        )
      }
    } catch {
      // ignore
    }
  }

  return (
    <main style={{ background: "#0b6839", padding: 24, color: "#fff", fontFamily: "monospace" }}>
      <HhGoaStudio />
    </main>
  )
}
