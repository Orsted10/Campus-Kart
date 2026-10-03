"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import {
  baseGlow,
  baseShadow,
  contactShadow,
  glowSprite,
  pedestalGloss,
  pedestalLabel,
  pedestalSkin,
  reflectionMask,
} from "./procedural";
import { pointer } from "./heroState";
import type { Tier } from "./CampusEnv";

/* --------------------------------------------------------------------------
   CAMPUSKART MONUMENT
   Real-world scale: pedestal 3.4 m across, the mark 2.6 m tall. Built from the
   brand's language — glossy electric-blue painted metal, white crate lattice,
   dark rubber wheels, red/orange/green cargo over the rim — and lit by the
   campus rig (warm sunset key, cool sky fill, warm pedestal uplight).
--------------------------------------------------------------------------- */

type Accent = { color: string };

const EASE_OUT = (t: number) => 1 - Math.pow(1 - t, 3);  /* the deck the mark stands on: the sculpture's local origin sits here */
const DECK_Y = 1.105;

const CART = {
  basketBottom: { w: 1.82, d: 1.28 },
  basketTop: { w: 2.36, d: 1.62 },
  basketY: 0.95,
  basketH: 1.24,
  rim: 0.09,
};

function useKartMaterials(mode: string = "dark") {
  const isLight = mode === "light";
  return useMemo(() => {
    const skin = isLight ? pedestalSkin() : null;
    /* Fine surface grain goes here rather than into the albedo: it breaks the
       clearcoat highlight up the way real paint does, without drawing a single
       visible line around a drum that is 14 m of circumference. */
    const gloss = isLight ? pedestalGloss() : null;
    /* Brand paint: saturated electric blue with a wet, deep-gloss clearcoat —
       the toy-car lacquer the references are built on. */
    const blue = new THREE.MeshPhysicalMaterial({
      color: isLight ? "#0755df" : "#0b49d8",
      metalness: 0.06,
      roughness: 0.18,
      clearcoat: 1,
      clearcoatRoughness: 0.2,
      envMapIntensity: 1.1,
    });
    const blueDeep = new THREE.MeshPhysicalMaterial({
      color: isLight ? "#093ea7" : "#0a3690",
      metalness: 0.15,
      roughness: 0.22,
      clearcoat: 1,
      clearcoatRoughness: 0.22,
      envMapIntensity: 1,
    });
    const blueInner = new THREE.MeshStandardMaterial({
      color: isLight ? "#1e3a8a" : "#051229",
      metalness: 0.4,
      roughness: 0.55,
      envMapIntensity: 0.6,
    });
    const lattice = new THREE.MeshPhysicalMaterial({
      color: isLight ? "#54a1ff" : "#3f86e0",
      metalness: 0.06,
      roughness: 0.2,
      clearcoat: 1,
      clearcoatRoughness: 0.22,
      envMapIntensity: 1,
    });
    const rubber = new THREE.MeshStandardMaterial({
      color: "#12141c",
      roughness: 0.62,
      metalness: 0.14,
    });
    const hub = new THREE.MeshPhysicalMaterial({
      color: "#3d4657",
      metalness: 0.5,
      roughness: 0.36,
      envMapIntensity: 0.6,
    });
    const cargo = (color: string, roughness = 0.24) =>
      new THREE.MeshPhysicalMaterial({
        color,
        roughness,
        metalness: 0.06,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
        envMapIntensity: 1.45,
      });
    /* Daylight pedestal: bright acrylic-white with a satin clearcoat. The
       base colours sit just below white so the sun still models the drum,
       and the env carries the blue cast off the sky that reads as gloss. */
    const plinth = new THREE.MeshPhysicalMaterial({
      color: isLight ? "#eef2f7" : "#141821",
      roughness: isLight ? 0.32 : 0.28,
      roughnessMap: gloss,
      metalness: isLight ? 0 : 0.75,
      clearcoat: isLight ? 0.6 : 0,
      clearcoatRoughness: 0.18,
      clearcoatRoughnessMap: gloss,
      envMapIntensity: isLight ? 0.7 : 1.1,
    });
    const plinthFace = new THREE.MeshPhysicalMaterial({
      color: isLight ? "#f2f6fa" : "#14181f",
      map: skin,
      roughness: isLight ? 0.3 : 0.22,
      roughnessMap: gloss,
      metalness: isLight ? 0 : 0.7,
      clearcoat: isLight ? 0.75 : 0.9,
      clearcoatRoughness: isLight ? 0.12 : 0.15,
      clearcoatRoughnessMap: gloss,
      envMapIntensity: isLight ? 0.7 : 0.9,
    });
    const plinthTop = new THREE.MeshPhysicalMaterial({
      color: isLight ? "#f7fafd" : "#2a3346",
      roughness: isLight ? 0.22 : 0.16,
      roughnessMap: gloss,
      metalness: isLight ? 0 : 0.8,
      clearcoat: 0.7,
      clearcoatRoughness: isLight ? 0.08 : 0.04,
      envMapIntensity: isLight ? 0.85 : 1.3,
    });
    /* Machined seam */
    const plinthSeam = new THREE.MeshStandardMaterial({
      color: isLight ? "#6b7889" : "#33240f",
      roughness: isLight ? 0.32 : 0.34,
      metalness: isLight ? 0.55 : 0.86,
      envMapIntensity: isLight ? 0.7 : 1.05,
    });
    /* Daylight fills this slot with the sky in the clearcoat, not with an
       emitter. Left switched on in daylight it was the single largest thing
       pushing the base of the plinth past white. */
    const plinthGlow = new THREE.MeshStandardMaterial({
      color: isLight ? "#4c6076" : "#42260e",
      emissive: new THREE.Color(isLight ? "#0d1b2a" : "#ffb066"),
      emissiveIntensity: isLight ? 0 : 0.9,
      toneMapped: false,
      side: THREE.DoubleSide,
    });
    return {
      blue,
      blueDeep,
      blueInner,
      lattice,
      rubber,
      hub,
      plinth,
      plinthFace,
      plinthTop,
      plinthSeam,
      plinthGlow,
      cargo: {
        red: cargo("#dd3327"),
        orange: cargo("#f97c1c"),
        green: cargo("#2fbf58"),
        blue: cargo("#4aa4ff", 0.2),
      },
    };
  }, [isLight]);
}

