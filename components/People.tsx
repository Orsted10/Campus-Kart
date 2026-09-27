"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap, useReveal } from "@/lib/motion";
import { useReducedMotion } from "@/lib/store";
import { Arrow, Magnetic } from "./Chrome";
import { scrollToId } from "@/lib/store";

export default function People() {
  const wrap = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const head = useReveal<HTMLDivElement>(24);

  useEffect(() => {
    if (!wrap.current || reduced) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        const amount = Number(el.dataset.parallax) || 12;
        gsap.fromTo(
          el,
          { yPercent: -amount },
          {
            yPercent: amount,
            ease: "none",
            scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });
    }, wrap);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section id="people" ref={wrap} className="relative px-5 pb-[12vh] pt-[8vh] sm:px-8 lg:px-[4vw]">
      <div className="mx-auto max-w-[1400px]">
        <div ref={head} className="flex items-center gap-3">
          <span className="h-px w-8" style={{ background: "var(--blue)" }} />
          <span className="micro">Act V — believe</span>
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:items-end">
          <h2 className="display text-[clamp(2.4rem,6vw,5.2rem)]">
            BEHIND EVERY REQUEST,
            <br />
            <span className="serif-accent text-blue">someone is moving.</span>
          </h2>
          <p className="lede lg:justify-self-end">            Students choosing, vendors cooking, riders crossing the quad. CampusKart isn&apos;t
            infrastructure for infrastructure&apos;s sake — it exists because campus life never
            stands still.
          </p>
        </div>

        {/* editorial photo composition */}
        <div className="mt-12 grid gap-5 lg:grid-cols-12">
          <figure className="relative overflow-hidden lg:col-span-7" style={{ background: "var(--surface-2)" }}>
            <div className="aspect-[16/11] w-full overflow-hidden">
              <Image
                data-parallax="8"
                src="/img/stu2.jpg"
                alt="Students walking together across campus"
                width={1400}
                height={963}
                className="h-[116%] w-full object-cover"
              />
            </div>
            <figcaption className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
              <span className="micro" style={{ color: "var(--text)" }}>
                08:10 · hostel steps
              </span>
              <span className="micro" style={{ color: "var(--text)" }}>
                Photo · demo
              </span>
            </figcaption>
          </figure>

          <div className="grid gap-5 lg:col-span-5">
            <figure className="relative overflow-hidden" style={{ background: "var(--surface-2)" }}>
              <div className="aspect-[16/10] w-full overflow-hidden">
                <Image
                  data-parallax="10"
                  src="/img/ven1.jpg"
                  alt="A vendor preparing food in a campus kitchen"
                  width={1400}
                  height={875}
                  className="h-[120%] w-full object-cover"
                />
              </div>
              <figcaption className="absolute bottom-4 left-4">
                <span className="micro" style={{ color: "var(--text)" }}>
                  13:18 · food court
                </span>
              </figcaption>
            </figure>

            <blockquote className="border-l-2 pl-5" style={{ borderColor: "var(--blue)" }}>
              <p className="text-[clamp(1.05rem,1.6vw,1.35rem)] leading-snug tracking-[-0.02em]">
                “The campus doesn&apos;t need another app. It needs its existing parts to finally
                <span className="serif-accent"> talk to each other.</span>”
              </p>
              <cite className="micro mt-3 block not-italic">CampusKart · design note</cite>
            </blockquote>
          </div>

          <figure className="relative overflow-hidden lg:col-span-5" style={{ background: "var(--surface-2)" }}>
            <div className="aspect-[16/10] w-full overflow-hidden">
              <Image
                data-parallax="9"
                src="/img/ride3.jpg"
                alt="A rider setting off on a campus road"
                width={1400}
                height={875}
                className="h-[118%] w-full object-cover"
              />
            </div>
            <figcaption className="absolute bottom-4 left-4">
              <span className="micro" style={{ color: "var(--text)" }}>
                17:47 · academic spine
              </span>
            </figcaption>
          </figure>

          <figure className="relative overflow-hidden lg:col-span-7" style={{ background: "var(--surface-2)" }}>
            <div className="aspect-[16/9] w-full overflow-hidden">
              <Image
                data-parallax="7"
                src="/img/lib1.jpg"
                alt="A student studying late in the campus library"
                width={1400}
                height={788}
                className="h-[116%] w-full object-cover"
              />
            </div>
            <figcaption className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
              <span className="micro" style={{ color: "var(--text)" }}>
                21:09 · library, second floor
              </span>
              <span className="micro" style={{ color: "var(--text)" }}>
                Photo · demo
              </span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}

/* ================================================================ VENDORS */

