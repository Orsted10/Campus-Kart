"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/store";
import { gsap, ScrollTrigger } from "@/lib/motion";

const UNIFIED = [
  { d: "M152,108 C 220,160 310,220 400,280", color: "#f97316" },
  { d: "M400,121 C 400,160 400,220 400,280", color: "#3b82f6" },
  { d: "M647,108 C 580,160 490,220 400,280", color: "#10b981" },
  { d: "M152,383 C 220,350 310,310 400,280", color: "#10b981" },
  { d: "M400,385 C 400,350 400,310 400,280", color: "#f97316" },
  { d: "M647,383 C 580,350 490,310 400,280", color: "#3b82f6" },
];

const BLOCKS = [
  {
    x: 80,
    y: 70,
    w: 145,
    h: 76,
    dx: -80,
    dy: -50,
    r: -9,
    service: "food",
    dotColor: "#f97316",
    tag: "FOOD HUB",
    title: "Resto & Eats",
    sub: "Outside Deliveries",
  },
  {
    x: 327.5,
    y: 45,
    w: 145,
    h: 76,
    dx: 0,
    dy: -70,
    r: 6,
    service: "rides",
    dotColor: "#3b82f6",
    tag: "GATE STAND",
    title: "Outside Gate",
    sub: "Cabs & Outstation",
  },
  {
    x: 575,
    y: 70,
    w: 145,
    h: 76,
    dx: 80,
    dy: -50,
    r: -6,
    service: "essentials",
    dotColor: "#10b981",
    tag: "ACADEMICS",
    title: "Block F & E",
    sub: "Classrooms & Labs",
  },
  {
    x: 80,
    y: 345,
    w: 145,
    h: 76,
    dx: -80,
    dy: 50,
    r: 8,
    service: "essentials",
    dotColor: "#10b981",
    tag: "HOSTELS",
    title: "Hostels 1 & 2",
    sub: "Night Deliveries",
  },
  {
    x: 327.5,
    y: 385,
    w: 145,
    h: 76,
    dx: 0,
    dy: 70,
    r: -5,
    service: "food",
    dotColor: "#f97316",
    tag: "STORE & MART",
    title: "Stationery Mart",
    sub: "Prints & Supplies",
  },
  {
    x: 575,
    y: 345,
    w: 145,
    h: 76,
    dx: 80,
    dy: 50,
    r: 7,
    service: "rides",
    dotColor: "#3b82f6",
    tag: "EXPRESS RIDE",
    title: "City Commute",
    sub: "Unnao/Lucknow Direct",
  },
];

