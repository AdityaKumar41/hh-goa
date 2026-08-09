import { ImageResponse } from "next/og"
import { generateBuilderId, generateBuilderTitle, generateClassTag } from "@/components/hhgoa/builder-title"

export const alt = "HH Goa 2026 Frame / ID Card Generator"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

// Dynamic OG image: renders a mini HH Goa builder card so shared links
// show the actual generated graphic, not a blank thumbnail.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const t = searchParams.get("t") || "Builder"
  const s = searchParams.get("s") || ""
  const f = searchParams.get("f") === "pfp" ? "pfp" : "idcard"
  const name = t.slice(0, 28)
  const stack = s.slice(0, 34)
  const title = generateBuilderTitle(t, s)
  const tag = generateClassTag(t)
  const builderId = generateBuilderId(t, s)
  const format = f === "pfp" ? "pfp" : "idcard"

  const green = "#0b6839"
  const yellow = "#fee101"
  const pink = "#ff0080"
  const cream = "#fffbe8"

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: green,
          position: "relative",
          fontFamily: "monospace",
        }}
      >
        {/* ticket card */}
        <div
          style={{
            position: "absolute",
            left: 70,
            top: 60,
            right: 70,
            bottom: 60,
            background: cream,
            borderRadius: 16,
            display: "flex",
            padding: "34px 40px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 14,
                background: yellow,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: 34,
                color: green,
                flexShrink: 0,
              }}
            >
              गो
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ display: "flex", fontSize: 34, fontWeight: 900, letterSpacing: 1, color: green }}>HH GOA 2026</div>
              <div style={{ display: "flex", fontSize: 16, fontWeight: 700, color: pink }}>GOA · INDIA · 28–31 OCT 2026</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 30, marginTop: 26, alignItems: "center" }}>
            {/* avatar */}
            <div
              style={{
                width: 168,
                height: 168,
                borderRadius: 16,
                background: green,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 72,
              }}
            >
              {format === "idcard" ? "🏝️" : "🖼️"}
            </div>

            <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", fontSize: 50, fontWeight: 900, color: green }}>{name || "BUILDER"}</div>
              <div style={{ display: "flex", fontSize: 19, fontWeight: 700, color: pink, marginTop: 4 }}>
                {format === "idcard" ? "IS BUILDING IN GOA" : "NEW PFP · HH GOA 2026"}
              </div>
              <div style={{ display: "flex", height: 2, background: "rgba(11,104,57,0.3)", margin: "14px 0" }} />
              <div style={{ display: "flex", fontSize: 17, color: green, opacity: 0.75 }}>STACK / ROLE</div>
              <div style={{ display: "flex", fontSize: 23, color: green, fontWeight: 700 }}>{stack || "Terminal Citizen"}</div>
              <div style={{ display: "flex", fontSize: 17, color: green, opacity: 0.75, marginTop: 10 }}>BUILDER CLASS</div>
              <div style={{ display: "flex", fontSize: 21, color: pink, fontWeight: 700 }}>{title}</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ display: "flex", fontSize: 16, fontWeight: 700, color: green }}>{tag}</div>
              <div style={{ display: "flex", fontSize: 13, fontWeight: 700, color: "rgba(11,104,57,0.6)", letterSpacing: 1 }}>ID {builderId}</div>
            </div>
            <div style={{ display: "flex", fontSize: 20, fontWeight: 900, color: pink }}>#FRAMEINGOA</div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  )
}
