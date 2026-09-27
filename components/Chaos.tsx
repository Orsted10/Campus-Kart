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
  const [open, setOpen] = useState<string | null>(null);
  const headRef = useReveal<HTMLDivElement>(24);

  return (
    <section id="chaos" className="relative overflow-hidden px-5 pb-[14vh] pt-[10vh] sm:px-8">
      {/* disconnected fragments in the background */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <svg viewBox="0 0 760 460" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          {FRAG_PATHS.map((f, i) => (
            <path
              key={i}
              d={f.d}
              transform={`rotate(${f.rot} 380 230)`}
              fill="none"
              stroke={f.color}
              strokeWidth="1.6"
              strokeDasharray="5 7"
              opacity="0.45"
            />
          ))}
        </svg>
      </div>

      <div ref={headRef} className="relative mx-auto max-w-[1400px]">
        <div className="flex items-center gap-3">
          <span className="h-px w-8" style={{ background: "var(--food)" }} />
          <span className="micro">Act II — recognise</span>
        </div>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:items-end">
          <h2 className="display text-[clamp(2.4rem,6.4vw,5.4rem)]">
            YOU KNOW
            <br />
            THIS <span className="serif-accent text-food">chaos.</span>
          </h2>
          <p className="lede lg:justify-self-end lg:text-right">
            Five ordinary minutes of campus life. Each one runs on its own system — none of them talk
            to each other.
          </p>
        </div>
      </div>

      {/* scattered moments — spatial on desktop, stacked on mobile */}
      <div className="relative mx-auto mt-[8vh] max-w-[1400px] lg:h-[62vh]">
        {MOMENTS.map((m, i) => {
          const isOpen = open === m.time;
          const accent =
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
              className="mb-6 lg:absolute lg:mb-0"
              style={{
                left: `${m.x}%`,
                top: `${m.y}%`,
                transform: `rotate(${m.rot}deg)`,
                width: "min(86vw, 300px)",
              }}
            >
              <div className="w-full">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : m.time)}
                  aria-expanded={isOpen}
                  data-cursor="link"
                  className="group w-full border-l-2 bg-transparent px-4 py-3 text-left transition-all duration-500 hover:translate-x-1"
                  style={{
                    borderColor: isOpen ? accent : "var(--border)",
                    background: isOpen ? "var(--surface)" : "transparent",
                  }}
                >
                  <span className="num block text-[clamp(1.6rem,3vw,2.3rem)] font-medium tracking-[-0.04em]">
                    {m.time}
                  </span>
                  <span className="mt-1 flex items-center justify-between gap-3">
                    <span className="text-[15px] text-muted transition-colors group-hover:text-ink">
                      {m.line}
                    </span>
                    <span
                      className="h-1.5 w-1.5 rounded-full transition-all duration-500"
                      style={{
                        background: accent,
                        transform: isOpen ? "scale(1.9)" : "scale(1)",
                      }}
                    />
                  </span>
                </button>

                <div
                  className="overflow-hidden transition-all duration-500"
                  style={{
                    maxHeight: isOpen ? 190 : 0,
                    opacity: isOpen ? 1 : 0,
                  }}
                >
                  <div className="ml-4 mt-2 border-l border-line pl-4">
                    <p className="text-[13.5px] leading-relaxed text-muted">{m.scene}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="micro" style={{ color: accent }}>
                        {m.service === "none" ? "no system" : SERVICE_META[m.service].label}
                      </span>
                      <span className="h-px w-6" style={{ background: accent }} />
                      <span className="micro opacity-75">fragment {i + 1}/5</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="relative mx-auto mt-[6vh] max-w-[1400px] border-t border-line pt-5">
        <p className="micro">
          Five moments · five separate apps · one student · <span className="text-food">scroll</span>
        </p>
      </div>
    </section>
  );
}
