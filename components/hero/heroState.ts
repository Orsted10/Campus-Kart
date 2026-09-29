"use client";

/* Shared hero signals read inside useFrame — deliberately outside React state so
   pointer parallax and scroll never trigger a re-render at 60fps. */

export const pointer = { x: 0, y: 0 };

/* How far the reader has left the hero, 0 → 1. Written once per frame by the
   hero's own ticker and read by both the DOM layers (as --ck-scroll) and the 3D
   camera. One signal, one clock: when the DOM and the camera each smooth the
   raw scroll separately they fall out of step, and the hero visibly keeps
   moving for a beat after the scroll has already stopped. */
export const heroScroll = { v: 0 };

export function initPointer(center = true) {
  let px = 0;
  let py = 0;
  if (center) {
    px = 0;
    py = 0;
  }
  const onMove = (e: PointerEvent) => {
    px = (e.clientX / window.innerWidth) * 2 - 1;
    py = (e.clientY / window.innerHeight) * 2 - 1;
  };
  const onLeave = () => {
    px = 0;
    py = 0;
  };
  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerleave", onLeave);
  const tick = () => {
    pointer.x += (px - pointer.x) * 0.06;
    pointer.y += (py - pointer.y) * 0.06;
    raf = requestAnimationFrame(tick);
  };
  let raf = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerleave", onLeave);
  };
}

export type HeroTier = "high" | "low";

export function pickTier(reduced: boolean, width: number): HeroTier {
  if (reduced) return "low";
  if (width < 1024) return "low";
  return "high";
}
