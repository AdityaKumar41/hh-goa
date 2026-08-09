"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import NextImage from "next/image"
import { Download, Eye, History, Loader2, RefreshCcw, Sparkles, Trash2, Upload, X } from "lucide-react"
import { fileToImage, downloadDataUrl, buildXShareUrl } from "./image-upload"
import { renderPfpFrame } from "./pfp-frame-canvas"
import { renderIdCard } from "./id-card-canvas"
import { HH } from "./design-tokens"
import { useCardHistory } from "./use-card-history"

type Format = "idcard" | "pfp"
type Status = "idle" | "processing" | "ready" | "error"

export function HhGoaStudio() {
  const [format, setFormat] = useState<Format>("idcard")
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null)
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [stack, setStack] = useState("")
  const [accent, setAccent] = useState<"yellow" | "pink">("yellow")
  const [status, setStatus] = useState<Status>("idle")
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [cardUrl, setCardUrl] = useState<string | null>(null)
  const [generated, setGenerated] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const { history, addToHistory, removeFromHistory, clearHistory } = useCardHistory()

  const handleFile = useCallback(async (file: File) => {
    try {
      setStatus("processing")
      setErrorMsg(null)
      const img = await fileToImage(file)
      setPhoto(img)
      if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl)
      setPhotoPreviewUrl(URL.createObjectURL(file))
      setResultUrl(null)
      setGenerated(false)
      setStatus("ready")
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Something went wrong reading that file.")
      setStatus("error")
    }
  }, [photoPreviewUrl])

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ""
  }, [handleFile])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  // Live preview: render to canvas whenever inputs change
  useEffect(() => {
    if (!photo || !previewCanvasRef.current) return
    let cancelled = false
    const run = async () => {
      try {
        setStatus("processing")
        const dataUrl =
          format === "idcard"
            ? await renderIdCard({ photo, name, stack, accent })
            : await renderPfpFrame({ photo, name, stack, accent })
        if (cancelled) return
        const img = new Image()
        img.onload = () => {
          if (cancelled) return
          const canvas = previewCanvasRef.current!
          canvas.width = img.naturalWidth
          canvas.height = img.naturalHeight
          canvas.getContext("2d")!.drawImage(img, 0, 0)
          setResultUrl(dataUrl)
          setStatus("ready")
        }
        img.onerror = () => {
          if (!cancelled) {
            setErrorMsg("Could not load the rendered preview.")
            setStatus("error")
          }
        }
        img.src = dataUrl
      } catch (e) {
        if (!cancelled) {
          setErrorMsg(e instanceof Error ? e.message : "Rendering failed.")
          setStatus("error")
        }
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [photo, format, name, stack, accent])

  const handleDownload = useCallback(() => {
    if (!resultUrl) return
    const filename = format === "idcard" ? `hh-goa-id-${Date.now()}.png` : `hh-goa-pfp-${Date.now()}.png`
    downloadDataUrl(resultUrl, filename)
  }, [resultUrl, format])

  const handleView = useCallback(
    (item?: { cardUrl?: string; dataUrl: string; format: Format; name: string; stack: string; accent: "yellow" | "pink" }) => {
      // Always open OUR OWN /c page — never the raw blob URL. The /c page
      // shows the card (using the blob image when available) and carries
      // the OG metadata used for the X preview.
      const viewName = (item?.name ?? name).trim() || "Builder"
      const viewStack = (item?.stack ?? stack).trim() || "Terminal Citizen"
      const viewFormat = item?.format ?? format
      const itemBlobUrl = item?.cardUrl
      const blobUrl = itemBlobUrl ?? cardUrl
      const cardUrlBase = blobUrl
        ? `/c?img=${encodeURIComponent(blobUrl)}&t=${encodeURIComponent(viewName)}&s=${encodeURIComponent(viewStack)}&f=${viewFormat}`
        : `/c?t=${encodeURIComponent(viewName)}&s=${encodeURIComponent(viewStack)}&f=${viewFormat}`
      window.open(cardUrlBase, "_blank", "noopener,noreferrer")
    },
    [cardUrl, format, name, stack],
  )

  const handleShare = useCallback(
    (item?: { cardUrl?: string; dataUrl: string; format: Format; name: string; stack: string; accent: "yellow" | "pink" }) => {
      if (!resultUrl && !item) return
      const shareName = (item?.name ?? name).trim() || "Builder"
      const shareStack = (item?.stack ?? stack).trim() || "Terminal Citizen"
      const shareFormat = item?.format ?? format
      // Share OUR OWN /c link. The /c page serves the card image through
      // its OG metadata, so X auto-embeds the card in the tweet preview.
      const itemBlobUrl = item?.cardUrl
      const blobUrl = itemBlobUrl ?? cardUrl
      const cardUrlBase = blobUrl
        ? `/c?img=${encodeURIComponent(blobUrl)}&t=${encodeURIComponent(shareName)}&s=${encodeURIComponent(shareStack)}&f=${shareFormat}`
        : `/c?t=${encodeURIComponent(shareName)}&s=${encodeURIComponent(shareStack)}&f=${shareFormat}`
      const shareLink = `${window.location.origin}${cardUrlBase}`
      const label = shareFormat === "idcard" ? "my HH Goa 2026 Builder ID" : "my HH Goa 2026 profile frame"
      const caption = `Just minted ${label} 🏝️🔥\n\n${shareName} is building in Goa this October.\n\nMake yours → #FrameInGoa`
      window.open(buildXShareUrl(caption, undefined, shareLink), "_blank", "noopener,noreferrer")
    },
    [resultUrl, cardUrl, format, name, stack],
  )

  const handleGenerate = useCallback(async () => {
    if (!resultUrl || status === "processing") return
    setStatus("processing")
    setErrorMsg(null)
    let uploadedUrl: string | null = null
    try {
      // Persist the card to blob storage -> it gets its own permanent URL
      const res = await fetch("/api/upload-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl: resultUrl, format }),
      })
      if (!res.ok) throw new Error("upload failed")
      const { url } = await res.json()
      uploadedUrl = url
      setCardUrl(url)
      setGenerated(true)
      setStatus("ready")
    } catch {
      // Even if upload fails, the card is still usable locally
      setCardUrl(null)
      setGenerated(true)
      setStatus("ready")
    }
    // Save the generated card to local history with its blob URL so the
    // View / Share actions open the actual hosted image, not a re-render.
    addToHistory({ dataUrl: resultUrl, cardUrl: uploadedUrl ?? undefined, format, name, stack, accent })
  }, [resultUrl, status, format, name, stack, accent, addToHistory])

  const handleReset = useCallback(() => {
    setPhoto(null)
    if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl)
    setPhotoPreviewUrl(null)
    setResultUrl(null)
    setCardUrl(null)
    setGenerated(false)
    setName("")
    setStack("")
    setStatus("idle")
  }, [photoPreviewUrl])

  const hasPhoto = !!photo

  return (
    <div className="w-full">
      {/* ===== Format toggle + accent (one row) ===== */}
      <div className="mb-3 flex flex-wrap items-center justify-center gap-3">
        {(["idcard", "pfp"] as Format[]).map((f) => (
          <button
            key={f}
            onClick={() => setFormat(f)}
            className={`px-5 py-2 font-heading text-[13px] font-bold uppercase tracking-[0.08em] rounded-sm border-2 transition-all ${
              format === f
                ? "border-dashed border-brand-pink bg-brand-accent text-brand-black"
                : "border-brand-white/30 bg-transparent text-brand-white/80 hover:border-brand-accent hover:text-brand-accent"
            }`}
          >
            {f === "idcard" ? "ID Card" : "PFP Frame"}
          </button>
        ))}

        <span className="mx-1 h-5 w-px bg-brand-white/20" />

        <div className="flex items-center gap-2">
          <span className="font-body text-[10px] font-bold uppercase tracking-[0.15em] text-brand-white/60">Accent</span>
          <button
            onClick={() => setAccent("yellow")}
            className={`size-5 rounded-full border-2 transition-transform ${accent === "yellow" ? "scale-110 border-brand-black ring-2 ring-brand-white/70" : "border-transparent"}`}
            style={{ backgroundColor: HH.yellow }}
            aria-label="Yellow accent"
          />
          <button
            onClick={() => setAccent("pink")}
            className={`size-5 rounded-full border-2 transition-transform ${accent === "pink" ? "scale-110 border-brand-black ring-2 ring-brand-white/70" : "border-transparent"}`}
            style={{ backgroundColor: HH.pink }}
            aria-label="Pink accent"
          />
        </div>
      </div>

      {/* ===== Responsive layout: stacked on mobile, two columns on desktop ===== */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
        {/* ---- LEFT: upload + fields ---- */}
        <div className="flex flex-col gap-4">
          {/* Upload */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative h-[200px] w-full cursor-pointer overflow-hidden rounded-lg border-2 border-dashed transition-all sm:h-[230px] ${
              dragOver ? "border-brand-pink bg-brand-pink/10" : "border-brand-accent/50 hover:border-brand-accent"
            } ${hasPhoto ? "" : "flex flex-col items-center justify-center px-4 py-6 text-center"}`}
          >
            <input ref={fileInputRef} type="file" accept="image/*,.heic,.heif" className="hidden" onChange={onFileChange} />
            {hasPhoto && photoPreviewUrl ? (
              <>
                <div className="relative h-[200px] w-full sm:h-[230px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoPreviewUrl} alt="Your upload" className="absolute inset-0 h-full w-full object-cover" />
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleReset() }}
                  className="absolute right-2 top-2 rounded-full bg-brand-black/70 p-2 text-brand-white transition-colors hover:bg-brand-black"
                  aria-label="Remove photo"
                >
                  <X className="size-4" />
                </button>
              </>
            ) : (
              <>
                <Upload className="mb-3 size-10 text-brand-accent" />
                <p className="font-body text-base font-bold text-brand-white">Drop your photo</p>
                <p className="mt-1 font-body text-[12px] text-brand-white/60">
                  JPG · PNG · WEBP · HEIC · no cropping needed
                </p>
                <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-accent px-5 py-2 font-heading text-[12px] font-bold uppercase tracking-wide text-brand-black">
                  Choose photo
                </span>
              </>
            )}
          </div>

          {/* Fields — always shown so the layout stays fixed */}
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-col gap-0.5">
              <label htmlFor="name" className="font-body text-[10px] font-bold uppercase tracking-[0.15em] text-brand-accent">
                {format === "idcard" ? "Your name" : "Handle"}
              </label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={format === "idcard" ? "aditya.eth" : "@builder"}
                className="rounded-md border border-brand-white/15 bg-brand-primary px-3.5 py-2 font-body text-sm text-brand-white outline-none transition-colors placeholder:text-brand-white/35 focus:border-brand-pink"
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <label htmlFor="stack" className="font-body text-[10px] font-bold uppercase tracking-[0.15em] text-brand-accent">
                {format === "idcard" ? "Stack / role" : "Tagline"}
              </label>
              <input
                id="stack"
                value={stack}
                onChange={(e) => setStack(e.target.value)}
                placeholder={format === "idcard" ? "full-stack · AI · design" : "ship or ship"}
                className="rounded-md border border-brand-white/15 bg-brand-primary px-3.5 py-2 font-body text-sm text-brand-white outline-none transition-colors placeholder:text-brand-white/35 focus:border-brand-pink"
              />
            </div>
          </div>

          {errorMsg && (
            <p className="rounded-md border border-brand-pink/50 bg-brand-pink/15 px-3 py-2 font-body text-sm text-brand-white">
              {errorMsg}
            </p>
          )}
        </div>

        {/* ---- RIGHT: preview + actions ---- */}
        <div className="flex flex-col gap-4">
          <div className="relative overflow-hidden rounded-lg border-2 border-brand-white/12 bg-brand-black/20">
            <div className="relative h-[260px] w-full sm:h-[250px] md:h-[240px]">
              <canvas ref={previewCanvasRef} className="absolute inset-0 h-full w-full object-contain" />
              {!photo && !resultUrl && (
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
                  <NextImage
                    src="/assets/goa_hindi.svg"
                    alt=""
                    width={60}
                    height={60}
                    className="opacity-70"
                  />
                  <p className="font-heading text-base font-bold uppercase text-brand-white/60">
                    Your {format === "idcard" ? "ID card" : "frame"} preview
                  </p>
                </div>
              )}
              {status === "processing" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-brand-black/40 text-brand-white/90">
                  <Loader2 className="size-6 animate-spin text-brand-accent" />
                  <p className="font-body text-sm">Rendering…</p>
                </div>
              )}
              {status === "error" && !resultUrl && (
                <div className="absolute inset-0 flex items-center justify-center px-4 text-center font-body text-sm text-brand-white/70">
                  {errorMsg || "Something went wrong."}
                </div>
              )}
            </div>
          </div>

          {/* Actions — space always reserved so the layout stays fixed */}
          <div className="flex min-h-[38px] flex-wrap items-center justify-center gap-1.5">
            {resultUrl && status === "ready" && !generated ? (
              <button
                onClick={handleGenerate}
                className="inline-flex items-center gap-2 rounded-md bg-brand-accent px-6 py-2 font-heading text-[13px] font-bold uppercase tracking-wide text-brand-black transition-all hover:brightness-105"
              >
                <Sparkles className="size-4" /> Generate
              </button>
            ) : resultUrl && status === "ready" && generated ? (
              <>
                <button
                  onClick={handleView}
                  disabled={status === "processing"}
                  className="inline-flex items-center gap-1.5 rounded-md border-2 border-dashed border-brand-pink bg-brand-forest-deep px-3.5 py-1.5 font-heading text-[11px] font-bold uppercase tracking-wide text-brand-accent transition-all hover:bg-brand-pink hover:text-brand-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Eye className="size-3.5" /> View
                </button>
                <button
                  onClick={handleDownload}
                  disabled={status === "processing"}
                  className="inline-flex items-center gap-1.5 rounded-md bg-brand-accent px-3.5 py-1.5 font-heading text-[11px] font-bold uppercase tracking-wide text-brand-black transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Download className="size-3.5" /> Download
                </button>
                <button
                  onClick={handleShare}
                  disabled={status === "processing"}
                  className="inline-flex items-center gap-1.5 rounded-md border-2 border-brand-white/20 px-3.5 py-1.5 font-heading text-[11px] font-bold uppercase tracking-wide text-brand-white transition-colors hover:border-brand-accent hover:text-brand-accent disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {/* official X icon from the asset kit */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/180-frame-1948754793-54-30952.svg" alt="" width={14} height={12} />
                  Share
                </button>
                <button
                  onClick={handleReset}
                  disabled={!photo}
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 font-heading text-[10px] font-bold uppercase tracking-wide text-brand-white/50 transition-colors hover:text-brand-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <RefreshCcw className="size-3.5" /> Reset
                </button>
              </>
            ) : (
              <span className="font-body text-[10px] uppercase tracking-[0.15em] text-brand-white/30">
                {status === "processing" ? "Generating your frame…" : "Upload a photo to generate"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ===== History: every generated card, stored in the browser ===== */}
      <div className="mt-6 border-t border-brand-white/15 pt-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <History className="size-4 text-brand-accent" />
            <h2 className="font-heading text-[13px] font-extrabold uppercase tracking-[0.15em] text-brand-white">
              Your creations
            </h2>
            <span className="font-body text-[10px] uppercase tracking-[0.15em] text-brand-white/40">
              {history.length} saved
            </span>
          </div>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="inline-flex items-center gap-1.5 rounded-md border border-brand-white/20 px-2.5 py-1 font-heading text-[10px] font-bold uppercase tracking-wide text-brand-white/60 transition-colors hover:border-brand-pink hover:text-brand-pink"
            >
              <Trash2 className="size-3" /> Clear all
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <p className="rounded-lg border border-dashed border-brand-white/15 px-4 py-6 text-center font-body text-[12px] text-brand-white/40">
            No creations yet — generate a card and it will be saved here on this device.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-brand-white/10">
            {history.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3 sm:flex-nowrap"
              >
                {/* Text info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-heading text-[14px] font-extrabold uppercase tracking-wide text-brand-white">
                    {item.name || "Builder"}
                  </p>
                  <p className="truncate font-body text-[11px] text-brand-white/50">
                    {item.format === "idcard" ? "ID Card" : "PFP Frame"}
                    {item.stack ? ` · ${item.stack}` : ""} ·{" "}
                    {new Date(item.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleView(item)}
                    className="inline-flex items-center gap-1.5 rounded-md border-2 border-dashed border-brand-pink bg-brand-forest-deep px-3 py-1.5 font-heading text-[10px] font-bold uppercase tracking-wide text-brand-accent transition-all hover:bg-brand-pink hover:text-brand-white"
                    title="Open shareable link"
                  >
                    <Eye className="size-3" /> View
                  </button>
                  <button
                    onClick={() => downloadDataUrl(item.dataUrl, `hh-goa-${item.format}-${item.id.slice(0, 6)}.png`)}
                    className="inline-flex items-center gap-1.5 rounded-md bg-brand-accent px-3 py-1.5 font-heading text-[10px] font-bold uppercase tracking-wide text-brand-black transition-all hover:brightness-105"
                    title="Download image"
                  >
                    <Download className="size-3" /> Download
                  </button>
                  <button
                    onClick={() => handleShare(item)}
                    className="inline-flex items-center gap-1.5 rounded-md border-2 border-brand-white/20 px-3 py-1.5 font-heading text-[10px] font-bold uppercase tracking-wide text-brand-white transition-colors hover:border-brand-accent hover:text-brand-accent"
                    title="Share on X"
                  >
                    {/* official X icon from the asset kit */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/assets/180-frame-1948754793-54-30952.svg" alt="" width={12} height={10} />
                    Share
                  </button>
                  <button
                    onClick={() => removeFromHistory(item.id)}
                    className="inline-flex items-center gap-1 rounded-md px-1.5 py-1.5 font-heading text-[10px] font-bold uppercase tracking-wide text-brand-white/40 transition-colors hover:text-brand-pink"
                    title="Delete from history"
                    aria-label="Delete from history"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
