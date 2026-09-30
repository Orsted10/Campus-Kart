"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/store";
import { gsap, ScrollTrigger } from "@/lib/motion";

const UNIFIED = [
  { id: "food-hub", d: "M 240,112 C 300,112 330,240 400,280", color: "#f97316", label: "FOOD HUB" },
  { id: "gate-stand", d: "M 400,124 C 400,170 400,220 400,280", color: "#3b82f6", label: "GATE STAND" },
  { id: "academics", d: "M 560,112 C 500,112 470,240 400,280", color: "#10b981", label: "ACADEMICS" },
  { id: "hostels", d: "M 240,387 C 300,387 330,320 400,280", color: "#10b981", label: "HOSTELS" },
  { id: "store-mart", d: "M 400,375 C 400,340 400,310 400,280", color: "#f97316", label: "STORE & MART" },
  { id: "express-ride", d: "M 560,387 C 500,387 470,320 400,280", color: "#3b82f6", label: "EXPRESS RIDE" },
];

const BLOCKS = [
  {
    x: 75,
    y: 70,
    w: 165,
    h: 84,
    dx: -90,
    dy: -55,
    r: -6,
    service: "food",
    dotColor: "#f97316",
    tag: "FOOD HUB",
    title: "Resto & Eats",
    sub: "Outside Deliveries",
  },
  {
    x: 317.5,
    y: 40,
    w: 165,
    h: 84,
    dx: 0,
    dy: -75,
    r: 4,
    service: "rides",
    dotColor: "#3b82f6",
    tag: "GATE STAND",
    title: "Outside Gate",
    sub: "Cabs & Outstation",
  },
  {
    x: 560,
    y: 70,
    w: 165,
    h: 84,
    dx: 90,
    dy: -55,
    r: -4,
    service: "essentials",
    dotColor: "#10b981",
    tag: "ACADEMICS",
    title: "Block F & E",
    sub: "Classrooms & Labs",
  },
  {
    x: 75,
    y: 345,
    w: 165,
    h: 84,
    dx: -90,
    dy: 55,
    r: 6,
    service: "essentials",
    dotColor: "#10b981",
    tag: "HOSTELS",
    title: "Hostels 1 & 2",
    sub: "Night Deliveries",
  },
  {
    x: 317.5,
    y: 375,
    w: 165,
    h: 84,
    dx: 0,
    dy: 75,
    r: -4,
    service: "food",
    dotColor: "#f97316",
    tag: "STORE & MART",
    title: "Stationery Mart",
    sub: "Prints & Supplies",
  },
  {
    x: 560,
    y: 345,
    w: 165,
    h: 84,
    dx: 90,
    dy: 55,
    r: 5,
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
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);

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
            const s = 0.6 + p2 * 0.4 + p3 * 0.15;
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
        <div className="flex items-center justify-between px-5 pt-[112px] sm:px-8 sm:pt-[120px] lg:px-[4vw] lg:pt-[128px]">
          <div className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)]/80 px-3 py-1 backdrop-blur-md shadow-sm">
            <span className="h-2 w-2 rounded-full bg-[var(--blue)] animate-pulse" />
            <span className="micro font-mono text-[11px] tracking-wider text-[var(--text)] font-medium uppercase">
              CONNECT SCHEMATIC
            </span>
          </div>
          <span className="micro font-mono text-[11.5px] tracking-wider text-[var(--muted)]">
            SYSTEM STATE · <span className="text-[var(--blue-ink)] font-semibold">SYNCHRONISING PIPELINES</span>
          </span>
        </div>

        {/* Interactive Schematic Diagram */}
        <div className="relative flex flex-1 items-center justify-center">
          <svg
            viewBox="0 0 800 560"
            className="h-[74vh] w-[96vw] max-w-[1240px]"
            aria-hidden="true"
            style={{ overflow: "visible" }}
          >
            {/* Definitions for Gradients, Glows & Patterns */}
            <defs>
              <pattern id="dot-grid-tech" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.2" fill="currentColor" className="text-white/[0.05]" />
              </pattern>
              
              <linearGradient id="glow-orange" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.4" />
              </linearGradient>

              <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <rect width="800" height="560" fill="url(#dot-grid-tech)" />

            {/* Crisp Curved Circuit Vectors */}
            <g ref={unifiedGroup} strokeLinecap="round">
              {UNIFIED.map((u, i) => {
                const isHovered = hoveredNode === i;
                return (
                  <g key={i}>
                    {/* Outer subtle guide ray */}
                    <path
                      d={u.d}
                      fill="none"
                      stroke={u.color}
                      strokeWidth="1.2"
                      opacity={isHovered ? "0.6" : "0.2"}
                      strokeDasharray="4 6"
                      className="transition-opacity duration-300"
                    />
                    {/* Main animated circuit vector ray */}
                    <path
                      data-ray
                      d={u.d}
                      fill="none"
                      stroke={u.color}
                      strokeWidth={isHovered ? "2.8" : "2"}
                      opacity={isHovered ? "1" : "0.85"}
                      filter={isHovered ? "url(#neon-glow)" : "none"}
                      className="transition-all duration-300"
                    />
                  </g>
                );
              })}
            </g>

            {/* 6 Clean Ultra-Premium Node Cards */}
            <g ref={blockGroup}>
              {BLOCKS.map((b, i) => {
                const isHovered = hoveredNode === i;
                return (
                  <g
                    key={i}
                    data-dx={b.dx}
                    data-dy={b.dy}
                    data-r={b.r}
                    onMouseEnter={() => setHoveredNode(i)}
                    onMouseLeave={() => setHoveredNode(null)}
                    className="cursor-pointer transition-transform duration-300"
                    style={{ transformOrigin: `${b.x + b.w / 2}px ${b.y + b.h / 2}px` }}
                  >
                    {/* Outer Ambient Glow Effect on Hover */}
                    {isHovered && (
                      <rect
                        x={b.x - 4}
                        y={b.y - 4}
                        width={b.w + 8}
                        height={b.h + 8}
                        rx="16"
                        fill="none"
                        stroke={b.dotColor}
                        strokeWidth="1.5"
                        opacity="0.4"
                        filter="url(#neon-glow)"
                      />
                    )}

                    {/* Card Background Container */}
                    <rect
                      x={b.x}
                      y={b.y}
                      width={b.w}
                      height={b.h}
                      rx="12"
                      fill={isHovered ? "var(--surface-2)" : "#090d19"}
                      stroke={isHovered ? b.dotColor : "var(--border)"}
                      strokeWidth={isHovered ? "1.5" : "1"}
                      className="transition-all duration-300 shadow-xl"
                    />

                    {/* Top Accent Indicator */}
                    <rect
                      x={b.x}
                      y={b.y}
                      width={b.w}
                      height="3"
                      rx="1"
                      fill={b.dotColor}
                      opacity={isHovered ? "1" : "0.5"}
                    />

                    {/* Card Category Badge */}
                    <rect
                      x={b.x + 12}
                      y={b.y + 12}
                      width={b.tag.length * 6.2 + 16}
                      height="17"
                      rx="5"
                      fill="var(--shade)"
                      stroke="var(--border)"
                      strokeWidth="0.8"
                    />
                    <circle cx={b.x + 19} cy={b.y + 20.5} r="2.8" fill={b.dotColor} />
                    <text
                      x={b.x + 27}
                      y={b.y + 23.5}
                      fontSize="8.5"
                      fontWeight="700"
                      letterSpacing="0.08em"
                      fill="var(--text)"
                      fontFamily="var(--font-mono)"
                    >
                      {b.tag}
                    </text>

                    {/* Card Title */}
                    <text
                      x={b.x + 14}
                      y={b.y + 49}
                      fontSize="12.5"
                      fontWeight="700"
                      fill="var(--text)"
                      fontFamily="var(--font-mono)"
                    >
                      {b.title}
                    </text>

                    {/* Card Subtitle */}
                    <text
                      x={b.x + 14}
                      y={b.y + 67}
                      fontSize="9.5"
                      fontWeight="500"
                      fill="var(--muted)"
                      fontFamily="var(--font-mono)"
                    >
                      {b.sub}
                    </text>
                  </g>
                );
              })}
            </g>

            {/* Center Origin Node (Multi-Ring Reactor Core) */}
            <g ref={center}>
              <circle cx="400" cy="280" r="48" fill="none" stroke="var(--blue)" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
              <circle cx="400" cy="280" r="32" fill="none" stroke="var(--border)" strokeWidth="1.5" />
              <circle cx="400" cy="280" r="22" fill="#070b16" stroke="var(--blue)" strokeWidth="2.2" filter="url(#neon-glow)" />
              <circle cx="400" cy="280" r="6" fill="var(--blue)" className="animate-pulse" />

              <rect x="330" y="322" width="140" height="22" rx="6" fill="#070b16" stroke="var(--border)" strokeWidth="1.2" />
              <text x="400" y="336" textAnchor="middle" fontSize="9" fontWeight="700" letterSpacing="0.16em" fill="var(--text)" fontFamily="var(--font-mono)">
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
              <div className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-1.5 mb-5 backdrop-blur-md shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--blue)] animate-ping" />
                <span className="micro font-mono text-[10.5px] tracking-widest text-[var(--text)] uppercase font-medium">
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
