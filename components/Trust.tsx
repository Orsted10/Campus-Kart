"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/store";
import { gsap, ScrollTrigger, useReveal } from "@/lib/motion";

const PRINCIPLES = [
  { label: "Transparent", note: "No surprise fees, no hidden states", x: 90, y: 190 },
  { label: "Secure", note: "Verified campus accounts", x: 270, y: 110 },
  { label: "Trackable", note: "Follow the route, live in-product", x: 450, y: 210 },
  { label: "Campus-aware", note: "Gates, hours, zones, curfews", x: 640, y: 120 },
  { label: "Reliable", note: "Same path at 8 AM and 11 PM", x: 820, y: 200 },
  { label: "Human support", note: "A person, when the system can't", x: 960, y: 110 },
];

const PATH_D =
  "M60,200 C 150,200 160,110 270,110 C 360,110 380,215 450,210 C 540,205 560,115 640,120 C 730,125 760,205 820,200 C 900,194 930,110 980,110";

export function TrustLayer() {
  const wrap = useRef<HTMLDivElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const [p, setP] = useState(0);
  const reduced = useReducedMotion();
  const head = useReveal<HTMLDivElement>(24);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const path = pathRef.current;
    if (path) {
      const len = path.getTotalLength();
      path.style.strokeDasharray = `${len}`;
      path.style.strokeDashoffset = `${len}`;
    }
    if (reduced) {
      const ctxReduced = gsap.context(() => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 75%",
          onEnter: () => setP(1),
          onLeaveBack: () => setP(0),
        });
      }, el);
      return () => ctxReduced.revert();
    }
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 72%",
        end: "bottom 70%",
        scrub: 0.4,
        onUpdate: (self) => setP(self.progress),
      });
    }, el);
    return () => ctx.revert();
  }, [reduced]);

  const progress = reduced ? 1 : p;

  return (
    <section id="trust" ref={wrap} className="relative px-5 pb-[12vh] pt-[6vh] sm:px-8 lg:px-[4vw]">
      <div className="mx-auto max-w-[1400px]">
        <div ref={head} className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-end">
          <h2 className="display text-[clamp(2.3rem,5.6vw,4.8rem)]">
            TRUST SHOULDN&apos;T BE
            <br />
            A ROW OF <span className="serif-accent text-blue">shields.</span>
          </h2>
          <p className="lede lg:justify-self-end lg:text-right">
            You shouldn&apos;t have to be told it&apos;s safe. You should be able to see it — a
            legible route, a verified vendor, a ride you can follow, a human when the system
            can&apos;t.
          </p>
        </div>

        <div className="relative mt-10 overflow-hidden border border-line" style={{ background: "var(--surface)" }}>
          <svg viewBox="0 0 1040 280" className="h-[36vh] w-full lg:h-[46vh]" role="img" aria-label="A delivery path that becomes clearer, annotated with CampusKart's trust principles">
            {/* uncertain path */}
            <path
              d={PATH_D}
              fill="none"
              stroke="var(--muted)"
              strokeWidth="1.5"
              strokeDasharray="3 9"
              opacity={0.55 * (1 - progress)}
            />
            {/* clear path */}
            <path
              ref={pathRef}
              d={PATH_D}
              fill="none"
              stroke="var(--blue)"
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{ strokeDashoffset: `${(1 - progress) * 1000}` }}
            />

            {PRINCIPLES.map((pr, i) => {
              const shown = progress > i / PRINCIPLES.length - 0.05;
              const isActive = active === i;
              return (
                <g
                  key={pr.label}
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                  style={{ cursor: "pointer", opacity: shown ? 1 : 0, transition: "opacity .6s ease" }}
                >
                  <circle cx={pr.x} cy={pr.y} r="24" fill="transparent" />
                  <circle
                    cx={pr.x}
                    cy={pr.y}
                    r={isActive ? 9 : 6}
                    fill="var(--surface)"
                    stroke="var(--blue)"
                    strokeWidth="2"
                    style={{ transition: "r .35s cubic-bezier(.22,1,.36,1)" }}
                  />
                  <circle cx={pr.x} cy={pr.y} r="2.5" fill="var(--blue)" />
                  <text
                    x={pr.x}
                    y={pr.y - 26}
                    textAnchor="middle"
                    fontSize="17"
                    fill={isActive ? "var(--text)" : "var(--muted)"}
                    style={{ fontFamily: "var(--font-sans)", fontWeight: 500, letterSpacing: "-0.02em", transition: "fill .3s" }}
                  >
                    {pr.label}
                  </text>
                  <text
                    x={pr.x}
                    y={pr.y + 34}
                    textAnchor="middle"
                    fontSize="11.5"
                    fill="var(--muted)"
                    style={{ fontFamily: "var(--font-mono)" }}
                    opacity={isActive ? 1 : 0}
                  >
                    {pr.note.toUpperCase()}
                  </text>
                </g>
              );
            })}

            {/* verified vendor node */}
            <g transform="translate(60 246)" style={{ opacity: progress > 0.4 ? 1 : 0.2, transition: "opacity .6s" }}>
              <circle cx="0" cy="0" r="7" fill="none" stroke="var(--essentials)" strokeWidth="2" />
              <path d="M-3,0 l2.5,2.5 l4.5,-5" fill="none" stroke="var(--essentials)" strokeWidth="2" strokeLinecap="round" />
              <text x="16" y="4" fontSize="12" fill="var(--muted)" style={{ fontFamily: "var(--font-mono)" }}>
                VENDOR VERIFIED
              </text>
            </g>
            <g transform="translate(760 252)" style={{ opacity: progress > 0.65 ? 1 : 0.2, transition: "opacity .6s" }}>
              <text x="0" y="0" fontSize="12" fill="var(--muted)" style={{ fontFamily: "var(--font-mono)" }}>
                ROUTE TRACKABLE · SUPPORT IS HUMAN
              </text>
            </g>
          </svg>
        </div>
        <p className="micro mt-3">Hover a principle · scroll drives how clear the path becomes</p>
      </div>
    </section>
  );
}

