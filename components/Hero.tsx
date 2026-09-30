"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { ArrowRight, CarFront, Package, Play, UtensilsCrossed } from "lucide-react";
import { SERVICE_META, type NodeKind, type ServiceId } from "@/lib/data";
import { scrollToId, useApp, useReducedMotion } from "@/lib/store";
import { Arrow } from "./Chrome";
import CampusScene from "./CampusScene";
import { heroScroll, initPointer, pickTier, pointer, type HeroTier } from "./hero/heroState";

const HeroScene = dynamic(() => import("./hero/HeroScene"), {
  ssr: false,
  loading: () => null,
});

/* --------------------------------------------------------------------------
   HERO — cinematic campus plaza, huge editorial headline on the left, the
   CampusKart monument standing on its lit pedestal centre-right, floating
   glass navigation, three service cards across the lower third.
--------------------------------------------------------------------------- */

const ACCENTS: Record<ServiceId, string> = {
  food: "#ff7a1a",
  rides: "#2f8dff",
  essentials: "#22c55e",
};

const SERVICE_COPY: { id: ServiceId; title: string; body: string; icon: ReactNode; img: string; pos: string }[] = [
  {
    id: "food",
    title: "Food",
    body: "Top outside restaurants & eateries near campus.",
    icon: <UtensilsCrossed size={17} strokeWidth={2.1} />,
    img: "/img/ven1.jpg",
    pos: "object-[62%_58%]",
  },
  {
    id: "rides",
    title: "Rides",
    body: "Cabs & rides at gate with real-time availability.",
    icon: <CarFront size={17} strokeWidth={2.1} />,
    img: "/img/ride3.jpg",
    pos: "object-[34%_86%]",
  },
  {
    id: "essentials",
    title: "Essentials",
    body: "Everything you need, delivered straight to your block.",
    icon: <Package size={17} strokeWidth={2.1} />,
    img: "/img/hst1.jpg",
    pos: "object-[46%_48%]",
  },
];

