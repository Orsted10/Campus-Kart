"use client";

import { useEffect, useRef, useState } from "react";
import { CAMPUSES, SERVICE_META, type ServiceId } from "@/lib/data";
import { useApp, useReducedMotion } from "@/lib/store";
import { gsap } from "@/lib/motion";

const ZONES = [
  { id: "z1", label: "Campus Outside Gate", x: 300, y: 45, w: 400, h: 70, kind: "rides" },
  { id: "z2", label: "University Block F", x: 640, y: 170, w: 230, h: 130, kind: "zone" },
  { id: "z3", label: "University Block E", x: 480, y: 310, w: 210, h: 120, kind: "zone" },
  { id: "z4", label: "Hostel 1", x: 160, y: 450, w: 240, h: 140, kind: "food" },
  { id: "z5", label: "Hostel 2", x: 480, y: 450, w: 240, h: 140, kind: "essentials" },
];

const MARKERS = [
  { id: "m1", label: "Outside Gate Pickup", x: 500, y: 80, kind: "pickup" },
  { id: "m2", label: "Hostel 1 Pickup", x: 280, y: 520, kind: "pickup" },
  { id: "m3", label: "Block F Canteen", x: 755, y: 235, kind: "vendor" },
  { id: "m4", label: "Block E Lab Hub", x: 585, y: 370, kind: "vendor" },
  { id: "m5", label: "Hostel 2 Store", x: 600, y: 520, kind: "vendor" },
];

const MAP_ROUTES: { id: ServiceId; d: string }[] = [
  { id: "food", d: "M280,520 H500 V370 H585" },
  { id: "rides", d: "M280,520 V450 H500 V80" },
  { id: "essentials", d: "M755,235 H500 V450 H600" },
];

