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
  const [pickerOpen, setPickerOpen] = useState(false);
  const [hoverKind, setHoverKind] = useState<ServiceId | null>(null);
  const active = CAMPUSES.find((c) => c.id === campus) ?? CAMPUSES[0];

  useEffect(() => {
    const el = section.current;
    if (!el || reduced) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top top", end: "bottom bottom", scrub: 0.6 },
      });
      tl.fromTo(
        sceneWrap.current,
        { x: () => window.innerWidth * 0.12, scale: 0.98 },
        { x: 0, scale: 1.4, ease: "none" },
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
          className="absolute left-1/2 top-[54%] w-[124vw] max-w-[1500px] -translate-x-1/2 -translate-y-1/2 lg:top-1/2 lg:w-[74vw] lg:max-w-none"
          style={{ transformOrigin: "center" }}
        >
          <div className="relative">
            <CampusScene
              mode={hoverKind ?? service}
              onHover={(k) => setHoverKind(k === "food" || k === "rides" || k === "essentials" ? k : null)}
              showLabels={false}
              className="h-[46svh] w-full lg:h-[76vh]"
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(60% 60% at 50% 45%, transparent 40%, var(--bg) 100%)",
                opacity: 0.85,
              }}
            />
          </div>
        </div>

        {/* ---------------------------------------------------- copy */}
        <div className="pointer-events-none absolute inset-0">
          <div
            ref={copy}
            className="pointer-events-auto absolute left-5 right-5 top-[16svh] sm:left-8 lg:left-[4vw] lg:top-[24vh] lg:w-[46vw]"
          >
            <div className="flex items-center gap-3">
              <span className="h-px w-8" style={{ background: "var(--blue)" }} />
              <span className="micro">
                {active.name.split(" ")[0]} campus · {active.city} · demo
              </span>
            </div>

            <h1 className="display mt-5 text-[clamp(2.7rem,7.4vw,6.4rem)]">
              EVERYTHING
              <br />
              CAMPUS.
              <br />
              <span className="serif-accent text-blue">One</span> KART.
            </h1>

            <p className="lede mt-6">
              Food. Rides. Essentials. Campus life — one place, moving with the way you already live.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Magnetic>
                <button
                  type="button"
                  className="btn btn-solid"
                  onClick={() => scrollToId("ecosystem")}
                  data-cursor="cta"
                >
                  Explore CampusKart <Arrow />
                </button>
              </Magnetic>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => scrollToId("how")}
                data-cursor="cta"
              >
                See How It Works <Arrow />
              </button>
            </div>
          </div>

          {/* ------------------------------------------ campus selector */}
          <div className="pointer-events-auto absolute bottom-[19svh] left-5 sm:left-8 lg:bottom-[14vh] lg:left-[4vw]">
            <p className="micro">Where do you campus?</p>
            <div className="relative mt-2">
              <button
                type="button"
                onClick={() => setPickerOpen((v) => !v)}
                aria-expanded={pickerOpen}
                data-cursor="link"
                className="flex items-center gap-3 border-b border-line pb-2 text-left text-[15px] font-medium transition-colors hover:border-ink"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: "var(--blue)" }}
                  aria-hidden="true"
                />
                {active.name}
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden="true"
                  style={{
                    transform: pickerOpen ? "rotate(180deg)" : "none",
                    transition: "transform .35s ease",
                  }}
                >
                  <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </button>
              <div
                className="panel absolute bottom-[calc(100%+10px)] left-0 z-30 w-[min(84vw,340px)] overflow-hidden"
                style={{
                  opacity: pickerOpen ? 1 : 0,
                  transform: pickerOpen ? "none" : "translateY(10px)",
                  pointerEvents: pickerOpen ? "auto" : "none",
                  transition: "all .4s cubic-bezier(.22,1,.36,1)",
                }}
              >
                {CAMPUSES.map((c, i) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setCampus(c.id);
                      setPickerOpen(false);
                    }}
                    className="flex w-full items-center justify-between border-b border-line px-4 py-3 text-left text-[14px] transition-colors last:border-b-0 hover:bg-surface2"
                    style={{ transitionDelay: pickerOpen ? `${i * 30}ms` : "0ms" }}
                  >
                    <span className={c.id === campus ? "font-medium" : "text-muted"}>{c.name}</span>
                    <span className="micro">{c.city}</span>
                  </button>
                ))}
              </div>
              <p className="micro mt-2">{active.note}</p>
            </div>
          </div>

          {/* ------------------------------------------ service selector */}
          <div className="pointer-events-auto absolute bottom-[19svh] right-5 hidden text-right sm:right-8 lg:bottom-[14vh] lg:right-[4vw] lg:block">
            <p className="micro">Wake a service</p>
            <div className="mt-3 flex flex-col items-end gap-2">
              {chips.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setService(s)}
                  onMouseEnter={() => setHoverKind(s)}
                  onMouseLeave={() => setHoverKind(null)}
                  className="group flex items-center gap-3 text-right"
                  data-cursor="link"
                >
                  <span
                    className="text-[13px] transition-all duration-300"
                    style={{
                      color: service === s ? SERVICE_META[s].ink : "var(--muted)",
                      transform: service === s ? "translateX(-4px)" : "none",
                    }}
                  >
                    {SERVICE_META[s].blurb}
                  </span>
                  <span
                    className="display text-[1.5rem] transition-all duration-300"
                    style={{
                      color: service === s ? SERVICE_META[s].ink : "var(--text)",
                      opacity: service === s ? 1 : 0.55,
                    }}
                  >
                    {SERVICE_META[s].label.toUpperCase()}
                  </span>
                  <span
                    className="h-px transition-all duration-500"
                    style={{
                      width: service === s ? 44 : 18,
                      background: service === s ? SERVICE_META[s].accent : "var(--border)",
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* ------------------------------------------ mobile chips */}
          <div className="pointer-events-auto absolute bottom-[11svh] left-5 right-5 flex gap-2 lg:hidden">
            {chips.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setService(s)}
                className="flex-1 rounded-full border px-3 py-2 text-[12px] transition-all duration-300"
                style={{
                  borderColor: service === s ? SERVICE_META[s].ink : "var(--border)",
                  color: service === s ? SERVICE_META[s].ink : "var(--muted)",
                  background: service === s ? "var(--surface)" : "transparent",
                }}
              >
                {SERVICE_META[s].label}
              </button>
            ))}
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
            <button
              type="button"
              className="micro transition-colors hover:text-ink"
              onClick={(e) =>
                openOverlay("search", { x: e.clientX, y: e.clientY })
              }
              data-cursor="link"
            >
              Search the campus ⌘K
            </button>
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
