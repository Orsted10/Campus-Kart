"use client";

import { useState } from "react";
import { SERVICE_META, type ServiceId } from "@/lib/data";
import { scrollToId, useApp } from "@/lib/store";
import CampusScene from "./CampusScene";
import { Arrow } from "./Chrome";

export default function Hero() {
  const { service, setService } = useApp();
  const [hoverKind, setHoverKind] = useState<ServiceId | null>(null);

  return (
    <section id="top" className="relative min-h-[100vh] w-full overflow-hidden bg-[#08090d] text-white pt-24 pb-8 px-5 sm:px-8 lg:px-[4vw] flex flex-col justify-between">
      {/* Cinematic Background Image Layer */}
      <div className="absolute inset-0 select-none pointer-events-none z-0">
        <img
          src="/img/hero_bg.jpg"
          alt="Chandigarh University Campus Dusk"
          className="h-full w-full object-cover object-center opacity-85"
        />
        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090d] via-[#08090d]/60 to-[#08090d]/40" />
      </div>

      {/* Main Top/Middle Grid: Copy (Left), 3D Kart (Center), Glass Blueprint (Right) */}
      <div className="relative z-10 mx-auto w-full max-w-[1440px] grid lg:grid-cols-[1.1fr_1fr_1.1fr] items-center gap-8 pt-4">
        {/* LEFT COLUMN: Hero Copy & Actions */}
        <div className="flex flex-col items-start">
          {/* Location Badge */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-blue-500/30 bg-blue-950/60 px-4 py-1.5 backdrop-blur-md shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
            </span>
            <span className="font-mono text-[11px] font-bold tracking-[0.16em] text-white">
              CHANDIGARH UNIVERSITY · UNNAO, UP
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="display mt-6 text-[clamp(2.8rem,5.8vw,5.4rem)] font-extrabold leading-[0.92] tracking-[-0.035em] text-white">
            EVERYTHING
            <br />
            CAMPUS.
            <br />
            <span className="relative inline-block mt-1">
              <span className="serif-accent text-[#3b82f6] italic pr-2 font-normal">One</span>
              <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent font-extrabold">KART.</span>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-[clamp(1rem,1.2vw,1.15rem)] leading-relaxed text-slate-300 max-w-[40ch]">
            <span className="font-extrabold text-[#ff8533]">Food.</span>{" "}
            <span className="font-extrabold text-[#60a5fa]">Rides.</span>{" "}
            <span className="font-extrabold text-[#34d399]">Essentials.</span>{" "}
            Campus life — one place, moving with the way you already live.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              type="button"
              className="btn !h-12 !px-7 text-[15px] font-bold !rounded-full bg-white text-black shadow-[0_12px_32px_-6px_rgba(255,255,255,0.4)] transition-all duration-300 hover:bg-slate-200 hover:scale-[1.02] cursor-pointer"
              onClick={() => scrollToId("ecosystem")}
            >
              Explore CampusKart <Arrow />
            </button>
            <button
              type="button"
              className="btn !h-12 !px-7 text-[15px] font-semibold !rounded-full border border-white/20 bg-slate-900/60 backdrop-blur-md text-white transition-all duration-300 hover:bg-slate-800/80 hover:scale-[1.02] cursor-pointer"
              onClick={() => scrollToId("how")}
            >
              <span className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-white/10 text-white text-[10px]">▶</span>
                See How It Works
              </span>
            </button>
          </div>
        </div>

        {/* CENTER COLUMN: 3D Kart & Illuminated Pedestal */}
        <div className="relative flex flex-col items-center justify-center my-auto py-4">
          <div className="relative w-[300px] h-[300px] sm:w-[360px] sm:h-[360px] lg:w-[400px] lg:h-[400px] drop-shadow-[0_20px_50px_rgba(59,130,246,0.45)] transition-transform duration-500 hover:scale-105">
            <img src="/img/hero_cart.jpg" alt="CampusKart 3D Emblem" className="w-full h-full object-contain rounded-3xl" />
          </div>
          {/* Illuminated Pedestal Base */}
          <div className="relative -mt-12 flex flex-col items-center">
            <div className="h-5 w-[240px] rounded-full bg-blue-500/40 blur-md border border-blue-400/60 shadow-[0_0_30px_#3b82f6]" />
            <div className="mt-[-10px] flex items-center gap-2 rounded-full border border-blue-400/50 bg-[#0d101d]/90 px-6 py-1.5 backdrop-blur-xl shadow-[0_0_24px_rgba(59,130,246,0.6)]">
              <span className="font-mono text-[13px] font-extrabold tracking-widest text-white">
                CAMPUS<span className="text-[#3b82f6]">KART</span>
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Floating 3D Architectural HUD Pane */}
        <div className="relative hidden lg:flex justify-end">
          <div className="relative w-[410px] h-[350px] rounded-2xl border border-blue-500/30 bg-[#0a0d18]/70 backdrop-blur-xl p-4 shadow-[0_25px_60px_rgba(0,0,0,0.7)] transition-transform duration-500 hover:rotate-0">
            <CampusScene mode={hoverKind ?? service} showLabels={false} className="w-full h-full" />
          </div>
        </div>
      </div>

      {/* BOTTOM SERVICE CARDS DOCK (3 Cards) */}
      <div className="relative z-10 mx-auto w-full max-w-[1440px] mt-8 grid gap-4 sm:grid-cols-3">
        {/* Food Card */}
        <div
          onClick={() => setService("food")}
          onMouseEnter={() => setHoverKind("food")}
          onMouseLeave={() => setHoverKind(null)}
          className="group relative flex items-center justify-between rounded-2xl border border-[#ff6b00]/30 bg-[#0c0e17]/85 p-4 backdrop-blur-xl transition-all duration-300 hover:border-[#ff6b00] hover:shadow-[0_12px_32px_-6px_rgba(255,107,0,0.4)] cursor-pointer"
        >
          <div className="flex flex-col justify-between pr-2">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#ff6b00]/20 text-[#ff8533] text-lg">
                🍱
              </span>
              <span className="text-[17px] font-bold text-white">Food</span>
            </div>
            <p className="mt-2 text-[12px] text-slate-300 leading-snug">
              Top outside restaurants & eateries near campus.
            </p>
            <div className="mt-3 grid h-7 w-7 place-items-center rounded-full bg-white/10 text-white transition-all group-hover:bg-[#ff6b00] group-hover:text-white">
              <Arrow />
            </div>
          </div>
          <img src="/img/food_thumb.jpg" alt="Food" className="h-20 w-26 rounded-xl object-cover shrink-0 border border-white/10 shadow-md" />
        </div>

        {/* Rides Card */}
        <div
          onClick={() => setService("rides")}
          onMouseEnter={() => setHoverKind("rides")}
          onMouseLeave={() => setHoverKind(null)}
          className="group relative flex items-center justify-between rounded-2xl border border-[#3b82f6]/30 bg-[#0c0e17]/85 p-4 backdrop-blur-xl transition-all duration-300 hover:border-[#3b82f6] hover:shadow-[0_12px_32px_-6px_rgba(59,130,246,0.4)] cursor-pointer"
        >
          <div className="flex flex-col justify-between pr-2">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#3b82f6]/20 text-[#60a5fa] text-lg">
                🚗
              </span>
              <span className="text-[17px] font-bold text-white">Rides</span>
            </div>
            <p className="mt-2 text-[12px] text-slate-300 leading-snug">
              Cabs & rides at gate with real-time availability.
            </p>
            <div className="mt-3 grid h-7 w-7 place-items-center rounded-full bg-white/10 text-white transition-all group-hover:bg-[#3b82f6] group-hover:text-white">
              <Arrow />
            </div>
          </div>
          <img src="/img/rides_thumb.jpg" alt="Rides" className="h-20 w-26 rounded-xl object-cover shrink-0 border border-white/10 shadow-md" />
        </div>

        {/* Essentials Card */}
        <div
          onClick={() => setService("essentials")}
          onMouseEnter={() => setHoverKind("essentials")}
          onMouseLeave={() => setHoverKind(null)}
          className="group relative flex items-center justify-between rounded-2xl border border-[#10b981]/30 bg-[#0c0e17]/85 p-4 backdrop-blur-xl transition-all duration-300 hover:border-[#10b981] hover:shadow-[0_12px_32px_-6px_rgba(16,185,129,0.4)] cursor-pointer"
        >
          <div className="flex flex-col justify-between pr-2">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#10b981]/20 text-[#34d399] text-lg">
                📦
              </span>
              <span className="text-[17px] font-bold text-white">Essentials</span>
            </div>
            <p className="mt-2 text-[12px] text-slate-300 leading-snug">
              Everything you need, delivered straight to your block.
            </p>
            <div className="mt-3 grid h-7 w-7 place-items-center rounded-full bg-white/10 text-white transition-all group-hover:bg-[#10b981] group-hover:text-white">
              <Arrow />
            </div>
          </div>
          <img src="/img/essentials_thumb.jpg" alt="Essentials" className="h-20 w-26 rounded-xl object-cover shrink-0 border border-white/10 shadow-md" />
        </div>
      </div>

      {/* FOOTER STRIP (Avatars Left, Scroll Center, Service Legend Right) */}
      <div className="relative z-10 mx-auto w-full max-w-[1440px] mt-6 flex flex-wrap items-center justify-between border-t border-white/10 pt-4 text-[11.5px] font-mono text-slate-400 gap-4">
        {/* Left: Avatar stack & student count */}
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <img src="/img/stu1.jpg" alt="Student" className="h-7 w-7 rounded-full border border-slate-900 object-cover" />
            <img src="/img/stu2.jpg" alt="Student" className="h-7 w-7 rounded-full border border-slate-900 object-cover" />
            <img src="/img/ven1.jpg" alt="Partner" className="h-7 w-7 rounded-full border border-slate-900 object-cover" />
            <img src="/img/ven2.jpg" alt="Partner" className="h-7 w-7 rounded-full border border-slate-900 object-cover" />
          </div>
          <div>
            <span className="font-bold text-white">5000+</span> students already use CampusKart
            <span className="hidden sm:inline text-slate-500 ml-2">· Food · Rides · Essentials · A Happier Campus Life</span>
          </div>
        </div>

        {/* Center: Scroll Mouse indicator */}
        <div className="hidden md:flex items-center gap-2">
          <div className="h-6 w-3.5 rounded-full border border-slate-400 flex justify-center pt-1">
            <span className="h-1.5 w-1 rounded-full bg-blue-400 animate-bounce" />
          </div>
          <span className="text-[10.5px] tracking-widest text-slate-300 uppercase">Scroll to Explore</span>
        </div>

        {/* Right: Legend Pills */}
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-slate-200">
            <span className="h-2 w-2 rounded-full bg-[#ff6b00]" /> Food
          </span>
          <span className="flex items-center gap-1.5 text-slate-200">
            <span className="h-2 w-2 rounded-full bg-[#3b82f6]" /> Rides
          </span>
          <span className="flex items-center gap-1.5 text-slate-200">
            <span className="h-2 w-2 rounded-full bg-[#10b981]" /> Essentials
          </span>
        </div>
      </div>
    </section>
  );
}
