"use client";

import { useState } from "react";
import { SERVICE_META, type ServiceId } from "@/lib/data";
import { useApp } from "@/lib/store";
import { EssentialsShelf, FoodJourney, RideJourney } from "./Journeys";

const ORDER: ServiceId[] = ["food", "rides", "essentials"];

export default function Ecosystem() {
  const { service, setService } = useApp();
  const [preview, setPreview] = useState<ServiceId | null>(null);
  const shown = preview ?? service;
  const meta = SERVICE_META[shown];

  const dash =
    shown === "food" ? "10 8" : shown === "rides" ? "none" : "2 12";

  return (
    <section id="ecosystem" className="relative px-5 pb-[12vh] pt-[8vh] sm:px-8 lg:px-[4vw]">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex items-end justify-between gap-6 border-t border-line pt-6">
          <span className="micro">Act IV — experience</span>
          <span className="micro text-right">
            demo content · <span style={{ color: meta.ink }}>{meta.label}</span>
          </span>
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,300px)_1fr] lg:gap-16">
          {/* ------------------------------------------------- selector */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <h2 className="display text-[clamp(2.2rem,5vw,4rem)]">
              ONE
              <br />
              ENVIRONMENT.
              <br />
              <span className="serif-accent text-blue">three ways it moves.</span>
            </h2>

            <div
              className="mt-8 flex gap-2 overflow-x-auto no-bar lg:mt-10 lg:flex-col lg:gap-0"
              role="tablist"
              aria-label="CampusKart services"
            >
              {ORDER.map((s, i) => {
                const active = service === s;
                return (
                  <button
                    key={s}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setService(s)}
                    onMouseEnter={() => setPreview(s)}
                    onMouseLeave={() => setPreview(null)}
                    className="group flex shrink-0 items-baseline gap-4 border-b border-line px-4 py-4 text-left transition-colors lg:w-full lg:px-0"
                    data-cursor="link"
                    style={{ borderColor: active ? SERVICE_META[s].accent : "var(--border)" }}
                  >
                    <span className="num text-[12px]" style={{ color: active ? SERVICE_META[s].ink : "var(--muted)" }}>
                      0{i + 1}
                    </span>
                    <span
                      className="display whitespace-nowrap text-[clamp(1.8rem,4.6vw,3.1rem)] transition-all duration-500"
                      style={{
                        color: active ? SERVICE_META[s].ink : "var(--text)",
                        opacity: active ? 1 : 0.62,
                        transform: active && preview ? "translateX(6px)" : "none",
                      }}
                    >
                      {SERVICE_META[s].label.toUpperCase()}
                    </span>
                    <span
                      className="ml-auto hidden h-px transition-all duration-500 lg:block"
                      style={{
                        width: active ? 56 : 18,
                        background: active ? SERVICE_META[s].accent : "var(--border)",
                      }}
                    />
                  </button>
                );
              })}
            </div>

            <p className="lede mt-6">{SERVICE_META[service].blurb}</p>
          </div>

          {/* ---------------------------------------------------- stage */}
          <div id="how" className="scroll-mt-24">
            {/* continuity: one line that changes texture, never disappears */}
            <div className="relative mb-8 flex items-center gap-4">
              <svg
                viewBox="0 0 1000 40"
                preserveAspectRatio="none"
                className="h-8 flex-1"
                aria-hidden="true"
              >
                <path
                  d="M0,32 C 220,32 260,8 500,8 C 740,8 780,32 1000,32"
                  fill="none"
                  stroke={meta.accent}
                  strokeWidth={shown === "rides" ? 9 : 3}
                  strokeLinecap="round"
                  strokeDasharray={dash}
                  opacity={shown === "rides" ? 0.25 : 1}
                  style={{ transition: "stroke .6s ease, stroke-width .6s ease, opacity .6s ease" }}
                  vectorEffect="non-scaling-stroke"
                  className={shown === "food" ? "route-dash" : ""}
                />
              </svg>
              <span className="micro whitespace-nowrap" style={{ color: meta.ink }}>
                {shown === "food" ? "route" : shown === "rides" ? "road" : "supply path"}
              </span>
            </div>

            <div
              key={service}
              style={{ animation: "ck-stage .6s cubic-bezier(.22,1,.36,1) both" }}
            >
              {service === "food" && <FoodJourney />}
              {service === "rides" && <RideJourney />}
              {service === "essentials" && <EssentialsShelf />}
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes ck-stage { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: none } }`}</style>
    </section>
  );
}
