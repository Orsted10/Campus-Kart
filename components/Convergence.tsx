"use client";

import { useEffect, useRef } from "react";
import { MOMENTS } from "@/lib/data";
import { useReducedMotion } from "@/lib/store";
import { gsap, ScrollTrigger } from "@/lib/motion";

const FRAGMENTS = [
  { d: "M70,110 C 120,90 150,130 200,110", color: "var(--food)", ink: "var(--food-ink)", lx: 70, ly: 96, label: "FOOD" },
  { d: "M560,70 C 610,100 650,60 710,90", color: "var(--rides)", ink: "var(--rides-ink)", lx: 560, ly: 56, label: "RIDES" },
  { d: "M240,420 C 290,450 330,410 380,440", color: "var(--essentials)", ink: "var(--essentials-ink)", lx: 240, ly: 410, label: "STORE" },
  { d: "M560,400 C 610,430 660,390 720,420", color: "var(--muted)", ink: "var(--muted)", lx: 560, ly: 390, label: "STATIONERY" },
  { d: "M40,320 C 90,350 120,310 170,340", color: "var(--muted)", ink: "var(--muted)", lx: 40, ly: 310, label: "HOSTEL" },
  { d: "M310,50 C 360,80 400,40 450,70", color: "var(--muted)", ink: "var(--muted)", lx: 310, ly: 40, label: "GATE" },
];

const UNIFIED = [
  { d: "M60,80 C 180,140 300,220 400,280", color: "var(--food)" },
  { d: "M400,26 C 400,120 400,200 400,280", color: "var(--rides)" },
  { d: "M740,80 C 620,150 480,220 400,280", color: "var(--essentials)" },
  { d: "M760,480 C 640,410 480,330 400,280", color: "var(--rides)" },
  { d: "M400,534 C 400,430 400,350 400,280", color: "var(--food)" },
  { d: "M50,480 C 170,410 320,330 400,280", color: "var(--essentials)" },
];

const BLOCKS = [
  { x: 96, y: 96, w: 120, h: 74, dx: -70, dy: -40, r: -9 },
  { x: 300, y: 66, w: 96, h: 62, dx: 30, dy: -60, r: 7 },
  { x: 560, y: 120, w: 128, h: 70, dx: 70, dy: -20, r: -6 },
  { x: 130, y: 330, w: 110, h: 80, dx: -60, dy: 50, r: 8 },
  { x: 330, y: 400, w: 140, h: 66, dx: 10, dy: 70, r: -7 },
  { x: 580, y: 350, w: 116, h: 78, dx: 66, dy: 46, r: 5 },
];

