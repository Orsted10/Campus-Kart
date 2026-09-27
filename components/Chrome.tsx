"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { NAV_LINKS, SERVICE_META, type ServiceId } from "@/lib/data";
import { scrollToId, useApp, useReducedMotion } from "@/lib/store";

/* ------------------------------------------------------------------ mark */

export function Mark({ size = 30, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <rect x="1" y="1" width="38" height="38" rx="11" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M9 29 C 15 29 16 11 22 11 C 26 11 27 16 31 16"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="31" cy="16" r="3.6" fill="var(--blue)" />
      <circle cx="9" cy="29" r="2.2" fill="currentColor" />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`text-[15px] font-semibold tracking-[-0.045em] ${className}`}>
      Campus<span className="text-blue">Kart</span>
    </span>
  );
}

/* --------------------------------------------------------------- magnetic */

export function Magnetic({
  children,
  strength = 0.28,
  className = "",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const dist = Math.hypot(dx, dy);
      if (dist < r.width * 0.9 + 60) {
        el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
      } else {
        el.style.transform = "translate(0,0)";
      }
    };
    const onLeave = () => (el.style.transform = "translate(0,0)");
    window.addEventListener("mousemove", onMove, { passive: true });
    el.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [strength, reduced]);
  return (
    <span ref={ref} className={`inline-block transition-transform duration-500 ${className}`}>
      {children}
    </span>
  );
}

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`arrow ${className}`}
      width="15"
      height="15"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* ------------------------------------------------------------ theme knob */

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, toggleTheme } = useApp();
  const ref = useRef<HTMLButtonElement | null>(null);
  return (
    <button
      ref={ref}
      type="button"
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        toggleTheme({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
      }}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      data-cursor="theme"
      className={`group relative grid place-items-center overflow-hidden rounded-full border border-line transition-colors duration-500 hover:border-ink ${
        compact ? "h-8 w-8" : "h-9 w-9"
      }`}
    >
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <g
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          style={{
            opacity: theme === "light" ? 1 : 0,
            transform: `rotate(${theme === "light" ? 0 : -60}deg)`,
            transformOrigin: "center",
            transition: "all .5s cubic-bezier(.22,1,.36,1)",
          }}
        >
          <circle cx="10" cy="10" r="3.6" />
          <path d="M10 2.2v1.6M10 16.2v1.6M2.2 10h1.6M16.2 10h1.6M4.5 4.5l1.1 1.1M14.4 14.4l1.1 1.1M15.5 4.5l-1.1 1.1M5.6 14.4l-1.1 1.1" />
        </g>
        <path
          d="M15.5 12.4A6.2 6.2 0 0 1 7.6 4.5a6.2 6.2 0 1 0 7.9 7.9Z"
          fill={theme === "dark" ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
          style={{
            opacity: theme === "dark" ? 1 : 0,
            transform: `rotate(${theme === "dark" ? 0 : 60}deg)`,
            transformOrigin: "center",
            transition: "all .5s cubic-bezier(.22,1,.36,1)",
          }}
        />
      </svg>
      <span
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle at 50% 120%, var(--accent-soft), transparent 70%)",
          opacity: 0,
          transition: "opacity .4s ease",
        }}
      />
    </button>
  );
}

/* ---------------------------------------------------------------- loader */

