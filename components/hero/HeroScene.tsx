"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, DepthOfField, EffectComposer, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import CampusEnv, { type Tier } from "./CampusEnv";
import Monument from "./Monument";
import { heroScroll, pointer } from "./heroState";
import { skyEnvironment } from "./procedural";

/* --------------------------------------------------------------------------
   HERO SCENE
   One WebGL world holds the campus and the monument, so they share a single
   lighting rig: sunset key from the right, cool sky fill from the left, warm
   uplight off the pedestal. The camera behaves like a cinema camera on a
   fluid head — locked off, with a whisper of parallax.
--------------------------------------------------------------------------- */

function CameraRig({ tier, reduced, mode }: { tier: Tier; reduced: boolean; mode?: string }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);

  /* Framing is aspect-led. In portrait the copy stacks above the mark, so the
     camera tilts up and the mark drops into the band between the buttons and
     the service cards instead of sitting behind the headline. The camera sits
     on the mark's own axis at every aspect: the sculpture is centred over its
     plinth, so the lens is too. */
  const base = useMemo(() => {
    const aspect = size.width / Math.max(1, size.height);
    if (aspect < 0.62) {
      return {
        pos: new THREE.Vector3(0, 1.3, 19),
        fov: 30,
        target: new THREE.Vector3(0, 2.8, 0),
      };
    }
    if (aspect < 0.95) {
      return {
        pos: new THREE.Vector3(0, 1.2, 21),
        fov: 29,
        target: new THREE.Vector3(0, 2.2, 0),
      };
    }
    if (aspect < 1.4) {
      return {
        pos: new THREE.Vector3(0, 1.16, 19.4),
        fov: 29,
        target: new THREE.Vector3(0, 1.55, 0),
      };
    }
    return {
      pos: new THREE.Vector3(0, 1.0, 17),
      fov: 28,
        target: new THREE.Vector3(0, mode === "light" ? 1.65 : 1.5, 0),
    };
  }, [size.width, size.height, mode]);

  /* The lens swings on a short arc around the mark rather than sliding across
     it. That distinction is the whole feel of the interaction: a slide moves
     the sculpture against whatever is behind it, while an orbit keeps the mark
     pinned in frame and changes the angle we read it from, so the pointer
     lifts the pedestal's deck into view and drops it away again the way a
     camera on a fluid head would. */
  const orbit = useMemo(() => {
    const off = base.pos.clone().sub(base.target);
    return {
      radius: off.length(),
      elevation: Math.asin(off.y / off.length()),
      azimuth: Math.atan2(off.x, off.z),
    };
  }, [base]);

  /* The camera's resting pose (pointer orbit + the load push-in) is damped,
     because it is chasing a continuously moving target. The scroll response is
     not: it is applied straight from the shared, already-smoothed signal, so
     when the reader is back at the top the camera is exactly on its mark again
     instead of still easing toward it. */
  const rest = useRef(base.pos.clone());
  const look = useRef(base.target.clone());
  const born = useRef<number | null>(null);
  const EXIT = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    if (camera.fov !== base.fov) {
      camera.fov = base.fov;
      camera.updateProjectionMatrix();
    }
    const damp = Math.min(1, delta * 3.2);
    const px = reduced ? 0 : pointer.x;
    const py = reduced ? 0 : pointer.y;

    /* A single, very slow push-in on load (~1.8% over two and a half seconds)
       and then the camera is locked off. Cinema, not a screensaver. */
    if (born.current === null) born.current = state.clock.elapsedTime;
    const age = Math.min(1, Math.max(0, (state.clock.elapsedTime - born.current) / 2.6));
    const push = 1 + (reduced ? 0 : (1 - age) * 0.018);

    /* Pointer → arc. Left/right walks around the mark; up/down raises and
       lowers the lens, which is what changes the angle on the plinth. */
    const az = orbit.azimuth + px * 0.085;
    const el = orbit.elevation - py * 0.052;
    const r = orbit.radius * push;
    const rx = base.target.x + r * Math.cos(el) * Math.sin(az);
    const ry = base.target.y + r * Math.sin(el);
    const rz = base.target.z + r * Math.cos(el) * Math.cos(az);
    rest.current.x += (rx - rest.current.x) * damp;
    rest.current.y += (ry - rest.current.y) * damp;
    rest.current.z += (rz - rest.current.z) * damp;

    /* a finger's width of drift on the look point, so the swing still has some
       weight to it without ever unseating the mark from its plinth */
    const lx = base.target.x + px * 0.14;
    const ly = base.target.y - py * 0.07;
    look.current.x += (lx - look.current.x) * damp;
    look.current.y += (ly - look.current.y) * damp;
    look.current.z += (base.target.z - look.current.z) * damp;

    /* Leaving the hero pulls back and tilts up, as if the camera were lifted
       off the plaza. Kept modest — a large move leaves a large aftertaste. */
    const exit = reduced ? 0 : heroScroll.v;
    EXIT.current.set(-exit * 0.1, exit * 0.42, exit * 1.45);

    camera.position.copy(rest.current).add(EXIT.current);
    camera.lookAt(look.current.x - exit * 0.05, look.current.y + exit * 0.62, look.current.z);
  });

  return null;
}

