"use client";

import { useEffect, useRef } from "react";
import { MOMENTS } from "@/lib/data";
import { useReducedMotion } from "@/lib/store";
import { gsap, ScrollTrigger } from "@/lib/motion";

const FRAGMENTS = [
  { d: "M70,110 C 120,90 150,130 200,110", color: "#f97316", ink: "var(--food-ink)", lx: 75, ly: 94, label: "FOOD" },
  { d: "M560,70 C 610,100 650,60 710,90", color: "#3b82f6", ink: "var(--rides-ink)", lx: 565, ly: 54, label: "RIDES" },
  { d: "M240,420 C 290,450 330,410 380,440", color: "#10b981", ink: "var(--essentials-ink)", lx: 245, ly: 408, label: "STORE" },
  { d: "M560,400 C 610,430 660,390 720,420", color: "var(--text)", ink: "var(--muted)", lx: 565, ly: 388, label: "STATIONERY" },
  { d: "M40,320 C 90,350 120,310 170,340", color: "var(--text)", ink: "var(--muted)", lx: 45, ly: 308, label: "HOSTEL" },
  { d: "M310,50 C 360,80 400,40 450,70", color: "var(--text)", ink: "var(--muted)", lx: 315, ly: 38, label: "GATE" },
];

const UNIFIED = [
  { d: "M152,108 C 220,160 310,220 400,280", color: "#f97316", glow: "url(#glow-food)" },
  { d: "M400,121 C 400,160 400,220 400,280", color: "#3b82f6", glow: "url(#glow-rides)" },
  { d: "M647,108 C 580,160 490,220 400,280", color: "#10b981", glow: "url(#glow-essentials)" },
  { d: "M152,383 C 220,350 310,310 400,280", color: "#10b981", glow: "url(#glow-essentials)" },
  { d: "M400,385 C 400,350 400,310 400,280", color: "#f97316", glow: "url(#glow-food)" },
  { d: "M647,383 C 580,350 490,310 400,280", color: "#3b82f6", glow: "url(#glow-rides)" },
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
    color: "#f97316",
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
    color: "#3b82f6",
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
    color: "#10b981",
    tag: "ACADEMICS",
    title: "Block F & E",
    sub: "Classroom Labs",
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
    color: "#10b981",
    tag: "HOSTELS",
    title: "Hostels 1 & 2",
    sub: "Late Night Delivery",
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
    color: "#f97316",
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
    color: "#3b82f6",
    tag: "EXPRESS RIDE",
    title: "City Commute",
    sub: "Unnao/Lucknow Direct",
  },
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
          const p4 = clamp((p - 0.06) / 0.46);

          if (fragGroup.current) {
            fragGroup.current.style.opacity = `${1 - p1}`;
            fragGroup.current.style.transform = `scale(${1 + p1 * 0.12})`;
            fragGroup.current.style.transformOrigin = "center";
          }
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
    <section id="connect" ref={section} className="relative h-[320vh] bg-[#08090d] text-white">
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-20 sm:px-8 lg:px-[4vw]">
          <div className="flex items-center gap-2.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1.5 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
            </span>
            <span className="micro font-mono text-[11px] tracking-widest text-blue-400 font-semibold uppercase">
              SYSTEM CONVERGENCE
            </span>
          </div>
          <span className="micro font-mono text-[11.5px] tracking-wider text-[var(--muted)]">
            SYSTEM STATE · <span className="text-blue-400 font-semibold animate-pulse">SYNCHRONISING</span>
          </span>
        </div>

        <div className="relative flex flex-1 items-center justify-center">
          <svg
            viewBox="0 0 800 560"
            className="h-[72vh] w-[94vw] max-w-[1200px]"
            aria-hidden="true"
            style={{ overflow: "visible" }}
          >
            <defs>
              <filter id="glow-food" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="glow-rides" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="glow-essentials" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="glow-core" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="12" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Connecting Neon Ray Pipelines */}
            <g ref={unifiedGroup} strokeLinecap="round">
              {UNIFIED.map((u, i) => (
                <g key={i}>
                  {/* Thick glowing aura stroke */}
                  <path d={u.d} fill="none" stroke={u.color} strokeWidth="10" opacity="0.3" filter={u.glow} />
                  {/* Main bright ray stroke */}
                  <path data-ray d={u.d} fill="none" stroke={u.color} strokeWidth="3" opacity="0.95" />
                  {/* Inner neon core ray */}
                  <path d={u.d} fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.8" />
                </g>
              ))}
            </g>

            {/* 6 Campus Nodes Cards */}
            <g ref={blockGroup}>
              {BLOCKS.map((b, i) => (
                <g key={i} data-dx={b.dx} data-dy={b.dy} data-r={b.r} className="transition-all duration-300">
                  {/* Glowing background card shadow */}
                  <rect
                    x={b.x}
                    y={b.y}
                    width={b.w}
                    height={b.h}
                    rx="12"
                    fill="#10121a"
                    fillOpacity="0.92"
                    stroke={b.color}
                    strokeWidth="1.6"
                    strokeOpacity="0.8"
                    filter={b.service === "food" ? "url(#glow-food)" : b.service === "rides" ? "url(#glow-rides)" : "url(#glow-essentials)"}
                  />
                  {/* Card Category Tag */}
                  <rect
                    x={b.x + 10}
                    y={b.y + 10}
                    width={b.tag.length * 6.5 + 16}
                    height="17"
                    rx="8.5"
                    fill={b.color}
                    fillOpacity="0.22"
                    stroke={b.color}
                    strokeWidth="0.8"
                  />
                  <circle cx={b.x + 17} cy={b.y + 18.5} r="3" fill={b.color} />
                  <text
                    x={b.x + 25}
                    y={b.y + 21.5}
                    fontSize="8.5"
                    fontWeight="700"
                    letterSpacing="0.1em"
                    fill={b.color}
                    fontFamily="var(--font-mono)"
                  >
                    {b.tag}
                  </text>
                  {/* Card Title */}
                  <text
                    x={b.x + 12}
                    y={b.y + 44}
                    fontSize="11.5"
                    fontWeight="700"
                    fill="#ffffff"
                    fontFamily="var(--font-mono)"
                  >
                    {b.title}
                  </text>
                  {/* Card Subtitle */}
                  <text
                    x={b.x + 12}
                    y={b.y + 61}
                    fontSize="9"
                    fill="#9ca3af"
                    fontFamily="var(--font-mono)"
                  >
                    {b.sub}
                  </text>
                </g>
              ))}
            </g>

            {/* Disconnected Fragments (Initial State) */}
            <g ref={fragGroup} style={{ transition: "none" }}>
              {FRAGMENTS.map((f) => (
                <g key={f.label}>
                  <path d={f.d} fill="none" stroke={f.color} strokeWidth="2" strokeDasharray="6 8" opacity="0.6" />
                  <text
                    x={f.lx}
                    y={f.ly}
                    fontSize="11"
                    fontWeight="700"
                    letterSpacing="1.8"
                    fill={f.color}
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {f.label}
                  </text>
                </g>
              ))}
            </g>

            {/* ONE KART NEXUS Central Core */}
            <g ref={center}>
              {/* Outer dashed radar ring */}
              <circle cx="400" cy="280" r="58" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4 6" opacity="0.4" />
              {/* Secondary pulse ring */}
              <circle cx="400" cy="280" r="44" fill="none" stroke="#3b82f6" strokeWidth="1.5" opacity="0.7" />
              {/* Glowing aura */}
              <circle cx="400" cy="280" r="30" fill="#3b82f6" fillOpacity="0.2" filter="url(#glow-core)" />
              {/* Solid core sphere */}
              <circle cx="400" cy="280" r="22" fill="#08090d" stroke="#3b82f6" strokeWidth="2.5" />
              {/* Inner neon core dot */}
              <circle cx="400" cy="280" r="8" fill="#60a5fa" filter="url(#glow-core)" />
              <circle cx="400" cy="280" r="4" fill="#ffffff" />

              {/* Nexus Badge */}
              <rect x="335" y="316" width="130" height="22" rx="11" fill="#11131f" stroke="#3b82f6" strokeWidth="1.2" opacity="0.95" />
              <text x="400" y="331" textAnchor="middle" fontSize="9" fontWeight="800" letterSpacing="0.16em" fill="#60a5fa" fontFamily="var(--font-mono)">
                ONE KART NEXUS
              </text>
            </g>
          </svg>

          {/* Floating Day-in-the-life Chips */}
          <div ref={chipsRef} className="pointer-events-none absolute inset-0 hidden lg:block">
            {MOMENTS.map((m, i) => {
              const pos = [
                { l: "6%", t: "22%", cx: 28, cy: 10, color: "#3b82f6" },
                { l: "74%", t: "16%", cx: -34, cy: 14, color: "#f97316" },
                { l: "82%", t: "66%", cx: -40, cy: -18, color: "#3b82f6" },
                { l: "14%", t: "72%", cx: 28, cy: -20, color: "#10b981" },
                { l: "46%", t: "8%", cx: 2, cy: 26, color: "#10b981" },
              ][i];
              return (
                <div
                  key={m.time}
                  data-chip
                  data-cx={pos.cx}
                  data-cy={pos.cy}
                  className="absolute flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[12px] font-mono shadow-xl backdrop-blur-xl transition-all"
                  style={{
                    left: pos.l,
                    top: pos.t,
                    background: "rgba(16, 18, 26, 0.88)",
                    borderColor: pos.color,
                    boxShadow: `0 8px 24px -4px ${pos.color}40`,
                    willChange: "transform",
                  }}
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: pos.color, boxShadow: `0 0 8px ${pos.color}` }} />
                  <span className="font-bold text-white">{m.time}</span>
                  <span className="text-[10px] tracking-wider text-gray-300 uppercase">{m.service === "rides" ? "RIDE" : m.service === "food" ? "FOOD" : "SUPPLY"}</span>
                </div>
              );
            })}
          </div>

          {/* Radial Glow Veil & Converged Headline */}
          <div
            ref={veil}
            className="pointer-events-none absolute inset-0 transition-opacity duration-300"
            style={{ opacity: 0, background: "radial-gradient(55% 55% at 50% 50%, rgba(8, 9, 13, 0.94) 35%, transparent 100%)" }}
            aria-hidden="true"
          />
          <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 px-5 text-center">
            <div ref={headline} style={{ opacity: 0 }}>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/40 bg-blue-500/10 px-4 py-1.5 mb-5 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_10px_#60a5fa] animate-pulse" />
                <span className="micro font-mono text-[11px] tracking-widest text-blue-300 font-semibold uppercase">
                  SYSTEM SYNCHRONIZED
                </span>
              </div>
              <h2 className="display text-[clamp(2.6rem,7.8vw,6.6rem)] leading-[0.92] tracking-[-0.035em]">
                ONE CAMPUS.
                <br />
                ONE <span className="serif-accent text-blue-400 italic">ecosystem.</span>
              </h2>
            </div>
            <p ref={subline} className="micro mx-auto mt-6 max-w-[50ch] text-[1.1rem] text-gray-300 leading-relaxed font-mono" style={{ opacity: 0 }}>
              Food · Rides · Essentials · People · Places — unified into one real-time pipeline for Chandigarh University (Unnao).
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between px-5 pb-6 sm:px-8 lg:px-[4vw]">
          <span className="micro font-mono text-[11.5px] tracking-wider text-gray-400">
            FRAGMENTS 06 → ROUTES 06 → <span className="text-blue-400 font-semibold">NETWORK 01</span>
          </span>
          <span className="micro font-mono text-[11.5px] tracking-wider text-blue-400 font-semibold">
            SCROLL REVERSES THIS ↑
          </span>
        </div>
      </div>
    </section>
  );
}
