"use client";

import { useEffect } from "react";
import { useSmoothScroll, ScrollTrigger } from "@/lib/motion";
import { useApp } from "@/lib/store";
import { Cursor, Loader, Nav } from "./Chrome";
import Overlays from "./Overlays";
import Hero from "./Hero";
import Chaos from "./Chaos";
import Convergence from "./Convergence";
import Ecosystem from "./Ecosystem";
import Scenarios from "./Scenarios";
import People, { Vendors } from "./People";
import { TrustLayer, UnderSurface } from "./Trust";
import Partner from "./Partner";
import Footer from "./Footer";

const SECTIONS = ["top", "connect", "ecosystem", "stories", "people", "partner"];

export default function Experience() {
  useSmoothScroll();
  const { setActiveSection, openOverlay } = useApp();

  useEffect(() => {
    const triggers = SECTIONS.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      return ScrollTrigger.create({
        trigger: el,
        start: "top center",
        end: "bottom center",
        onToggle: (self) => {
          if (self.isActive) setActiveSection(id);
        },
      });
    }).filter(Boolean);

    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openOverlay("search");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      triggers.forEach((t) => t?.kill());
      window.removeEventListener("keydown", onKey);
    };
  }, [setActiveSection, openOverlay]);

  return (
    <>
      <Loader />
      <Cursor />
      <Nav />
      <main>
        <Hero />
        <Chaos />
        <Convergence />
        <Ecosystem />
        <Scenarios />
        <People />
        <Vendors />
        <TrustLayer />
        <UnderSurface />
        <Partner />
      </main>
      <Footer />
      <Overlays />
    </>
  );
}
