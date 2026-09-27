"use client";

import { useEffect, useId, useRef, type MouseEvent } from "react";
import { PULSE_NODES, type NodeKind, type ServiceId, SERVICE_META } from "@/lib/data";
import { useReducedMotion } from "@/lib/store";

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

const ROUTES: Record<ServiceId, string> = {
  food: "M206,168 C 270,215 320,238 404,268 C 452,286 474,330 520,372",
  rides: "M668,452 C 604,472 520,472 460,460 C 380,446 300,430 240,410 C 190,394 158,382 132,372",
  essentials: "M618,152 C 540,178 466,204 404,268 C 332,336 220,352 132,372",
};

const BLOCKS = [
  { x: 66, y: 316, w: 172, h: 124, r: -1, label: "HOSTEL NORTH", sub: "4 blocks" },
  { x: 326, y: 206, w: 196, h: 112, r: 0.6, label: "ACADEMIC SPINE", sub: "lecture + labs" },
  { x: 468, y: 330, w: 124, h: 92, r: -0.8, label: "LIBRARY", sub: "quiet hours" },
  { x: 150, y: 112, w: 162, h: 92, r: 0.8, label: "FOOD COURT", sub: "12 points" },
  { x: 556, y: 96, w: 146, h: 96, r: -0.6, label: "CAMPUS MART", sub: "essentials" },
  { x: 612, y: 306, w: 138, h: 96, r: 1, label: "SPORTS", sub: "courts" },
  { x: 348, y: 60, w: 132, h: 86, r: -1.2, label: "SCIENCE", sub: "wing B" },
  { x: 646, y: 428, w: 116, h: 58, r: 0.5, label: "MAIN GATE", sub: "pickup" },
];

const ROADS = [
  "M18,300 H784",
  "M404,14 V546",
  "M96,140 C 190,180 240,250 300,300",
  "M556,540 C 556,436 640,404 786,392",
  "M66,470 H640",
  "M470,60 C 540,70 580,96 620,140",
];

