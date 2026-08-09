// HH Goa brand tokens, shared between the web UI and the canvas renderers.
// Extracted from hhgoa.com + DESIGN.md
export const HH = {
  forest: "#0b6839",
  forestDeep: "#0a5730",
  yellow: "#fee101",
  golden: "#edd723",
  pink: "#ff0080",
  white: "#ffffff",
  cream: "#fffbe8",
  black: "#000000",
  greenAccent: "#9ac95f",
  palm: "#4aa35b",
  sand: "#f5bba6",
} as const

export type HHColor = (typeof HH)[keyof typeof HH]

// Helper: rounded rect path (no fill/stroke)
export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + w - radius, y)
  ctx.arcTo(x + w, y, x + w, y + radius, radius)
  ctx.lineTo(x + w, y + h - radius)
  ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius)
  ctx.lineTo(x + radius, y + h)
  ctx.arcTo(x, y + h, x, y + h - radius, radius)
  ctx.lineTo(x, y + radius)
  ctx.arcTo(x, y, x + radius, y, radius)
  ctx.closePath()
}

// Utility: load an image (HTMLImageElement) from URL or data URI
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    img.src = src
  })
}

// Cover-fit draw: draw img into rect (x,y,w,h) preserving aspect ratio, centered, cropped
export function drawCover(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const imgW = (img as HTMLImageElement).naturalWidth || (img as HTMLVideoElement).videoWidth
  const imgH = (img as HTMLImageElement).naturalHeight || (img as HTMLVideoElement).videoHeight
  if (!imgW || !imgH) return
  const scale = Math.max(w / imgW, h / imgH)
  const dw = imgW * scale
  const dh = imgH * scale
  const dx = x + (w - dw) / 2
  const dy = y + (h - dh) / 2
  ctx.drawImage(img, dx, dy, dw, dh)
}
