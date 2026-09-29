"use client";

import { useCallback, useId, useMemo, type MouseEvent } from "react";
import { PULSE_NODES, type NodeKind, type ServiceId } from "@/lib/data";
import { useReducedMotion } from "@/lib/store";

/* --------------------------------------------------------------------------
   CAMPUS BLUEPRINT
   The campus drawn as an interface, not as a diagram. Everything is sized for
   the hero HUD, where the SVG renders at roughly half these units — so the type
   is deliberately large and the vocabulary is deliberately small: five named
   places, three service routes, one road spine, and junction dots that carry
   the pulse. The earlier version drew rotated hexagons and triangles whose
   labels rendered at ~6px; nothing in it was readable, which is why it read as
   noise rather than as a map.
--------------------------------------------------------------------------- */

type Props = {
  mode?: ServiceId | "all";
  interactive?: boolean;
  movers?: boolean;
  showLabels?: boolean;
  className?: string;
  onHover?: (kind: NodeKind | null) => void;
  onNodeClick?: (id: string) => void;
  activeNode?: string | null;
  focus?: string | null;
};

type Chip = {
  id: string;
  label: string;
  sub: string;
  kind: NodeKind;
  service: ServiceId | null;
  x: number;
  y: number;
  w: number;
  h: number;
};

/* The plan. Fixed geometry, hand-set so no two elements ever collide: a road
   spine at x=400, service chips hung off it, hostels on a cross road at y=373. */
const SPINE_X = 400;
const SPINE_TOP = 116;
const SPINE_BOTTOM = 400;
const CROSS_Y = 373;

const CHIPS: Chip[] = [
  { id: "gate", label: "OUTSIDE GATE", sub: "CAMPUS ENTRY & EXIT", kind: "rides", service: "rides", x: 244, y: 50, w: 312, h: 72 },
  { id: "blockF", label: "BLOCK F", sub: "UNIVERSITY", kind: "campus", service: null, x: 566, y: 137, w: 208, h: 72 },
  { id: "blockE", label: "BLOCK E", sub: "UNIVERSITY", kind: "campus", service: null, x: 566, y: 249, w: 208, h: 72 },
  { id: "hostel1", label: "HOSTEL 1", sub: "RESIDENTIAL", kind: "food", service: "food", x: 80, y: 337, w: 214, h: 72 },
  { id: "hostel2", label: "HOSTEL 2", sub: "RESIDENTIAL", kind: "essentials", service: "essentials", x: 506, y: 337, w: 214, h: 72 },
];

/* building footprints, drawn as blueprint outlines so they read as surveyed
   massing rather than as filled widgets — and never overlapping a chip */
const MASSING: [number, number, number, number][] = [
  [104, 128, 152, 92],
  [56, 258, 118, 86],
  [202, 168, 118, 74],
  [288, 250, 78, 66],
  [306, 186, 70, 118],
  [600, 400, 156, 72],
  [104, 428, 148, 50],
];

const ROUTES: Record<ServiceId, string> = {
  /* the gate road: the whole spine lights up when rides are in focus */
  rides: `M${SPINE_X},${SPINE_TOP} V${CROSS_Y}`,
  food: `M${SPINE_X},283 V${CROSS_Y} H302`,
  essentials: `M${SPINE_X},283 V${CROSS_Y} H498`,
};

const JUNCTIONS: [number, number][] = [
  [SPINE_X, SPINE_TOP],
  [SPINE_X, 173],
  [SPINE_X, 283],
  [SPINE_X, CROSS_Y],
];

