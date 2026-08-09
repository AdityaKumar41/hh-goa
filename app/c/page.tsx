import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

interface Props {
  searchParams: Promise<{ t?: string; s?: string; f?: string; img?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams
  const t = params.t?.trim() || "Builder"
  const s = params.s?.trim() || "Terminal Citizen"
  const f = params.f === "pfp" ? "pfp" : "idcard"
  const title = `${t} · HH Goa 2026 ${f === "pfp" ? "Profile Frame" : "Builder ID"}`
  const description = `My HH Goa 2026 ${f === "pfp" ? "profile frame" : "builder ID card"}. Build your own → #FrameInGoa`
  // If the card was persisted to blob storage, use its real image as the
  // OG image so the tweet preview shows the user's actual card+photo.
  const image = params.img || `/og?t=${encodeURIComponent(t)}&s=${encodeURIComponent(s)}&f=${f}`
  const imgWidth = f === "pfp" ? 1080 : 1200
  const imgHeight = f === "pfp" ? 1080 : 630

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image, width: imgWidth, height: imgHeight, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  }
}

export default async function CardPage({ searchParams }: Props) {
  const params = await searchParams
  const t = params.t?.trim() || "Builder"
  const s = params.s?.trim() || "Terminal Citizen"
  const f = params.f === "pfp" ? "pfp" : "idcard"
  const image = params.img || `/og?t=${encodeURIComponent(t)}&s=${encodeURIComponent(s)}&f=${f}`

  return (
    <main className="relative min-h-screen w-full overflow-x-clip bg-brand-primary font-mono text-brand-white">
      {/* Palm tree background (same asset as the home hero) */}
      <Image
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
          ← Back to studio
        </Link>

        <p className="mt-8 font-heading text-[13px] font-extrabold uppercase tracking-[0.15em] text-brand-pink">
          Your HH Goa 2026
        </p>
        <h1 className="mt-1 font-heading text-3xl font-extrabold uppercase tracking-tight text-brand-accent sm:text-4xl">
          {f === "pfp" ? "Profile frame" : "Builder ID card"}
        </h1>

        {/* The card (served from the OG route, which renders the same graphic) */}
        <div className="mt-8 w-full max-w-md overflow-hidden rounded-xl border-2 border-brand-white/15 bg-brand-black/40 p-3 shadow-[0_16px_50px_rgba(0,0,0,0.5)] backdrop-blur-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={`${t} · HH Goa 2026`} className="h-auto w-full rounded-lg" />
        </div>

        <p className="mt-4 font-body text-[13px] text-brand-white/70">
          {t} · {s} · {f === "pfp" ? "PFP frame" : "Builder ID"}
        </p>

        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-brand-accent px-6 py-3 font-heading text-[13px] font-bold uppercase tracking-wide text-brand-black transition-all hover:brightness-105"
        >
          Build your own → #FrameInGoa
        </Link>
      </div>
    </main>
  )
}