function SoloCamera() {
  const camera = useThree((s) => s.camera);
  useFrame(() => camera.lookAt(0, 1.95, 0));
  return null;
}

function SceneContent({
  tier,
  reduced,
  accent,
  mode,
}: {
  tier: Tier;
  reduced: boolean;
  accent: string;
  mode?: string;
}) {
  const size = useThree((s) => s.size);
  const aspect = size.width / Math.max(1, size.height);
  const scale = aspect < 0.62 ? 0.74 : aspect < 0.95 ? 0.8 : 1;
  return (
    <>
      <CameraRig tier={tier} reduced={reduced} mode={mode} />
      <Lights tier={tier} mode={mode} />
      <Suspense fallback={null}>
        {/* One world, both hours. The campus is built from real geometry that
           sits on the plaza, so the monument stands on the same ground the
           buildings do instead of being composited over a photograph. */}
        <CampusEnv tier={tier} mode={mode} />
        <group scale={scale}>
          <Monument accent={{ color: accent }} tier={tier} reduced={reduced} mode={mode} />
        </group>
      </Suspense>
    </>
  );
}

function Lights({ tier, mode }: { tier: Tier; mode?: string }) {
  const shadow = tier === "high" ? 2048 : 1024;
  const isLight = mode === "light";

  if (isLight) {
    return (
      <>
        {/* Daytime ambient. Kept deliberately below the key so the white
           pedestal keeps a lit side and a shade side — a flat wash of ambient
           is what turned it into a paper cut-out. */}
        <ambientLight color="#e9f3ff" intensity={0.18} />
        <hemisphereLight color="#b6dcf8" groundColor="#e8eff5" intensity={0.18} />

        {/* Sun key — high, and forward enough that the campus facades the camera
           actually sees are the lit ones. A sun set squarely to the side would
           model the plinth beautifully and leave every building in shade. */}
        <directionalLight
          color="#fff4e6"
          intensity={3.2}
          position={[26, 25, 17]}
          castShadow
          shadow-mapSize-width={shadow}
          shadow-mapSize-height={shadow}
          shadow-camera-near={1}
          shadow-camera-far={90}
          shadow-camera-left={-26}
          shadow-camera-right={26}
          shadow-camera-top={22}
          shadow-camera-bottom={-14}
          shadow-bias={-0.0004}
          shadow-normalBias={0.024}
        />
        {/* Cool sky fill from the left */}
        <directionalLight color="#a9d8f7" intensity={0.3} position={[-22, 15, 12]} />
        {/* Ground bounce — subtle cool reflection off concrete */}
        <directionalLight color="#cfe9f8" intensity={0.18} position={[1, -7, 3]} />
        {/* Camera-side fill. This is the light that keeps the plaza and the
           plinth's face readable without lifting the whole frame into white. */}
        <directionalLight color="#f8fbff" intensity={0.34} position={[-6, 7, 20]} />
        {/* Daytime practials: a hint of bounce off the plaza, nothing that a
           clear day would not already do at ten times this brightness. */}
        <pointLight position={[7.5, 3.6, 4]} color="#91c7ff" intensity={1.1} distance={30} decay={2} />
        <pointLight position={[-2.4, 4.2, 7.4]} color="#fff4e8" intensity={0.8} distance={20} decay={2} />
      </>
    );
  }

  return (
    <>
      <ambientLight color="#16233f" intensity={0.3} />
      <hemisphereLight color="#3d6cc2" groundColor="#1c1208" intensity={0.5} />

      {/* sunset key — low, warm, from behind the academic block */}
      <directionalLight
        color="#ffa860"
        intensity={2.1}
        position={[30, 12, -22]}
        castShadow
        shadow-mapSize-width={shadow}
        shadow-mapSize-height={shadow}
        shadow-camera-near={1}
        shadow-camera-far={90}
        shadow-camera-left={-26}
        shadow-camera-right={26}
        shadow-camera-top={22}
        shadow-camera-bottom={-14}
        shadow-bias={-0.0004}
        shadow-normalBias={0.024}
      />
      {/* cool sky fill so the blue paint keeps its edge on the shadow side */}
      <directionalLight color="#4a86ff" intensity={1.1} position={[-18, 9, 13]} />
      {/* bounce off the wet plaza */}
      <directionalLight color="#2e5cae" intensity={0.3} position={[2, -6, 4]} />
      {/* the campus itself is a light source at blue hour: warm wash off the
          lit facades so the architecture reads warm against the cold sky */}
      <directionalLight color="#ffb479" intensity={0.65} position={[12, 5, -30]} />
      <pointLight position={[7.5, 3.6, 4]} color="#ffab5e" intensity={22} distance={34} decay={2} />
      {/* Front fill. A wide directional reads as bounce light and keeps the
          mark's front face an even blue; a close point light blows a hotspot
          straight through the clearcoat and turns the paint pale lavender. */}
      <directionalLight color="#dfe6f5" intensity={0.32} position={[-6, 4, 14]} />
      <pointLight position={[-2.4, 4.2, 7.4]} color="#e6dcd2" intensity={10} distance={22} decay={2} />
    </>
  );
}