const PARTNERS = [
  { label: "Restaurants", note: "List once, serve the whole campus" },
  { label: "Cafés", note: "Peak-hour queues, pre-ordered" },
  { label: "Stores", note: "Shelf inventory, campus hours" },
  { label: "Drivers", note: "Verified routes, fixed pickup points" },
  { label: "Local businesses", note: "Reach students where they live" },
  { label: "Campus partners", note: "One dashboard for the institution" },
];

export function Vendors() {
  const [hover, setHover] = useState<number | null>(null);
  const reduced = useReducedMotion();
  const ref = useReveal<HTMLDivElement>(24);

  return (
    <section id="vendors" className="relative px-5 pb-[12vh] pt-[6vh] sm:px-8 lg:px-[4vw]">
      <div className="mx-auto max-w-[1400px] grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
        <div ref={ref}>
          <span className="micro">For the people who serve the campus</span>
          <h2 className="display mt-5 text-[clamp(2.3rem,5.4vw,4.6rem)]">
            BUILT AROUND
            <br />
            CAMPUS <span className="serif-accent text-essentials">life.</span>
          </h2>
          <p className="lede mt-6">
            The canteen that opens at six, the xerox shop that never closes, the driver who knows
            which gate is unlocked after nine. CampusKart connects them to the students who already
            rely on them.
          </p>

          <ul className="mt-9 border-t border-line">
            {PARTNERS.map((p, i) => (
              <li key={p.label}>
                <button
                  type="button"
                  onMouseEnter={() => setHover(i)}
                  onFocus={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => scrollToId("partner")}
                  className="group flex w-full items-center justify-between gap-4 border-b border-line py-4 text-left"
                  data-cursor="link"
                >
                  <span className="flex items-baseline gap-4">
                    <span className="num text-[12px]" style={{ color: hover === i ? "var(--essentials-ink)" : "var(--muted)" }}>
                      0{i + 1}
                    </span>
                    <span
                      className="text-[clamp(1.05rem,2vw,1.5rem)] tracking-[-0.03em] transition-all duration-300"
                      style={{
                        color: hover === i ? "var(--text)" : "var(--muted)",
                        transform: hover === i ? "translateX(6px)" : "none",
                      }}
                    >
                      {p.label}
                    </span>
                  </span>
                  <span className="hidden text-right text-[13px] text-muted sm:block">{p.note}</span>
                </button>
              </li>
            ))}
          </ul>

          <Magnetic>
            <button type="button" className="btn btn-solid mt-8" onClick={() => scrollToId("partner")} data-cursor="cta">
              Register as a campus partner <Arrow />
            </button>
          </Magnetic>
        </div>

        {/* vendor → student connection */}
        <div className="relative">
          <div className="relative overflow-hidden" style={{ background: "var(--surface-2)" }}>
            <Image
              src="/img/ven2.jpg"
              alt="A local café owner handing over an order"
              width={1400}
              height={1050}
              className="aspect-[4/3] w-full object-cover"
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: "linear-gradient(to top, color-mix(in srgb, var(--bg) 75%, transparent), transparent 55%)" }}
            />
            <svg viewBox="0 0 400 160" className="absolute inset-x-0 bottom-0 h-[42%] w-full" aria-hidden="true">
              <path
                d="M40,120 C 130,120 150,50 240,50 C 310,50 330,90 360,90"
                fill="none"
                stroke="var(--essentials)"
                strokeWidth="2"
                className={reduced ? "" : "route-dash"}
              />
              <g>
                <rect x="32" y="112" width="16" height="16" transform="rotate(45 40 120)" fill="var(--bg)" stroke="var(--essentials)" strokeWidth="2" />
                <text x="40" y="148" textAnchor="middle" fontSize="12" fill="var(--text)" style={{ fontFamily: "var(--font-mono)" }}>
                  VENDOR
                </text>
              </g>
              <g>
                <circle cx="360" cy="90" r="8" fill="var(--bg)" stroke="var(--blue)" strokeWidth="2" />
                <circle cx="360" cy="90" r="3" fill="var(--blue)" />
                <text x="360" y="72" textAnchor="middle" fontSize="12" fill="var(--text)" style={{ fontFamily: "var(--font-mono)" }}>
                  STUDENT
                </text>
              </g>
            </svg>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-px" style={{ background: "var(--border)" }}>
            {[
              ["Vendors list once", "Catalogue, hours, pricing — campus-wide"],
              ["Students see truth", "Open, closed, ready, arriving"],
            ].map(([t, d]) => (
              <div key={t} className="p-4" style={{ background: "var(--bg)" }}>
                <p className="text-[14px] font-medium">{t}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-muted">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
