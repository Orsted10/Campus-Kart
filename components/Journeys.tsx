"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Cookie, Highlighter, NotebookPen, PenLine, PlugZap, Printer, ShowerHead } from "lucide-react";
import { DISHES, RIDE_POINTS, SHELF } from "@/lib/data";
import { useApp, useReducedMotion } from "@/lib/store";

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="micro inline-flex items-center gap-2 border border-line px-2.5 py-1">
    <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--food)" }} />
    {children}
  </span>
);

/* ================================================================ FOOD */

const STAGES = ["Discover", "Choose", "Order", "Prepare", "Move", "Arrive"] as const;

export function FoodJourney() {
  const [dish, setDish] = useState(0);
  const [stage, setStage] = useState(1);
  const [run, setRun] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (run === 0 || reduced) return;
    let n = 0;
    const id = window.setInterval(() => {
      n += 1;
      setStage(n);
      if (n >= 5) window.clearInterval(id);
    }, 850);
    return () => window.clearInterval(id);
  }, [run, reduced]);

  const start = () => {
    setRun((r) => r + 1);
    setStage(reduced ? 5 : 0);
  };

  const active = DISHES[dish];
  const progress = stage / 5;

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
      <div>
        <Badge>Live order · campus network</Badge>
        <h3 className="display mt-5 text-[clamp(2.1rem,4.6vw,3.6rem)]">
          HUNGRY?
          <br />
          <span className="serif-accent text-food">sorted.</span>
        </h3>
        <p className="lede mt-4">
          Pick a dish. Watch the vendor wake, the kitchen work, and the route find your block.
        </p>

        <div className="mt-7 border-t border-line">
          {DISHES.map((d, i) => (
            <button
              key={d.id}
              type="button"
              onClick={() => {
                setDish(i);
                start();
              }}
              className="group flex w-full items-center justify-between border-b border-line py-4 text-left"
              data-cursor="link"
            >
              <span className="flex items-baseline gap-4">
                <span
                  className="num text-[12px] transition-colors"
                  style={{ color: i === dish ? "var(--food-ink)" : "var(--muted)" }}
                >
                  0{i + 1}
                </span>
                <span>
                  <span
                    className="block text-[17px] font-medium tracking-[-0.02em] transition-colors"
                    style={{ color: i === dish ? "var(--text)" : "var(--muted)" }}
                  >
                    {d.name}
                  </span>
                  <span className="micro mt-0.5 block">{d.vendor} · {d.mins} min</span>
                </span>
              </span>
              <span className="num text-[15px] text-muted group-hover:text-ink">{d.price}</span>
            </button>
          ))}
        </div>

        {/* journey line */}
        <ol className="mt-8 space-y-0">
          {STAGES.map((s, i) => {
            const done = i <= stage;
            const current = i === stage;
            return (
              <li key={s} className="flex items-center gap-4">
                <span className="relative flex h-8 w-4 items-center justify-center">
                  <span
                    className="absolute h-8 w-px transition-colors duration-500"
                    style={{ background: i <= stage ? "var(--food)" : "var(--border)" }}
                  />
                  <span
                    className="absolute h-2.5 w-2.5 rounded-full border transition-all duration-500"
                    style={{
                      background: current ? "var(--food)" : done ? "var(--surface)" : "var(--bg)",
                      borderColor: done ? "var(--food)" : "var(--border)",
                      transform: current ? "scale(1.35)" : "scale(1)",
                    }}
                  />
                </span>
                <span
                  className="text-[14px] transition-all duration-500"
                  style={{
                    color: done ? "var(--text)" : "var(--muted)",
                    transform: current ? "translateX(4px)" : "none",
                  }}
                >
                  {s}
                  <span className="micro ml-3">
                    {current ? (i === 3 ? `${active.vendor} is preparing` : "in progress") : i < stage ? "done" : "waiting"}
                  </span>
                </span>
              </li>
            );
          })}
        </ol>

        <div className="mt-7 flex flex-wrap items-center gap-4">
          <button
            type="button"
            className="btn btn-solid"
            onClick={start}
            data-cursor="cta"
          >
            {stage >= 5 ? "Run it again" : "Send it"} <span className="arrow">→</span>
          </button>
          <div className="h-1 w-32 overflow-hidden" style={{ background: "var(--border)" }}>
            <div
              className="h-full"
              style={{
                width: `${progress * 100}%`,
                background: "var(--food)",
                transition: "width .7s cubic-bezier(.65,0,.35,1)",
              }}
            />
          </div>
        </div>
      </div>

      {/* ------------------------------------------------ photo + route */}
      <div className="relative">
        <div className="relative overflow-hidden" style={{ background: "var(--surface-2)" }}>
          <Image
            src="/img/food1.jpg"
            alt="A freshly plated campus meal packed for delivery"
            width={1400}
            height={933}
            priority={false}
            className="h-[42vh] w-full object-cover lg:h-[60vh]"
            style={{
              transform: `scale(${1.04 - stage * 0.008})`,
              transition: "transform 1.2s cubic-bezier(.22,1,.36,1)",
            }}
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, color-mix(in srgb, var(--bg) 88%, transparent), transparent 55%)",
            }}
          />

          {/* route across the photo */}
          <svg
            viewBox="0 0 600 200"
            className="absolute inset-x-0 bottom-0 h-[45%] w-full"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M60,150 C 180,150 220,60 320,60 C 420,60 460,140 540,140"
              fill="none"
              stroke="var(--food)"
              strokeWidth="2"
              opacity="0.9"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset={1 - progress}
              style={{ transition: "stroke-dashoffset .8s cubic-bezier(.65,0,.35,1)" }}
            />
            <g style={{ opacity: stage >= 2 ? 1 : 0.35, transition: "opacity .5s" }}>
              <circle cx="60" cy="150" r="7" fill="var(--bg)" stroke="var(--food)" strokeWidth="2" />
              <circle cx="60" cy="150" r="2.5" fill="var(--food)" />
              <text x="60" y="176" textAnchor="middle" fontSize="11" fill="var(--text)" style={{ fontFamily: "var(--font-mono)" }}>
                {active.vendor.toUpperCase()}
              </text>
            </g>
            <g style={{ opacity: stage >= 5 ? 1 : 0.35, transition: "opacity .5s" }}>
              <circle cx="540" cy="140" r="9" fill="var(--bg)" stroke="var(--food)" strokeWidth={stage >= 5 ? 2.5 : 1.5} />
              {stage >= 5 && <circle cx="540" cy="140" r="4" fill="var(--food)" />}
              <text x="540" y="166" textAnchor="middle" fontSize="11" fill="var(--text)" style={{ fontFamily: "var(--font-mono)" }}>
                HOSTEL NORTH
              </text>
            </g>
          </svg>

          {stage >= 4 && (
            <svg
              viewBox="0 0 600 200"
              className="absolute inset-x-0 bottom-0 h-[45%] w-full"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <circle r="7" fill="var(--food)">
                <animateMotion dur="2.6s" repeatCount="indefinite" path="M60,150 C 180,150 220,60 320,60 C 420,60 460,140 540,140" />
              </circle>
            </svg>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <span className="micro">
            {stage >= 5 ? "Arrived · collect at hostel steps" : stage >= 3 ? "In preparation" : "Awaiting confirmation"}
          </span>
          <span className="num text-[13px] text-muted">
            {active.name} · {active.price} · ~{active.mins} min
          </span>
        </div>

      </div>
    </div>
  );
}