/* ----------------------------------------------------------------- basket */

function basketGeometry() {
  const { basketBottom: b, basketTop: t, basketH: h } = CART;
  const r = 0.07;
  const shape = new THREE.Shape();
  const bl = b.w / 2;
  const br = t.w / 2;
  const half = h / 2;
  shape.moveTo(-bl + r, -half);
  shape.lineTo(bl - r, -half);
  shape.quadraticCurveTo(bl, -half, bl, -half + r);
  shape.lineTo(br, half - r);
  shape.quadraticCurveTo(br, half, br - r, half);
  shape.lineTo(-br + r, half);
  shape.quadraticCurveTo(-br, half, -br, half - r);
  shape.lineTo(-bl, -half + r);
  shape.quadraticCurveTo(-bl, -half, -bl + r, -half);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: (b.d + t.d) / 2,
    bevelEnabled: true,
    bevelThickness: 0.07,
    bevelSize: 0.06,
    bevelSegments: 4,
    curveSegments: 6,
  });
  geo.translate(0, 0, -(b.d + t.d) / 4);
  geo.computeVertexNormals();
  return geo;
}

function Basket({ mode = "dark" }: { mode?: string }) {
  const { blue, blueInner, lattice } = useKartMaterials(mode);
  const geo = useMemo(() => basketGeometry(), []);

  const bars = useMemo(() => {
    const { basketBottom: b, basketTop: t, basketH: h } = CART;
    const topW = t.w;
    const out: { p: [number, number, number]; s: [number, number, number] }[] = [];
    const cols = 5;
    const rows = 3;
    const zf = t.d / 2 + 0.03;
    for (let i = 1; i < cols; i++) {
      const u = i / cols;
      const x = -b.w / 2 + u * topW;
      out.push({ p: [x, 0, zf], s: [0.022, h * 0.76, 0.038] });
    }
    for (let j = 1; j < rows; j++) {
      const y = -h / 2 + (j / rows) * h;
      out.push({ p: [0, y, zf], s: [topW * 0.92, 0.022, 0.038] });
    }
    return out;
  }, []);

  const frame = useMemo(() => {
    const { basketTop: t, basketH: h } = CART;
    const topW = t.w;
    const zf = t.d / 2 + 0.05;
    return [
      { p: [0, h / 2 - 0.05, zf] as [number, number, number], s: [topW * 1.0, 0.1, 0.1] as [number, number, number] },
      { p: [0, -h / 2 + 0.05, zf] as [number, number, number], s: [topW * 1.0, 0.1, 0.1] as [number, number, number] },
      { p: [-topW / 2 + 0.06, 0, zf] as [number, number, number], s: [0.1, h * 0.94, 0.1] as [number, number, number] },
      { p: [topW / 2 - 0.06, 0, zf] as [number, number, number], s: [0.1, h * 0.94, 0.1] as [number, number, number] },
    ];
  }, []);

  return (
    <group position={[0, CART.basketY + CART.basketH / 2, 0]} rotation={[-0.15, 0, 0.02]}>
      <mesh geometry={geo} material={blue} castShadow receiveShadow />
      {bars.map((b, i) => (
        <mesh key={i} position={b.p} material={lattice} castShadow>
          <boxGeometry args={b.s} />
        </mesh>
      ))}
      {frame.map((b, i) => (
        <mesh key={`f${i}`} position={b.p} material={blue} castShadow>
          <boxGeometry args={b.s} />
        </mesh>
      ))}
      <mesh position={[0, CART.basketH / 2 - 0.14, 0]} material={blueInner}>
        <boxGeometry args={[CART.basketTop.w - 0.28, 0.1, CART.basketTop.d - 0.28]} />
      </mesh>
      <mesh position={[0, CART.basketH / 2 + 0.015, 0]} material={blue} castShadow>
        <boxGeometry args={[CART.basketTop.w + 0.08, 0.1, CART.basketTop.d + 0.08]} />
      </mesh>
      <mesh position={[0, -CART.basketH / 2 + 0.05, 0]} material={blueInner}>
        <boxGeometry args={[CART.basketBottom.w - 0.2, 0.08, CART.basketBottom.d - 0.2]} />
      </mesh>
    </group>
  );
}

