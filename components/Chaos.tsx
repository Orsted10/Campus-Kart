"use client";

import { useState } from "react";
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
  const [open, setOpen] = useState<string | null>("17:47");
  const headRef = useReveal<HTMLDivElement>(24);

  return (
    <section id="chaos" className="relative overflow-hidden px-5 pb-[4vh] pt-[6vh] sm:px-8">
      {/* Background Constellation Lines */}
      <div className="pointer-events-none absolute inset-0 select-none opacity-30" aria-hidden="true">
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

      <div ref={headRef} className="relative mx-auto max-w-[1400px]">
        <div className="inline-flex items-center gap-2.5 rounded-full border border-[var(--border)] bg-[var(--surface)]/80 px-3.5 py-1.5 backdrop-blur-md shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--food)] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--food)] shadow-[0_0_8px_var(--food)]" />
          </span>
          <span className="micro font-mono text-[11px] tracking-[0.18em] text-[var(--text)] font-medium">
            ACT II · RECOGNIZE THE FRAGMENTATION
          </span>
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:items-end">
          <h2 className="display text-[clamp(2.5rem,6.2vw,5.5rem)] leading-[0.94] tracking-[-0.035em]">
            YOU KNOW
            <br />
            THIS <span className="serif-accent text-food italic">chaos.</span>
          </h2>
          <p className="lede lg:justify-self-end lg:text-right text-[var(--muted)] text-[1.1rem] leading-relaxed max-w-[36ch]">
            Five ordinary minutes of campus life. Each one runs on its own disconnected app — none of them talk to each other.
          </p>
        </div>
      </div>

      {/* Spatial Time Cards Matrix */}
      <div className="relative mx-auto mt-[3vh] max-w-[1400px] lg:h-[42vh]">
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
              className="mb-6 lg:absolute lg:mb-0 transition-transform duration-500"
              style={{
                left: `${m.x}%`,
                top: `${m.y}%`,
                transform: `rotate(${m.rot}deg)`,
                width: "min(88vw, 320px)",
                zIndex: isOpen ? 30 : 10 - i,
              }}
            >
              <div
                className="group relative w-full rounded-2xl border backdrop-blur-xl transition-all duration-500 overflow-hidden shadow-[0_16px_40px_-12px_rgba(0,0,0,0.35)]"
                style={{
                  borderColor: isOpen ? accent : "var(--border)",
                  background: isOpen ? "var(--surface-2)" : "var(--surface)",
                  boxShadow: isOpen ? `0 12px 32px -6px ${accent}40` : "none",
                }}
              >
                {/* Active side indicator glow */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 transition-all duration-300"
                  style={{
                    background: accent,
                    opacity: isOpen ? 1 : 0.4,
                  }}
                />

                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : m.time)}
                  aria-expanded={isOpen}
                  data-cursor="link"
                  className="w-full p-4.5 text-left transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <span className="num text-[clamp(1.75rem,3.2vw,2.4rem)] font-extrabold tracking-[-0.04em] font-mono leading-none">
                      {m.time}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="micro text-[9.5px] font-mono tracking-widest px-2 py-0.5 rounded-full border border-[var(--border)] bg-[var(--shade)] text-[var(--muted)]">
                        {m.service === "none" ? "NO SYSTEM" : SERVICE_META[m.service].label.toUpperCase()}
                      </span>
                      <span
                        className="h-2 w-2 rounded-full transition-all duration-500"
                        style={{
                          background: accent,
                          transform: isOpen ? "scale(1.4)" : "scale(1)",
                          boxShadow: isOpen ? `0 0 10px ${accent}` : "none",
                        }}
                      />
                    </div>
                  </div>

                  <p className="mt-2 text-[14.5px] font-medium leading-snug transition-colors group-hover:text-ink text-[var(--text)]">
                    {m.line}
                  </p>
                </button>

                <div
                  className="overflow-hidden transition-all duration-500"
                  style={{
                    maxHeight: isOpen ? 180 : 0,
                    opacity: isOpen ? 1 : 0,
                  }}
                >
                  <div className="mx-4 mb-4 border-t border-[var(--border)]/60 pt-3">
                    <p className="text-[13px] leading-relaxed text-[var(--muted)]">{m.scene}</p>
                    <div className="mt-3 flex items-center justify-between border-t border-[var(--border)]/40 pt-2.5">
                      <span className="micro font-mono text-[10px]" style={{ color: inkColor }}>
                        {m.service === "none" ? "Isolated app" : `Pipelined to ${SERVICE_META[m.service].label}`}
                      </span>
                      <span className="micro font-mono text-[10px] text-[var(--muted)] opacity-75">
                        FRAGMENT 0{i + 1}/05
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="relative mx-auto mt-[1vh] max-w-[1400px] flex items-center justify-between border-t border-[var(--border)] pt-4 text-[12px] font-mono text-[var(--muted)]">
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--food)]" /> 5 UNCONNECTED APPS
        </span>
        <span className="hidden sm:inline">5 CAMPUS MOMENTS · ONE UNIFIED KART SOLUTION</span>
        <span className="text-[var(--food-ink)] font-semibold">SCROLL TO RESOLVE ↓</span>
      </div>
    </section>
  );
}
