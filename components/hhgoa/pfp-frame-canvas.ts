"use client"

import { HH, drawCover, loadImage, roundRect } from "./design-tokens"
import { generateBuilderId } from "./builder-title"

export interface PfpFrameInput {
  photo: HTMLImageElement
  name?: string
  stack?: string
  accent?: "yellow" | "pink"
}

const W = 1080
const H = 1080

let goaBadgePromise: Promise<HTMLImageElement> | null = null
function getGoaBadge() {
  if (!goaBadgePromise) {
    goaBadgePromise = loadImage("/assets/goa_hindi.svg").catch(() => {
      goaBadgePromise = null
      throw new Error("goa badge failed to load")
    })
  }
  return goaBadgePromise
}

let hackerHousePromise: Promise<HTMLImageElement> | null = null
function getHackerHouse() {
  if (!hackerHousePromise) {
    hackerHousePromise = loadImage("/assets/Hacker house.png").catch(() => {
      hackerHousePromise = null
      throw new Error("hacker house wordmark failed to load")
    })
  }
  return hackerHousePromise
}

let palmBgPromise: Promise<HTMLImageElement> | null = null
function getPalmBg() {
  if (!palmBgPromise) {
    palmBgPromise = loadImage("/assets/footer trees.png").catch(() => {
      palmBgPromise = null
      throw new Error("palm background failed to load")
    })
  }
  return palmBgPromise
}

