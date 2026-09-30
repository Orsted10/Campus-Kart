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
  const currentMoment = MOMENTS[activeIndex >= 0 ? activeIndex : 0];
  const activeAccent =
    currentMoment.service === "food"
      ? "var(--food)"
      : currentMoment.service === "rides"
        ? "var(--rides)"
        : currentMoment.service === "essentials"
          ? "var(--essentials)"
          : "var(--text)";

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
              RECOGNIZE THE FRAGMENTATION · MOMENT 0{activeIndex >= 0 ? activeIndex + 1 : 1}/05
            </span>
          </div>

          <div className="mt-4 grid gap-6 lg:grid-cols-[1.15fr_1fr] lg:items-end">
            <h2 className="display text-[clamp(2.2rem,5.2vw,4.6rem)] leading-[0.94] tracking-[-0.035em]">
              YOU KNOW
              <br />
              THIS <span className="serif-accent italic transition-colors duration-500" style={{ color: activeAccent }}>chaos.</span>
            </h2>
            <p className="lede lg:justify-self-end lg:text-right text-[var(--muted)] text-[1.02rem] leading-relaxed max-w-[38ch]">
              Five ordinary minutes of campus life. Each one runs on its own disconnected app — zero coordination, endless frustration.
            </p>
          </div>
        </div>

        {/* 24-Hour Interactive Timeline Track */}
        <div className="relative mx-auto w-full max-w-[1400px] my-4">
          <div className="relative h-1 w-full rounded-full bg-[var(--border)]/40 overflow-hidden">
            {/* Filled timeline bar */}
            <div
              className="absolute left-0 top-0 bottom-0 transition-all duration-500 rounded-full"
              style={{
                width: `${((activeIndex + 0.5) / 5) * 100}%`,
                background: activeAccent,
                boxShadow: `0 0 12px ${activeAccent}`,
              }}
            />
          </div>

          {/* Time Ticks */}
          <div className="mt-2.5 flex items-center justify-between px-1">
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
                  className={`group relative flex flex-col items-center gap-1 transition-all duration-300 ${
                    isActive ? "scale-110" : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full border transition-all duration-300 ${
                      isActive ? "ring-4 ring-white/10" : ""
                    }`}
                    style={{
                      background: isActive ? accent : "var(--surface)",
                      borderColor: accent,
                      boxShadow: isActive ? `0 0 10px ${accent}` : "none",
                    }}
                  />
                  <span className="font-mono text-[11px] font-semibold tracking-wider text-[var(--text)]">
                    {m.time}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5-Column Non-Overlapping Grid Matrix */}
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

              const inkColor =
                m.service === "food"
                  ? "var(--food-ink)"
                  : m.service === "rides"
                    ? "var(--rides-ink)"
                    : m.service === "essentials"
                      ? "var(--essentials-ink)"
                      : "var(--muted)";

              return (
                <div
                  key={m.time}
                  className={`group relative rounded-2xl border transition-all duration-500 overflow-hidden flex flex-col justify-between ${
                    isOpen
                      ? "scale-[1.02] shadow-[0_20px_45px_-12px_rgba(0,0,0,0.5)] z-20"
                      : "opacity-75 hover:opacity-100 hover:scale-[1.01] z-10"
                  }`}
                  style={{
                    borderColor: isOpen ? accent : "var(--border)",
                    background: isOpen ? "var(--surface-2)" : "var(--surface)",
                    boxShadow: isOpen ? `0 14px 36px -8px ${accent}35` : "none",
                  }}
                >
                  {/* Top Color Accent Line */}
                  <div
                    className="h-1 w-full transition-all duration-300"
                    style={{
                      background: accent,
                      opacity: isOpen ? 1 : 0.3,
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => {
                      setIsManual(true);
                      setOpen(isOpen ? null : m.time);
                    }}
                    aria-expanded={isOpen}
                    data-cursor="link"
                    className="w-full p-4 text-left transition-all duration-300 flex-1 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="num text-[clamp(1.6rem,2.2vw,2.1rem)] font-extrabold tracking-[-0.04em] font-mono leading-none">
                          {m.time}
                        </span>
                        <span className="micro text-[9px] font-mono tracking-widest px-2 py-0.5 rounded-full border border-[var(--border)] bg-[var(--shade)] text-[var(--muted)] shrink-0">
                          {m.service === "none" ? "NO SYSTEM" : SERVICE_META[m.service].label.toUpperCase()}
                        </span>
                      </div>

                      <p className="mt-2 text-[14px] font-medium leading-snug transition-colors group-hover:text-ink text-[var(--text)]">
                        {m.line}
                      </p>
                    </div>

                    {/* Scene Details (Expanded) */}
                    <div
                      className="overflow-hidden transition-all duration-500"
                      style={{
                        maxHeight: isOpen ? 160 : 0,
                        opacity: isOpen ? 1 : 0,
                      }}
                    >
                      <div className="border-t border-[var(--border)]/60 pt-2.5">
                        <p className="text-[12.5px] leading-relaxed text-[var(--muted)]">{m.scene}</p>
                        <div className="mt-2.5 flex items-center justify-between border-t border-[var(--border)]/40 pt-2">
                          <span className="micro font-mono text-[9.5px]" style={{ color: inkColor }}>
                            {m.service === "none" ? "Isolated app" : `Pipelined to ${SERVICE_META[m.service].label}`}
                          </span>
                          <span className="micro font-mono text-[9.5px] text-[var(--muted)] opacity-75">
                            0{i + 1}/05
                          </span>
                        </div>
                      </div>
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
