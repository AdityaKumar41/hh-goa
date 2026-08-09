"use client"

import { isHeicFile } from "@/lib/image-utils"

// heic2any references `window` at module scope, so load it lazily only when
// actually converting a HEIC file (keeps SSR safe).
async function loadHeicConverter() {
  const mod = await import("heic2any")
  return (mod.default ?? mod) as typeof import("heic2any")["default"]
}

// Decode an uploaded File (jpg, png, webp, heic) into an HTMLImageElement.
// HEIC/HEIF (iPhone) files are converted to JPEG via heic2any.
export async function fileToImage(file: File): Promise<HTMLImageElement> {
  let blob: Blob = file
  try {
    if (await isHeicFile(file)) {
      const heic2any = await loadHeicConverter()
      const converted = (await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: 0.92,
      })) as Blob
      blob = converted
    }
  } catch (err) {
    console.warn("HEIC conversion failed, falling back to raw file", err)
  }

  const url = URL.createObjectURL(blob)
  try {
    const img = new Image()
    img.decoding = "async"
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error("Could not read that image file."))
      img.src = url
    })
    return img
  } finally {
    URL.revokeObjectURL(url)
  }
}

// Download a data URL as a file
export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a")
  a.href = dataUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
}

// Build the share-to-X intent URL with a pre-filled caption
export function buildXShareUrl(caption: string, imageDataUrl?: string, ogUrl?: string): string {
  const text = encodeURIComponent(caption)
  let url = `https://x.com/intent/tweet?text=${text}`
  // If we have a hosted OG image URL, append it so the link preview shows the graphic
  if (ogUrl) url += `&url=${encodeURIComponent(ogUrl)}`
  return url
}
