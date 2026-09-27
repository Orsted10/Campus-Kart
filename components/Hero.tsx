"use client";

import { useEffect, useRef, useState } from "react";
import { CAMPUSES, SERVICE_META, type ServiceId } from "@/lib/data";
import { scrollToId, useApp } from "@/lib/store";
import { gsap } from "@/lib/motion";
import { useReducedMotion } from "@/lib/store";
import CampusScene from "./CampusScene";
import { Arrow, Magnetic } from "./Chrome";

export default function Hero() {
  const { campus, setCampus, service, setService, openOverlay } = useApp();
  const section = useRef<HTMLElement | null>(null);
  const sceneWrap = useRef<HTMLDivElement | null>(null);
  const copy = useRef<HTMLDivElement | null>(null);
  const bigWord = useRef<HTMLDivElement | null>(null);
  const leadLine = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const [hoverKind, setHoverKind] = useState<ServiceId | null>(null);
  const active = CAMPUSES.find((c) => c.id === campus) ?? CAMPUSES[0];

  useEffect(() => {
    const el = section.current;
    if (!el || reduced) return;
    const isLg = typeof window !== "undefined" && window.innerWidth >= 1024;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top top", end: "bottom bottom", scrub: 0.6 },
      });
      tl.fromTo(
        sceneWrap.current,
        { scale: 0.98, x: isLg ? "0vw" : "0px" },
        { scale: isLg ? 1.25 : 1.15, x: isLg ? "-21vw" : "0px", ease: "none" },
        0,
      )
        .to(copy.current, { y: -110, opacity: 0, ease: "power1.in" }, 0)
        .fromTo(bigWord.current, { xPercent: 0 }, { xPercent: -22, ease: "none" }, 0)
        .fromTo(leadLine.current, { scaleX: 0 }, { scaleX: 1, ease: "none" }, 0.35);
    }, el);
    return () => ctx.revert();
  }, [reduced]);

  const chips: ServiceId[] = ["food", "rides", "essentials"];

  return (
    <section id="top" ref={section} className="relative h-[210vh] lg:h-[230vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* editorial word behind the scene */}
        <div
          ref={bigWord}
          className="pointer-events-none absolute left-[-4vw] top-[6vh] select-none"
          aria-hidden="true"
        >
          <span
            className="display block text-[26vw] leading-[0.78] opacity-[0.07]"
            style={{ letterSpacing: "-0.05em" }}
          >
            CAMPUS
          </span>
        </div>

        {/* ---------------------------------------------------- scene */}
        <div
          ref={sceneWrap}
          className="absolute left-1/2 top-[56%] w-[100vw] max-w-[1100px] -translate-x-1/2 -translate-y-1/2 lg:right-[3vw] lg:left-auto lg:top-[42%] lg:w-[48vw] lg:max-w-[850px] lg:translate-x-0"
          style={{ transformOrigin: "center center" }}
        >
          <div className="relative">
            <CampusScene
              mode={hoverKind ?? service}
              onHover={(k) => setHoverKind(k === "food" || k === "rides" || k === "essentials" ? k : null)}
              showLabels={false}
              className="h-[44svh] w-full lg:h-[66vh]"
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(60% 60% at 50% 45%, transparent 45%, var(--bg) 100%)",
                opacity: 0.75,
              }}
            />
          </div>
        </div>

        {/* ---------------------------------------------------- copy */}
        <div className="pointer-events-none absolute inset-0">
          <div
            ref={copy}
            className="pointer-events-auto absolute left-5 right-5 top-[14svh] sm:left-8 lg:left-[4vw] lg:top-[20vh] lg:w-[42vw] z-10"
          >
            {/* Top Location Glass Badge */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-[var(--border)] bg-[var(--surface)]/80 px-3.5 py-1.5 backdrop-blur-md shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--blue)] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--blue)] shadow-[0_0_8px_var(--blue)]" />
              </span>
              <span className="micro font-mono text-[11px] tracking-[0.18em] text-[var(--text)] font-medium">
                CHANDIGARH UNIVERSITY · UNNAO, UP
              </span>
            </div>

            <h1 className="display mt-6 text-[clamp(2.8rem,7.2vw,6.2rem)] leading-[0.92] tracking-[-0.035em]">
              EVERYTHING
              <br />
              CAMPUS.
              <br />
              <span className="relative inline-block">
                <span className="serif-accent text-blue italic pr-2">One</span>
                <span className="bg-gradient-to-r from-[var(--text)] to-[var(--muted)] bg-clip-text text-transparent font-extrabold">KART.</span>
              </span>
            </h1>

            <p className="lede mt-6 text-[clamp(1rem,1.4vw,1.25rem)] text-[var(--muted)] leading-relaxed max-w-[42ch]">
              <span className="font-semibold text-[var(--food-ink)]">Food.</span>{" "}
              <span className="font-semibold text-[var(--rides-ink)]">Rides.</span>{" "}
              <span className="font-semibold text-[var(--essentials-ink)]">Essentials.</span>{" "}
              Campus life — one place, moving with the way you already live.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Magnetic>
                <button
                  type="button"
                  className="btn btn-solid !h-12 !px-7 text-[15px] font-semibold !rounded-full shadow-[0_12px_32px_-6px_rgba(59,130,246,0.35)] transition-all duration-300 hover:shadow-[0_16px_40px_-4px_rgba(59,130,246,0.5)] hover:scale-[1.02] relative group overflow-hidden"
                  onClick={() => scrollToId("ecosystem")}
                  data-cursor="cta"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Explore CampusKart <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </button>
              </Magnetic>
              <button
                type="button"
                className="btn !h-12 !px-7 text-[15px] font-medium !rounded-full border border-[var(--border)] bg-[var(--surface)]/70 backdrop-blur-md transition-all duration-300 hover:bg-[var(--surface-2)] hover:border-[var(--text)]/40 hover:scale-[1.02] group"
                onClick={() => scrollToId("how")}
                data-cursor="cta"
              >
                See How It Works <Arrow className="opacity-60 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0.5" />
              </button>
            </div>

            {/* Micro Live Campus Pill Stats */}
            <div className="mt-8 flex items-center gap-3.5 text-[11px] font-mono text-[var(--muted)] tracking-wider">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--food)]" /> OUTSIDE RESTAURANTS
              </span>
              <span className="text-[var(--border)]">|</span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--rides)]" /> CABS & RIDES AT GATE
              </span>
            </div>
          </div>

          {/* ------------------------------------------ service selector dock */}
          <div className="pointer-events-auto absolute bottom-[10vh] right-[4vw] hidden lg:flex flex-col items-end gap-2.5 z-20">
            {/* Active service blurb hint */}
            <p className="micro text-[11.5px] tracking-tight transition-all duration-300 text-[var(--muted)] text-right">
              <span className="font-semibold" style={{ color: SERVICE_META[hoverKind ?? service].ink }}>
                {SERVICE_META[hoverKind ?? service].label}:
              </span>{" "}
              {SERVICE_META[hoverKind ?? service].blurb}
            </p>

            {/* Compact horizontal glass dock */}
            <div className="flex items-center gap-1.5 p-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-2xl shadow-[0_12px_32px_-8px_rgba(0,0,0,0.3)]">
              {chips.map((s) => {
                const isSelected = service === s;
                const isHovered = hoverKind === s;
                const activeState = isHovered || isSelected;
                const meta = SERVICE_META[s];

                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setService(s)}
                    onMouseEnter={() => setHoverKind(s)}
                    onMouseLeave={() => setHoverKind(null)}
                    className="relative flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold transition-all duration-300"
                    style={{
                      color: activeState ? meta.ink : "var(--muted)",
                      background: isSelected ? "var(--surface-2)" : isHovered ? "var(--shade)" : "transparent",
                      boxShadow: isSelected ? `0 2px 10px ${meta.accent}25` : "none",
                    }}
                    data-cursor="link"
                  >
                    <span
                      className="h-2 w-2 rounded-full transition-all duration-300"
                      style={{
                        background: meta.accent,
                        transform: activeState ? "scale(1.25)" : "scale(1)",
                        boxShadow: activeState ? `0 0 8px ${meta.accent}` : "none",
                      }}
                    />
                    <span className="tracking-tight">{meta.label}</span>
                    {isSelected && (
                      <span
                        className="absolute inset-0 rounded-full border border-current opacity-30"
                        style={{ color: meta.accent }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ------------------------------------------ mobile chips */}
          <div className="pointer-events-auto absolute bottom-[11svh] left-5 right-5 flex gap-2 lg:hidden z-20">
            {chips.map((s) => {
              const isSelected = service === s;
              const meta = SERVICE_META[s];
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setService(s)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full border px-3 py-2 text-[12px] font-semibold backdrop-blur-xl transition-all duration-300 shadow-sm"
                  style={{
                    borderColor: isSelected ? meta.accent : "var(--border)",
                    color: isSelected ? meta.ink : "var(--muted)",
                    background: isSelected ? "var(--surface-2)" : "var(--nav-bg)",
                  }}
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: meta.accent }} />
                  {meta.label}
                </button>
              );
            })}
          </div>

          <div className="pointer-events-auto absolute bottom-[5svh] left-5 right-5 flex items-end justify-between lg:bottom-[5vh] lg:left-[4vw] lg:right-[4vw]">
            <div className="flex items-center gap-3">
              <span className="micro">Scroll</span>
              <span className="block h-8 w-px overflow-hidden" style={{ background: "var(--border)" }}>
                <span
                  className="block h-3 w-px"
                  style={{ background: "var(--blue)", animation: "ck-scroll 1.8s ease-in-out infinite" }}
                />
              </span>
            </div>
          </div>
        </div>

        {/* route that carries the eye into the next scene */}
        <div
          ref={leadLine}
          className="absolute bottom-0 left-0 h-px w-full origin-left"
          style={{ background: "var(--blue)", transform: "scaleX(0)" }}
          aria-hidden="true"
        />
      </div>

      <style>{`@keyframes ck-scroll { 0%{transform:translateY(-100%)} 50%{transform:translateY(120%)} 100%{transform:translateY(120%)} }`}</style>
    </section>
  );
}
