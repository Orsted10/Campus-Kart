"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MOMENTS, SERVICE_META } from "@/lib/data";
import { useReveal } from "@/lib/motion";

const FRAG_PATHS = [
  { d: "M40,90 C 90,70 120,110 170,90", color: "var(--food)", rot: -6 },
  { d: "M540,60 C 590,90 630,50 690,80", color: "var(--rides)", rot: 4 },
  { d: "M240,400 C 290,430 330,390 380,420", color: "var(--essentials)", rot: 3 },
  { d: "M560,380 C 610,410 660,370 720,400", color: "var(--muted)", rot: -5 },
  { d: "M30,300 C 80,330 110,290 160,320", color: "var(--muted)", rot: 8 },
  { d: "M300,40 C 350,70 390,30 440,60", color: "var(--muted)", rot: -3 },
];

export default function Chaos() {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useReveal<HTMLDivElement>(24);
  const [open, setOpen] = useState<string | null>("17:47");
  const [isManual, setIsManual] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const el = sectionRef.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5,
        onUpdate: (self) => {
          if (isManual) return;
          const p = self.progress;
          // Clean discrete step snapping (0..4)
          const idx = Math.min(4, Math.floor(p * 5));
          const targetTime = MOMENTS[idx]?.time;
          if (targetTime) {
            setOpen(targetTime);
          }
        },
      });
    }, el);

    return () => ctx.revert();
  }, [isManual]);

  const activeIndex = MOMENTS.findIndex((m) => m.time === open);
  const validIndex = activeIndex >= 0 ? activeIndex : 0;
  const currentMoment = MOMENTS[validIndex];
  
  const activeAccent =
    currentMoment.service === "food"
      ? "var(--food)"
      : currentMoment.service === "rides"
        ? "var(--rides)"
        : currentMoment.service === "essentials"
          ? "var(--essentials)"
          : "var(--text)";

  // Snapped progress line percentage (0%, 25%, 50%, 75%, 100%)
  const snapProgressPercent = (validIndex / 4) * 100;

  return (
    <section id="chaos" ref={sectionRef} className="relative h-[240vh] border-b border-[var(--border)]/30">
      <div className="sticky top-0 flex min-h-[100svh] flex-col justify-between overflow-hidden px-5 pb-[4vh] pt-[112px] sm:px-8 sm:pt-[120px] lg:px-[4vw] lg:pt-[128px]">
        {/* Dynamic Background Glow & Constellation */}
        <div className="pointer-events-none absolute inset-0 select-none overflow-hidden opacity-30" aria-hidden="true">
          <div
            className="absolute -top-[20%] left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full blur-[140px] transition-all duration-700 opacity-25"
            style={{ background: activeAccent }}
          />
          <svg viewBox="0 0 760 460" className="h-full w-full opacity-40" preserveAspectRatio="xMidYMid slice">
            {FRAG_PATHS.map((f, i) => (
              <path
                key={i}
                d={f.d}
                transform={`rotate(${f.rot} 380 230)`}
                fill="none"
                stroke={f.color}
                strokeWidth="1.6"
                strokeDasharray="4 8"
                opacity="0.6"
              />
            ))}
          </svg>
        </div>

        {/* Header Section */}
        <div ref={headRef} className="relative mx-auto w-full max-w-[1400px]">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-[var(--border)] bg-[var(--surface)]/80 px-3.5 py-1.5 backdrop-blur-md shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: activeAccent }} />
              <span className="relative inline-flex rounded-full h-2 w-2 shadow-[0_0_8px_currentColor]" style={{ background: activeAccent, color: activeAccent }} />
            </span>
            <span className="micro font-mono text-[11px] tracking-[0.18em] text-[var(--text)] font-medium">
              RECOGNIZE THE FRAGMENTATION · POINT 0{validIndex + 1}/05
            </span>
          </div>

          <div className="mt-4 grid gap-6 lg:grid-cols-[1.15fr_1fr] lg:items-end">
            <h2 className="display text-[clamp(2.2rem,5.2vw,4.6rem)] leading-[0.94] tracking-[-0.035em]">
              YOU KNOW
              <br />
              THIS <span className="serif-accent italic transition-colors duration-500" style={{ color: activeAccent }}>chaos.</span>
            </h2>
            <p className="lede lg:justify-self-end lg:text-right text-[var(--muted)] text-[1.02rem] leading-relaxed max-w-[38ch]">
              Five ordinary minutes of campus life. Discrete apps, zero synergy — scroll or click to inspect each point.
            </p>
          </div>
        </div>

        {/* 24-Hour Snapping Point Scrubber Track */}
        <div className="relative mx-auto w-full max-w-[1400px] my-5 px-3">
          {/* Base Track */}
          <div className="relative h-1 w-full rounded-full bg-[var(--border)]/50">
            {/* Snapped Progress Bar */}
            <div
              className="absolute left-0 top-0 bottom-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] rounded-full"
              style={{
                width: `${snapProgressPercent}%`,
                background: activeAccent,
                boxShadow: `0 0 14px ${activeAccent}`,
              }}
            />

            {/* Glowing Snap Knob */}
            <div
              className="absolute top-1/2 -translate-y-1/2 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-white shadow-[0_0_12px_rgba(255,255,255,0.8)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-10"
              style={{
                left: `${snapProgressPercent}%`,
                background: activeAccent,
              }}
            />
          </div>

          {/* Point Ticks */}
          <div className="mt-4 flex items-center justify-between">
            {MOMENTS.map((m, i) => {
              const isActive = open === m.time;
              const accent =
                m.service === "food"
                  ? "var(--food)"
                  : m.service === "rides"
                    ? "var(--rides)"
                    : m.service === "essentials"
                      ? "var(--essentials)"
                      : "var(--text)";

              return (
                <button
                  key={m.time}
                  type="button"
                  onClick={() => {
                    setIsManual(true);
                    setOpen(m.time);
                  }}
                  className={`group flex flex-col items-center gap-1.5 transition-all duration-300 ${
                    isActive ? "scale-110 opacity-100" : "opacity-50 hover:opacity-100"
                  }`}
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                      isActive ? "scale-125 ring-4 ring-white/20" : ""
                    }`}
                    style={{
                      background: isActive ? accent : "transparent",
                      border: `2px solid ${accent}`,
                      boxShadow: isActive ? `0 0 10px ${accent}` : "none",
                    }}
                  />
                  <span className="font-mono text-[12px] font-bold tracking-wider text-[var(--text)]">
                    {m.time}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5-Column Punchy Point-Based Grid Matrix */}
        <div className="relative mx-auto my-auto w-full max-w-[1400px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {MOMENTS.map((m, i) => {
              const isOpen = open === m.time;
              const accent =
                m.service === "food"
                  ? "var(--food)"
                  : m.service === "rides"
                    ? "var(--rides)"
                    : m.service === "essentials"
                      ? "var(--essentials)"
                      : "var(--text)";

              // Clean point-based summary bullet points
              const pointLocations: Record<string, string> = {
                "08:12": "Outside Gate",
                "13:18": "Hostel Block",
                "17:47": "Market Road",
                "21:09": "Downstairs Store",
                "23:14": "Night Canteen",
              };

              return (
                <div
                  key={m.time}
                  className={`group relative rounded-2xl border transition-all duration-500 overflow-hidden flex flex-col justify-between ${
                    isOpen
                      ? "scale-[1.03] shadow-[0_20px_45px_-12px_rgba(0,0,0,0.6)] z-20 ring-1 ring-white/10"
                      : "opacity-75 hover:opacity-100 hover:scale-[1.01] z-10"
                  }`}
                  style={{
                    borderColor: isOpen ? accent : "var(--border)",
                    background: isOpen ? "var(--surface-2)" : "var(--surface)",
                    boxShadow: isOpen ? `0 14px 36px -8px ${accent}40` : "none",
                  }}
                >
                  {/* Top Color Accent Bar */}
                  <div
                    className="h-1.5 w-full transition-all duration-300"
                    style={{
                      background: accent,
                      opacity: isOpen ? 1 : 0.35,
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => {
                      setIsManual(true);
                      setOpen(m.time);
                    }}
                    aria-expanded={isOpen}
                    data-cursor="link"
                    className="w-full p-4 text-left transition-all duration-300 flex-1 flex flex-col justify-between gap-3"
                  >
                    {/* Time & Service Header */}
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="num text-[clamp(1.7rem,2.4vw,2.2rem)] font-extrabold tracking-[-0.04em] font-mono leading-none">
                          {m.time}
                        </span>
                        <span className="micro text-[9.5px] font-mono font-semibold tracking-widest px-2.5 py-1 rounded-full border border-[var(--border)] bg-[var(--shade)] text-[var(--muted)] shrink-0">
                          {m.service === "none" ? "NO SYSTEM" : SERVICE_META[m.service].label.toUpperCase()}
                        </span>
                      </div>

                      <p className="mt-2.5 text-[15px] font-bold leading-tight transition-colors group-hover:text-ink text-[var(--text)]">
                        {m.line}
                      </p>
                    </div>

                    {/* Punchy Point-Based Details */}
                    <div className="space-y-2 border-t border-[var(--border)]/60 pt-3">
                      <div className="flex items-center gap-2 text-[12px] font-mono text-[var(--text)]/90">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
                        <span>📍 {pointLocations[m.time] || "Campus Hub"}</span>
                      </div>

                      <div className="flex items-center gap-2 text-[11.5px] font-mono text-[var(--muted)]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--muted)]/50" />
                        <span>⚡ Isolated App</span>
                      </div>
                    </div>

                    {/* Bottom Status Tag */}
                    <div className="flex items-center justify-between border-t border-[var(--border)]/40 pt-2.5 mt-1">
                      <span className="micro font-mono text-[10px] font-semibold tracking-wider" style={{ color: isOpen ? accent : "var(--muted)" }}>
                        {isOpen ? "ACTIVE POINT" : "POINT"}
                      </span>
                      <span className="micro font-mono text-[10px] text-[var(--muted)] opacity-75">
                        0{i + 1}/05
                      </span>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Info Strip */}
        <div className="relative mx-auto w-full max-w-[1400px] flex items-center justify-between border-t border-[var(--border)] pt-4 text-[12px] font-mono text-[var(--muted)]">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: activeAccent }} />
            5 UNCONNECTED APPS
          </span>
          <span className="hidden sm:inline">5 CAMPUS MOMENTS · ONE UNIFIED KART SOLUTION</span>
          <span className="font-semibold transition-colors duration-300" style={{ color: activeAccent }}>
            SCROLL TO RESOLVE ↓
          </span>
        </div>
      </div>
    </section>
  );
}
