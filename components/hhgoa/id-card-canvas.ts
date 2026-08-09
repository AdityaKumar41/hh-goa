"use client"

import { HH, drawCover, loadImage, roundRect } from "./design-tokens"
import { generateBuilderId, generateBuilderTitle, generateClassTag } from "./builder-title"

export interface IdCardInput {
  photo: HTMLImageElement
  name: string
  stack: string
  accent?: "yellow" | "pink"
}

// Tall portrait badge — like a real event ID card / lanyard
const W = 1080
const H = 1440

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

let wordmarkPromise: Promise<HTMLImageElement> | null = null
function getWordmark() {
  if (!wordmarkPromise) {
    wordmarkPromise = loadImage("/assets/Hacker house.png").catch(() => {
      wordmarkPromise = null
      throw new Error("wordmark failed to load")
    })
  }
  return wordmarkPromise
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

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let current = ""
  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current)
      current = word
      if (lines.length === maxLines) break
    } else {
      current = test
    }
  }
  if (current && lines.length < maxLines) lines.push(current)
  return lines
}

export async function renderIdCard(input: IdCardInput): Promise<string> {
  const canvas = document.createElement("canvas")
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext("2d")!
  const accent = input.accent === "pink" ? HH.pink : HH.yellow

  // ---- Background: forest green ----
  ctx.fillStyle = HH.forest
  ctx.fillRect(0, 0, W, H)

  // ---- Palm tree background (same asset as the home hero) ----
  // Cover-fit would only show the solid-green top of the panorama, so we
  // scale it to the card height and center it — the framing palms show on
  // the sides and the foliage strip anchors the bottom.
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
  const glow = ctx.createRadialGradient(W / 2, 440, 80, W / 2, 440, 640)
  glow.addColorStop(0, accent === HH.pink ? "rgba(255,0,128,0.10)" : "rgba(254,225,1,0.10)")
  glow.addColorStop(1, "rgba(254,225,1,0)")
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, H)

  // ---- Bottom vignette: a gentle dark fade at the very base so the
  // foliage blends into the card without a visible gradient band. ----
  const scrim = ctx.createLinearGradient(0, H - 170, 0, H - 10)
  scrim.addColorStop(0, "rgba(0,0,0,0)")
  scrim.addColorStop(1, "rgba(0,0,0,0.4)")
  ctx.fillStyle = scrim
  ctx.fillRect(0, H - 170, W, 160)

  // ---- Top accent band + cream rule ----
  ctx.fillStyle = accent
  ctx.fillRect(0, 0, W, 34)
  ctx.fillStyle = HH.cream
  ctx.fillRect(0, 34, W, 6)

  // ---- HACKER HOUSE wordmark (asset) ----
  const wordmarkW = 520
  const wordmarkH = 108
  try {
    const wordmark = await getWordmark()
    drawCover(ctx, wordmark, (W - wordmarkW) / 2, 56, wordmarkW, wordmarkH)
  } catch {
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillStyle = HH.yellow
    ctx.font = "800 54px 'Imbue', serif"
    ctx.fillText("HACKER HOUSE", W / 2, 108)
  }
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillStyle = HH.white
  ctx.font = "700 17px 'Victor Mono', monospace"
  ctx.fillText("GOA · INDIA · 28–31 OCT 2026", W / 2, 180)

  // ---- Photo (centered, accent + cream ring) ----
  const photoSize = 400
  const photoX = (W - photoSize) / 2
  const photoY = 236
  ctx.save()
  roundRect(ctx, photoX, photoY, photoSize, photoSize, 20)
  ctx.clip()
  drawCover(ctx, input.photo, photoX, photoY, photoSize, photoSize)
  ctx.restore()
  ctx.strokeStyle = accent
  ctx.lineWidth = 7
  roundRect(ctx, photoX, photoY, photoSize, photoSize, 20)
  ctx.stroke()
  ctx.strokeStyle = HH.cream
  ctx.lineWidth = 3
  roundRect(ctx, photoX - 12, photoY - 12, photoSize + 24, photoSize + 24, 26)
  ctx.stroke()

  // ---- Name + details ----
  const name = input.name.trim() || "BUILDER"
  const nameY = 700
  ctx.fillStyle = HH.white
  ctx.font = "800 66px 'Imbue', serif"
  ctx.fillText(name.slice(0, 22), W / 2, nameY)

  ctx.fillStyle = accent
  ctx.font = "700 20px 'Victor Mono', monospace"
  ctx.fillText("IS BUILDING IN GOA", W / 2, nameY + 44)

  // divider
  ctx.strokeStyle = "rgba(255,251,232,0.25)"
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(W / 2 - 190, nameY + 78)
  ctx.lineTo(W / 2 + 190, nameY + 78)
  ctx.stroke()

  // stack + builder class
  ctx.fillStyle = "rgba(255,251,232,0.6)"
  ctx.font = "700 16px 'Victor Mono', monospace"
  ctx.fillText("STACK / ROLE", W / 2, nameY + 114)
  ctx.fillStyle = HH.white
  ctx.font = "400 24px 'Victor Mono', monospace"
  ctx.fillText((input.stack.trim() || "Terminal Citizen").slice(0, 30), W / 2, nameY + 150)

  ctx.fillStyle = "rgba(255,251,232,0.6)"
  ctx.font = "700 16px 'Victor Mono', monospace"
  ctx.fillText("BUILDER CLASS", W / 2, nameY + 196)
  ctx.fillStyle = HH.cream
  ctx.font = "700 21px 'Victor Mono', monospace"
  const title = generateBuilderTitle(input.name, input.stack)
  const titleLines = wrapText(ctx, title, 640, 1)
  titleLines.forEach((line, i) => ctx.fillText(line, W / 2, nameY + 230 + i * 26))

  // ---- Class chip ----
  const tag = generateClassTag(input.name)
  ctx.fillStyle = accent
  roundRect(ctx, W / 2 - 150, nameY + 262, 300, 46, 23)
  ctx.fill()
  ctx.fillStyle = HH.black
  ctx.font = "700 16px 'Victor Mono', monospace"
  ctx.fillText(tag, W / 2, nameY + 285)

  // ---- Builder ID (dashed box) ----
  const builderId = generateBuilderId(input.name, input.stack)
  const idY = nameY + 352
  ctx.fillStyle = "rgba(255,251,232,0.6)"
  ctx.font = "700 15px 'Victor Mono', monospace"
  ctx.fillText("BUILDER ID", W / 2, idY)
  ctx.setLineDash([12, 8])
  ctx.strokeStyle = accent
  ctx.lineWidth = 3
  roundRect(ctx, W / 2 - 260, idY + 16, 520, 84, 14)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.fillStyle = HH.cream
  ctx.font = "700 34px 'Victor Mono', monospace"
  ctx.fillText(builderId, W / 2, idY + 60)

  // ---- Footer (tight, cohesive cluster just below the ID box) ----
  const footerTop = idY + 128
  try {
    const badge = await getGoaBadge()
    drawCover(ctx, badge, W / 2 - 34, footerTop, 68, 68)
  } catch {
    ctx.fillStyle = HH.yellow
    ctx.font = "800 34px 'Imbue', serif"
    ctx.fillText("गोवा", W / 2, footerTop + 36)
  }
  ctx.fillStyle = "rgba(255,251,232,0.6)"
  ctx.font = "700 13px 'Victor Mono', monospace"
  ctx.fillText("2:47 PM STUDIO", W / 2, footerTop + 86)
  ctx.fillStyle = accent
  ctx.font = "800 18px 'Victor Mono', monospace"
  ctx.fillText("#FRAMEINGOA", W / 2, footerTop + 112)

  // ---- Bottom accent strip ----
  ctx.fillStyle = accent
  ctx.fillRect(0, H - 24, W, 24)

  return canvas.toDataURL("image/png")
}