export default function CampusScene({
  mode = "all",
  interactive = true,
  movers = true,
  showLabels = true,
  className = "",
  onHover,
  onNodeClick,
  activeNode = null,
  focus = null,
}: Props) {
  const uid = useId().replace(/:/g, "");
  const reduced = useReducedMotion();
  const wrap = useRef<SVGSVGElement | null>(null);
  const grid = useRef<SVGGElement | null>(null);
  const blocksRef = useRef<SVGGElement | null>(null);
  const routesRef = useRef<SVGGElement | null>(null);

  const serviceKeys: ServiceId[] = ["food", "rides", "essentials"];

  useEffect(() => {
    const svg = wrap.current;
    if (!svg || !interactive || reduced) return;
    const onMove = (e: globalThis.MouseEvent) => {
      const rect = svg.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      if (grid.current)
        grid.current.style.transform = `translate3d(${nx * -6}px, ${ny * -6}px, 0)`;
      if (blocksRef.current)
        blocksRef.current.style.transform = `translate3d(${nx * 14}px, ${ny * 14}px, 0)`;
      if (routesRef.current)
        routesRef.current.style.transform = `translate3d(${nx * 22}px, ${ny * 22}px, 0)`;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [interactive, reduced]);

  const dim = (k: ServiceId) => {
    if (mode === "all") return 1;
    if (focus) return k === focus ? 1 : 0.12;
    return k === mode ? 1 : 0.14;
  };

  const handleMove = (e: MouseEvent<SVGSVGElement>) => {
    if (!interactive || !onHover) return;
    const target = (e.target as Element).closest("[data-kind]");
    onHover(target ? (target.getAttribute("data-kind") as NodeKind) : null);
  };

  return (
    <svg
      ref={wrap}
      viewBox="0 0 800 560"
      className={className}
      role="img"
      aria-label="Stylised top-down map of an example campus with routes connecting food points, ride pickups and essential stores"
      onMouseMove={handleMove}
      onMouseLeave={() => onHover?.(null)}
      style={{ overflow: "visible" }}
    >
      <defs>
        <pattern id={`${uid}-tick`} width="26" height="26" patternUnits="userSpaceOnUse">
          <path d="M0 0 H6 M0 0 V6" className="tick" strokeWidth="1" fill="none" opacity="0.5" />
        </pattern>
        <linearGradient id={`${uid}-fade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--surface)" stopOpacity="0" />
          <stop offset="100%" stopColor="var(--surface)" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* ---------------------------------------------------- contours */}
      <g ref={grid} style={{ transition: "transform .6s cubic-bezier(.22,1,.36,1)" }}>
        <rect x="0" y="0" width="800" height="560" fill={`url(#${uid}-tick)`} opacity="0.55" />
        {[0, 1, 2, 3, 4].map((i) => (
          <path
            key={i}
            d={`M-20,${70 + i * 118} C 180,${30 + i * 118} 420,${130 + i * 118} 820,${
              50 + i * 118
            }`}
            fill="none"
            className="tick"
            strokeWidth="1"
            opacity={0.45}
          />
        ))}
        <text x="18" y="34" className="micro" fill="var(--muted)" fontSize="11">
          ZONE GRID / DEMO CAMPUS
        </text>
        <text x="686" y="34" className="micro" fill="var(--muted)" fontSize="11">
          N ↑
        </text>
      </g>

      {/* ------------------------------------------------------ roads */}
      <g ref={blocksRef} style={{ transition: "transform .5s cubic-bezier(.22,1,.36,1)" }}>
        {ROADS.map((d, i) => (
          <path key={i} d={d} fill="none" stroke="var(--scene-line)" strokeWidth="1.5" />
        ))}
        {ROADS.map((d, i) => (
          <path
            key={`d-${i}`}
            d={d}
            fill="none"
            stroke="var(--scene-line)"
            strokeWidth="8"
            opacity="0.22"
            strokeLinecap="round"
          />
        ))}

        {BLOCKS.map((b) => {
          const kind: NodeKind =
            b.label === "FOOD COURT" ? "food" : b.label === "CAMPUS MART" ? "essentials" : "campus";
          const active =
            mode !== "all" && ((mode === "food" && kind === "food") || (mode === "essentials" && kind === "essentials"));
          return (
            <g
              key={b.label}
              data-kind={kind}
              transform={`rotate(${b.r} ${b.x + b.w / 2} ${b.y + b.h / 2})`}
              onMouseEnter={() => onHover?.(kind)}
              style={{ cursor: interactive ? "pointer" : "auto" }}
            >
              <rect
                x={b.x + 4}
                y={b.y + 6}
                width={b.w}
                height={b.h}
                fill="var(--shade)"
                rx="2"
              />
              <rect
                x={b.x}
                y={b.y}
                width={b.w}
                height={b.h}
                fill="var(--scene-block)"
                stroke="var(--scene-line)"
                strokeWidth="1.2"
                rx="2"
                style={{ transition: "fill .5s ease" }}
              />
              <path
                d={`M${b.x},${b.y + b.h * 0.62} H${b.x + b.w}`}
                stroke="var(--scene-line)"
                strokeWidth="1"
              />
              <path
                d={`M${b.x + b.w * 0.36},${b.y} V${b.y + b.h}`}
                stroke="var(--scene-line)"
                strokeWidth="1"
                opacity="0.7"
              />
              {active && (
                <rect
                  x={b.x - 4}
                  y={b.y - 4}
                  width={b.w + 8}
                  height={b.h + 8}
                  fill="none"
                  stroke={mode === "food" ? "var(--food)" : "var(--essentials)"}
                  strokeWidth="1.5"
                  strokeDasharray="4 5"
                  rx="3"
                />
              )}
              {showLabels && (
                <text
                  x={b.x + 8}
                  y={b.y + 18}
                  fontSize="10.5"
                  letterSpacing="1.4"
                  fill="var(--text)"
                  opacity="0.75"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {b.label}
                </text>
              )}
            </g>
          );
        })}
      </g>

      {/* ---------------------------------------------------- routes */}
      <g ref={routesRef} style={{ transition: "transform .4s cubic-bezier(.22,1,.36,1)" }}>
        {serviceKeys.map((k) => (
          <g key={k} style={{ opacity: dim(k), transition: "opacity .5s ease" }}>
            <path
              d={ROUTES[k]}
              fill="none"
              stroke={SERVICE_META[k].accent}
              strokeWidth="7"
              strokeLinecap="round"
              opacity="0.14"
            />
            <path
              id={`${uid}-${k}`}
              d={ROUTES[k]}
              fill="none"
              stroke={SERVICE_META[k].accent}
              strokeWidth="2"
              strokeLinecap="round"
              className={reduced ? "" : "route-dash"}
            />
            {movers && !reduced && (
              <circle r="4.5" fill={SERVICE_META[k].accent}>
                <animateMotion dur={k === "rides" ? "7s" : "9s"} repeatCount="indefinite" rotate="auto">
                  <mpath href={`#${uid}-${k}`} />
                </animateMotion>
              </circle>
            )}
            {movers && !reduced && (
              <circle r="3" fill="var(--text)" opacity="0.5">
                <animateMotion
                  dur={k === "rides" ? "7s" : "9s"}
                  begin={k === "rides" ? "-3.5s" : "-4.5s"}
                  repeatCount="indefinite"
                >
                  <mpath href={`#${uid}-${k}`} />
                </animateMotion>
              </circle>
            )}
          </g>
        ))}
      </g>

      {/* ----------------------------------------------------- nodes */}
      <g>
        {PULSE_NODES.map((n) => {
          const accent =
            n.kind === "food"
              ? "var(--food)"
              : n.kind === "rides"
                ? "var(--rides)"
                : n.kind === "essentials"
                  ? "var(--essentials)"
                  : "var(--text)";
          const isActive =
            activeNode === n.id || (mode !== "all" && n.kind === mode);
          return (
            <g
              key={n.id}
              data-kind={n.kind}
              data-node={n.id}
              onMouseEnter={() => onHover?.(n.kind)}
              onClick={() => onNodeClick?.(n.id)}
              style={{ cursor: interactive ? "pointer" : "auto" }}
            >
              {isActive && !reduced && (
                <circle cx={n.x} cy={n.y} r="7" fill="none" stroke={accent} strokeWidth="1.5" className="pulse-ring" />
              )}
              <circle cx={n.x} cy={n.y} r="16" fill="transparent" />
              <circle
                cx={n.x}
                cy={n.y}
                r={isActive ? 7 : 5}
                fill="var(--bg)"
                stroke={accent}
                strokeWidth="2"
                style={{ transition: "r .35s cubic-bezier(.22,1,.36,1)" }}
              />
              <circle cx={n.x} cy={n.y} r="2" fill={accent} />
              {showLabels && (
                <g
                  style={{
                    opacity: isActive || mode === "all" ? 1 : 0.45,
                    transition: "opacity .4s ease",
                  }}
                >
                  <text
                    x={n.x + 13}
                    y={n.y - 2}
                    fontSize="11"
                    fill="var(--text)"
                    style={{ fontFamily: "var(--font-sans)", fontWeight: 500 }}
                  >
                    {n.label}
                  </text>
                  <text
                    x={n.x + 13}
                    y={n.y + 11}
                    fontSize="9"
                    letterSpacing="1.2"
                    fill="var(--muted)"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {n.sub.toUpperCase()}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
}
