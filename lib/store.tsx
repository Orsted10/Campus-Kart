"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { ServiceId } from "./data";

export type OverlayKind =
  | "none"
  | "search"
  | "login"
  | "register"
  | "support"
  | "legal"
  | "menu";

type Origin = { x: number; y: number };

type AppState = {
  theme: "light" | "dark";
  toggleTheme: (origin?: Origin) => void;
  campus: string;
  setCampus: (id: string) => void;
  service: ServiceId;
  setService: (s: ServiceId) => void;
  pickup: string;
  destination: string;
  setPickup: (v: string) => void;
  setDestination: (v: string) => void;
  overlay: OverlayKind;
  openOverlay: (kind: OverlayKind, origin?: Origin) => void;
  closeOverlay: () => void;
  origin: Origin;
  legalDoc: string;
  openLegal: (key: string, origin?: Origin) => void;
  activeSection: string;
  setActiveSection: (id: string) => void;
};

/* theme lives in a tiny external store so the DOM (set by the boot script) and
   React never disagree — no setState-in-effect, no hydration mismatch. */
type Theme = "light" | "dark";
let themeSnapshot: Theme = "light";
let themeHydrated = false;
const themeListeners = new Set<() => void>();

function readTheme(): Theme {
  if (!themeHydrated && typeof document !== "undefined") {
    themeSnapshot = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    themeHydrated = true;
  }
  return themeSnapshot;
}

function subscribeTheme(listener: () => void) {
  themeListeners.add(listener);
  return () => {
    themeListeners.delete(listener);
  };
}

function setTheme(t: Theme, persist = true) {
  if (typeof document !== "undefined") {
    document.documentElement.dataset.theme = t;
    themeHydrated = true;
  }
  if (persist) {
    try {
      localStorage.setItem("ck-theme", t);
    } catch {
      /* storage blocked — theme still applies for this session */
    }
  }
  if (themeSnapshot !== t) {
    themeSnapshot = t;
    themeListeners.forEach((l) => l());
  }
}

const Ctx = createContext<AppState | null>(null);

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => "light" as Theme);
  const [campus, setCampus] = useState("riyana");
  const [service, setService] = useState<ServiceId>("food");
  const [pickup, setPickup] = useState("Hostel");
  const [destination, setDestination] = useState("Main Gate");
  const [overlay, setOverlay] = useState<OverlayKind>("none");
  const [origin, setOrigin] = useState<Origin>({ x: 50, y: 50 });
  const [legalDoc, setLegalDoc] = useState("privacy");
  const [activeSection, setActiveSection] = useState("top");

  const applyTheme = useCallback((t: Theme) => setTheme(t), []);

  /* radial day -> night illumination, never an instant variable swap */
  const toggleTheme = useCallback(
    (o?: Origin) => {
      const next = theme === "dark" ? "light" : "dark";
      const pt = o ?? { x: window.innerWidth - 60, y: 40 };
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const probe = document.createElement("div");
      probe.style.cssText =
        "position:fixed;inset:0;z-index:200;pointer-events:none;visibility:hidden";
      document.documentElement.appendChild(probe);
      const color = next === "dark" ? "#151515" : "#F4F0E8";
      probe.style.background = color;
      const radius = Math.hypot(
        Math.max(pt.x, window.innerWidth - pt.x),
        Math.max(pt.y, window.innerHeight - pt.y),
      );

      if (reduced) {
        applyTheme(next);
        probe.remove();
        return;
      }

      const anim = probe.animate(
        [
          { clipPath: `circle(0px at ${pt.x}px ${pt.y}px)`, opacity: 1 },
          { clipPath: `circle(${radius}px at ${pt.x}px ${pt.y}px)`, opacity: 1 },
        ],
        { duration: 720, easing: "cubic-bezier(0.65, 0, 0.35, 1)", fill: "forwards" },
      );
      probe.style.visibility = "visible";
      window.setTimeout(() => applyTheme(next), 380);
      anim.finished
        .then(() => {
          probe.style.transition = "opacity 260ms ease";
          probe.style.opacity = "0";
          window.setTimeout(() => probe.remove(), 300);
        })
        .catch(() => probe.remove());
    },
    [theme, applyTheme],
  );

  const openOverlay = useCallback((kind: OverlayKind, o?: Origin) => {
    if (o) setOrigin(o);
    else setOrigin({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    setOverlay(kind);
  }, []);

  const closeOverlay = useCallback(() => setOverlay("none"), []);

  const openLegal = useCallback(
    (key: string, o?: Origin) => {
      setLegalDoc(key);
      openOverlay("legal", o);
    },
    [openOverlay],
  );

  const value = useMemo<AppState>(
    () => ({
      theme,
      toggleTheme,
      campus,
      setCampus,
      service,
      setService,
      pickup,
      destination,
      setPickup,
      setDestination,
      overlay,
      openOverlay,
      closeOverlay,
      origin,
      legalDoc,
      openLegal,
      activeSection,
      setActiveSection,
    }),
    [
      theme,
      toggleTheme,
      campus,
      service,
      pickup,
      destination,
      overlay,
      openOverlay,
      closeOverlay,
      origin,
      legalDoc,
      openLegal,
      activeSection,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - 72;
  const win = window as unknown as {
    lenis?: { scrollTo: (y: number, opts?: { duration?: number }) => void };
  };
  if (win.lenis) win.lenis.scrollTo(y, { duration: 1.1 });
  else window.scrollTo({ top: y, behavior: "smooth" });
}