export default function CampusMap() {
  const { campus, service, setService } = useApp();
  const active = CAMPUSES.find((c) => c.id === campus) ?? CAMPUSES[0];
  const wrap = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = wrap.current;
    if (!el || reduced) return;
    const ctx = gsap.context(() => {
      const paths = gsap.utils.toArray<SVGPathElement>(".map-route");
      paths.forEach((p, i) => {
        const len = p.getTotalLength();
        gsap.fromTo(
          p,
          { strokeDashoffset: len, strokeDasharray: len },
          {
            strokeDashoffset: 0,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top 78%", end: "bottom 65%", scrub: 0.5 },
            delay: i * 0.05,
          },
        );
      });
      gsap.fromTo(
        ".map-marker",
        { scale: 0, transformOrigin: "center" },
        {
          scale: 1,
          stagger: 0.06,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 70%", end: "center 60%", scrub: 0.4 },
        },
      );
    }, el);
    return () => ctx.revert();
  }, [reduced]);

  const hoveredMarker = MARKERS.find((m) => m.id === hover);

  return (
    <section id="map" ref={wrap} className="relative px-5 pb-[12vh] pt-[6vh] sm:px-8 lg:px-[4vw]">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex items-end justify-between gap-6">
          <div>
            <span className="micro">The campus map · {active.city}</span>
            <h2 className="display mt-4 text-[clamp(2.2rem,5.4vw,4.6rem)]">
              A MAP THAT
              <br />
              <span className="serif-accent text-blue">behaves like wayfinding.</span>
            </h2>
          </div>
          <p className="lede hidden lg:block lg:text-right">
            Not a satellite. A drawing of your campus that knows where food, rides and supplies
            actually live.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_300px]">
          <div
            className="relative overflow-hidden border border-line"
            style={{ background: "var(--surface)" }}
            onMouseLeave={() => setHover(null)}
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <span className="micro">Zone plan · example campus</span>
              <span className="micro">hover markers</span>
            </div>

            <svg ref={svgRef} viewBox="0 0 1000 640" className="h-[52vh] w-full lg:h-[68vh]" role="img" aria-label={`Stylised campus zone plan for ${active.name}`}>
              <defs>
                <pattern id="map-tick" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M0 0 H8 M0 0 V8" fill="none" stroke="var(--scene-line)" strokeWidth="1" opacity="0.7" />
                </pattern>
              </defs>
              <rect width="1000" height="640" fill="url(#map-tick)" opacity="0.7" />

              {/* topographic rings */}
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <ellipse
                  key={i}
                  cx="500"
                  cy="330"
                  rx={170 + i * 78}
                  ry={110 + i * 56}
                  fill="none"
                  stroke="var(--scene-line)"
                  strokeWidth="1"
                  opacity={0.5 - i * 0.05}
                />
              ))}

              {/* roads */}
              <path d="M20,330 H980" stroke="var(--scene-line)" strokeWidth="12" opacity="0.3" />
              <path d="M460,20 V620" stroke="var(--scene-line)" strokeWidth="12" opacity="0.3" />
              <path d="M60,560 C 300,560 520,575 960,565" stroke="var(--scene-line)" strokeWidth="12" opacity="0.3" fill="none" />

              {/* zones */}
              {ZONES.map((z) => (
                <g key={z.id} onMouseEnter={() => setHover(z.id)} style={{ cursor: "crosshair" }}>
                  <rect
                    x={z.x}
                    y={z.y}
                    width={z.w}
                    height={z.h}
                    rx="3"
                    fill="var(--scene-block)"
                    stroke="var(--scene-line)"
                    strokeWidth="1.4"
                    style={{ transition: "fill .4s ease" }}
                  />
                  <path
                    d={`M${z.x + 14},${z.y + z.h * 0.66} H${z.x + z.w - 14}`}
                    stroke="var(--scene-line)"
                    strokeWidth="1"
                  />
                  <text
                    x={z.x + 16}
                    y={z.y + 28}
                    fontSize="14"
                    letterSpacing="1.4"
                    fill={hover === z.id ? "var(--text)" : "var(--muted)"}
                    style={{ fontFamily: "var(--font-mono)", transition: "fill .3s" }}
                  >
                    {z.label.toUpperCase()}
                  </text>
                </g>
              ))}

              {/* routes */}
              {MAP_ROUTES.map((r) => (
                <g key={r.id} style={{ opacity: service === r.id ? 1 : 0.32, transition: "opacity .5s" }}>
                  <path className="map-route" d={r.d} fill="none" stroke={SERVICE_META[r.id].accent} strokeWidth="10" opacity="0.14" strokeLinecap="round" />
                  <path className="map-route" d={r.d} fill="none" stroke={SERVICE_META[r.id].accent} strokeWidth="2.2" strokeLinecap="round" />
                </g>
              ))}

              {/* markers */}
              {MARKERS.map((m) => (
                <g
                  key={m.id}
                  className="map-marker"
                  onMouseEnter={() => setHover(m.id)}
                  onClick={() => setService(m.kind === "pickup" ? "rides" : "essentials")}
                  style={{ cursor: "pointer" }}
                >
                  <circle cx={m.x} cy={m.y} r="26" fill="transparent" />
                  {m.kind === "pickup" ? (
                    <>
                      <circle cx={m.x} cy={m.y} r="11" fill="var(--bg)" stroke="var(--rides)" strokeWidth="2" />
                      <circle cx={m.x} cy={m.y} r="3.5" fill="var(--rides)" />
                    </>
                  ) : (
                    <>
                      <rect
                        x={m.x - 9}
                        y={m.y - 9}
                        width="18"
                        height="18"
                        transform={`rotate(45 ${m.x} ${m.y})`}
                        fill="var(--bg)"
                        stroke={m.label.includes("Annapoorna") || m.label.includes("Chai") ? "var(--food)" : "var(--essentials)"}
                        strokeWidth="2"
                      />
                    </>
                  )}
                  {hover === m.id && (
                    <text x={m.x} y={m.y - 22} textAnchor="middle" fontSize="13" fill="var(--text)" style={{ fontFamily: "var(--font-mono)" }}>
                      {m.label}
                    </text>
                  )}
                </g>
              ))}

              {/* scale + north */}
              <g opacity="0.75">
                <path d="M40,600 H140" stroke="var(--muted)" strokeWidth="1.5" />
                <path d="M40,594 V606 M140,594 V606" stroke="var(--muted)" strokeWidth="1.5" />
                <text x="40" y="586" fontSize="12" fill="var(--muted)" style={{ fontFamily: "var(--font-mono)" }}>
                  100 m · schematic
                </text>
                <path d="M950,610 V570 M950,570 l-8,10 M950,570 l8,10" stroke="var(--muted)" strokeWidth="1.5" fill="none" />
                <text x="940" y="628" fontSize="12" fill="var(--muted)" style={{ fontFamily: "var(--font-mono)" }}>
                  N
                </text>
              </g>
            </svg>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line px-4 py-3">
              {[
                ["Pickup point", "var(--rides)"],
                ["Vendor / store", "var(--food)"],
                ["Campus zone", "var(--muted)"],
              ].map(([l, c]) => (
                <span key={l} className="micro flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: c }} />
                  {l}
                </span>
              ))}
              <span className="micro ml-auto">{hoveredMarker ? hoveredMarker.label : "schematic · not to scale"}</span>
            </div>
          </div>

          {/* annotation column */}
          <div className="flex flex-col gap-4">
            <div className="border border-line p-5" style={{ background: "var(--surface)" }}>
              <p className="micro">Active campus</p>
              <p className="mt-2 text-[15px] font-medium leading-snug">{active.name}</p>
              <ul className="mt-4 space-y-2">
                {active.zones.map((z, i) => (
                  <li key={z} className="flex items-center justify-between border-b border-line pb-2 text-[13.5px]">
                    <span className="text-muted">{z}</span>
                    <span className="micro">0{i + 1}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border border-line p-5">
              <p className="micro">Legend</p>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
                Terracotta traces are food. Blue is movement. Olive is supply. Grey is the campus
                itself — always there, under everything.
              </p>
            </div>

            <div className="border border-line p-5" style={{ background: "var(--surface-2)" }}>
              <p className="micro">Drawn by scroll</p>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
                Scroll up and the traces retract. Nothing here plays once and locks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------- campus pulse */

const SIGNALS: { label: string; states: string[]; service: ServiceId }[] = [
  { label: "Food moving", states: ["MOVING", "ARRIVING"], service: "food" },
  { label: "Rides moving", states: ["READY", "MOVING"], service: "rides" },
  { label: "Essentials flowing", states: ["ACTIVE", "RESTOCKING"], service: "essentials" },
  { label: "Vendors active", states: ["ACTIVE", "PREPARING"], service: "food" },
  { label: "Students connected", states: ["ONLINE", "ACTIVE"], service: "rides" },
];

export function CampusPulse() {
  const [step, setStep] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setStep((s) => s + 1), 2400);
    return () => window.clearInterval(id);
  }, [reduced]);

  return (
    <section id="pulse" className="px-5 sm:px-8 lg:px-[4vw]">
      <div className="mx-auto max-w-[1400px] border-y border-line py-8">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="display text-[clamp(1.6rem,3vw,2.4rem)]">
            CAMPUS <span className="serif-accent text-blue">pulse</span>
          </h2>
          <p className="micro">The campus never stops moving · conceptual states, no fake totals</p>
        </div>

        <ul className="mt-7 grid gap-px sm:grid-cols-2 lg:grid-cols-5" style={{ background: "var(--border)" }}>
          {SIGNALS.map((s, i) => {
            const state = s.states[(step + i) % s.states.length];
            const accent = SERVICE_META[s.service].ink;
            return (
              <li key={s.label} className="flex flex-col gap-3 p-4" style={{ background: "var(--bg)" }}>
                <span className="micro">{s.label}</span>
                <span className="flex items-center gap-2">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: accent, animation: reduced ? "none" : "pulse-ring 2.4s ease-out infinite" }}
                  />
                  <span className="num text-[13px]" style={{ color: accent }}>
                    {state}
                  </span>
                </span>
                <svg viewBox="0 0 100 24" className="h-6 w-full" aria-hidden="true">
                  <path
                    d="M0,18 C 16,18 20,6 36,6 C 52,6 56,18 72,18 C 86,18 90,10 100,8"
                    fill="none"
                    stroke={accent}
                    strokeWidth="1.6"
                    opacity="0.7"
                    className={reduced ? "" : "route-dash"}
                    pathLength={100}
                  />
                </svg>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
