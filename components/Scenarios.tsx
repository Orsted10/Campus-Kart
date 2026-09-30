"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import { SCENARIOS, SERVICE_META } from "@/lib/data";
import { useReducedMotion } from "@/lib/store";
import { gsap, ScrollTrigger } from "@/lib/motion";
const PHOTOS = ["/img/stu1.jpg", "/img/food3.jpg", "/img/shop1.jpg", "/img/hst1.jpg"];

const ALTS = [
  "Students crossing campus in the morning",
  "Street food being prepared on campus",
  "A stationery shop counter",
  "A hostel corridor at night",
];

export default function Scenarios() {
  const section = useRef<HTMLElement | null>(null);
  const [index, setIndex] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          const i = Math.min(SCENARIOS.length - 1, Math.floor(self.progress * SCENARIOS.length));
          setIndex((prev) => (prev === i ? prev : i));
        },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  const s = SCENARIOS[index];
  const accent = SERVICE_META[s.service].accent;
  const ink = SERVICE_META[s.service].ink;

  return (
    <section id="stories" ref={section} className="relative h-[300vh]">
      <div className="sticky top-0 flex h-[100svh] flex-col justify-between overflow-hidden px-5 pb-[4vh] pt-[112px] sm:px-8 sm:pt-[120px] lg:px-[4vw] lg:pt-[128px]">
        <div className="mx-auto w-full max-w-[1400px]">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <span className="micro">A day on campus · four moments</span>
            <span className="micro">
              0{index + 1} / 0{SCENARIOS.length}
            </span>
          </div>

          <div className="mt-8 grid items-center gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            <div>
              <div className="relative h-[clamp(4rem,9vw,7rem)] overflow-hidden">
                <span
                  key={s.time}
                  className="num absolute inset-x-0 top-0 block text-[clamp(4rem,9vw,7rem)] font-medium leading-none tracking-[-0.05em]"
                  style={{ animation: reduced ? "none" : "ck-time .6s cubic-bezier(.22,1,.36,1) both" }}
                >
                  {s.time}
                </span>
              </div>

              <div className="relative mt-4 min-h-[9rem] sm:min-h-[8rem]">
                <div
                  key={s.title}
                  style={{ animation: reduced ? "none" : "ck-rise .6s .08s cubic-bezier(.22,1,.36,1) both" }}
                >
                  <h2 className="display text-[clamp(2rem,5vw,4rem)]">
                    {s.title.toUpperCase()}
                  </h2>
                  <p className="lede mt-4 max-w-[42ch]">{s.detail}</p>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-5">
                <span className="micro">CampusKart:</span>
                <span
                  className="display text-[clamp(1.6rem,3.4vw,2.6rem)] transition-colors duration-500"
                  style={{ color: accent }}
                >
                  {s.action.toUpperCase()}
                </span>
              </div>

              {/* progress rail */}
              <div className="mt-8 flex items-center gap-3">
                {SCENARIOS.map((sc, i) => (
                  <span key={sc.time} className="flex-1">
                    <span
                      className="block h-[3px] transition-all duration-500"
                      style={{ background: i <= index ? accent : "var(--border)" }}
                    />
                    <span
                      className="micro mt-2 block"
                      style={{ color: i === index ? ink : undefined }}
                    >
                      {sc.time}
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* photo stack */}
            <div className="relative hidden aspect-[4/5] w-full overflow-hidden lg:block" style={{ background: "var(--surface-2)" }}>
              {PHOTOS.map((p, i) => (
                <Image
                  key={p}
                  src={p}
                  alt={ALTS[i]}
                  fill
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="absolute inset-0 h-full w-full object-cover transition-all duration-700"
                  style={{
                    opacity: index === i ? 1 : 0,
                    transform: index === i ? "scale(1)" : "scale(1.06)",
                  }}
                />
              ))}
              <div
                className="pointer-events-none absolute inset-0"
                style={{ background: "linear-gradient(to top, color-mix(in srgb, var(--bg) 70%, transparent), transparent 45%)" }}
              />
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                <span className="micro" style={{ color: ink }}>
                  {SERVICE_META[s.service].label}
                </span>
                <span className="micro" style={{ color: "var(--text)" }}>
                  example campus
                </span>
              </div>
            </div>
          </div>
        </div>

        <p className="micro absolute bottom-6 left-5 sm:left-8 lg:left-[4vw]">
          Keep scrolling — the day continues
        </p>
      </div>

      <style>{`
        @keyframes ck-time { from { opacity:0; transform: translateY(100%) } to { opacity:1; transform:none } }
        @keyframes ck-rise { from { opacity:0; transform: translateY(18px) } to { opacity:1; transform:none } }
      `}</style>
    </section>
  );
}
