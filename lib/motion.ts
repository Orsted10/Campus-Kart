"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

/* register once at module load so any importer's effects are safe */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}
function register() {
  if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);
}

/** Lenis smooth scroll wired into GSAP's ticker; keyboard + touch stay native. */
export function useSmoothScroll() {
  useEffect(() => {
    register();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    });
    (window as unknown as { lenis?: Lenis }).lenis = lenis;

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      delete (window as unknown as { lenis?: Lenis }).lenis;
    };
  }, []);
}

/** Element reveal: fades + rises once, on enter. Reverses with scroll. */
export function useReveal<T extends HTMLElement>(distance = 28) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    register();
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      gsap.set(el, { opacity: 1, y: 0 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y: distance },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 86%", toggleActions: "play none none reverse" },
        },
      );
    }, el);
    return () => ctx.revert();
  }, [distance]);
  return ref;
}

/** Scrubbed progress (0..1) for a tall pinned-feeling section. */
export function useScrub<T extends HTMLElement>(length = "+=120%") {
  const ref = useRef<T | null>(null);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    register();
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: length,
        scrub: true,
        onUpdate: (self) => setProgress(self.progress),
      });
    }, el);
    return () => ctx.revert();
  }, [length]);
  return { ref, progress };
}

export { gsap, ScrollTrigger };