export default function Convergence() {
  const section = useRef<HTMLElement | null>(null);
  const fragGroup = useRef<SVGGElement | null>(null);
  const unifiedGroup = useRef<SVGGElement | null>(null);
  const blockGroup = useRef<SVGGElement | null>(null);
  const center = useRef<SVGGElement | null>(null);
  const headline = useRef<HTMLDivElement | null>(null);
  const subline = useRef<HTMLDivElement | null>(null);
  const veil = useRef<HTMLDivElement | null>(null);
  const chipsRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const paths = Array.from(unifiedGroup.current?.querySelectorAll("path") ?? []);
      paths.forEach((p) => {
        const len = p.getTotalLength();
        p.style.strokeDasharray = `${len}`;
        p.style.strokeDashoffset = `${len}`;
      });

      const clamp = (v: number) => Math.min(1, Math.max(0, v));

      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          const p = reduced ? 1 : self.progress;
          const p1 = clamp(p / 0.5);
          const p2 = clamp((p - 0.16) / 0.44);
          const p3 = clamp((p - 0.6) / 0.24);
          const p4 = clamp((p - 0.06) / 0.46);

          if (fragGroup.current) {
            fragGroup.current.style.opacity = `${1 - p1}`;
            fragGroup.current.style.transform = `scale(${1 + p1 * 0.12})`;
            fragGroup.current.style.transformOrigin = "center";
          }
          if (blockGroup.current) {
            blockGroup.current.querySelectorAll("rect[data-dx]").forEach((r) => {
              const dx = Number(r.getAttribute("data-dx"));
              const dy = Number(r.getAttribute("data-dy"));
              const rr = Number(r.getAttribute("data-r"));
              r.setAttribute(
                "transform",
                `translate(${dx * (1 - p1)} ${dy * (1 - p1)}) rotate(${rr * (1 - p1)})`,
              );
            });
          }
          paths.forEach((path, i) => {
            const len = path.getTotalLength();
            const local = clamp(p2 * 1.5 - i * 0.09);
            path.style.strokeDashoffset = `${len * (1 - local)}`;
          });
          if (center.current) {
            const s = 0.35 + p2 * 0.65 + p3 * 0.35;
            center.current.style.transform = `scale(${s})`;
            center.current.style.transformOrigin = "400px 280px";
            center.current.style.opacity = `${clamp(p2 * 2)}`;
          }
          if (chipsRef.current) {
            chipsRef.current.querySelectorAll<HTMLElement>("[data-chip]").forEach((c) => {
              const cx = Number(c.dataset.cx);
              const cy = Number(c.dataset.cy);
              c.style.transform = `translate(${-cx * p4}px, ${-cy * p4}px) rotate(${(1 - p4) * 6}deg)`;
              c.style.opacity = `${1 - clamp((p4 - 0.6) / 0.4)}`;
            });
          }
          if (veil.current) veil.current.style.opacity = `${clamp((p3 - 0.15) / 0.6)}`;
          if (headline.current) {
            headline.current.style.opacity = `${clamp(p3 * 1.6)}`;
            headline.current.style.clipPath = `inset(0 0 ${(1 - clamp(p3 * 1.25)) * 100}% 0)`;
            headline.current.style.transform = `translateY(${(1 - clamp(p3 * 1.25)) * 26}px)`;
          }
          if (subline.current) subline.current.style.opacity = `${clamp((p3 - 0.7) / 0.3)}`;
        },
      });
    }, el);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section id="connect" ref={section} className="relative h-[320vh]">
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-24 sm:px-8 lg:px-[4vw]">
          <span className="micro">connect</span>
          <span className="micro">
            system state · <span className="text-blue">synchronising</span>
          </span>
        </div>

        <div className="relative flex flex-1 items-center justify-center">
          <svg
            viewBox="0 0 800 560"
            className="h-[68vh] w-[92vw] max-w-[1150px]"
            aria-hidden="true"
            style={{ overflow: "visible" }}
          >
            <g ref={blockGroup}>
              {BLOCKS.map((b, i) => (
                <rect
                  key={i}
                  x={b.x}
                  y={b.y}
                  width={b.w}
                  height={b.h}
                  data-dx={b.dx}
                  data-dy={b.dy}
                  data-r={b.r}
                  rx="2"
                  fill="var(--scene-block)"
                  stroke="var(--scene-line)"
                  strokeWidth="1.2"
                  opacity="0.9"
                />
              ))}
            </g>

            <g ref={fragGroup} style={{ transition: "none" }}>
              {FRAGMENTS.map((f) => (
                <g key={f.label}>
                  <path d={f.d} fill="none" stroke={f.color} strokeWidth="2" strokeDasharray="6 8" />
                  <text
                    x={f.lx}
                    y={f.ly}
                    fontSize="11"
                    letterSpacing="1.6"
                    fill={f.ink}
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {f.label}
                  </text>
                </g>
              ))}
            </g>

            <g ref={unifiedGroup} strokeLinecap="round">
              {UNIFIED.map((u) => (
                <g key={u.d}>
                  <path d={u.d} fill="none" stroke={u.color} strokeWidth="7" opacity="0.14" />
                  <path d={u.d} fill="none" stroke={u.color} strokeWidth="2" />
                </g>
              ))}
            </g>

            <g ref={center}>
              <circle cx="400" cy="280" r="34" fill="none" stroke="var(--blue)" strokeWidth="1" opacity="0.5" />
              <circle cx="400" cy="280" r="18" fill="var(--bg)" stroke="var(--blue)" strokeWidth="2" />
              <circle cx="400" cy="280" r="5" fill="var(--blue)" />
            </g>
          </svg>

          {/* day-in-the-life chips collapsing into the system */}
          <div ref={chipsRef} className="pointer-events-none absolute inset-0 hidden lg:block">
            {MOMENTS.map((m, i) => {
              const pos = [
                { l: "6%", t: "24%", cx: 26, cy: 8 },
                { l: "74%", t: "16%", cx: -34, cy: 14 },
                { l: "82%", t: "66%", cx: -40, cy: -18 },
                { l: "14%", t: "72%", cx: 28, cy: -20 },
                { l: "46%", t: "8%", cx: 2, cy: 26 },
                { l: "44%", t: "86%", cx: 4, cy: -30 },
              ][i];
              return (
                <span
                  key={m.time}
                  data-chip
                  data-cx={pos.cx}
                  data-cy={pos.cy}
                  className="num absolute border border-line px-3 py-1.5 text-[12px]"
                  style={{
                    left: pos.l,
                    top: pos.t,
                    background: "var(--surface)",
                    color: "var(--muted)",
                    willChange: "transform",
                  }}
                >
                  {m.time} · {m.service === "rides" ? "ride" : m.service === "food" ? "food" : "supply"}
                </span>
              );
            })}
          </div>

          {/* veil + headline */}
          <div
            ref={veil}
            className="pointer-events-none absolute inset-0"
            style={{ opacity: 0, background: "radial-gradient(55% 55% at 50% 50%, var(--bg) 42%, transparent 100%)" }}
            aria-hidden="true"
          />
          <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 px-5 text-center">
            <div ref={headline} style={{ opacity: 0 }}>
              <h2 className="display text-[clamp(2.3rem,7vw,6rem)]">
                ONE CAMPUS.
                <br />
                ONE <span className="serif-accent text-blue">ecosystem.</span>
              </h2>
            </div>
            <p ref={subline} className="micro mx-auto mt-6 max-w-[46ch] leading-relaxed" style={{ opacity: 0 }}>
              Food. Movement. Essentials. People. Places. — one system that finally points the same way.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between px-5 pb-6 sm:px-8 lg:px-[4vw]">
          <span className="micro">Fragments 06 → routes 06 → network 01</span>
          <span className="micro">scroll reverses this</span>
        </div>
      </div>
    </section>
  );
}