export default function Convergence() {
  const section = useRef<HTMLElement | null>(null);
  const unifiedGroup = useRef<SVGGElement | null>(null);
  const blockGroup = useRef<SVGGElement | null>(null);
  const center = useRef<SVGGElement | null>(null);
  const headline = useRef<HTMLDivElement | null>(null);
  const subline = useRef<HTMLDivElement | null>(null);
  const veil = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const paths = Array.from(unifiedGroup.current?.querySelectorAll("path[data-ray]") ?? []);
      paths.forEach((p) => {
        const len = (p as SVGPathElement).getTotalLength();
        (p as SVGPathElement).style.strokeDasharray = `${len}`;
        (p as SVGPathElement).style.strokeDashoffset = `${len}`;
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

          if (blockGroup.current) {
            blockGroup.current.querySelectorAll("g[data-dx]").forEach((r) => {
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
            const len = (path as SVGPathElement).getTotalLength();
            const local = clamp(p2 * 1.5 - i * 0.09);
            (path as SVGPathElement).style.strokeDashoffset = `${len * (1 - local)}`;
          });
          if (center.current) {
            const s = 0.5 + p2 * 0.5 + p3 * 0.2;
            center.current.style.transform = `scale(${s})`;
            center.current.style.transformOrigin = "400px 280px";
            center.current.style.opacity = `${clamp(p2 * 2)}`;
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
    <section id="connect" ref={section} className="relative h-[320vh] bg-[var(--bg)] text-[var(--text)]">
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 pt-20 sm:px-8 lg:px-[4vw]">
          <span className="micro font-mono text-[11.5px] tracking-wider text-[var(--muted)]">
            connect
          </span>
          <span className="micro font-mono text-[11.5px] tracking-wider text-[var(--muted)]">
            system state · <span className="text-[var(--blue-ink)] font-semibold">synchronising</span>
          </span>
        </div>

        {/* Interactive Schematic Diagram */}
        <div className="relative flex flex-1 items-center justify-center">
          <svg
            viewBox="0 0 800 560"
            className="h-[72vh] w-[94vw] max-w-[1200px]"
            aria-hidden="true"
            style={{ overflow: "visible" }}
          >
            {/* Background Grid Pattern */}
            <defs>
              <pattern id="dot-grid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="currentColor" className="text-white/[0.04]" />
              </pattern>
            </defs>
            <rect width="800" height="560" fill="url(#dot-grid)" />

            {/* Crisp Vectors Rays */}
            <g ref={unifiedGroup} strokeLinecap="round">
              {UNIFIED.map((u, i) => (
                <g key={i}>
                  {/* Outer subtle guide ray */}
                  <path d={u.d} fill="none" stroke={u.color} strokeWidth="1" opacity="0.2" strokeDasharray="3 4" />
                  {/* Main animated vector ray */}
                  <path data-ray d={u.d} fill="none" stroke={u.color} strokeWidth="1.8" opacity="0.9" />
                </g>
              ))}
            </g>

            {/* 6 Clean Node Cards */}
            <g ref={blockGroup}>
              {BLOCKS.map((b, i) => (
                <g key={i} data-dx={b.dx} data-dy={b.dy} data-r={b.r} className="transition-all duration-300">
                  {/* Card Background - Clean dark matte panel with fine hairline border */}
                  <rect
                    x={b.x}
                    y={b.y}
                    width={b.w}
                    height={b.h}
                    rx="10"
                    fill="var(--surface)"
                    stroke="var(--border)"
                    strokeWidth="1"
                    className="backdrop-blur-md"
                  />
                  {/* Card Category Badge */}
                  <rect
                    x={b.x + 10}
                    y={b.y + 10}
                    width={b.tag.length * 6 + 14}
                    height="16"
                    rx="8"
                    fill="var(--shade)"
                    stroke="var(--border)"
                    strokeWidth="0.8"
                  />
                  <circle cx={b.x + 16} cy={b.y + 18} r="2.5" fill={b.dotColor} />
                  <text
                    x={b.x + 23}
                    y={b.y + 21}
                    fontSize="8"
                    fontWeight="600"
                    letterSpacing="0.1em"
                    fill="var(--muted)"
                    fontFamily="var(--font-mono)"
                  >
                    {b.tag}
                  </text>
                  {/* Card Title */}
                  <text
                    x={b.x + 12}
                    y={b.y + 44}
                    fontSize="11"
                    fontWeight="600"
                    fill="var(--text)"
                    fontFamily="var(--font-mono)"
                  >
                    {b.title}
                  </text>
                  {/* Card Subtitle */}
                  <text
                    x={b.x + 12}
                    y={b.y + 60}
                    fontSize="8.5"
                    fill="var(--muted)"
                    fontFamily="var(--font-mono)"
                  >
                    {b.sub}
                  </text>
                </g>
              ))}
            </g>

            {/* Center Origin Node */}
            <g ref={center}>
              <circle cx="400" cy="280" r="40" fill="none" stroke="var(--border)" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
              <circle cx="400" cy="280" r="22" fill="var(--bg)" stroke="var(--blue)" strokeWidth="1.8" />
              <circle cx="400" cy="280" r="5" fill="var(--blue)" />

              <rect x="340" y="312" width="120" height="18" rx="9" fill="var(--surface)" stroke="var(--border)" strokeWidth="1" />
              <text x="400" y="324" textAnchor="middle" fontSize="8.5" fontWeight="600" letterSpacing="0.15em" fill="var(--muted)" fontFamily="var(--font-mono)">
                CAMPUSKART CORE
              </text>
            </g>
          </svg>

          {/* Radial Glow Veil & Converged Headline */}
          <div
            ref={veil}
            className="pointer-events-none absolute inset-0 transition-opacity duration-300"
            style={{ opacity: 0, background: "radial-gradient(55% 55% at 50% 50%, var(--bg) 40%, transparent 100%)" }}
            aria-hidden="true"
          />
          <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 px-5 text-center">
            <div ref={headline} style={{ opacity: 0 }}>
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-1 mb-5 backdrop-blur-md shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--blue)]" />
                <span className="micro font-mono text-[10.5px] tracking-widest text-[var(--muted)] uppercase font-medium">
                  SYSTEM SYNCHRONIZED
                </span>
              </div>
              <h2 className="display text-[clamp(2.5rem,6.6vw,5.6rem)] leading-[1.02] tracking-[-0.035em] pb-3">
                ONE CAMPUS.
                <br />
                EVERYTHING <span className="serif-accent text-blue italic inline-block pb-2">connected.</span>
              </h2>
            </div>
            <p ref={subline} className="micro mx-auto mt-4 max-w-[38ch] text-[1rem] text-[var(--muted)] leading-relaxed font-mono" style={{ opacity: 0 }}>
              Food, rides & essentials — unified into one real-time pipeline.
            </p>
          </div>
        </div>

        {/* Footer info bar */}
        <div className="flex items-center justify-between px-5 pb-6 sm:px-8 lg:px-[4vw]">
          <span className="micro font-mono text-[11.5px] tracking-wider text-[var(--muted)]">
            FRAGMENTS 06 → ROUTES 06 → <span className="text-[var(--text)] font-medium">NETWORK 01</span>
          </span>
          <span className="micro font-mono text-[11.5px] tracking-wider text-[var(--muted)]">
            scroll reverses this
          </span>
        </div>
      </div>
    </section>
  );
}