export function Loader() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    const seen = sessionStorage.getItem("ck-intro");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t1 = window.setTimeout(() => setLeaving(true), seen || reduced ? 60 : 1500);
    const t2 = window.setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem("ck-intro", "1");
    }, seen || reduced ? 320 : 2050);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[120] grid place-items-center"
      style={{
        background: "var(--bg)",
        transition: "opacity .55s ease",
        opacity: leaving ? 0 : 1,
      }}
      aria-hidden="true"
    >
      <div className="flex flex-col items-center gap-4">
        <div style={{ animation: "ck-in .6s cubic-bezier(.22,1,.36,1) both" }}>
          <Mark size={46} />
        </div>
        <svg width="150" height="10" viewBox="0 0 150 10" fill="none">
          <path
            d="M2 8 C 40 8 46 2 74 2 C 102 2 110 8 148 8"
            stroke="var(--blue)"
            strokeWidth="1.6"
            strokeDasharray="160"
            strokeDashoffset="160"
            style={{ animation: "ck-route .9s .25s cubic-bezier(.65,0,.35,1) forwards" }}
          />
        </svg>
        <div
          className="overflow-hidden"
          style={{ animation: "ck-in .5s .55s cubic-bezier(.22,1,.36,1) both" }}
        >
          <Wordmark className="text-[17px]" />
        </div>
      </div>
      <style>{`
        @keyframes ck-in { from { opacity:0; transform: translateY(8px) } to { opacity:1; transform:none } }
        @keyframes ck-route { to { stroke-dashoffset: 0 } }
      `}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ nav */

