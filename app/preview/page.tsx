"use client"

import { useCallback, useEffect, useState } from "react"
import NextImage from "next/image"
import Link from "next/link"
import { ArrowLeft, Download } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { downloadDataUrl, buildXShareUrl } from "@/components/hhgoa/image-upload"

interface PreviewData {
  dataUrl: string
  format: "idcard" | "pfp"
  name: string
  stack: string
}

export default function PreviewPage() {
  const searchParams = useSearchParams()
  const [data, setData] = useState<PreviewData | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)

  // Try to load from localStorage first (same-browser "View your frame")
  useEffect(() => {
    try {
      const raw = localStorage.getItem("hhgoa-preview")
      if (raw) {
        const parsed = JSON.parse(raw)
        setData({ dataUrl: parsed.dataUrl, format: parsed.format, name: parsed.name, stack: parsed.stack })
        setLoading(false)
        return
      }
    } catch {
      // ignore, fall through to query params
    }

    // Fallback: shared link (?t=name&s=stack&f=format) -> regenerate the card
    const t = searchParams.get("t")
    const s = searchParams.get("s") || ""
    const f = searchParams.get("f")
    if (t) {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        setData({
          dataUrl: img.src,
          format: f === "pfp" ? "pfp" : "idcard",
          name: t,
          stack: s,
        })
        setLoading(false)
      }
      img.onerror = () => {
        setNotFound(true)
        setLoading(false)
      }
      img.src = `/og?t=${encodeURIComponent(t)}&s=${encodeURIComponent(s)}&f=${f || "idcard"}`
    } else {
      setNotFound(true)
      setLoading(false)
    }
  }, [searchParams])

  const handleDownload = useCallback(() => {
    if (!data) return
    const filename = data.format === "idcard" ? "hh-goa-id.png" : "hh-goa-pfp.png"
    downloadDataUrl(data.dataUrl, filename)
  }, [data])

  const handleShare = useCallback(() => {
    if (!data) return
    const cardUrl = `${window.location.origin}/c?t=${encodeURIComponent(data.name)}&s=${encodeURIComponent(data.stack)}&f=${data.format}`
    const label = data.format === "idcard" ? "my HH Goa 2026 Builder ID" : "my HH Goa 2026 profile frame"
    const caption = `Just minted ${label} 🏝️🔥\n\n${data.name || "Builder"} is building in Goa this October.\n\nMake yours → #FrameInGoa`
    window.open(buildXShareUrl(caption, undefined, cardUrl), "_blank", "noopener,noreferrer")
  }, [data])

  return (
    <main className="relative min-h-screen w-full overflow-x-clip bg-brand-primary font-mono text-brand-white">
      {/* Palm tree background (same asset as the home hero) */}
      <NextImage
        src="/assets/footer trees.png"
        alt=""
        fill
        priority
        className="object-cover object-center"
      />
      {/* subtle dark overlay for readability */}
      <div className="absolute inset-0 bg-brand-black/40" />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center px-5 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-body text-[12px] font-bold uppercase tracking-[0.18em] text-brand-white/70 transition-colors hover:text-brand-accent"
        >
          <ArrowLeft className="size-3.5" /> Back to studio
        </Link>

        <p className="mt-8 font-heading text-[13px] font-extrabold uppercase tracking-[0.15em] text-brand-pink">
          Your HH Goa 2026
        </p>
        <h1 className="mt-1 font-heading text-3xl font-extrabold uppercase tracking-tight text-brand-accent sm:text-4xl">
          {data?.format === "pfp" ? "Profile frame" : "Builder ID card"}
        </h1>

        {loading ? (
          <p className="mt-10 font-body text-sm text-brand-white/70">Loading…</p>
        ) : notFound ? (
          <div className="mt-10 flex flex-col items-center gap-4 text-center">
            <p className="font-body text-sm text-brand-white/80">
              No frame to preview yet. Build one on the home page first.
            </p>
            <Link
              href="/"
              className="rounded-md bg-brand-accent px-6 py-3 font-heading text-[13px] font-bold uppercase tracking-wide text-brand-black"
            >
              Go build your frame
            </Link>
          </div>
        ) : data ? (
          <>
            {/* The card, displayed large */}
            <div className="mt-8 w-full max-w-md overflow-hidden rounded-xl border-2 border-brand-white/15 bg-brand-black/40 p-3 shadow-[0_16px_50px_rgba(0,0,0,0.5)] backdrop-blur-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={data.dataUrl} alt="Your HH Goa frame" className="h-auto w-full rounded-lg" />
            </div>

            <p className="mt-4 font-body text-[13px] text-brand-white/70">
              {data.name} · {data.stack}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 rounded-md bg-brand-accent px-6 py-3 font-heading text-[13px] font-bold uppercase tracking-wide text-brand-black transition-all hover:brightness-105"
              >
                <Download className="size-4" /> Download
              </button>
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 rounded-md border-2 border-brand-white/20 px-6 py-3 font-heading text-[13px] font-bold uppercase tracking-wide text-brand-white transition-colors hover:border-brand-accent hover:text-brand-accent"
              >
                {/* official X icon from the asset kit */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/180-frame-1948754793-54-30952.svg" alt="" width={18} height={16} />
                Share on X
              </button>
            </div>
          </>
        ) : null}
      </div>
    </main>
  )
}
