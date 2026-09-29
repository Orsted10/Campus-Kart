"use client";

import { useEffect, useRef, useState } from "react";
import { Arrow } from "./Chrome";
import { gsap, ScrollTrigger, useReveal } from "@/lib/motion";
import { scrollToId, useReducedMotion } from "@/lib/store";

/* --------------------------------------------------------------------------
   HOW IT WORKS
   Three stages, scrubbed against scroll: discover what is open around campus,
   order it, and have it arrive where you already are.
--------------------------------------------------------------------------- */

const STAGES = [
  {
    n: "01",
    title: "DISCOVER",
    accent: "#5aa2ff",
    line: "Everything open around campus, on one screen.",
    detail:
      "Restaurants outside the gate, cabs waiting at the stand, the store that still has what you forgot. No five apps, no group chat screenshots.",
    points: ["Live availability", "Block-level menus", "Honest ETAs"],
  },
  {
    n: "02",
    title: "ORDER",
    accent: "#ff8a3d",
    line: "One tap. One cart. One campus account.",
    detail:
      "Food, a ride or a stationery run confirm the same way — campus-verified, cashless, and tracked from the second it is accepted.",
    points: ["UPI & campus wallet", "Verified vendors", "Live tracking"],
  },
  {
    n: "03",
    title: "ARRIVE",
    accent: "#35d07f",
    line: "It meets you where you already are.",
    detail:
      "Your block gate, your hostel stairwell, your classroom corridor. The last hundred metres are the part every other app gets wrong.",
    points: ["Hostel & block drops", "Gate pickups", "Night-safe routes"],
  },
];

/** Progress across the section while it is actually on screen, so the three
    stages light up in front of the reader rather than after they have scrolled
    past. */
function useStageProgress<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [progress, setProgress] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 82%",
        end: "bottom 58%",
        scrub: true,
        onUpdate: (self) => setProgress(reduced ? 1 : self.progress),
      });
    }, el);
    return () => ctx.revert();
  }, [reduced]);

  return { ref, progress: reduced ? 1 : progress };
}

export default function HowItWorks() {
  const head = useReveal<HTMLDivElement>(24);
  const { ref, progress } = useStageProgress<HTMLDivElement>();

  return (
    <section id="how" className="relative px-5 pb-[14vh] pt-[12vh] sm:px-8 lg:px-[4vw]">
      <div ref={head} className="mx-auto max-w-[1400px]">
        <div className="flex items-end justify-between gap-6 border-t border-line pt-6">
          <span className="micro">how it works</span>
          <span className="micro text-right">
            three stages · <span className="text-blue">discover → arrive</span>
          </span>
        </div>

        <h2 className="display mt-8 max-w-[18ch] text-[clamp(2.3rem,5.4vw,4.6rem)]">
          THREE MOVES,
          <br />
          <span className="serif-accent text-blue">no friction.</span>
        </h2>
      </div>

      <div ref={ref} className="mx-auto mt-14 max-w-[1400px]">
        {/* the rail the three stages hang from */}
        <div className="relative hidden h-[2px] w-full bg-line lg:block">
          <div
            className="absolute inset-y-0 left-0 bg-blue transition-[width] duration-200 ease-out"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>

        <div className="grid gap-6 pt-6 lg:grid-cols-3 lg:gap-8">
          {STAGES.map((s, i) => (
            <Stage key={s.n} stage={s} index={i} progress={progress} />
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => scrollToId("ecosystem")}
            data-cursor="cta"
            className="btn btn-solid !h-11 !px-6"
          >
            Explore CampusKart <Arrow />
          </button>
          <button
            type="button"
            onClick={() => scrollToId("partner")}
            data-cursor="link"
            className="btn btn-ghost !h-11 !px-6"
          >
            Bring it to your campus <Arrow />
          </button>
        </div>
      </div>
    </section>
  );
}

function Stage({
  stage,
  index,
  progress,
}: {
  stage: (typeof STAGES)[number];
  index: number;
  progress: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const start = 0.04 + index * 0.24;
  const local = Math.min(1, Math.max(0, (progress - start) / 0.32));

  return (
    <div
      ref={ref}
      className="relative border-t border-line pt-6 transition-[opacity,transform] duration-500 lg:border-t-0"
      style={{
        opacity: 0.42 + local * 0.58,
        transform: `translateY(${(1 - local) * 14}px)`,
      }}
    >
      <div className="flex items-baseline gap-4">
        <span className="num text-[13px]" style={{ color: stage.accent }}>
          {stage.n}
        </span>
        <span
          className="h-[2px] flex-1 origin-left transition-transform duration-500"
          style={{
            background: stage.accent,
            transform: `scaleX(${0.18 + local * 0.82})`,
          }}
        />
      </div>

      <h3 className="display mt-5 text-[clamp(1.9rem,3.4vw,2.8rem)]" style={{ color: "var(--text)" }}>
        {stage.title}
      </h3>
      <p className="mt-3 text-[15px] font-medium text-ink">{stage.line}</p>
      <p className="lede mt-3 max-w-[36ch] text-[14px]">{stage.detail}</p>

      <ul className="mt-5 flex flex-wrap gap-2">
        {stage.points.map((p) => (
          <li
            key={p}
            className="rounded-full border px-3 py-1 text-[11px] tracking-tight"
            style={{
              borderColor: `color-mix(in srgb, ${stage.accent} 34%, transparent)`,
              color: stage.accent,
              background: `color-mix(in srgb, ${stage.accent} 10%, transparent)`,
            }}
          >
            {p}
          </li>
        ))}
      </ul>
    </div>
  );
}
