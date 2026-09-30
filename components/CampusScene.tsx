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
  { id: "gate", label: "OUTSIDE GATE", sub: "CAMPUS ENTRY & EXIT", kind: "rides", service: "rides", x: 236, y: 52, w: 328, h: 64 },
  { id: "blockF", label: "BLOCK F", sub: "UNIVERSITY", kind: "campus", service: null, x: 556, y: 135, w: 216, h: 64 },
  { id: "blockE", label: "BLOCK E", sub: "UNIVERSITY", kind: "campus", service: null, x: 556, y: 247, w: 216, h: 64 },
  { id: "hostel1", label: "HOSTEL 1", sub: "RESIDENTIAL", kind: "food", service: "food", x: 74, y: 341, w: 224, h: 64 },
  { id: "hostel2", label: "HOSTEL 2", sub: "RESIDENTIAL", kind: "essentials", service: "essentials", x: 502, y: 341, w: 224, h: 64 },
];

/* building footprints, drawn as blueprint outlines so they read as surveyed
   massing rather than as filled widgets — and never overlapping a chip */
const MASSING: [number, number, number, number][] = [
  [104, 128, 142, 92],
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
  food: `M${SPINE_X},283 V${CROSS_Y} H298`,
  essentials: `M${SPINE_X},283 V${CROSS_Y} H502`,
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

  const weight = useCallback(
    (service: ServiceId | null, isActive: boolean) => {
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
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
        </linearGradient>
      </defs>

      {/* --------------------------------------------------------- paper */}
      <rect x="0" y="0" width="800" height="500" fill="#050812" opacity="0.94" rx="12" />
      <rect x="0" y="0" width="800" height="500" fill={`url(#${gridId})`} />

      {/* survey frame */}
      <rect x="24" y="46" width="752" height="422" rx="14" fill="none" stroke="var(--border)" strokeWidth="1" strokeDasharray="11 9" opacity="0.34" />
      <g stroke="var(--border)" strokeWidth="0.9" opacity="0.28">
        {Array.from({ length: 13 }).map((_, i) => (
          <path key={`tx${i}`} d={`M${24 + i * (752 / 12)},46 v6`} />
        ))}
        {Array.from({ length: 9 }).map((_, i) => (
          <path key={`ty${i}`} d={`M24,${46 + i * (422 / 8)} h6`} />
        ))}
        {Array.from({ length: 13 }).map((_, i) => (
          <path key={`bx${i}`} d={`M${24 + i * (752 / 12)},468 v-6`} />
        ))}
      </g>

      {/* scale bar */}
      <g opacity="0.55">
        <path d="M50,454 h88 M50,448 v12 M94,448 v12 M138,448 v12" stroke="var(--muted)" strokeWidth="1.1" fill="none" />
        <text x="50" y="441" fontSize="12" fill="var(--muted)" style={{ fontFamily: "var(--font-mono)" }}>
          0
        </text>
        <text x="138" y="441" textAnchor="end" fontSize="12" fill="var(--muted)" style={{ fontFamily: "var(--font-mono)" }}>
          200 M
        </text>
      </g>

      {/* ------------------------------------------------------- massing */}
      <g fill="none" stroke="var(--border)" strokeWidth="1.1" strokeDasharray="5 6" opacity="0.45">
        {MASSING.map(([x, y, w, h], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} rx="7" />
        ))}
      </g>

      {/* ----------------------------------------------------- plan header */}
      <text x="28" y="32" fontSize="13" letterSpacing="1.1" fill="var(--muted)" opacity="0.92" fontWeight="500" style={{ fontFamily: "var(--font-mono)" }}>
        CHANDIGARH UNIV • UNNAO
      </text>
      <g opacity="0.9">
        <text x="768" y="32" textAnchor="end" fontSize="12" letterSpacing="1.1" fill="var(--muted)" fontWeight="500" style={{ fontFamily: "var(--font-mono)" }}>
          CAMPUS PLAN ↑ N
        </text>
      </g>

      {/* --------------------------------------------------------- roads */}
      <g strokeLinecap="round" fill="none">
        <path d={`M${SPINE_X},${SPINE_TOP} V${SPINE_BOTTOM}`} stroke="var(--scene-line)" strokeWidth="3" opacity="0.55" />
        <path d={`M${SPINE_X},${SPINE_TOP} V${SPINE_BOTTOM}`} stroke="var(--muted)" strokeWidth="0.9" strokeDasharray="7 9" opacity="0.4" />
        <path d={`M${SPINE_X},173 H556`} stroke="var(--scene-line)" strokeWidth="2.4" opacity="0.5" />
        <path d={`M${SPINE_X},283 H556`} stroke="var(--scene-line)" strokeWidth="2.4" opacity="0.5" />
        <path d={`M298,${CROSS_Y} H502`} stroke="var(--scene-line)" strokeWidth="2.4" opacity="0.5" />
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
              {active && <rect x={c.x} y={c.y} width={c.w} height={c.h} rx="12" fill="none" stroke={accent} strokeWidth="6" opacity="0.18" />}
              <rect
                x={c.x}
                y={c.y}
                width={c.w}
                height={c.h}
                rx="12"
                fill="#070c18"
                fillOpacity="0.96"
                stroke={accent}
                strokeWidth={active ? 1.8 : 1.3}
                strokeOpacity={active ? 0.95 : 0.55}
              />
              <rect x={c.x} y={c.y} width={c.w} height={c.h} rx="12" fill={`url(#${chipFill})`} />
              {/* status light */}
              <circle cx={c.x + 22} cy={c.y + c.h / 2} r="4" fill={accent} />
              {active && !reduced && (
                <circle cx={c.x + 22} cy={c.y + c.h / 2} r="9" fill="none" stroke={accent} strokeWidth="1.4" className="pulse-ring" />
              )}
              <text
                x={c.x + 36}
                y={c.y + 26}
                fontSize="17"
                letterSpacing="0.8"
                fontWeight="700"
                fill="var(--text)"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {c.label}
              </text>
              <text
                x={c.x + 36}
                y={c.y + 48}
                fontSize="12"
                letterSpacing="0.6"
                fill="var(--muted)"
                opacity="0.85"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {c.sub}
              </text>
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