export async function renderPfpFrame(input: PfpFrameInput): Promise<string> {
  const canvas = document.createElement("canvas")
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext("2d")!
  const accent = input.accent === "pink" ? HH.pink : HH.yellow

  // ---- Base: forest green ----
  ctx.fillStyle = HH.forest
  ctx.fillRect(0, 0, W, H)

  // ---- Palm tree background (same asset as the home hero) ----
  // Scale to the canvas height so the framing palms show on the sides and
  // the foliage strip anchors the bottom, instead of a flat green top.
  try {
    const palm = await getPalmBg()
    const scale = H / palm.naturalHeight
    const dw = palm.naturalWidth * scale
    ctx.drawImage(palm, (W - dw) / 2, 0, dw, H)
  } catch {
    // fallback: keep the flat forest green
  }
  // dark overlay so text stays legible over the illustration
  ctx.fillStyle = "rgba(0,0,0,0.34)"
  ctx.fillRect(0, 0, W, H)

  // subtle radial glow behind the photo
  const glow = ctx.createRadialGradient(W / 2, H / 2 - 40, 60, W / 2, H / 2 - 40, 520)
  glow.addColorStop(0, accent === HH.pink ? "rgba(255,0,128,0.12)" : "rgba(254,225,1,0.12)")
  glow.addColorStop(1, "rgba(254,225,1,0)")
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, H)

  // ---- Bottom vignette: gentle dark fade at the very base so the footer
  // reads over the foliage without a visible gradient band. ----
  const scrim = ctx.createLinearGradient(0, H - 150, 0, H - 10)
  scrim.addColorStop(0, "rgba(0,0,0,0)")
  scrim.addColorStop(1, "rgba(0,0,0,0.4)")
  ctx.fillStyle = scrim
  ctx.fillRect(0, H - 150, W, 140)

  // ---- Top band: accent + cream rule ----
  ctx.fillStyle = accent
  ctx.fillRect(0, 0, W, 44)
  ctx.fillStyle = HH.cream
  ctx.fillRect(0, 44, W, 5)

  // HACKER HOUSE wordmark (asset) — sits high under the band
  try {
    const wordmark = await getHackerHouse()
    const ww = 340
    const wh = 71
    drawCover(ctx, wordmark, W / 2 - ww / 2, 52, ww, wh)
  } catch {
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillStyle = HH.yellow
    ctx.font = "800 44px 'Imbue', serif"
    ctx.fillText("HACKER HOUSE", W / 2, 90)
  }
  // date line right under the wordmark
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillStyle = HH.white
  ctx.font = "700 15px 'Victor Mono', monospace"
  ctx.fillText("GOA · INDIA · 28–31 OCT 2026", W / 2, 132)

  // ---- Photo circle (clear of the top header block) ----
  const photoCx = W / 2
  const photoCy = 486
  const photoR = 252

  // pink dashed tick ring
  ctx.setLineDash([8, 10])
  ctx.strokeStyle = "rgba(255,0,128,0.6)"
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(photoCx, photoCy, photoR + 40, 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([])

  // accent ring
  ctx.fillStyle = accent
  ctx.beginPath()
  ctx.arc(photoCx, photoCy, photoR + 26, 0, Math.PI * 2)
  ctx.fill()
  // cream inner ring
  ctx.strokeStyle = HH.cream
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.arc(photoCx, photoCy, photoR + 11, 0, Math.PI * 2)
  ctx.stroke()

  // photo
  ctx.save()
  ctx.beginPath()
  ctx.arc(photoCx, photoCy, photoR, 0, Math.PI * 2)
  ctx.clip()
  drawCover(ctx, input.photo, photoCx - photoR, photoCy - photoR, photoR * 2, photoR * 2)
  ctx.restore()

  // ---- Bottom content: clean stack BELOW the photo ----
  // photo bottom edge = 486 + 252 = 738. Everything below is compressed so
  // the footer cluster ends ABOVE the palm foliage (which starts ~y=1010).
  const handle = (input.name || "").trim() || "@builder"
  const tagline = (input.stack || "").trim() || "SHIP OR SHIP"

  ctx.textAlign = "center"
  ctx.textBaseline = "middle"

  // handle (name) at y=790
  ctx.fillStyle = HH.cream
  ctx.font = "800 42px 'Imbue', serif"
  const displayHandle = handle.startsWith("@") ? handle : `@${handle}`
  ctx.fillText(displayHandle, W / 2, 790)

  // tagline (stack) at y=856 — 66px below the handle baseline
  ctx.fillStyle = accent
  ctx.font = "700 19px 'Victor Mono', monospace"
  const shortTagline = tagline.length > 36 ? `${tagline.slice(0, 36)}…` : tagline
  ctx.fillText(shortTagline.toUpperCase(), W / 2, 856)

  // ---- Builder ID chip ----
  const builderId = generateBuilderId(input.name || "", input.stack || "")
  // label at y=896 — 40px clear of the tagline
  ctx.fillStyle = "rgba(255,251,232,0.75)"
  ctx.font = "700 14px 'Victor Mono', monospace"
  ctx.fillText("BUILDER ID", W / 2, 896)
  // dashed box from y=906 to 950, ID centered at y=928
  ctx.setLineDash([10, 7])
  ctx.strokeStyle = "rgba(255,251,232,0.55)"
  ctx.lineWidth = 2
  roundRect(ctx, W / 2 - 180, 906, 360, 44, 22)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.fillStyle = HH.cream
  ctx.font = "700 19px 'Victor Mono', monospace"
  ctx.fillText(builderId, W / 2, 928)

  // goa badge — small, below the chip (kept above the foliage line)
  try {
    const badge = await getGoaBadge()
    drawCover(ctx, badge, W / 2 - 20, 952, 40, 40)
  } catch {
    ctx.fillStyle = HH.yellow
    ctx.font = "800 20px 'Imbue', serif"
    ctx.fillText("गोवा", W / 2, 970)
  }

  // bottom hash — below the badge, over the dark vignette so it reads
  ctx.fillStyle = HH.cream
  ctx.font = "700 16px 'Victor Mono', monospace"
  ctx.fillText("#FRAMEINGOA · 2026", W / 2, 1016)

  // ---- Bottom accent strip ----
  ctx.fillStyle = accent
  ctx.fillRect(0, H - 8, W, 8)

  return canvas.toDataURL("image/png")
}