/* ---------------------------------------------------------------- handle */

/* Handle styled precisely after the CampusKart Logo Icon:
   Vertical posts rising from the rear rim, bending 90 degrees horizontally
   backwards to form the iconic L-shaped push handlebar gesture. */

function Handle() {
  const { blue, blueDeep } = useKartMaterials();

  // Logo Handle geometry coordinates (in cart space)
  // Basket top rim rear edge is at Y ≈ 2.22, Z ≈ -0.74
  const handleTopY = 2.64;
  const handleRearZ = -1.35;
  const rimRearZ = -0.74;

  const leftX = -1.05;
  const rightX = 1.05;

  return (
    <group>
      {/* Left and Right Vertical Rise Posts (from rim up to elbow height) */}
      <mesh position={[leftX, (2.22 + handleTopY) / 2, rimRearZ]} material={blue} castShadow>
        <cylinderGeometry args={[0.054, 0.058, handleTopY - 2.22, 18]} />
      </mesh>
      <mesh position={[rightX, (2.22 + handleTopY) / 2, rimRearZ]} material={blue} castShadow>
        <cylinderGeometry args={[0.054, 0.058, handleTopY - 2.22, 18]} />
      </mesh>

      {/* Left and Right Horizontal Extensions (from vertical post back to push bar) */}
      <mesh
        position={[leftX, handleTopY, (rimRearZ + handleRearZ) / 2]}
        rotation={[Math.PI / 2, 0, 0]}
        material={blue}
        castShadow
      >
        <cylinderGeometry args={[0.054, 0.054, Math.abs(handleRearZ - rimRearZ), 18]} />
      </mesh>
      <mesh
        position={[rightX, handleTopY, (rimRearZ + handleRearZ) / 2]}
        rotation={[Math.PI / 2, 0, 0]}
        material={blue}
        castShadow
      >
        <cylinderGeometry args={[0.054, 0.054, Math.abs(handleRearZ - rimRearZ), 18]} />
      </mesh>

      {/* Curved 90° Elbow Corner Spheres */}
      <mesh position={[leftX, handleTopY, rimRearZ]} material={blue} castShadow>
        <sphereGeometry args={[0.058, 16, 14]} />
      </mesh>
      <mesh position={[rightX, handleTopY, rimRearZ]} material={blue} castShadow>
        <sphereGeometry args={[0.058, 16, 14]} />
      </mesh>
      <mesh position={[leftX, handleTopY, handleRearZ]} material={blue} castShadow>
        <sphereGeometry args={[0.058, 16, 14]} />
      </mesh>
      <mesh position={[rightX, handleTopY, handleRearZ]} material={blue} castShadow>
        <sphereGeometry args={[0.058, 16, 14]} />
      </mesh>

      {/* Main Transverse Push Handle Bar (matching the logo horizontal bar) */}
      <mesh position={[0, handleTopY, handleRearZ]} rotation={[0, 0, Math.PI / 2]} material={blue} castShadow>
        <cylinderGeometry args={[0.056, 0.056, 2.32, 22]} />
      </mesh>

      {/* Deep Blue Ergonomic Grip Sleeve over the center of the handle bar */}
      <mesh position={[0, handleTopY, handleRearZ]} rotation={[0, 0, Math.PI / 2]} material={blueDeep} castShadow>
        <cylinderGeometry args={[0.072, 0.072, 1.94, 24]} />
      </mesh>

      {/* Rounded Safety End Caps extending outward (matching the logo icon handle tip) */}
      {[-1.18, 1.18].map((x) => (
        <mesh key={`logocap${x}`} position={[x, handleTopY, handleRearZ]} material={blueDeep} castShadow>
          <sphereGeometry args={[0.072, 18, 14]} />
        </mesh>
      ))}

      {/* Cast Rim Mount Clamps */}
      <RoundedBox
        args={[0.22, 0.16, 0.22]}
        radius={0.04}
        smoothness={3}
        position={[leftX, 2.22, rimRearZ]}
        material={blueDeep}
        castShadow
      />
      <RoundedBox
        args={[0.22, 0.16, 0.22]}
        radius={0.04}
        smoothness={3}
        position={[rightX, 2.22, rimRearZ]}
        material={blueDeep}
        castShadow
      />

      {/* Rear Folding Seat Flap / Backplate */}
      <group position={[0, 2.15, -0.78]} rotation={[-0.22, 0, 0]}>
        <RoundedBox args={[1.48, 0.62, 0.04]} radius={0.015} material={blueDeep} castShadow />
      </group>
    </group>
  );
}

