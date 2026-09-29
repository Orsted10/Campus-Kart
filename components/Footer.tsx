"use client";

import { useEffect, useRef, useState } from "react";
import { FOOTER_GROUPS } from "@/lib/data";
import { scrollToId, useApp, useReducedMotion } from "@/lib/store";
import { gsap } from "@/lib/motion";
import { Arrow, Mark } from "./Chrome";

const INBOUND = [
  { d: "M-40,20 C 160,20 260,120 460,130", color: "var(--food)" },
  { d: "M1040,10 C 840,10 700,110 540,130", color: "var(--rides)" },
  { d: "M-40,230 C 180,230 300,160 462,142", color: "var(--essentials)" },
  { d: "M1040,240 C 860,240 720,170 540,142", color: "var(--blue)" },
  { d: "M300,300 C 340,240 420,180 480,150", color: "var(--food)" },
  { d: "M760,300 C 720,240 620,180 524,150", color: "var(--rides)" },
];

export default function Footer() {
  const { openLegal, openOverlay } = useApp();
  const footerRef = useRef<HTMLElement | null>(null);
  const groupRef = useRef<SVGGElement | null>(null);
  const markRef = useRef<SVGGElement | null>(null);
  const reduced = useReducedMotion();
  const [email, setEmail] = useState("");
  const [news, setNews] = useState<"idle" | "done" | "error">("idle");

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;
    if (reduced) return;
    const ctx = gsap.context(() => {
      const paths = gsap.utils.toArray<SVGPathElement>(".conv-route");
      paths.forEach((p) => {
        const len = p.getTotalLength();
        gsap.fromTo(
          p,
          { strokeDasharray: len, strokeDashoffset: len },
          {
            strokeDashoffset: 0,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top 85%", end: "top 15%", scrub: 0.5 },
          },
        );
      });
      if (markRef.current) {
        gsap.fromTo(
          markRef.current,
          { scale: 0.4, opacity: 0, transformOrigin: "500px 138px" },
          {
            scale: 1,
            opacity: 1,
            ease: "power1.out",
            scrollTrigger: { trigger: el, start: "top 55%", end: "top 10%", scrub: 0.5 },
          },
        );
      }
    }, el);
    return () => ctx.revert();
  }, [reduced]);

  const submitNews = (e: React.FormEvent) => {
    e.preventDefault();
    setNews(/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()) ? "done" : "error");
  };

  const legal = [
    ["Privacy", "privacy"],
    ["Terms", "terms"],
    ["Cookies", "cookies"],
    ["Safety", "safety"],
    ["Refunds", "refunds"],
  ] as const;

  return (
    <footer ref={footerRef} className="relative overflow-hidden px-5 pt-[8vh] sm:px-8 lg:px-[4vw]">
      {/* ---------------------------------------- signature convergence */}
      <div className="relative mx-auto max-w-[1400px] overflow-hidden border border-line" style={{ background: "var(--surface)" }}>
        <svg viewBox="0 0 1000 280" className="h-[30vh] w-full sm:h-[36vh]" role="img" aria-label="Routes from food, rides and essentials converging into the CampusKart mark">
          <g ref={groupRef} strokeLinecap="round">
            {INBOUND.map((r, i) => (
              <g key={i}>
                <path className="conv-route" d={r.d} fill="none" stroke={r.color} strokeWidth="8" opacity="0.14" />
                <path className="conv-route" d={r.d} fill="none" stroke={r.color} strokeWidth="2" />
              </g>
            ))}
          </g>

          <g ref={markRef} style={{ opacity: reduced ? 1 : 0 }}>
            <circle cx="500" cy="138" r="54" fill="var(--surface-2)" stroke="var(--border)" />
            <g transform="translate(476 114) scale(1.2)">
              <rect x="1" y="1" width="38" height="38" rx="11" fill="none" stroke="var(--text)" strokeWidth="1.6" />
              <path d="M9 29 C 15 29 16 11 22 11 C 26 11 27 16 31 16" fill="none" stroke="var(--text)" strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="31" cy="16" r="3.6" fill="var(--blue)" />
              <circle cx="9" cy="29" r="2.2" fill="var(--text)" />
            </g>
            <text x="500" y="222" textAnchor="middle" fontSize="13" letterSpacing="4" fill="var(--muted)" style={{ fontFamily: "var(--font-mono)" }}>
              EVERY ROUTE ENDS IN ONE PLACE
            </text>
          </g>

          <text x="34" y="42" fontSize="12" letterSpacing="2" fill="var(--muted)" style={{ fontFamily: "var(--font-mono)" }}>
            FOOD
          </text>
          <text x="900" y="36" fontSize="12" letterSpacing="2" fill="var(--muted)" style={{ fontFamily: "var(--font-mono)" }}>
            RIDES
          </text>
          <text x="34" y="254" fontSize="12" letterSpacing="2" fill="var(--muted)" style={{ fontFamily: "var(--font-mono)" }}>
            ESSENTIALS
          </text>
          <text x="866" y="254" fontSize="12" letterSpacing="2" fill="var(--muted)" style={{ fontFamily: "var(--font-mono)" }}>
            CAMPUS
          </text>
        </svg>
      </div>

      {/* --------------------------------------------------- statement */}
      <div className="mx-auto mt-[10vh] max-w-[1400px]">
        <h2 className="display text-[clamp(2.5rem,8.2vw,7.2rem)] leading-[0.88]">
          CAMPUS LIFE,
          <br />
          WITHOUT THE <span className="serif-accent text-blue">friction.</span>
        </h2>
        <div className="mt-7 flex flex-wrap items-center gap-4">
          <button type="button" className="btn btn-solid" onClick={(e) => openOverlay("register", { x: e.clientX, y: e.clientY })} data-cursor="cta">
            Get Started <Arrow />
          </button>
          <button type="button" className="btn btn-ghost" onClick={(e) => openOverlay("search", { x: e.clientX, y: e.clientY })} data-cursor="cta">
            Search the campus <Arrow />
          </button>
          <button type="button" className="btn btn-ghost" onClick={(e) => openOverlay("support", { x: e.clientX, y: e.clientY })} data-cursor="cta">
            Support <Arrow />
          </button>
        </div>
      </div>

      {/* ------------------------------------------------- link columns */}
      <div className="mx-auto mt-[8vh] grid max-w-[1400px] gap-10 border-t border-line pt-10 lg:grid-cols-[1.4fr_repeat(3,1fr)_1.3fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <Mark size={30} />
            <span className="text-[15px] font-semibold tracking-[-0.045em]">
              Campus<span className="text-blue">Kart</span>
            </span>
          </div>
          <p className="mt-4 max-w-[30ch] text-sm leading-relaxed text-muted">
            Food. Rides. Essentials. Campus life. One place — designed around how university life
            actually moves.
          </p>
          <p className="micro mt-6">Chandigarh University · Unnao, UP</p>
        </div>

        {FOOTER_GROUPS.map((g) => (
          <nav key={g.title} aria-label={g.title}>
            <p className="micro">{g.title}</p>
            <ul className="mt-4 space-y-2.5">
              {g.links.map((label, i) => (
                <li key={label}>
                  <button
                    type="button"
                    className="nav-link !text-[14px]"
                    onClick={(e) => {
                      const href = g.hrefs[i];
                      if (href === "#support") openOverlay("support", { x: e.clientX, y: e.clientY });
                      else if (href.startsWith("#legal:")) openLegal(href.split(":")[1], { x: e.clientX, y: e.clientY });
                      else scrollToId(href.replace("#", ""));
                    }}
                    data-cursor="link"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div>
          <p className="micro">Campus updates</p>
          <form onSubmit={submitNews} className="mt-4" noValidate>
            <div className="flex items-center gap-3 border-b border-line pb-2">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setNews("idle");
                }}
                placeholder="you@campus.edu"
                aria-label="Email for campus updates"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
              />
              <button type="submit" aria-label="Subscribe" className="grid h-7 w-7 place-items-center rounded-full border border-line transition-colors hover:border-ink" data-cursor="link">
                <Arrow />
              </button>
            </div>
            <p
              className="micro mt-2"
              style={{ color: news === "error" ? "var(--food-ink)" : news === "done" ? "var(--blue-ink)" : undefined }}
            >
              {news === "error"
                ? "That email doesn't look right."
                : news === "done"
                  ? "Subscribed successfully."
                  : "Product notes from the campus, occasionally."}
            </p>
          </form>

          <div className="mt-6 flex flex-wrap gap-3">
            {["Instagram", "X", "LinkedIn", "YouTube"].map((s) => (
              <a
                key={s}
                href="#top"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToId("top");
                }}
                className="micro border border-line px-2.5 py-1.5 transition-colors hover:border-ink hover:text-ink"
              >
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* --------------------------------------------------- legal row */}
      <div className="mx-auto mt-10 flex max-w-[1400px] flex-wrap items-center justify-between gap-4 border-t border-line py-6">
        <p className="micro">© {new Date().getFullYear()} CampusKart · placeholder brand, real ambition</p>
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {legal.map(([label, key]) => (
            <li key={key}>
              <button
                type="button"
                className="micro transition-colors hover:text-ink"
                onClick={(e) => openLegal(key, { x: e.clientX, y: e.clientY })}
                data-cursor="link"
              >
                {label}
              </button>
            </li>
          ))}
          <li>
            <button type="button" className="micro transition-colors hover:text-ink" onClick={(e) => openOverlay("support", { x: e.clientX, y: e.clientY })}>
              Support
            </button>
          </li>
        </ul>
      </div>

      {/* the route line continues to the very bottom */}
      <div className="relative mx-auto h-24 max-w-[1400px] overflow-hidden" aria-hidden="true">
        <svg viewBox="0 0 1000 96" className="h-full w-full" preserveAspectRatio="none" aria-hidden="true">
          <path
            d="M0,20 C 240,20 320,76 520,76 C 700,76 780,20 1000,20"
            fill="none"
            stroke="var(--blue)"
            strokeWidth="1.6"
            className={reduced ? "" : "route-dash"}
            opacity="0.8"
          />
        </svg>
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Mark size={34} />
        </span>
      </div>
    </footer>
  );
}
