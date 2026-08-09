import { NextResponse } from "next/server"
import { uploadImageToBlob } from "@/lib/blob-storage"

/**
 * POST /api/upload-card
 * Persists a generated card image to Vercel Blob and returns its
 * permanent public URL. Every generated card gets its own URL so it
 * can be shared, previewed, and downloaded from anywhere.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { dataUrl, format } = body

    if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.startsWith("data:image")) {
      return NextResponse.json({ error: "Missing or invalid image data" }, { status: 400 })
    }

    const filename = `cards/${format === "pfp" ? "pfp" : "id"}-${Date.now()}.png`
    const url = await uploadImageToBlob(dataUrl, filename)

    return NextResponse.json({ url })
  } catch (e) {
    console.error("upload-card error", e)
    return NextResponse.json({ error: "Failed to upload card" }, { status: 500 })
  }
}