/* =============================================================== RIDES */

const POINTS: Record<string, [number, number]> = {
  Hostel: [90, 330],
  "Academic Block": [330, 130],
  Library: [520, 300],
  "Food Court": [170, 80],
  "Main Gate": [700, 370],
};

function routePath(a: string, b: string) {
  const [x1, y1] = POINTS[a];
  const [x2, y2] = POINTS[b];
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const off = 46;
  const cx = mx + (-dy / len) * off;
  const cy = my + (dx / len) * off;
  return `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`;
}

export function RideJourney() {
  const { pickup, destination, setPickup, setDestination } = useApp();
  const path = useMemo(() => routePath(pickup, destination), [pickup, destination]);
  const [x1, y1] = POINTS[pickup];
  const [x2, y2] = POINTS[destination];
  const dist = (Math.hypot(x2 - x1, y2 - y1) * 0.0075).toFixed(1);
  const eta = Math.max(2, Math.round(Number(dist) * 3.4 + 2));
  const reduced = useReducedMotion();

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
      <div>
        <span className="micro inline-flex items-center gap-2 border border-line px-2.5 py-1">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--rides)" }} />
          Route map · campus network
        </span>
        <h3 className="display mt-5 text-[clamp(2.1rem,4.6vw,3.6rem)]">
          NEED A CAB?
          <br />
          <span className="serif-accent text-blue">outside gate ready.</span>
        </h3>
        <p className="lede mt-4">
          Outside cabs, autos & outstation rides right from Outside Gate directly to your destination.
        </p>

        <fieldset className="mt-7">
          <legend className="micro">Pickup</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {RIDE_POINTS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPickup(p === destination ? pickup : p)}
                disabled={p === destination}
                className="rounded-full border px-3.5 py-2 text-[13px] transition-all duration-300 disabled:opacity-35"
                style={{
                  borderColor: pickup === p ? "var(--rides)" : "var(--border)",
                  color: pickup === p ? "var(--rides-ink)" : "var(--muted)",
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-6">
          <legend className="micro">Destination</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {RIDE_POINTS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setDestination(p === pickup ? destination : p)}
                disabled={p === pickup}
                className="rounded-full border px-3.5 py-2 text-[13px] transition-all duration-300 disabled:opacity-35"
                style={{
                  borderColor: destination === p ? "var(--rides)" : "var(--border)",
                  color: destination === p ? "var(--rides-ink)" : "var(--muted)",
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </fieldset>

        <dl className="mt-8 grid grid-cols-3 gap-px border border-line" style={{ background: "var(--border)" }}>
          {[
            ["ETA", `${eta} min`],
            ["Distance", `${dist} km`],
            ["Pickup", pickup],
          ].map(([k, v]) => (
            <div key={k} className="p-4" style={{ background: "var(--surface)" }}>
              <dt className="micro">{k}</dt>
              <dd className="num mt-1 text-[clamp(1.05rem,2vw,1.4rem)] font-medium tracking-[-0.03em]">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="micro mt-3">
          Availability · <span className="text-blue">ready</span> — real-time state appears inside the product.
        </p>
      </div>

      {/* -------------------------------------------------- route map */}
      <div className="relative overflow-hidden border border-line" style={{ background: "var(--surface)" }}>
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <span className="micro">Campus route · schematic</span>
          <span className="micro" style={{ color: "var(--rides-ink)" }}>
            {pickup} → {destination}
          </span>
        </div>
        <svg viewBox="0 0 800 440" className="h-[38vh] w-full lg:h-[52vh]" aria-label="Schematic route across the example campus">
          <defs>
            <pattern id="ride-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 0 H40 M0 0 V40" fill="none" stroke="var(--scene-line)" strokeWidth="1" opacity="0.6" />
            </pattern>
          </defs>
          <rect width="800" height="440" fill="url(#ride-grid)" />
          {[
            [40, 200, 200, 70],
            [300, 240, 190, 80],
            [560, 90, 180, 70],
            [430, 350, 240, 60],
          ].map(([x, y, w, h], i) => (
            <rect key={i} x={x} y={y} width={w} height={h} fill="var(--scene-block)" stroke="var(--scene-line)" rx="2" />
          ))}

          <path d="M20,240 H780" stroke="var(--scene-line)" strokeWidth="10" opacity="0.35" fill="none" />
          <path d="M360,20 V420" stroke="var(--scene-line)" strokeWidth="10" opacity="0.35" fill="none" />

          <path key={path} d={path} fill="none" stroke="var(--rides)" strokeWidth="3" strokeDasharray="8 8" className={reduced ? "" : "route-dash"} />
          {Object.entries(POINTS).map(([name, [x, y]]) => {
            const isPickup = name === pickup;
            const isDest = name === destination;
            return (
              <g key={name} style={{ opacity: isPickup || isDest ? 1 : 0.55, transition: "opacity .4s" }}>
                <circle
                  cx={x}
                  cy={y}
                  r={isPickup || isDest ? 9 : 5}
                  fill="var(--surface)"
                  stroke={isPickup ? "var(--rides)" : isDest ? "var(--food)" : "var(--muted)"}
                  strokeWidth="2"
                  style={{ transition: "r .4s cubic-bezier(.22,1,.36,1)" }}
                />
                {(isPickup || isDest) && (
                  <text x={x} y={y + 28} textAnchor="middle" fontSize="12" fill="var(--text)" style={{ fontFamily: "var(--font-mono)" }}>
                    {name.toUpperCase()}
                  </text>
                )}
              </g>
            );
          })}

          <g key={`${pickup}-${destination}`}>
            <circle r="8" fill="var(--rides)">
              <animateMotion dur="3.4s" repeatCount="indefinite" path={path} />
            </circle>
            <circle r="3.5" fill="#fff">
              <animateMotion dur="3.4s" repeatCount="indefinite" path={path} />
            </circle>
          </g>
        </svg>
        <div className="flex items-center justify-between border-t border-line px-4 py-3">
          <span className="micro">Student · Hostel steps</span>
          <span className="micro">Kart · campus plate 04</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------- essentials shelf */

const ICONS = [PlugZap, NotebookPen, PenLine, ShowerHead, Cookie, Printer, Highlighter];

export function EssentialsShelf() {
  const [open, setOpen] = useState<string | null>(null);
  const [bag, setBag] = useState<string[]>([]);
  const active = SHELF.find((s) => s.id === open);

  return (
    <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:gap-14">
      <div>
        <span className="micro inline-flex items-center gap-2 border border-line px-2.5 py-1">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--essentials)" }} />
          Store shelf · campus network
        </span>
        <h3 className="display mt-5 text-[clamp(2.1rem,4.6vw,3.6rem)]">
          FOR THE THINGS
          <br />
          <span className="serif-accent text-essentials">you forgot.</span>
        </h3>

        <div className="mt-8 -mx-5 overflow-x-auto px-5 no-bar sm:mx-0 sm:px-0">
          <div className="grid min-w-[560px] grid-cols-4 gap-px sm:min-w-0" style={{ background: "var(--border)" }}>
            {SHELF.map((item, i) => {
              const Icon = ICONS[i % ICONS.length];
              const isActive = open === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setOpen(isActive ? null : item.id)}
                  onMouseEnter={() => setOpen(item.id)}
                  data-cursor="link"
                  className="group relative flex aspect-[4/5] flex-col justify-between p-4 text-left transition-transform duration-500"
                  style={{
                    background: isActive ? "var(--surface-2)" : "var(--surface)",
                    transform: isActive ? "translateY(-8px)" : "none",
                    zIndex: isActive ? 2 : 1,
                  }}
                  aria-pressed={isActive}
                >
                  <span
                    className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{ background: "radial-gradient(60% 100% at 50% 0%, var(--accent-ess, rgb(101 112 90 / .22)), transparent 75%)" }}
                  />
                  <span className="relative flex items-start justify-between">
                    <Icon
                      size={26}
                      strokeWidth={1.25}
                      style={{
                        color: isActive ? "var(--essentials-ink)" : "var(--muted)",
                        transform: isActive ? "translateY(-4px)" : "none",
                        transition: "all .5s cubic-bezier(.22,1,.36,1)",
                      }}
                    />
                    <span className="micro">{item.aisle}</span>
                  </span>
                  <span className="relative">
                    <span className="block text-[13.5px] font-medium leading-tight">{item.name}</span>
                    <span
                      className="num mt-1 block text-[12px] transition-colors"
                      style={{ color: isActive ? "var(--essentials-ink)" : "var(--muted)" }}
                    >
                      {item.price}
                    </span>
                  </span>
                </button>
              );
            })}
            <div
              className="flex aspect-[4/5] flex-col justify-end p-4"
              style={{ background: "var(--surface-2)" }}
            >
              <span className="micro">Aisle D</span>
              <span className="mt-1 text-[13px] text-muted">Restocked 18:40</span>
            </div>
          </div>
        </div>
        <p className="micro mt-4">Hover / tap an item · store inventory</p>
      </div>

      <div className="relative">
        <div
          className="panel sticky top-28 p-6"
          style={{
            opacity: active ? 1 : 0.55,
            transform: active ? "none" : "translateY(6px)",
            transition: "all .5s cubic-bezier(.22,1,.36,1)",
          }}
        >
          <p className="micro">Item detail</p>
          {active ? (
            <div style={{ animation: "ck-rise .45s cubic-bezier(.22,1,.36,1) both" }}>
              <h4 className="mt-2 text-[1.5rem] font-semibold tracking-[-0.03em]">{active.name}</h4>
              <p className="mt-2 text-sm leading-relaxed text-muted">{active.note}</p>
              <div className="mt-5 flex items-end justify-between border-t border-line pt-4">
                <span>
                  <span className="micro block">Price</span>
                  <span className="num text-[1.35rem] font-medium">{active.price}</span>
                </span>
                <span className="text-right">
                  <span className="micro block">Location</span>
                  <span className="num text-[13px]">Aisle {active.aisle}</span>
                </span>
              </div>
              <button
                type="button"
                className="btn btn-solid mt-5 w-full justify-center"
                onClick={() => setBag((b) => (b.includes(active.id) ? b : [...b, active.id]))}
                data-cursor="cta"
              >
                {bag.includes(active.id) ? "In bag ✓" : "Add to bag"} <span className="arrow">→</span>
              </button>
              <p className="micro mt-3 text-center">No checkout here — this is the front door.</p>
            </div>
          ) : (
            <div className="mt-2">
              <h4 className="mt-2 text-[1.3rem] font-medium tracking-[-0.03em] text-muted">
                Pick something off the shelf.
              </h4>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Chargers, notebooks, toiletries, print supplies — the things that disappear the week
                before submissions.
              </p>
            </div>
          )}
        </div>
        <style>{`@keyframes ck-rise { from { opacity:0; transform: translateY(14px) } to { opacity:1; transform:none } }`}</style>
      </div>
    </div>
  );
}
