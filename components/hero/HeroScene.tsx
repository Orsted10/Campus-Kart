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

function CameraRig({ tier, reduced }: { tier: Tier; reduced: boolean }) {
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
      target: new THREE.Vector3(0, 1.5, 0),
    };
  }, [size.width, size.height]);

  /* The camera's resting pose (pointer parallax + the load push-in) is damped,
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

    const rx = base.pos.x * push + px * 0.6;
    const ry = base.pos.y * push - py * 0.3;
    const rz = base.pos.z * push;
    rest.current.x += (rx - rest.current.x) * damp;
    rest.current.y += (ry - rest.current.y) * damp;
    rest.current.z += (rz - rest.current.z) * damp;

    const lx = base.target.x + px * 0.26;
    const ly = base.target.y - py * 0.13;
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
}: {
  tier: Tier;
  reduced: boolean;
  accent: string;
}) {
  const size = useThree((s) => s.size);
  const aspect = size.width / Math.max(1, size.height);
  const scale = aspect < 0.62 ? 0.74 : aspect < 0.95 ? 0.8 : 1;
  return (
    <>
      <CameraRig tier={tier} reduced={reduced} />
      <Lights tier={tier} />
      <Suspense fallback={null}>
        <CampusEnv tier={tier} />
        <group scale={scale}>
          <Monument accent={{ color: accent }} tier={tier} reduced={reduced} />
        </group>
      </Suspense>
    </>
  );
}

function Lights({ tier }: { tier: Tier }) {
  const shadow = tier === "high" ? 2048 : 1024;
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

function Effects({ tier }: { tier: Tier }) {
  if (tier === "low") {
    return (
      <EffectComposer multisampling={0} enableNormalPass={false}>
        <Bloom intensity={0.22} luminanceThreshold={0.85} luminanceSmoothing={0.3} mipmapBlur radius={0.7} />
        <Vignette offset={0.3} darkness={0.6} />
      </EffectComposer>
    );
  }
  return (
    <EffectComposer multisampling={4} enableNormalPass={false}>
      <DepthOfField focusDistance={15} focusRange={23} bokehScale={1.15} height={520} />
      <Bloom intensity={0.2} luminanceThreshold={0.88} luminanceSmoothing={0.3} mipmapBlur radius={0.7} />
      <Vignette offset={0.3} darkness={0.55} />
    </EffectComposer>
  );
}

export default function HeroScene({
  tier,
  reduced,
  accent,
  active = true,
}: {
  tier: Tier;
  reduced: boolean;
  accent: string;
  /* false once the hero has scrolled out of view: the world stops rendering
     entirely, so the rest of the page scrolls on a quiet GPU */
  active?: boolean;
}) {
  const env = useMemo(() => skyEnvironment(), []);
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
        <color attach="background" args={["#20242f"]} />
        <SoloCamera />
        <primitive object={env} attach="environment" />
        <hemisphereLight color="#7fa6ff" groundColor="#241a10" intensity={1.2} />
        <directionalLight color="#ffb072" intensity={2.6} position={[6, 5, 4]} castShadow />
        <directionalLight color="#6f9bff" intensity={1.2} position={[-6, 3, 5]} />
        <Monument accent={{ color: "#2f8dff" }} tier={tier} reduced />
      </Canvas>
    );
  }

  return (
    <Canvas
      dpr={tier === "high" ? [1, 1.7] : [1, 1.25]}
      gl={{
        antialias: false,
        alpha: false,
        powerPreference: "high-performance",
        stencil: false,
        depth: true,
      }}
      shadows
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 1.0, 17], fov: 28, near: 0.1, far: 900 }}
      onCreated={(state) => {
        state.gl.toneMapping = THREE.ACESFilmicToneMapping;
        state.gl.toneMappingExposure = flat ? 1.08 : 1.0;
        (window as unknown as { __ck?: unknown }).__ck = state;
      }}
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <fogExp2 attach="fog" args={["#1a2444", tier === "high" ? 0.003 : 0.0044]} />
      <primitive object={env} attach="environment" />
      <SceneContent tier={tier} reduced={reduced} accent={accent} />
      {!noFx && <Effects tier={tier} />}
    </Canvas>
  );
}