/* ---------------------------------------------------------------- wheels */

function Wheel({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const { rubber, hub } = useKartMaterials();
  return (
    <group position={position} scale={scale}>
      <mesh material={rubber} castShadow>
        <torusGeometry args={[0.31, 0.125, 14, 30]} />
      </mesh>
      <mesh material={rubber} castShadow>
        <cylinderGeometry args={[0.29, 0.29, 0.17, 26]} />
      </mesh>
      <mesh material={hub} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.105, 0.105, 0.175, 16]} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} rotation={[0, 0, (i * Math.PI) / 5]} material={hub}>
          <boxGeometry args={[0.46, 0.03, 0.024]} />
        </mesh>
      ))}
    </group>
  );
}

/* ----------------------------------------------------------------- cargo */

function Cargo() {
  const { cargo } = useKartMaterials();
  return (
    <group position={[0.02, CART.basketY + CART.basketH + 0.14, 0]}>
      <mesh position={[-0.62, 0.32, 0.1]} material={cargo.red} castShadow>
        <sphereGeometry args={[0.39, 30, 24]} />
      </mesh>
      <RoundedBox
        args={[0.62, 0.42, 0.54]}
        radius={0.12}
        smoothness={4}
        position={[-0.02, 0.2, 0.38]}
        rotation={[0.12, -0.32, 0.05]}
        material={cargo.orange}
        castShadow
      />
      <RoundedBox
        args={[0.54, 0.54, 0.54]}
        radius={0.1}
        smoothness={4}
        position={[0.74, 0.3, -0.06]}
        rotation={[0.05, 0.24, -0.06]}
        material={cargo.green}
        castShadow
      />
      <mesh position={[0.36, 0.62, 0.16]} material={cargo.blue} castShadow>
        <sphereGeometry args={[0.21, 22, 18]} />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------- pedestal */

/* The plinth's profile, in metres off the plaza. Three lathes carry the whole
   silhouette, so every crease in it is an edge between two surfaces rather than
   a seam between two stacked cylinders — that stack is exactly what read as a
   lampshade. The drum is deliberately dead straight between its two ends: the
   wordmark band rides 5 mm off the shell and can only hug it if the shell has
   no curvature the band does not know about. */
const PED = {
  deck: 1.0675,
  drumBot: { r: 2.302, y: 0.24 },
  /* The drum's wall is the plinth, really: in the reference it is 30% of the
     drum's own diameter and the wordmark sits at two thirds of the way up it.
     Both of those are what make it read as a pedestal holding something up
     rather than a dish something happens to be standing on. */
  drumTop: { r: 2.202, y: 0.885 },
  lip: 2.736,
  label: { y: 0.62, h: 0.46, span: 1.26, lift: 0.005 },
};

/* One number sets the plinth's footprint, and its height is not part of it. The
   reference is a tall drum standing on a tight, steep flare; at the 5.5 m this
   started out as, the plinth read as a wide dish with a toy on top — the cart's
   2.2 m of wheels covered 42% of it against 56% in the reference. Everything
   radial scales together, so the wordmark, the lip and the glow stay in the
   same relationship to the shell they belong to. */
const PLINTH_SCALE = 0.75;
const R = (r: number) => r * PLINTH_SCALE;

const drumR = (y: number) =>
  PLINTH_SCALE *
  (PED.drumBot.r +
    ((y - PED.drumBot.y) / (PED.drumTop.y - PED.drumBot.y)) *
      (PED.drumTop.r - PED.drumBot.r));

/* The collar: a saucer sweeping out from under the drum to a lip thin enough to
   catch light along its whole edge, with the paving visible underneath it. */
const COLLAR: [number, number][] = [
  [2.358, 0.0],
  [2.362, 0.018],
  [2.406, 0.03],
  [2.52, 0.035],
  [2.716, 0.042],
  [PED.lip, 0.062],
  [2.676, 0.12],
  [2.556, 0.174],
  [2.372, 0.211],
  [2.306, 0.214],
];

const DRUM: [number, number][] = [
  [PED.drumBot.r, 0.206],
  [PED.drumBot.r, PED.drumBot.y],
  [PED.drumTop.r, PED.drumTop.y],
  /* Continue past the cap's underside and turn inward to meet it. The drum and
     the cap are two separate lathes and between them sat an 18 mm slot: from
     any camera below the cap's plane that opened straight through to the sky,
     which is the bright hairline across the back of the shell in every
     daylight frame. Closing it here means the joint is geometry — an actual
     surface — instead of a hole that happens to be hard to notice. */
  [PED.drumTop.r - 0.004, 0.9],
  [PED.drumTop.r - 0.1, 0.906],
  [PED.drumTop.r - 0.26, 0.908],
];

/* The cap: a lid that oversails the drum by seven centimetres. The dark line
   under it is geometry — a real overhang the sun cannot reach — rather than a
   painted seam, which is the only kind of line that survives being lit twice. */
const CAP: [number, number][] = [
  [2.14, 0.903],
  [2.238, 0.897],
  [2.292, 0.911],
  [2.296, 1.003],
  [2.262, 1.031],
  [2.198, 1.053],
  [2.12, 1.063],
  [1.3, 1.067],
  [0.0, PED.deck],
];

/* The cap is a separate lathe from the drum and its first point sits inboard of
   the drum's top edge, so on its own it is a lid with a hole under the rim.
   The drum now closes that hole (see DRUM), which is why the underside of the
   cap is never seen through: the two surfaces meet and overlap. */

function lathe(profile: [number, number][], segments = 96) {
  return new THREE.LatheGeometry(
    profile.map(([r, y]) => new THREE.Vector2(R(r), y)),
    segments,
  );
}

function Pedestal({ mode = "dark" }: { mode?: string }) {
  const isLight = mode === "light";
  const { plinth, plinthFace, plinthTop, plinthSeam } = useKartMaterials(mode);
  /* The wordmark is drawn to the aspect of the band it wraps, so the texture has
     to be told what that band is. Get this wrong by a third and the letters are
     stretched sideways on the shell no matter how well the type was drawn. */
  const labelAspect =
    (drumR(PED.label.y) * PED.label.span) / PED.label.h;
  const label = useMemo(() => pedestalLabel(mode, labelAspect), [mode, labelAspect]);
  const topContact = useMemo(() => contactShadow(), []);
  const grounding = useMemo(
    () =>
      isLight
        ? { shadow: baseShadow(), glow: baseGlow(), polish: reflectionMask() }
        : null,
    [isLight],
  );
  const shell = useMemo(
    () => ({ collar: lathe(COLLAR), drum: lathe(DRUM), cap: lathe(CAP) }),
    [],
  );
  const spin = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (spin.current) spin.current.rotation.y += delta * 0.05;
  });

  return (
    <group>
      {/* --------------------------------------------------------- ground ---
          Three decals, painted in order: a polished apron that dissolves the
          paving grid the monument stands on, the contact shadow that seats it,
          and last — so nothing dims it — the blue the lip throws onto stone. */}
      {grounding && (
        <>
          {/* The apron is *polished stone*, so it is smoother and very slightly
              darker than the paving around it, not brighter. Painting it near
              white put a plate of pure light under the plinth, which is what
              was reading as a sunburst on the ground. A real honed slab holds
              a reflection; it does not emit. */}
          <mesh position={[0, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
            <circleGeometry args={[R(4.3), 72]} />
            <meshPhysicalMaterial
              color="#7d8894"
              roughness={0.22}
              metalness={0}
              clearcoat={0.7}
              clearcoatRoughness={0.14}
              envMapIntensity={0.5}
              transparent
              alphaMap={grounding.polish}
              opacity={0.34}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={2}>
            <circleGeometry args={[R(3.5), 64]} />
            <meshBasicMaterial map={grounding.shadow} transparent opacity={0.6} depthWrite={false} />
          </mesh>      {/* the blue puddle: a tight annulus, not a pad. A wide one reads as a
          base the plinth is parked on rather than light it is throwing. In
              daylight it is a faint bounce, not a pool of lamp oil — additive
              over paving that is already near white is how the base of this
              plinth ended up as a blue-white sunburst. */}
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={4}>
            {/* sized off the lip, not eyeballed: the texture is brightest at 0.61
                of its radius, so the disc has to be lip/0.61 wide for that band
                to land on the edge the light is coming from */}
            <circleGeometry args={[R(4.48), 64]} />
            <meshBasicMaterial
              map={grounding.glow}
              transparent
              opacity={0.16}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              fog={false}
            />
          </mesh>
        </>
      )}

      {/* ------------------------------------------------------- the base --- */}
      <mesh geometry={shell.collar} material={plinth} receiveShadow castShadow />

      {/* lit acrylic lip, sitting in the crease where the saucer turns away.
          The references make this a live emitter in both hours: a glowing blue
          rim by day, a hot orange one by night — the bloom pass is what keeps
          it from reading as a painted stripe. */}
      <mesh position={[0, 0.052, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[R(2.726), R(0.013), 10, 128]} />
        <meshStandardMaterial
          color={isLight ? "#2f6fd0" : "#3a1f08"}
          emissive={new THREE.Color(isLight ? "#2f8dff" : "#ff9a4d")}
          emissiveIntensity={isLight ? 1.6 : 2.2}
          roughness={0.34}
          metalness={isLight ? 0.25 : 0}
          toneMapped={false}
        />
      </mesh>

      {/* the light that leaks out of the joint where the drum lands on it */}
      <mesh position={[0, 0.2135, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[R(2.303), R(2.36), 96]} />
        <meshStandardMaterial
          color={isLight ? "#27507f" : "#42260e"}
          emissive={new THREE.Color(isLight ? "#2f8dff" : "#ffb066")}
          emissiveIntensity={isLight ? 0.9 : 1.6}
          roughness={0.36}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* --------------------------------------------------------- drum --- */}
      <mesh geometry={shell.drum} material={plinthFace} receiveShadow castShadow />

      {/* its underside, so the plinth is not hollow to a lens looking up */}
      <mesh position={[0, 0.206, 0]} rotation={[Math.PI / 2, 0, 0]} material={plinthSeam}>
        <circleGeometry args={[R(2.35), 64]} />
      </mesh>

      {/* LED strip tucked into the cap's overhang — the blue sliver the lid
          reads by, and the only light on the shell the sun did not put there. */}
      <mesh position={[0, 0.89, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[R(2.204), R(2.292), 96]} />
        <meshStandardMaterial
          color={isLight ? "#22405f" : "#42260e"}
          emissive={new THREE.Color(isLight ? "#2f8dff" : "#ffb066")}
          emissiveIntensity={isLight ? 0.7 : 1.5}
          roughness={0.4}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ---------------------------------------------------------- cap --- */}
      <mesh geometry={shell.cap} material={plinthTop} castShadow receiveShadow />

      {isLight && (
        <mesh position={[0.08, 1.069, 0.08]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={3}>
          <planeGeometry args={[3.82, 2.35]} />
          <meshBasicMaterial map={topContact} transparent opacity={0.15} depthWrite={false} />
        </mesh>
      )}

      {/* service ring: a slow sweep of light across the paving at the base —
          live at night, a faint blue glow-puddle by day */}
      <group ref={spin} position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh>
          <ringGeometry args={[R(2.84), R(3.04), 96, 1, 0, Math.PI * 1.3]} />
          <meshStandardMaterial
            color="#061428"
            emissive={new THREE.Color("#2f8dff")}
            emissiveIntensity={isLight ? 0.35 : 1.2}
            toneMapped={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* dimensional CAMPUSKART 3D lettering wrapped on drum.
          The band is solved off the drum's own taper so it rides 5 mm proud of
          the shell at every height. The version before this one sat up to
          10 cm off it at the top of the band: the letters read as a grey shelf
          floating in front of the plinth, and no material could have saved the
          type while the surface it was printed on was in the wrong place. */}
      <mesh position={[0, PED.label.y, 0]}>
        <cylinderGeometry
          args={[
            drumR(PED.label.y + PED.label.h / 2) + PED.label.lift,
            drumR(PED.label.y - PED.label.h / 2) + PED.label.lift,
            PED.label.h,
            128,
            1,
            true,
            -PED.label.span / 2,
            PED.label.span,
          ]}
        />
        <meshStandardMaterial
          map={label}
          transparent
          alphaTest={0.02}
          side={THREE.DoubleSide}
          metalness={isLight ? 0.05 : 0.15}
          roughness={isLight ? 0.3 : 0.34}
          envMapIntensity={isLight ? 0.35 : 0.8}
          polygonOffset
          polygonOffsetFactor={-3}
          /* The lettering is the one surface that has to agree with the exposure
             around it. Skipping tone mapping here left the letters sitting in a
             different response curve from the shell they are cut into, so they
             read as a decal laid over the plinth rather than type standing
             proud of it. */
          toneMapped
        />
      </mesh>

      {/* Pedestal lights. The sun is forty metres away, so on its own it models
          the plinth like a wall: every surface it reaches is lit at nearly the
          same angle and the drum ends up with no highlight to bend around.
          Daylight gets a close warm key at the front-left for the glossy
          streak, and a cool rim on the right so the shade side stays blue.

          These are shaping lights, not a second sun. At 26 candela four metres
          from a white drum this was delivering more illuminance than the key,
          which is why the drum had no shade side to shape with — it was simply
          past the top of the range everywhere. A third of that gives the same
          modelling with headroom left for the highlight to land in. */}
      <pointLight
        position={isLight ? [-3.6, 3.9, 5.2] : [0, 0.2, 1.8]}
        color={isLight ? "#fff5e8" : "#38bdf8"}
        intensity={isLight ? 7.5 : 4}
        distance={isLight ? 17 : 7}
        decay={2}
      />
      <pointLight
        position={isLight ? [5.4, 2.6, 1.6] : [3.2, 1.5, 3.2]}
        color={isLight ? "#8fc4ff" : "#ffc78c"}
        intensity={isLight ? 1.6 : 10}
        distance={isLight ? 14 : 15}
        decay={2}
      />
      {!isLight && (
        <>
          <pointLight color="#9fc6ff" intensity={8} distance={15} decay={2} position={[-3.5, 1.2, 2.8]} />
        </>
      )}
      {/* A tight highlight is the whole difference between glossy acrylic and
          white paint, and it has to come off a small source close to the drum so
          it stays a streak instead of spreading into the drum's own shading. */}
      {isLight && (
        <pointLight position={[-1.9, 1.5, 4.1]} color="#ffffff" intensity={3.4} distance={11} decay={2} />
      )}
      <PedestalGlow mode={mode} />

      {/* Contact shadows. Daylight seats the plinth on its own decals, so the
          airbrushed gradients only have to soften the edges of that stack. */}
      <ContactShadow opacity={isLight ? 0.5 : 0.8} size={R(isLight ? 6.6 : 11.5)} />
      {isLight && <ContactShadow opacity={0.22} size={R(12)} />}
    </group>
  );
}

function PedestalGlow({ mode = "dark" }: { mode?: string }) {
  const isLight = mode === "light";
  const warm = useMemo(() => glowSprite(isLight ? "56,189,248" : "255,186,120"), [isLight]);
  return (
    <group>
      {/* Daylight builds its glow out of lit surfaces — the lip, the floor, the
          sky in the clearcoat — so the airbrush has to get out of the way: at
          even 8% this sprite is a cyan haze sitting on top of the wordmark, and
          over near-white paving it reads as lens flare rather than light. */}
      <sprite position={[0, 1.05, 0.15]} scale={[8.4, 3.2, 1]} renderOrder={5}>
        <spriteMaterial
          map={warm}
          transparent
          opacity={isLight ? 0.008 : 0.12}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          fog={false}
        />
      </sprite>
      <sprite position={[0, 0.05, 0]} scale={[R(10.6), 3.5, 1]} renderOrder={4}>
        <spriteMaterial
          map={warm}
          color={isLight ? "#4f86c4" : "#5ea8ff"}
          transparent
          opacity={isLight ? 0.022 : 0.09}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          fog={false}
        />
      </sprite>
    </group>
  );
}

function ContactShadow({ opacity = 0.8, size = 11.5 }: { opacity?: number; size?: number }) {
  const texture = useMemo(() => contactShadow(), []);
  return (
    <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={2}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial map={texture} transparent opacity={opacity} depthWrite={false} />
    </mesh>
  );
}

/* ------------------------------------------------------------- assembly */

export default function Monument({
  accent,
  tier,
  reduced = false,
  mode = "dark",
}: {
  accent: Accent;
  tier: Tier;
  reduced?: boolean;
  mode?: string;
}) {
  const isLight = mode === "light";
  const { blueDeep } = useKartMaterials(mode);
  const group = useRef<THREE.Group>(null);
  const started = useRef<number | null>(null);
  const accentLight = useRef<THREE.PointLight>(null);
  const rimLight = useRef<THREE.PointLight>(null);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (started.current === null) started.current = t;

    if (group.current) {
      const local = t - started.current;
      const rise = reduced ? 1 : EASE_OUT(Math.min(1, Math.max(0, (local - 0.3) / 0.75)));
      const settle = reduced
        ? 0
        : Math.sin(Math.min(1, Math.max(0, (local - 0.9) / 0.9)) * Math.PI) * 0.018;
      /* One pedestal height for both themes: the mark lands on the same deck it
         stands on at night. (Light mode used to ride 5 cm higher to compensate
         for a stretched pedestal, which is exactly the gap that read as the
         sculpture hovering over its plinth.) */
      group.current.position.y = DECK_Y - (1 - rise) * 0.85 - settle;

      const idleYaw = reduced ? 0 : Math.sin(t * 0.17) * 0.02;
      const leanX = reduced ? 0 : -pointer.y * 0.035;
      const leanZ = reduced ? 0 : pointer.x * 0.04;
      /* The mark now rides on a pedestal that belongs to the ground, so it is
         allowed a millimetre of lean and nothing more: a floating showpiece
         sways, a plinth holding a sculpture does not. */
      const sway = reduced ? 1 : isLight ? 0.35 : 1;
      group.current.rotation.y = idleYaw + (reduced ? 0 : pointer.x * 0.06) * sway;
      group.current.rotation.z = leanZ * 0.4 * sway;
      group.current.rotation.x = leanX * 0.4 * sway;
    }

    if (accentLight.current) {
      /* Pure service-orange on the blue basket mixes to magenta, so the front
         accent rides a blend of the accent and the brand blue — the violet
         gradient the references show on the basket face. */
      accentLight.current.color.lerp(
        new THREE.Color(accent.color).lerp(new THREE.Color("#5aa2ff"), 0.5),
        Math.min(1, delta * 1.6),
      );
    }
    if (rimLight.current) {
      rimLight.current.color.lerp(
        new THREE.Color(accent.color).lerp(new THREE.Color("#5aa2ff"), 0.45),
        Math.min(1, delta * 1.6),
      );
    }
  });

  return (
    <group>
      <pointLight ref={accentLight} position={[-3.5, 3.6, 3.2]} color={accent.color} intensity={8} distance={16} decay={2} />
      <pointLight ref={rimLight} position={[3.8, 2.6, -3.2]} color={accent.color} intensity={9} distance={17} decay={2} />

      <Pedestal mode={mode} />

      <group ref={group} position={[0, DECK_Y, 0]}>
        <group rotation={[0.03, -0.5, -0.055]} scale={tier === "low" ? 1.0 : 1.05}>
          <Basket mode={mode} />
          <Handle />
          <Wheel position={[-0.82, 0.36, 0.72]} />
          <Wheel position={[-0.82, 0.36, -0.72]} />
          <Wheel position={[0.88, 0.36, 0.7]} scale={0.92} />
          <Wheel position={[0.88, 0.36, -0.7]} scale={0.92} />

          {/* Cast Chassis */}
          <mesh position={[0, 0.66, 0]} material={blueDeep} castShadow>
            <boxGeometry args={[1.72, 0.13, 0.16]} />
          </mesh>
          {[0.7, -0.7].map((z) => (
            <mesh key={z} position={[0, 0.66, z]} material={blueDeep} castShadow>
              <boxGeometry args={[1.76, 0.12, 0.13]} />
            </mesh>
          ))}
          {[0.82, -0.82].map((z) => (
            <mesh key={`c${z}`} position={[0, 0.66, z]} material={blueDeep} castShadow>
              <boxGeometry args={[0.13, 0.12, 1.52]} />
            </mesh>
          ))}
          {/* Chassis-to-basket legs */}
          {[-0.78, 0.88].map((x) =>
            [0.6, -0.6].map((z) => (
              <mesh key={`${x}${z}`} position={[x, 0.82, z]} material={blueDeep} castShadow>
                <cylinderGeometry args={[0.06, 0.07, 0.32, 10]} />
              </mesh>
            )),
          )}
          {/* Axles */}
          {[0.7, -0.7].map((z) => (
            <mesh key={z} position={[0, 0.36, z]} material={blueDeep} castShadow>
              <boxGeometry args={[1.76, 0.07, 0.07]} />
            </mesh>
          ))}
          <Cargo />
        </group>
      </group>
    </group>
  );
}
