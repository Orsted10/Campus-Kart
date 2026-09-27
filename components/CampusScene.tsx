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
  rides: "M320,375 H400 V87",
  food: "M320,375 H400 V285 H436",
  essentials: "M480,375 H400 V175 H572",
};

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
  const wrap = useRef<SVGSVGElement | null>(null);
  const grid = useRef<SVGGElement | null>(null);
  const blocksRef = useRef<SVGGElement | null>(null);
  const routesRef = useRef<SVGGElement | null>(null);

  const serviceKeys: ServiceId[] = ["food", "rides", "essentials"];

  useEffect(() => {
    // Map stays firmly anchored in a clean fixed position
  }, []);

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
      viewBox="0 0 800 500"
      className={className}
      role="img"
      aria-label="Chandigarh University Unnao Campus architectural blueprint"
      onMouseMove={handleMove}
      onMouseLeave={() => onHover?.(null)}
      style={{ overflow: "visible" }}
    >
      <defs>
        <pattern id={`${uid}-grid`} width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M0 0 H24 M0 0 V24" stroke="var(--border)" strokeWidth="0.4" fill="none" opacity="0.25" />
        </pattern>
      </defs>

      {/* ---------------------------------------------------- grid background */}
      <g ref={grid} style={{ transition: "transform 0.3s ease-out", willChange: "transform" }}>
        <rect x="0" y="0" width="800" height="500" fill={`url(#${uid}-grid)`} opacity="0.8" />
        <text x="24" y="24" className="micro" fill="var(--muted)" fontSize="10" letterSpacing="1.8">
          CHANDIGARH UNIVERSITY (UNNAO, UP)
        </text>
        <text x="776" y="24" textAnchor="end" className="micro" fill="var(--muted)" fontSize="10" letterSpacing="1.8">
          ARCHITECTURAL BLUEPRINT · N ↑
        </text>
      </g>

      {/* ------------------------------------------------------ buildings & roads */}
      <g ref={blocksRef} style={{ transition: "transform 0.3s ease-out", willChange: "transform" }}>
        {/* Main Road Spine */}
        <path d="M400,90 V375" fill="none" stroke="var(--scene-line)" strokeWidth="4" opacity="0.6" />
        <path d="M400,90 V375" fill="none" stroke="var(--blue)" strokeWidth="1.5" strokeDasharray="6 6" opacity="0.8" />

        {/* Branch Road to Block F */}
        <path d="M400,165 H570" fill="none" stroke="var(--scene-line)" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />

        {/* Branch Road to Block E */}
        <path d="M400,270 H436" fill="none" stroke="var(--scene-line)" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />

        {/* Branch Road to Hostel 1 & 2 */}
        <path d="M320,375 H480" fill="none" stroke="var(--scene-line)" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />

        {/* 1. OUTSIDE GATE RECTANGLE (Top) */}
        <g data-kind="rides" style={{ cursor: interactive ? "pointer" : "auto" }} onMouseEnter={() => onHover?.("rides")}>
          <rect
            x="250"
            y="52"
            width="300"
            height="38"
            rx="6"
            fill="var(--scene-block)"
            stroke="var(--blue)"
            strokeWidth="1.8"
          />
          <rect
            x="254"
            y="56"
            width="292"
            height="30"
            rx="4"
            fill="none"
            stroke="var(--blue)"
            strokeWidth="1"
            strokeDasharray="4 4"
            opacity="0.35"
          />
          <text
            x="400"
            y="75"
            textAnchor="middle"
            fontSize="11.5"
            letterSpacing="1.8"
            fill="var(--text)"
            fontWeight="600"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            OUTSIDE GATE (CAMPUS ENTRY & EXIT)
          </text>
        </g>

        {/* 2. UNIVERSITY BLOCK F (Top Right Hexagon) */}
        <g data-kind="campus" style={{ cursor: interactive ? "pointer" : "auto" }} onMouseEnter={() => onHover?.("campus")}>
          <polygon
            points="660,165 637.5,204 592.5,204 570,165 592.5,126 637.5,126"
            fill="var(--scene-block)"
            stroke="var(--blue)"
            strokeWidth="1.8"
          />
          <polygon
            points="652,165 631.5,198 598.5,198 578,165 598.5,132 631.5,132"
            fill="none"
            stroke="var(--blue)"
            strokeWidth="1"
            opacity="0.4"
          />
          <text
            x="615"
            y="161"
            textAnchor="middle"
            fontSize="11"
            letterSpacing="1.5"
            fill="var(--text)"
            fontWeight="600"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            BLOCK F
          </text>
          <text
            x="615"
            y="175"
            textAnchor="middle"
            fontSize="8.5"
            letterSpacing="1.2"
            fill="var(--muted)"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            UNIVERSITY
          </text>
        </g>

        {/* 3. UNIVERSITY BLOCK E (Middle Right Hexagon) */}
        <g data-kind="campus" style={{ cursor: interactive ? "pointer" : "auto" }} onMouseEnter={() => onHover?.("campus")}>
          <polygon
            points="524,270 502,308 458,308 436,270 458,232 502,232"
            fill="var(--scene-block)"
            stroke="var(--scene-line)"
            strokeWidth="1.8"
          />
          <polygon
            points="516,270 496,302 464,302 444,270 464,238 496,238"
            fill="none"
            stroke="var(--border)"
            strokeWidth="1"
            opacity="0.4"
          />
          <text
            x="480"
            y="266"
            textAnchor="middle"
            fontSize="10.5"
            letterSpacing="1.5"
            fill="var(--text)"
            fontWeight="600"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            BLOCK E
          </text>
          <text
            x="480"
            y="280"
            textAnchor="middle"
            fontSize="8"
            letterSpacing="1.2"
            fill="var(--muted)"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            UNIVERSITY
          </text>
        </g>

        {/* 4. HOSTEL 1 (Bottom Left Inverted Triangle) */}
        <g data-kind="campus" style={{ cursor: interactive ? "pointer" : "auto" }} onMouseEnter={() => onHover?.("campus")}>
          <polygon
            points="200,375 320,375 260,475"
            fill="var(--scene-block)"
            stroke="var(--food)"
            strokeWidth="1.8"
          />
          <polygon
            points="212,379 308,379 260,461"
            fill="none"
            stroke="var(--food)"
            strokeWidth="1"
            opacity="0.35"
          />
          <text
            x="260"
            y="402"
            textAnchor="middle"
            fontSize="11"
            letterSpacing="1.5"
            fill="var(--text)"
            fontWeight="600"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            HOSTEL 1
          </text>
          <text
            x="260"
            y="416"
            textAnchor="middle"
            fontSize="8"
            letterSpacing="1"
            fill="var(--muted)"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            RESIDENTIAL
          </text>
        </g>

        {/* 5. HOSTEL 2 (Bottom Right Inverted Triangle) */}
        <g data-kind="essentials" style={{ cursor: interactive ? "pointer" : "auto" }} onMouseEnter={() => onHover?.("essentials")}>
          <polygon
            points="480,375 600,375 540,475"
            fill="var(--scene-block)"
            stroke="var(--essentials)"
            strokeWidth="1.8"
          />
          <polygon
            points="492,379 588,379 540,461"
            fill="none"
            stroke="var(--essentials)"
            strokeWidth="1"
            opacity="0.35"
          />
          <text
            x="540"
            y="402"
            textAnchor="middle"
            fontSize="11"
            letterSpacing="1.5"
            fill="var(--text)"
            fontWeight="600"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            HOSTEL 2
          </text>
          <text
            x="540"
            y="416"
            textAnchor="middle"
            fontSize="8"
            letterSpacing="1"
            fill="var(--muted)"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            RESIDENTIAL
          </text>
        </g>
      </g>

      {/* ---------------------------------------------------- routes */}
      <g ref={routesRef} style={{ transition: "transform 0.3s ease-out", willChange: "transform" }}>
        {serviceKeys.map((k) => (
          <g key={k} style={{ opacity: dim(k), transition: "opacity .5s ease" }}>
            <path
              d={ROUTES[k]}
              fill="none"
              stroke={SERVICE_META[k].accent}
              strokeWidth="5"
              strokeLinecap="round"
              opacity="0.18"
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
              <circle r="4" fill={SERVICE_META[k].accent}>
                <animateMotion dur={k === "rides" ? "6s" : "8s"} repeatCount="indefinite" rotate="auto">
                  <mpath href={`#${uid}-${k}`} />
                </animateMotion>
              </circle>
            )}
          </g>
        ))}
      </g>

      {/* ----------------------------------------------------- pulse nodes */}
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
                <circle cx={n.x} cy={n.y} r="7" fill="none" stroke={accent} strokeWidth="1.4" className="pulse-ring" />
              )}
              <circle cx={n.x} cy={n.y} r="14" fill="transparent" />
              <circle
                cx={n.x}
                cy={n.y}
                r={isActive ? 6 : 4.5}
                fill="var(--bg)"
                stroke={accent}
                strokeWidth="2"
                style={{ transition: "r .35s cubic-bezier(.22,1,.36,1)" }}
              />
              <circle cx={n.x} cy={n.y} r="1.8" fill={accent} />
              
              {showLabels && isActive && (
                <g style={{ opacity: 1, transition: "opacity .3s ease" }}>
                  <rect
                    x={n.x + 10}
                    y={n.y - 12}
                    width={n.label.length * 7.5 + 16}
                    height="20"
                    rx="10"
                    fill="var(--surface)"
                    stroke="var(--border)"
                    strokeWidth="1"
                  />
                  <text
                    x={n.x + 18}
                    y={n.y + 2}
                    fontSize="10"
                    fill="var(--text)"
                    fontWeight="600"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {n.label}
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



