import type { Metadata } from "next"
import Image from "next/image"
import { HhGoaStudio } from "@/components/hhgoa/hhgoa-studio"

export const metadata: Metadata = {
  title: "HH GOA | Hacker House Goa 2026",
  description:
    "4 days. one rhythm. everything intentional. Design your HH Goa 2026 frame / ID card and share it with #FrameInGoa.",
}

const tickerItems = [
  "Shortlisting task · Frame / ID generator",
  "#FrameInGoa",
  "GOA, INDIA · 28–31 OCT 2026",
  "Upload a photo · get your HH Goa graphic",
  "No login needed",
  "Download & share after minting",
]

export default function Home() {
  return (
    <main className="relative h-screen w-full overflow-hidden bg-brand-primary font-mono text-brand-white">
      {/* ===== Announcement ticker ===== */}
      <div className="relative z-20 w-full overflow-hidden border-b border-brand-white/15 bg-brand-black/25 py-2">
        <div className="hhgoa-marquee flex w-max items-center gap-10 whitespace-nowrap font-body text-[11px] font-bold uppercase tracking-[0.18em] text-brand-accent">
          {Array.from({ length: 2 }).map((_, k) => (
            <span key={k} className="flex items-center gap-10">
              {tickerItems.map((t) => (
                <span key={t} className="flex items-center gap-10">
                  <span>{t}</span>
                  <span className="text-brand-pink">✦</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ===== HERO: single viewport ===== */}
      <section id="top" className="relative h-[calc(100vh-33px)]">
        {/* Palm frame image as full background */}
        <Image
          src="/assets/footer trees.png"
          alt=""
          fill
          priority
          className="object-cover object-center"
        />

        {/* subtle dark overlay for readability */}
        <div className="absolute inset-0 bg-brand-black/40" />

        {/* The generator panel — centered hero element */}
        <div className="relative z-10 mx-auto flex h-full w-full max-w-4xl flex-col items-center justify-start px-4 pt-4 sm:pt-8">
          {/* HACKER HOUSE wordmark — clickable, links to hhgoa.com */}
          <a
            href="https://hhgoa.com"
            target="_blank"
            rel="noopener noreferrer"
            className="relative block max-w-[260px] shrink-0 transition-opacity hover:opacity-85 sm:max-w-md"
            aria-label="Go to hhgoa.com"
          >
            <Image
              src="/assets/Hacker house.png"
              alt="HACKER HOUSE"
              width={560}
              height={116}
              priority
              className="h-auto w-full"
            />
          </a>
          <div className="relative z-10 -mt-2 flex justify-center sm:-mt-3">
            <div className="rounded-sm bg-brand-pink px-5 py-1 sm:py-1.5">
              <span className="font-heading text-lg font-extrabold uppercase text-brand-white sm:text-2xl">
                गोवा
              </span>
            </div>
          </div>

          {/* Studio + hhgoa.com line */}
          <div className="mt-1 flex items-center gap-3 font-body text-[10px] font-bold uppercase tracking-[0.15em] sm:mt-1.5">
            <span className="text-brand-white/70">2:47 PM Studio</span>
            <span className="text-brand-white/30">·</span>
            <a
              href="https://hhgoa.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-accent underline-offset-4 hover:text-brand-pink hover:underline"
            >
              hhgoa.com ↗
            </a>
          </div>

          {/* Generator panel — matches the HH Goa background, scrolls internally on short screens */}
          <div className="mt-2 w-full min-h-0 max-h-[calc(100vh-260px)] overflow-y-auto rounded-xl border-2 border-brand-white/15 bg-brand-primary/95 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.5)] sm:max-h-[calc(100vh-320px)] sm:p-4">
            <HhGoaStudio />
          </div>
        </div>
      </section>
    </main>
  )
}