export function Nav() {
  const { overlay, openOverlay, closeOverlay, service, setService, activeSection } = useApp();
  const [state, setState] = useState<"top" | "compact">("top");
  const [hidden, setHidden] = useState(false);
  const last = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setState(y > 48 ? "compact" : "top");
      const delta = y - last.current;
      setHidden(y > 420 && delta > 6);
      last.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (href: string, s?: ServiceId) => {
    if (s) setService(s);
    scrollToId(href.replace("#", ""));
    closeOverlay();
  };

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-[90] flex justify-center px-3 sm:px-5 transition-all duration-700 ease-out"
        style={{ 
          pointerEvents: overlay === "menu" ? "none" : "auto",
          paddingTop: state === "compact" ? "12px" : "24px"
        }}
      >
        <nav
          className={`relative flex w-full items-center justify-between transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${
            state === "compact"
              ? "max-w-[1000px] rounded-full border border-[var(--border)] py-2 px-3 sm:px-4 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.15)] bg-[var(--nav-bg)] backdrop-blur-2xl"
              : "max-w-[1400px] rounded-2xl border border-transparent py-3 px-3 sm:px-5 bg-transparent"
          }`}
          style={{
            opacity: hidden && overlay === "none" ? 0 : 1,
            transform: hidden && overlay === "none" ? "translateY(-150%) scale(0.95)" : "translateY(0) scale(1)",
            pointerEvents: hidden ? "none" : "auto",
            boxShadow: state === "compact" ? "inset 0 1px 1px rgba(255, 255, 255, 0.1), 0 16px 40px -12px rgba(0, 0, 0, 0.2)" : "none",
          }}
          aria-label="Primary"
        >
          {state === "compact" && (
             <div className="absolute inset-0 pointer-events-none rounded-full bg-gradient-to-r from-transparent via-[var(--text)] to-transparent opacity-5" style={{ backgroundSize: "200% 100%", animation: "shine 8s infinite linear" }} />
          )}
          
          <button
            type="button"
            onClick={() => go("#top")}
            className="flex items-center gap-2.5 relative z-10 transition-transform duration-300 hover:scale-105"
            aria-label="CampusKart home"
            data-cursor="link"
          >
            <Mark size={state === "compact" ? 28 : 34} />
            <Wordmark className="hidden sm:inline" />
          </button>

          <div className="hidden items-center gap-1 lg:flex p-1 rounded-full bg-[var(--shade)] border border-[var(--border)]/50 backdrop-blur-md relative z-10">
            {NAV_LINKS.filter((l) =>
              ["Food", "Rides", "Essentials", "How it Works", "For Partners"].includes(l.label),
            ).map((l) => {
              const isActive = (l.service && l.service === service && activeSection === "ecosystem") ||
                (l.href === `#${activeSection}` && !l.service);
              return (
                <button
                  key={l.label}
                  type="button"
                  className={`relative px-5 py-2 text-[13px] tracking-wide font-medium transition-colors duration-500 rounded-full ${
                    isActive ? "text-[var(--bg)]" : "text-[var(--text)] hover:text-[var(--blue)]"
                  }`}
                  onClick={() => go(l.href, l.service)}
                  data-cursor="link"
                >
                  {isActive && (
                    <span className="absolute inset-0 bg-[var(--text)] rounded-full -z-10 shadow-md" style={{ willChange: "transform" }} />
                  )}
                  {l.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 relative z-10">
            <button
              type="button"
              onClick={() => openOverlay("search")}
              aria-label="Search CampusKart"
              data-cursor="link"
              className="grid h-10 w-10 place-items-center rounded-full bg-[var(--shade)] text-muted transition-all duration-300 hover:bg-[var(--text)] hover:text-[var(--bg)] hover:scale-105 hover:shadow-lg"
            >
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.7" />
                <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </button>
            <div className="transition-transform duration-300 hover:scale-105">
              <ThemeToggle />
            </div>
            <button
              type="button"
              className="px-4 py-2 text-[14px] font-medium transition-colors hidden sm:block hover:text-[var(--blue)]"
              onClick={(e) =>
                openOverlay("login", { x: e.clientX, y: e.clientY })
              }
              data-cursor="link"
            >
              Login
            </button>
            <Magnetic strength={0.3}>
              <button
                type="button"
                className="btn btn-solid !h-10 !px-6 text-[14px] !rounded-full shadow-[0_8px_20px_-6px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.4)] transition-all duration-300 relative overflow-hidden group border border-[var(--text)]/10"
                onClick={(e) => openOverlay("register", { x: e.clientX, y: e.clientY })}
                data-cursor="cta"
              >
                <span className="relative z-10 flex items-center gap-2 font-semibold tracking-wide">Get Started <Arrow /></span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0" />
              </button>
            </Magnetic>
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-full bg-[var(--shade)] border border-[var(--border)] lg:hidden transition-transform hover:scale-105"
              aria-label="Open menu"
              onClick={(e) => openOverlay("menu", { x: e.clientX, y: e.clientY })}
              data-cursor="link"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2 5.5h12M2 10.5h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </nav>
      </header>

      <MobileMenu
        open={overlay === "menu"}
        onClose={closeOverlay}
        onNavigate={(href, s) => go(href, s)}
        service={service}
        setService={setService}
      />
    </>
  );
}

/* ---------------------------------------------------------- mobile menu */

function MobileMenu({
  open,
  onClose,
  onNavigate,
  service,
  setService,
}: {
  open: boolean;
  onClose: () => void;
  onNavigate: (href: string, s?: ServiceId) => void;
  service: ServiceId;
  setService: (s: ServiceId) => void;
}) {
  const { theme, openOverlay } = useApp();
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div
      className="fixed inset-0 z-[95] lg:hidden"
      style={{
        background: "var(--bg)",
        clipPath: open ? "inset(0 0 0% 0)" : "inset(0 0 100% 0)",
        transition: "clip-path .7s cubic-bezier(.76,0,.24,1)",
        pointerEvents: open ? "auto" : "none",
        visibility: open ? "visible" : "hidden",
      }}
      aria-hidden={!open}
    >
      <div className="flex h-full flex-col px-6 pb-10 pt-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Mark size={28} />
            <Wordmark />
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="grid h-10 w-10 place-items-center rounded-full border border-line"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav className="mt-12 flex flex-1 flex-col gap-1" aria-label="Mobile">
          {NAV_LINKS.map((l, i) => (
            <div
              key={l.label}
              style={{
                opacity: open ? 1 : 0,
                transform: open ? "none" : "translateY(26px)",
                transition: `all .6s cubic-bezier(.22,1,.36,1) ${open ? 0.16 + i * 0.055 : 0}s`,
              }}
            >
              <button
                type="button"
                onClick={() => onNavigate(l.href, l.service)}
                className="group flex w-full items-baseline justify-between border-b border-line py-4 text-left"
              >
                <span className="display text-[clamp(2rem,9vw,2.75rem)]">{l.label}</span>
                <span
                  className="micro"
                  style={{
                    color:
                      l.service === "food"
                        ? "var(--food)"
                        : l.service === "rides"
                          ? "var(--rides)"
                          : l.service === "essentials"
                            ? "var(--essentials)"
                            : undefined,
                  }}
                >
                  0{i + 1}
                </span>
              </button>
            </div>
          ))}
        </nav>

        <div
          className="mt-6 flex items-center gap-3"
          style={{
            opacity: open ? 1 : 0,
            transform: open ? "none" : "translateY(20px)",
            transition: `all .6s cubic-bezier(.22,1,.36,1) ${open ? 0.5 : 0}s`,
          }}
        >
          <div className="flex flex-1 gap-2">
            {(["food", "rides", "essentials"] as ServiceId[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setService(s)}
                className="flex-1 rounded-full border px-3 py-2 text-[12px] transition-all duration-300"
                style={{
                  borderColor: service === s ? SERVICE_META[s].accent : "var(--border)",
                  color: service === s ? SERVICE_META[s].ink : "var(--muted)",
                }}
              >
                {SERVICE_META[s].label}
              </button>
            ))}
          </div>
          <ThemeToggle compact />
        </div>

        <div
          className="mt-4 flex gap-3"
          style={{
            opacity: open ? 1 : 0,
            transform: open ? "none" : "translateY(20px)",
            transition: `all .6s cubic-bezier(.22,1,.36,1) ${open ? 0.58 : 0}s`,
          }}
        >
          <button
            type="button"
            className="btn btn-ghost flex-1 justify-center"
            onClick={() => {
              onClose();
              window.setTimeout(() => openOverlay("login"), 320);
            }}
          >
            Login
          </button>
          <button
            type="button"
            className="btn btn-solid flex-1 justify-center"
            onClick={() => {
              onClose();
              window.setTimeout(() => openOverlay("register"), 320);
            }}
          >
            Get Started
          </button>
        </div>
        <p className="micro mt-5 text-center">
          {theme === "dark" ? "Night mode" : "Day mode"} · demo campus
        </p>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- cursor */

export function Cursor() {
  const dot = useRef<HTMLDivElement | null>(null);
  const ring = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let rx = x;
    let ry = y;
    let scale = 1;
    let targetScale = 1;
    let raf = 0;

    const move = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      const el = (e.target as Element)?.closest?.("[data-cursor], a, button, input, [role=button]");
      targetScale = el ? 2.1 : 1;
      const kind = el?.getAttribute("data-cursor");
      if (labelRef.current) {
        const text =
          kind === "cta" ? "open" : kind === "theme" ? "light / dark" : kind === "map" ? "drag" : "";
        labelRef.current.textContent = text;
        labelRef.current.style.opacity = text ? "1" : "0";
      }
      if (dot.current) dot.current.style.opacity = el ? "0" : "1";
    };

    const loop = () => {
      rx += (x - rx) * 0.16;
      ry += (y - ry) * 0.16;
      scale += (targetScale - scale) * 0.14;
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) scale(${scale})`;
      if (dot.current) dot.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", move, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[150] hidden md:block" aria-hidden="true">
      <div
        ref={ring}
        className="absolute left-0 top-0 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border"
        style={{ borderColor: "var(--text)", willChange: "transform" }}
      >
        <span
          ref={labelRef}
          className="micro whitespace-nowrap text-[8px] opacity-0 transition-opacity duration-300"
          style={{ color: "var(--text)" }}
        />
      </div>
      <div
        ref={dot}
        className="absolute left-0 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity duration-300"
        style={{ background: "var(--blue)", willChange: "transform" }}
      />
    </div>
  );
}