export default function Hero() {
  const { service, setService, theme } = useApp();
  const isLight = theme === "light";
  const reduced = useReducedMotion();
  const [tier, setTier] = useState<HeroTier>("high");
  const [hoverKind, setHoverKind] = useState<ServiceId | null>(null);
  const [play, setPlay] = useState(false);
  const [inView, setInView] = useState(true);
  const root = useRef<HTMLElement | null>(null);
  const showing = useRef(true);

  const setHover = useCallback((next: ServiceId | null) => {
    setHoverKind((cur) => (cur === next ? cur : next));
  }, []);

  /* pointer parallax feed for the 3D layer */
  useEffect(() => initPointer(), []);

  /* One ticker owns the hero's motion signals. Both the DOM layers and the 3D
     camera read this same value, so nothing in the hero can disagree about how
     far the reader has scrolled. The easing is frame-rate independent and snaps
     on arrival, which is what keeps a slow frame from being mistaken for drift. */
  useEffect(() => {
    if (reduced) return;
    const el = root.current;
    if (!el) return;
    let raf = 0;
    let px = 0;
    let py = 0;
    let s = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const frame = Math.max(0, (now - last) / 1000);
      last = now;
      /* The pointer is damped with a short clamp, the scroll with a long one:
         a stalled frame should never leave the hero lagging behind a scroll
         that has already happened, but a jumpy cursor is fine to soften. */
      const kp = 1 - Math.exp(-Math.min(0.064, frame) * 12);
      const ks = 1 - Math.exp(-Math.min(0.5, frame) * 12);
      px += (pointer.x - px) * kp;
      py += (pointer.y - py) * kp;
      const to = Math.min(
        1,
        Math.max(0, window.scrollY / Math.max(1, window.innerHeight * 0.9)),
      );
      /* land exactly on the endpoints rather than approaching them forever */
      s = Math.abs(to - s) < 0.004 ? to : s + (to - s) * ks;
      heroScroll.v = s;
      /* off screen the world is paused and nothing is visible, so skip the
         style writes — but keep tracking, or the hero would lurch on re-entry */
      if (showing.current) {
        el.style.setProperty("--ck-px", px.toFixed(4));
        el.style.setProperty("--ck-py", py.toFixed(4));
        el.style.setProperty("--ck-scroll", s.toFixed(4));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      heroScroll.v = 0;
    };
  }, [reduced]);

  /* Stop rendering the plaza the moment it leaves the viewport. The hero scene
     is the heaviest thing on the page, and paying for it while the reader is
     three sections further down is what makes the rest of the scroll feel
     sticky. */
  useEffect(() => {
    const el = root.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        const next = entries[0]?.isIntersecting ?? true;
        showing.current = next;
        setInView(next);
      },
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* quality tier — recomputed only on real breakpoint changes */
  useEffect(() => {
    const decide = () => setTier(pickTier(reduced, window.innerWidth));
    decide();
    let w = window.innerWidth;
    const onResize = () => {
      if (Math.abs(window.innerWidth - w) < 120) return;
      w = window.innerWidth;
      decide();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [reduced]);

  /* the load choreography starts the moment the intro curtain clears */
  useEffect(() => {
    let done = false;
    const start = () => {
      if (done) return;
      done = true;
      setPlay(true);
    };
    if (sessionStorage.getItem("ck-intro") || reduced) {
      const t = window.setTimeout(start, 60);
      return () => window.clearTimeout(t);
    }
    window.addEventListener("ck:intro", start);
    const fallback = window.setTimeout(start, 2400);
    return () => {
      window.removeEventListener("ck:intro", start);
      window.clearTimeout(fallback);
    };
  }, [reduced]);

  const active = hoverKind ?? service;
  const accent = ACCENTS[active];

  return (
    <section
      ref={root}
      id="top"
      data-play={play ? "1" : "0"}
      className={`ck-hero relative isolate w-full overflow-hidden transition-colors duration-500 ${
        isLight ? "bg-[#ebf4ff] text-slate-900" : "bg-[#05070d] text-white"
      }`}
      style={{ "--ck-accent": accent } as React.CSSProperties}
    >
      {/* ---------------------------------------------------------- scene */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0 ck-glow"
          style={{ background: `radial-gradient(120% 90% at 62% 68%, ${accent}${isLight ? "25" : "22"} 0%, transparent 55%)` }}
        />
        <div className="absolute inset-0 ck-scene" data-play={play ? "1" : "0"}>
          <HeroScene tier={tier} reduced={reduced} accent={accent} active={inView} mode={theme} />
        </div>
        {/* atmospheric scrims: depth, legibility, and the vignette of a lens */}
        <div
          className={`ck-par pointer-events-none absolute inset-x-0 top-0 h-[26vh] bg-gradient-to-b ${
            isLight ? "from-[#ebf4ff]/90 via-[#ebf4ff]/40 to-transparent" : "from-[#04060c]/92 via-[#04060c]/45 to-transparent"
          }`}
          data-depth="2"
        />
        <div
          className={`ck-par pointer-events-none absolute inset-x-0 bottom-0 h-[38vh] bg-gradient-to-t ${
            isLight ? "from-[#ebf4ff] via-[#ebf4ff]/75 to-transparent" : "from-[#04060c] via-[#04060c]/72 to-transparent"
          }`}
          data-depth="9"
        />
        <div
          className={`ck-par pointer-events-none absolute inset-y-0 left-0 w-[46%] bg-gradient-to-r ${
            isLight ? "from-[#ebf4ff]/90 via-[#ebf4ff]/40 to-transparent" : "from-[#04060c]/86 via-[#04060c]/38 to-transparent"
          }`}
          data-depth="4"
        />
        <div
          className={`ck-par pointer-events-none absolute inset-0 ck-vignette ${isLight ? "opacity-25" : "opacity-100"}`}
          data-depth="3"
        />
      </div>

      {/* --------------------------------------------------------- content */}
      <div className="ck-exit relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1680px] flex-col justify-between px-5 pb-5 pt-[84px] sm:px-8 sm:pb-7 lg:px-[4.2vw] lg:pt-[104px]">
        {/* upper: copy left, blueprint HUD right */}
        <div className="grid flex-1 grid-cols-1 items-start gap-6 lg:grid-cols-12">
          <div className="order-2 lg:order-1 lg:col-span-5 xl:col-span-5">
            <div data-ck="badge" style={{ animationDelay: "0.42s" }} className="ck-in">
              <LocationBadge />
            </div>

            <h1 className="ck-display mt-4 text-[clamp(2.8rem,12.5vw,4.4rem)] font-black leading-[0.91] tracking-[-0.045em] sm:text-[clamp(2.95rem,7.8vw,5.35rem)] lg:mt-7 lg:text-[clamp(3.2rem,5.1vw,6.85rem)]">
              <Reveal delay={0.5}>
                <span className="text-white">EVERYTHING</span>
              </Reveal>
              <Reveal delay={0.6}>
                <span className="text-white">CAMPUS.</span>
              </Reveal>
              <Reveal delay={0.7}>
                <span className="text-white">
                  <span className="ck-serif mr-[0.06em] text-[1.06em] text-[#2f8dff]">One</span>
                  <span>KART.</span>
                </span>
              </Reveal>
            </h1>

            <p
              data-ck="desc"
              style={{ animationDelay: "0.86s" }}
              className="ck-in mt-5 max-w-[44ch] text-[15px] leading-relaxed text-slate-200/85 sm:mt-8 sm:text-[16px] lg:text-[16.5px]"
            >
              <span className="font-bold text-[#ff8a3d]">Food.</span>{" "}
              <span className="font-bold text-[#5aa2ff]">Rides.</span>{" "}
              <span className="font-bold text-[#35d07f]">Essentials.</span> Campus life — one place,
              moving with the way you already live.
            </p>

            <div
              data-ck="cta"
              style={{ animationDelay: "1.02s" }}
              className="ck-in mt-6 flex flex-wrap items-center gap-3 sm:mt-8 lg:mt-9"
            >
              <button
                type="button"
                onClick={() => scrollToId("ecosystem")}
                data-cursor="cta"
                className="ck-btn ck-btn-primary group"
              >
                Explore CampusKart
                <ArrowRight size={16} strokeWidth={2.4} className="transition-transform duration-300 group-hover:translate-x-1" />
              </button>
              <button type="button" onClick={() => scrollToId("how")} data-cursor="link" className="ck-btn ck-btn-ghost group">
                <span className="grid h-6 w-6 place-items-center rounded-lg bg-white/10 transition-colors duration-300 group-hover:bg-white/20">
                  <Play size={10} fill="currentColor" strokeWidth={0} />
                </span>
                See How It Works
              </button>
            </div>
          </div>

          {/* floating blueprint: the campus, as an interface */}
          <div className="order-1 hidden justify-end lg:order-2 lg:col-span-7 lg:flex xl:col-span-6 xl:col-start-7">
            <div className="ck-par w-full max-w-[468px]" data-depth="5">
              <div data-ck="hud" style={{ animationDelay: "1.2s" }} className="ck-in">
                <div className="ck-hud">
                  <HudPanel active={active} onHover={setHoverKind} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* portrait: the sculpture needs the middle of the frame to itself */}
        <div className="h-[23vh] shrink-0 sm:h-[29vh] lg:hidden" aria-hidden />

        {/* lower: service cards */}
        <div className="mt-6 lg:mt-5">
          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 lg:grid lg:grid-cols-3 lg:gap-4 lg:overflow-visible lg:px-[8.4vw] xl:px-[10vw] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {SERVICE_COPY.map((s, i) => (
              <ServiceCard
                key={s.id}
                {...s}
                delay={1.12 + i * 0.09}
                play={play}
                active={active === s.id}
                dimmed={hoverKind !== null && hoverKind !== s.id}
                onActivate={() => setService(s.id)}
                onHover={(v) => setHover(v ? s.id : null)}
              />
            ))}
          </div>
        </div>

        {/* footer strip: social proof, scroll cue, category switcher */}
        <div
          data-ck="foot"
          style={{ animationDelay: "1.34s" }}
          className="ck-in mt-6 flex flex-col gap-5 border-t border-white/[0.07] pt-4 sm:flex-row sm:items-center sm:justify-between lg:mt-7 lg:pt-5"
        >
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2.5">
              {["/img/stu1.jpg", "/img/ven1.jpg", "/img/stu2.jpg", "/img/ven2.jpg"].map((src, i) => (
                <span
                  key={src + i}
                  className="relative h-7 w-7 overflow-hidden rounded-full border border-white/[0.18] bg-[#0d1220] shadow-[0_3px_10px_-4px_rgba(0,0,0,0.9)]"
                >
                  <Image src={src} alt="" fill sizes="32px" className="object-cover" />
                </span>
              ))}
            </div>
            <div className="text-[11.5px] leading-tight text-slate-300/75">
              <p>
                <span className="font-semibold text-white/95">5000+</span> students already use CampusKart
              </p>
              <p className="mt-0.5 hidden text-[10.5px] text-slate-400/80 sm:block">
                Food <span className="text-slate-600">•</span> Rides <span className="text-slate-600">•</span>{" "}
                Essentials <span className="text-slate-600">•</span> A Happier Campus Life
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => scrollToId("connect")}
            data-cursor="link"
            className="group hidden items-center gap-2 text-[10.5px] uppercase tracking-[0.2em] text-slate-300/80 transition-colors hover:text-white md:flex"
          >
            <span className="ck-mouse">
              <span className="ck-mouse-dot" />
            </span>
            Scroll to Explore
          </button>

          <div className="ck-switch" role="group" aria-label="Service focus">
            {(["food", "rides", "essentials"] as ServiceId[]).map((id) => (
              <button
                key={id}
                type="button"
                aria-pressed={active === id}
                data-cursor="link"
                onMouseEnter={() => setHover(id)}
                onMouseLeave={() => setHover(null)}
                onClick={() => setService(id)}
                className="ck-switch-item"
                style={{ "--dot": ACCENTS[id] } as React.CSSProperties}
              >
                <span className="ck-dot" />
                {SERVICE_META[id].label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- pieces */

function Reveal({ children, delay }: { children: ReactNode; delay: number }) {
  return (
    <span className="ck-line">
      <span className="ck-line-inner" style={{ animationDelay: `${delay}s` }}>
        {children}
      </span>
    </span>
  );
}

function LocationBadge() {
  const { theme } = useApp();
  const isLight = theme === "light";
  return (
    <span
      className={`inline-flex items-center gap-2.5 rounded-xl border px-4 py-2 backdrop-blur-xl transition-colors duration-300 ${
        isLight
          ? "border-slate-300/80 bg-white/85 text-slate-800 shadow-[0_10px_30px_-18px_rgba(37,99,235,0.25)]"
          : "border-white/[0.14] bg-[#070b16]/75 text-slate-100/95 shadow-[0_10px_30px_-18px_rgba(47,141,255,0.9)]"
      }`}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3b8dff] opacity-70" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#3b8dff] shadow-[0_0_10px_#3b8dff]" />
      </span>
      <span
        className={`font-mono text-[9.5px] font-medium uppercase tracking-[0.21em] sm:text-[10px] ${
          isLight ? "text-slate-700" : "text-slate-100/95"
        }`}
      >
        Chandigarh University <span className={isLight ? "text-slate-400" : "text-slate-500"}>•</span> Unnao, UP
      </span>
    </span>
  );
}

function HudPanel({
  active,
  onHover,
}: {
  active: ServiceId;
  onHover: (s: ServiceId | null) => void;
}) {
  const { setService, theme } = useApp();
  const isLight = theme === "light";
  const handleHover = useCallback(
    (kind: NodeKind | null) => {
      const next = kind && kind !== "campus" ? (kind as ServiceId) : null;
      onHover(next);
    },
    [onHover],
  );
  return (
    <div
      className={`ck-hud-frame relative rounded-[22px] p-[1px] transition-all duration-300 ${
        isLight
          ? "border border-slate-300/80 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.12)] bg-gradient-to-br from-white via-white/80 to-blue-50/50"
          : "border border-white/10 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.85)]"
      }`}
    >
      <div
        className={`relative overflow-hidden rounded-[21px] px-4 pb-2.5 pt-3.5 backdrop-blur-[24px] ${
          isLight ? "bg-white/90 text-slate-800" : "bg-[#060b18]/96 text-white"
        }`}
      >
        {/* glass: top-left specular gradient scrim */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.12] via-transparent to-[#3f8dff]/[0.08]" />
        <div
          className={`relative mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.22em] ${
            isLight ? "text-slate-700" : "text-slate-200/90"
          }`}
        >
          <span>Campus network</span>
          <span className="flex items-center gap-1.5 text-[#2563eb] dark:text-[#5aa2ff]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2563eb] dark:bg-[#5aa2ff] shadow-[0_0_10px_#2563eb] animate-pulse" />
            Live
          </span>
        </div>
        <CampusScene
          mode={active}
          showLabels={false}
          onHover={handleHover}
          onNodeClick={() => setService(active)}
          className="relative h-[302px] w-full"
        />
        {/* the legend */}
        <div
          className={`relative mt-1.5 flex items-center justify-between gap-2 border-t pt-2 text-[9.5px] font-semibold uppercase tracking-[0.18em] ${
            isLight ? "border-slate-200 text-slate-600" : "border-white/[0.09] text-slate-300/85"
          }`}
        >
          {(["food", "rides", "essentials"] as ServiceId[]).map((id) => (
            <span key={id} className="flex items-center gap-1.5">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: ACCENTS[id], boxShadow: `0 0 8px ${ACCENTS[id]}` }}
              />
              {SERVICE_META[id].label}
            </span>
          ))}
          <span className={isLight ? "text-slate-400" : "text-slate-400/70"}>5 districts</span>
        </div>
      </div>
    </div>
  );
}

function ServiceCard({
  id,
  title,
  body,
  icon,
  img,
  pos,
  delay,
  play,
  active,
  dimmed,
  onActivate,
  onHover,
}: {
  id: ServiceId;
  title: string;
  body: string;
  icon: ReactNode;
  img: string;
  pos: string;
  delay: number;
  play: boolean;
  active: boolean;
  dimmed: boolean;
  onActivate: () => void;
  onHover: (v: boolean) => void;
}) {
  const { theme } = useApp();
  const isLight = theme === "light";
  const ref = useRef<HTMLDivElement | null>(null);
  const frame = useRef<number | null>(null);

  /* cursor tilt — the card physically leans, the artwork shifts with it */
  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      el.style.setProperty("--tx", `${px * 9}deg`);
      el.style.setProperty("--ty", `${-py * 7}deg`);
      el.style.setProperty("--mx", `${px * 14}px`);
      el.style.setProperty("--my", `${py * 10}px`);
    });
  }, []);

  const reset = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--tx", "0deg");
    el.style.setProperty("--ty", "0deg");
    el.style.setProperty("--mx", "0px");
    el.style.setProperty("--my", "0px");
  }, []);

  useEffect(() => () => {
    if (frame.current) cancelAnimationFrame(frame.current);
  }, []);

  return (
    <div
      ref={ref}
      data-ck={`card-${id}`}
      className="ck-in ck-card group relative min-w-[80vw] shrink-0 snap-center overflow-hidden rounded-[18px] sm:min-w-[46vw] lg:min-w-0"
      style={{ animationDelay: `${delay}s` }}
      onMouseMove={onMove}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => {
        onHover(false);
        reset();
      }}
      onClick={onActivate}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onActivate();
        }
      }}
      data-active={active}
      data-dimmed={dimmed}
      aria-label={`${title} — ${body}`}
    >
      <div
        className={`ck-card-frame absolute inset-0 rounded-[18px] border backdrop-blur-xl transition-all duration-300 ${
          isLight
            ? active
              ? "border-blue-400/60 bg-white/95 shadow-[0_16px_40px_-15px_rgba(37,99,235,0.25)]"
              : "border-slate-200/90 bg-white/85 shadow-md hover:bg-white"
            : active
              ? "border-white/20 bg-[#080c16]/90 shadow-xl"
              : "border-white/12 bg-[#080c16]/72"
        }`}
      />

      <div className="relative flex items-stretch gap-2 p-3 lg:p-3.5">
        <div className="flex flex-1 flex-col">
          <div className="flex items-center gap-2.5">
            <span className="ck-card-icon grid h-8 w-8 shrink-0 place-items-center rounded-[10px]">
              {icon}
            </span>
            <span className={`text-[16px] font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>{title}</span>
          </div>
          <p className={`mt-2 max-w-[26ch] text-[11.5px] leading-snug ${isLight ? "text-slate-600" : "text-slate-300/85"}`}>{body}</p>
          <span
            className={`ck-card-arrow mt-auto grid h-7 w-7 place-items-center rounded-full border transition-all duration-300 ${
              isLight
                ? "border-slate-300 bg-slate-100 text-slate-800 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900"
                : "border-white/15 bg-white/5 text-white group-hover:border-transparent group-hover:bg-white group-hover:text-[#070a12]"
            }`}
          >
            <Arrow />
          </span>
        </div>

        {/* the artwork bleeds into the card instead of sitting in a hard frame */}
        <div className="ck-card-photo-wrap relative hidden w-[46%] shrink-0 sm:block">
          <div
            className="absolute inset-0 scale-[1.08] transition-transform duration-700 ease-out group-hover:scale-[1.16]"
            style={{ transform: "translate3d(var(--mx,0), var(--my,0), 0) scale(1.08)" }}
          >
            <Image
              src={img}
              alt=""
              fill
              sizes="(max-width: 1024px) 40vw, 230px"
              className={`object-cover ${pos} ck-card-photo`}
            />
          </div>
          <div className="ck-card-photo-grade pointer-events-none absolute inset-0" data-service={id} />
        </div>
        <span className="ck-card-glow pointer-events-none absolute inset-0 rounded-[18px]" />
      </div>
    </div>
  );
}