function Effects({ tier, isLight }: { tier: Tier; isLight: boolean }) {
  /* Daylight wants even less bloom than dusk: the sky and the pedestal are
     already near white, so the threshold has to sit above them or the whole
     frame glows. The depth of field is what sells the campus as a place with
     distance rather than a flat backdrop. */
  if (tier === "low") {
    return (
      <EffectComposer multisampling={0} enableNormalPass={false}>
        <Bloom intensity={isLight ? 0.1 : 0.22} luminanceThreshold={isLight ? 0.95 : 0.85} luminanceSmoothing={0.3} mipmapBlur radius={0.7} />
        <Vignette offset={0.3} darkness={isLight ? 0.16 : 0.6} />
      </EffectComposer>
    );
  }
  return (
    <EffectComposer multisampling={4} enableNormalPass={false}>
      <DepthOfField focusDistance={15} focusRange={23} bokehScale={isLight ? 0.66 : 1.15} height={520} />
      <Bloom intensity={isLight ? 0.1 : 0.2} luminanceThreshold={isLight ? 0.95 : 0.88} luminanceSmoothing={0.3} mipmapBlur radius={0.7} />
      <Vignette offset={0.3} darkness={isLight ? 0.16 : 0.55} />
    </EffectComposer>
  );
}

export default function HeroScene({
  tier,
  reduced,
  accent,
  active = true,
  mode = "dark",
}: {
  tier: Tier;
  reduced: boolean;
  accent: string;
  /* false once the hero has scrolled out of view: the world stops rendering
     entirely, so the rest of the page scrolls on a quiet GPU */
  active?: boolean;
  mode?: string;
}) {
  const env = useMemo(() => skyEnvironment(mode), [mode]);
  const params = typeof window === "undefined" ? null : new URLSearchParams(window.location.search);
  const noFx = params?.get("nofx") === "1";
  const solo = params?.get("solo") === "1";
  const flat = solo || params?.get("flat") === "1";

  if (solo) {
    return (
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
        shadows
        camera={{ position: [0.7, 2.1, 9.4], fov: 30, near: 0.1, far: 200 }}
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <color attach="background" args={[mode === "light" ? "#dbeafe" : "#20242f"]} />
        <SoloCamera />
        <primitive object={env} attach="environment" />
        <hemisphereLight color="#7fa6ff" groundColor="#241a10" intensity={1.2} />
        <directionalLight color="#ffb072" intensity={2.6} position={[6, 5, 4]} castShadow />
        <directionalLight color="#6f9bff" intensity={1.2} position={[-6, 3, 5]} />
        <Monument accent={{ color: "#2f8dff" }} tier={tier} reduced />
      </Canvas>
    );
  }

  const isLight = mode === "light";
  const fogColor = isLight ? "#d5e7f6" : "#1a2444";
  /* Daylight haze is aerial perspective: enough to stack the far blocks behind
     the near ones, not enough to grey the plaza the monument is standing on. */
  const fogDensity = isLight ? (tier === "high" ? 0.0013 : 0.0022) : (tier === "high" ? 0.003 : 0.0044);

  return (
    <Canvas
      dpr={tier === "high" ? [1, 1.7] : [1, 1.25]}
      gl={{
        antialias: mode === "light",
        // The world paints its own sky in both hours, so the canvas only needs
        // alpha to survive a theme toggle without a black flash mid-swap.
        alpha: true,
        powerPreference: "high-performance",
        stencil: false,
        depth: true,
      }}
      shadows
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 1.0, 17], fov: 28, near: 0.1, far: 900 }}
      onCreated={(state) => {
        state.gl.toneMapping = THREE.ACESFilmicToneMapping;
        /* Daylight sits at 1.0: the key is already bright enough to put the
           plinth over 0.85 and the sky above it, and an exposure lifted to
           compensate just takes the plaza with it. */
        state.gl.toneMappingExposure = flat ? 1.08 : 1.0;
        (window as unknown as { __ck?: unknown }).__ck = state;
      }}
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <fogExp2 attach="fog" args={[fogColor, fogDensity]} />
      <primitive object={env} attach="environment" />
      <SceneContent tier={tier} reduced={reduced} accent={accent} mode={mode} />
      {!noFx && <Effects tier={tier} isLight={isLight} />}
    </Canvas>
  );
}