export default function CampusScene({
  mode = "all",
  interactive = true,
  movers = true,
  showLabels = false,
  className = "",
  onHover,
  onNodeClick,
  activeNode = null,
  focus = null,
}: Props) {
  const uid = useId().replace(/:/g, "");
  const reduced = useReducedMotion();

  const serviceKeys: ServiceId[] = ["food", "rides", "essentials"];

  const accentOf = useCallback((kind: NodeKind) => {
    if (kind === "food") return "var(--food)";
    if (kind === "rides") return "var(--rides)";
    if (kind === "essentials") return "var(--essentials)";
    return "var(--chip-neutral)";
  }, []);

  /* How loudly each chip and route speaks. One focus at a time, always: a map
     where everything is highlighted is a map where nothing is. */
  const weight = useCallback(
    (service: ServiceId | null, isActive: boolean) => {
      /* Even the quiet places stay readable: a plan you cannot read is not a
         plan. Focus is carried by the accent, the halo and the route, not by
         dimming everything else into the background. */
      if (focus) return isActive ? 1 : 0.42;
      if (mode === "all") return isActive ? 1 : 0.9;
      return isActive ? 1 : 0.72;
    },
    [focus, mode],
  );

  const routeOpacity = useCallback(
    (k: ServiceId) => {
      if (focus) return k === focus ? 1 : 0.07;
      if (mode === "all") return 0.5;
      return k === mode ? 1 : 0.07;
    },
    [focus, mode],
  );

  const chipIsActive = useCallback(
    (c: Chip) => {
      if (activeNode) return activeNode === c.id;
      if (focus) return c.id === focus;
      if (mode === "all") return false;
      return c.service === mode;
    },
    [activeNode, focus, mode],
  );

  const handleMove = (e: MouseEvent<SVGSVGElement>) => {
    if (!interactive || !onHover) return;
    const target = (e.target as Element).closest("[data-kind]");
    onHover(target ? (target.getAttribute("data-kind") as NodeKind) : null);
  };

  const gridId = `${uid}-grid`;
  const chipFill = `${uid}-chip`;

  const chips = useMemo(() => CHIPS, []);

  return (
    <svg
      viewBox="0 0 800 500"
      className={className}
      role="img"
      aria-label="Chandigarh University Unnao campus network plan"
      onMouseMove={handleMove}
      onMouseLeave={() => onHover?.(null)}
      style={{ overflow: "visible" }}
    >
      <defs>
        <pattern id={gridId} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M0 0 H20 M0 0 V20" stroke="var(--border)" strokeWidth="0.4" fill="none" opacity="0.16" />
        </pattern>
        <linearGradient id={chipFill} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* --------------------------------------------------------- paper */}
      {/* a settled ground under the drawing: silhouettes of the lit facades
          behind the glass were washing every line out */}
      <rect x="0" y="0" width="800" height="500" fill="#05080f" opacity="0.55" />
      <rect x="0" y="0" width="800" height="500" fill={`url(#${gridId})`} />

      {/* survey frame: the plan is a drawing, and drawings have edges */}
      <rect x="30" y="52" width="740" height="410" rx="16" fill="none" stroke="var(--border)" strokeWidth="1" strokeDasharray="11 9" opacity="0.34" />
      <g stroke="var(--border)" strokeWidth="0.9" opacity="0.28">
        {Array.from({ length: 13 }).map((_, i) => (
          <path key={`tx${i}`} d={`M${30 + i * (740 / 12)},52 v6`} />
        ))}
        {Array.from({ length: 9 }).map((_, i) => (
          <path key={`ty${i}`} d={`M30,${52 + i * (410 / 8)} h6`} />
        ))}
        {Array.from({ length: 13 }).map((_, i) => (
          <path key={`bx${i}`} d={`M${30 + i * (740 / 12)},462 v-6`} />
        ))}
      </g>

      {/* scale bar, the way any real plan signs itself off */}
      <g opacity="0.5">
        <path d="M60,454 h88 M60,448 v12 M104,448 v12 M148,448 v12" stroke="var(--muted)" strokeWidth="1.1" fill="none" />
        <text x="60" y="441" fontSize="13" fill="var(--muted)" style={{ fontFamily: "var(--font-mono)" }}>
          0
        </text>
        <text x="148" y="441" textAnchor="end" fontSize="13" fill="var(--muted)" style={{ fontFamily: "var(--font-mono)" }}>
          200 M
        </text>
      </g>

      {/* ------------------------------------------------------- massing */}
      <g fill="none" stroke="var(--border)" strokeWidth="1.1" strokeDasharray="5 6" opacity="0.55">
        {MASSING.map(([x, y, w, h], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} rx="7" />
        ))}
      </g>

      {/* ----------------------------------------------------- plan header */}
      <text x="30" y="36" fontSize="18" letterSpacing="1.4" fill="var(--muted)" opacity="0.9" style={{ fontFamily: "var(--font-mono)" }}>
        CHANDIGARH UNIVERSITY (UNNAO, UP)
      </text>
      <g opacity="0.8">
        <text x="700" y="36" textAnchor="end" fontSize="16" letterSpacing="1.3" fill="var(--muted)" style={{ fontFamily: "var(--font-mono)" }}>
          CAMPUS PLAN
        </text>
        <path d="M724 18 v22 M724 18 l-5 8 M724 18 l5 8" stroke="var(--muted)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        <text x="762" y="36" textAnchor="end" fontSize="16" letterSpacing="1" fill="var(--muted)" style={{ fontFamily: "var(--font-mono)" }}>
          N
        </text>
      </g>

      {/* --------------------------------------------------------- roads */}
      <g strokeLinecap="round" fill="none">
        <path d={`M${SPINE_X},${SPINE_TOP} V${SPINE_BOTTOM}`} stroke="var(--scene-line)" strokeWidth="3" opacity="0.55" />
        <path d={`M${SPINE_X},${SPINE_TOP} V${SPINE_BOTTOM}`} stroke="var(--muted)" strokeWidth="0.9" strokeDasharray="7 9" opacity="0.4" />
        <path d={`M${SPINE_X},173 H578`} stroke="var(--scene-line)" strokeWidth="2.4" opacity="0.5" />
        <path d={`M${SPINE_X},283 H578`} stroke="var(--scene-line)" strokeWidth="2.4" opacity="0.5" />
        <path d={`M296,${CROSS_Y} H504`} stroke="var(--scene-line)" strokeWidth="2.4" opacity="0.5" />
      </g>



      {/* ------------------------------------------------------ junctions */}
      <g>
        {JUNCTIONS.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="5.6" fill="var(--scene-block)" stroke="var(--border)" strokeWidth="1.2" />
            <circle cx={x} cy={y} r="2" fill="var(--muted)" opacity="0.9" />
          </g>
        ))}
      </g>

      {/* --------------------------------------------------------- routes */}
      <g fill="none">
        {serviceKeys.map((k) => (
          <g key={k} style={{ opacity: routeOpacity(k), transition: "opacity .5s ease" }}>
            <path d={ROUTES[k]} stroke={accentOf(k)} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" opacity="0.12" />
            <path
              id={`${uid}-${k}`}
              d={ROUTES[k]}
              stroke={accentOf(k)}
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={reduced ? "" : "route-dash"}
            />
            {movers && !reduced && (
              <circle r="4.4" fill={accentOf(k)}>
                <animateMotion dur={k === "rides" ? "7s" : "9s"} repeatCount="indefinite" rotate="auto">
                  <mpath href={`#${uid}-${k}`} />
                </animateMotion>
              </circle>
            )}
          </g>
        ))}
      </g>

      {/* ---------------------------------------------------------- places */}
      <g>
        {chips.map((c) => {
          const accent = accentOf(c.kind);
          const active = chipIsActive(c);
          const w = weight(c.service, active);
          return (
            <g
              key={c.id}
              data-kind={c.kind}
              data-node={c.id}
              onMouseEnter={() => onHover?.(c.kind)}
              onClick={() => onNodeClick?.(c.id)}
              style={{ cursor: interactive ? "pointer" : "auto", opacity: w, transition: "opacity .45s ease" }}
            >
              {/* halo under the focused place */}
              {active && <rect x={c.x} y={c.y} width={c.w} height={c.h} rx="13" fill="none" stroke={accent} strokeWidth="7" opacity="0.16" />}
              <rect
                x={c.x}
                y={c.y}
                width={c.w}
                height={c.h}
                rx="13"
                fill="#080d18"
                fillOpacity="0.94"
                stroke={accent}
                strokeWidth={active ? 1.8 : 1.3}
                strokeOpacity={active ? 0.95 : 0.6}
              />
              <rect x={c.x} y={c.y} width={c.w} height={c.h} rx="13" fill={`url(#${chipFill})`} />
              {/* status light, the way the product marks a live point */}
              <circle cx={c.x + 26} cy={c.y + c.h / 2} r="4.4" fill={accent} />
              {active && !reduced && (
                <circle cx={c.x + 26} cy={c.y + c.h / 2} r="10" fill="none" stroke={accent} strokeWidth="1.4" className="pulse-ring" />
              )}
              <text
                x={c.x + 44}
                y={c.y + 32}
                fontSize="24"
                letterSpacing="1.2"
                fontWeight="600"
                fill="var(--text)"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {c.label}
              </text>
              <text
                x={c.x + 44}
                y={c.y + 56}
                fontSize="18"
                letterSpacing="1"
                fill="var(--muted)"
                opacity="0.9"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {c.sub}
              </text>
              {showLabels && active && (
                <rect x={c.x - 12} y={c.y - 14} width={c.w + 24} height={c.h + 28} rx="16" fill="none" stroke={accent} strokeWidth="1" opacity="0.35" />
              )}
            </g>
          );
        })}
      </g>

      {/* ------------------------------------------------------ live pings */}
      <g>
        {PULSE_NODES.map((n) => {
          const accent = accentOf(n.kind);
          const isActive = activeNode === n.id || (mode !== "all" && n.kind === mode && !focus);
          return (
            <g
              key={n.id}
              data-kind={n.kind}
              data-node={n.id}
              onMouseEnter={() => onHover?.(n.kind)}
              onClick={() => onNodeClick?.(n.id)}
              style={{ cursor: interactive ? "pointer" : "auto" }}
            >
              <circle cx={n.x} cy={n.y} r="13" fill="transparent" />
              {isActive && !reduced && (
                <circle cx={n.x} cy={n.y} r="9" fill="none" stroke={accent} strokeWidth="1.4" className="pulse-ring" />
              )}
              <circle cx={n.x} cy={n.y} r="4.6" fill="#080c16" stroke={accent} strokeWidth="2" />
            </g>
          );
        })}
      </g>
    </svg>
  );
}