/* ==================================================== under the surface */

const LAYERS = [
  { n: "01", title: "Campus zones", note: "Where you are allowed to move", tint: "var(--muted)", ink: "var(--muted)" },
  { n: "02", title: "Order orchestration", note: "What is being made, right now", tint: "var(--food)", ink: "var(--food-ink)" },
  { n: "03", title: "Mobility", note: "Who is moving, and where", tint: "var(--rides)", ink: "var(--rides-ink)" },
  { n: "04", title: "Vendor systems", note: "What is open, ready, restocking", tint: "var(--essentials)", ink: "var(--essentials-ink)" },
  { n: "05", title: "Routing", note: "The fastest honest path between them", tint: "var(--blue)", ink: "var(--blue-ink)" },
];

export function UnderSurface() {
  const section = useRef<HTMLElement | null>(null);
  const [p, setP] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    if (reduced) {
      const ctxReduced = gsap.context(() => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 70%",
          onEnter: () => setP(1),
          onLeaveBack: () => setP(0),
        });
      }, el);
      return () => ctxReduced.revert();
    }
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => setP(self.progress),
      });
    }, el);
    return () => ctx.revert();
  }, [reduced]);


  return (
    <section id="tech" ref={section} className="relative h-[260vh]">
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden px-5 pb-[4vh] pt-[112px] sm:px-8 sm:pt-[120px] lg:px-[4vw] lg:pt-[128px]">
        <div className="mx-auto flex w-full max-w-[1400px] items-start justify-between gap-6">
          <div>
            <span className="micro">Technology · quietly</span>
            <h2 className="display mt-4 text-[clamp(2.1rem,5vw,4.2rem)]">
              UNDER THE
              <br />
              <span className="serif-accent text-blue">surface.</span>
            </h2>
          </div>
          <p className="lede hidden max-w-[34ch] text-right lg:block">
            The campus looks simple. Underneath, five systems keep agreeing on one truth — scroll to
            pull them apart.
          </p>
        </div>

        <div className="relative flex-1" style={{ perspective: "1400px" }}>
          <div className="absolute left-1/2 top-1/2 h-[340px] w-[min(88vw,760px)] -translate-x-1/2 -translate-y-1/2 lg:h-[380px]">
            {LAYERS.map((l, i) => (
              <div
                key={l.n}
                className="absolute left-1/2 top-1/2 h-[300px] lg:h-[320px]"
                style={{
                  width: "min(80vw, 680px)",
                  transform: `translate(-50%,-50%) rotateX(58deg) rotateZ(-36deg) translateZ(${
                    -i * (20 + p * 70) - i * 12
                  }px)`,
                  transition: "transform .1s linear",
                }}
              >
                <div
                  className="relative h-full w-full border"
                  style={{
                    background: i % 2 === 0 ? "var(--surface)" : "var(--surface-2)",
                    borderColor: "var(--border)",
                    boxShadow: "0 24px 60px -30px var(--shade-strong)",
                    opacity: 1,
                  }}
                >
                  <svg viewBox="0 0 680 320" className="h-full w-full" aria-hidden="true">
                    <defs>
                      <pattern id={`layer-${i}`} width="34" height="34" patternUnits="userSpaceOnUse">
                        <path d="M0 0 H34 M0 0 V34" fill="none" stroke="var(--scene-line)" strokeWidth="1" />
                      </pattern>
                    </defs>
                    <rect width="680" height="320" fill={`url(#layer-${i})`} opacity="0.8" />
                    <path
                      d={
                        i === 0
                          ? "M60,240 C 200,240 260,90 420,90 C 540,90 580,180 640,140"
                          : i === 1
                            ? "M40,140 H640"
                            : i === 2
                              ? "M80,60 V260 M340,60 V260 M560,60 V260"
                              : i === 3
                                ? "M60,80 C 240,80 300,250 620,250"
                                : "M40,280 C 240,280 320,40 640,60"
                      }
                      fill="none"
                      stroke={l.tint}
                      strokeWidth="2"
                      strokeDasharray={i % 2 ? "none" : "8 8"}
                      opacity="0.85"
                    />
                    <text x="24" y="34" fontSize="13" letterSpacing="2" fill="var(--muted)" style={{ fontFamily: "var(--font-mono)" }}>
                      {l.n} · {l.title.toUpperCase()}
                    </text>
                  </svg>
                </div>
              </div>
            ))}
          </div>

          {/* layer annotations */}
          <ul className="absolute right-0 top-1/2 hidden -translate-y-1/2 space-y-4 text-right lg:block">
            {LAYERS.map((l, i) => (
              <li
                key={l.n}
                style={{
                  opacity: Math.min(1, Math.max(0, (p - i * 0.13) * 5)),
                  transform: `translateX(${(1 - Math.min(1, p * 4)) * 20}px)`,
                  transition: "opacity .4s ease, transform .4s ease",
                }}
              >
                <span className="num text-[12px]" style={{ color: l.ink }}>
                  {l.n}
                </span>
                <p className="text-[15px] font-medium tracking-[-0.02em]">{l.title}</p>
                <p className="text-[13px] text-muted">{l.note}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* mobile layer legend */}
        <ul className="mx-auto mb-3 flex w-full max-w-[1400px] flex-wrap gap-x-5 gap-y-1 lg:hidden">
          {LAYERS.map((l, i) => (
            <li
              key={l.n}
              className="flex items-center gap-2"
              style={{
                opacity: Math.min(1, Math.max(0, (p - i * 0.13) * 5)),
                transition: "opacity .4s ease",
              }}
            >
              <span className="num text-[11px]" style={{ color: l.ink }}>
                {l.n}
              </span>
              <span className="text-[12.5px] text-muted">{l.title}</span>
            </li>
          ))}
        </ul>

        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between pb-6">
          <span className="micro">No “AI-powered” badge required</span>
          <span className="micro">depth {Math.round(p * 100)}%</span>
        </div>
      </div>
    </section>
  );
}
