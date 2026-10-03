"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { baseShadow, contactShadow, glowSprite, pedestalLabel, pedestalSkin } from "./procedural";
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
const DECK_Y = 0.95;

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
    /* Brand paint: saturated electric blue that survives a cool sky reflection. */
    const blue = new THREE.MeshPhysicalMaterial({
      color: isLight ? "#0755df" : "#0b49d8",
      metalness: 0.06,
      roughness: 0.34,
      clearcoat: 0.35,
      clearcoatRoughness: 0.42,
      envMapIntensity: 0.5,
    });
    const blueDeep = new THREE.MeshPhysicalMaterial({
      color: isLight ? "#093ea7" : "#0a3690",
      metalness: 0.15,
      roughness: 0.38,
      clearcoat: 0.3,
      clearcoatRoughness: 0.42,
      envMapIntensity: 0.45,
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
      roughness: 0.36,
      clearcoat: 0.3,
      clearcoatRoughness: 0.4,
      envMapIntensity: 0.5,
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
    /* Daylight pedestal. Painted stone, not paper: the plinth is a shade below
       the plaza photo so its foot has an edge, the drum carries the shell
       texture, and the cap is near-white and polished so the sky throws a
    /* Daylight pedestal. Painted satin metallic stone & aluminum: plinth drum has sleek metallic specular,
       and cap is bright white polished metallic so the sun throws clear highlights. */
    const plinth = new THREE.MeshPhysicalMaterial({
      color: isLight ? "#dbeafe" : "#141821",
      roughness: isLight ? 0.22 : 0.28,
      metalness: isLight ? 0.38 : 0.75,
      clearcoat: isLight ? 0.5 : 0,
      clearcoatRoughness: 0.15,
      envMapIntensity: isLight ? 0.85 : 1.1,
    });
    const plinthFace = new THREE.MeshPhysicalMaterial({
      color: isLight ? "#f8fafc" : "#14181f",
      map: skin,
      roughness: isLight ? 0.16 : 0.22,
      metalness: isLight ? 0.35 : 0.7,
      clearcoat: isLight ? 0.85 : 0.9,
      clearcoatRoughness: isLight ? 0.12 : 0.15,
      envMapIntensity: isLight ? 0.95 : 0.9,
    });
    const plinthTop = new THREE.MeshPhysicalMaterial({
      color: isLight ? "#ffffff" : "#2a3346",
      roughness: isLight ? 0.08 : 0.16,
      metalness: isLight ? 0.45 : 0.8,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
      envMapIntensity: isLight ? 1.3 : 1.3,
    });
    /* Machined seam */
    const plinthSeam = new THREE.MeshStandardMaterial({
      color: isLight ? "#94a3b8" : "#33240f",
      roughness: isLight ? 0.18 : 0.34,
      metalness: isLight ? 0.8 : 0.86,
      envMapIntensity: isLight ? 1.1 : 1.05,
    });
    const plinthGlow = new THREE.MeshStandardMaterial({
      color: isLight ? "#38bdf8" : "#42260e",
      emissive: new THREE.Color(isLight ? "#2563eb" : "#ffb066"),
      emissiveIntensity: isLight ? 1.3 : 0.9,
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

function Pedestal({ mode = "dark" }: { mode?: string }) {
  const isLight = mode === "light";
  const { plinth, plinthFace, plinthTop, plinthSeam, plinthGlow } = useKartMaterials(mode);
  const label = useMemo(() => pedestalLabel(mode), [mode]);
  const topContact = useMemo(() => contactShadow(), []);
  const base = useMemo(() => (isLight ? baseShadow() : null), [isLight]);
  const spin = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (spin.current) spin.current.rotation.y += delta * 0.05;
  });

  return (
    <group>
      {isLight && base && (
        <mesh position={[0, 0.014, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
          <circleGeometry args={[3.5, 64]} />
          <meshBasicMaterial map={base} transparent opacity={0.52} depthWrite={false} />
        </mesh>
      )}

      {/* ground plinth base */}
      <mesh position={[0, 0.09, 0]} material={plinth} receiveShadow castShadow>
        <cylinderGeometry args={[2.32, 2.42, 0.18, 72]} />
      </mesh>

      {/* machined foot: oversailing lip */}
      <mesh position={[0, 0.033, 0]} material={plinthSeam} receiveShadow castShadow>
        <cylinderGeometry args={[2.41, 2.47, 0.066, 72]} />
      </mesh>

      {/* illuminated neon blue translucent acrylic base rim (matching reference image 2) */}
      <mesh position={[0, 0.024, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[2.46, 2.54, 0.045, 72]} />
        <meshStandardMaterial
          color={isLight ? "#38bdf8" : "#061836"}
          emissive={new THREE.Color(isLight ? "#2563eb" : "#2f8dff")}
          emissiveIntensity={isLight ? 1.4 : 0.8}
          toneMapped={false}
        />
      </mesh>

      {/* ground glowing blue halo ring */}
      <mesh position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={isLight ? [2.44, 2.75, 72] : [2.42, 2.62, 72]} />
        <meshStandardMaterial
          color={isLight ? "#38bdf8" : "#04122b"}
          emissive={new THREE.Color(isLight ? "#2563eb" : "#2f8dff")}
          emissiveIntensity={isLight ? 1.5 : 0.8}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* left side metallic step block accent (matching reference image 2) */}
      <mesh position={[-2.32, 0.036, 0.42]} rotation={[0, 0.32, 0]} material={plinthTop} receiveShadow castShadow>
        <boxGeometry args={[0.65, 0.045, 0.28]} />
      </mesh>

      <mesh position={[0, 0.185, 0]} material={plinth} receiveShadow castShadow>
        <cylinderGeometry args={[2.25, 2.33, 0.06, 72]} />
      </mesh>

      {/* drum */}
      <mesh position={[0, 0.44, 0]} material={plinthFace} receiveShadow castShadow>
        <cylinderGeometry args={[2.2, 2.3, 0.52, 72]} />
      </mesh>

      {/* reveal glow between plinth and shell */}
      {isLight && (
        <mesh position={[0, 0.196, 0]} rotation={[-Math.PI / 2, 0, 0]} material={plinthGlow}>
          <ringGeometry args={[2.28, 2.37, 72]} />
        </mesh>
      )}

      {/* upper seam LED light strip under cap */}
      <mesh position={[0, 0.696, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.2, 2.25, 72]} />
        <meshStandardMaterial
          color={isLight ? "#ffffff" : "#42260e"}
          emissive={new THREE.Color(isLight ? "#ffffff" : "#ffb066")}
          emissiveIntensity={isLight ? 1.0 : 0.9}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* top cap flared overhang */}
      <mesh position={[0, 0.78, 0]} material={plinthTop} castShadow receiveShadow>
        <cylinderGeometry args={[2.12, 2.22, 0.2, 72]} />
      </mesh>
      <mesh position={[0, 0.9, 0]} material={plinthTop}>
        <cylinderGeometry args={[2.1, 2.1, 0.05, 72]} />
      </mesh>

      {isLight && (
        <mesh position={[0.08, 0.928, 0.08]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={3}>
          <planeGeometry args={[3.82, 2.35]} />
          <meshBasicMaterial map={topContact} transparent opacity={0.15} depthWrite={false} />
        </mesh>
      )}

      {/* service ring */}
      {!isLight && (
        <group ref={spin} position={[0, 0.19, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <mesh>
            <ringGeometry args={[2.34, 2.42, 72, 1, 0, Math.PI * 1.3]} />
            <meshStandardMaterial
              color="#061428"
              emissive={new THREE.Color("#2f8dff")}
              emissiveIntensity={0.75}
              toneMapped={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )}

      {/* dimensional CAMPUSKART 3D lettering wrapped on drum */}
      <mesh position={[0, 0.44, 0]}>
        <cylinderGeometry args={[2.305, 2.315, 0.44, 96, 1, true, -0.52, 1.04]} />
        <meshStandardMaterial
          map={label}
          transparent
          alphaTest={0.02}
          side={THREE.DoubleSide}
          metalness={isLight ? 0.35 : 0.15}
          roughness={isLight ? 0.18 : 0.34}
          polygonOffset
          polygonOffsetFactor={-3}
          toneMapped={false}
        />
      </mesh>

      {/* Pedestal Lights & Glow */}
      <pointLight position={[0, 0.2, 1.8]} color="#38bdf8" intensity={isLight ? 3.0 : 4} distance={7} decay={2} />
      <pointLight position={[0, 0.75, 1.4]} color="#ffffff" intensity={isLight ? 2.2 : 0} distance={5} decay={2} />
      {!isLight && (
        <>
          <pointLight color="#ffc78c" intensity={10} distance={15} decay={2} position={[3.2, 1.5, 3.2]} />
          <pointLight color="#9fc6ff" intensity={8} distance={15} decay={2} position={[-3.5, 1.2, 2.8]} />
        </>
      )}
      <PedestalGlow mode={mode} />

      {/* Contact shadows */}
      <ContactShadow opacity={isLight ? 0.62 : 0.8} size={isLight ? 6.6 : 11.5} />
      {isLight && <ContactShadow opacity={0.3} size={12} />}
    </group>
  );
}

function PedestalGlow({ mode = "dark" }: { mode?: string }) {
  const isLight = mode === "light";
  const warm = useMemo(() => glowSprite(isLight ? "56,189,248" : "255,186,120"), [isLight]);
  return (
    <group>
      <sprite position={[0, 1.05, 0.15]} scale={[8.4, 3.2, 1]} renderOrder={5}>
        <spriteMaterial
          map={warm}
          transparent
          opacity={isLight ? 0.08 : 0.12}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          fog={false}
        />
      </sprite>
      <sprite position={[0, 0.05, 0]} scale={[14.2, 5.0, 1]} renderOrder={4}>
        <spriteMaterial
          map={warm}
          color={isLight ? "#38bdf8" : "#5ea8ff"}
          transparent
          opacity={isLight ? 0.15 : 0.09}
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
      accentLight.current.color.lerp(new THREE.Color(accent.color), Math.min(1, delta * 1.6));
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
      <pointLight ref={accentLight} position={[-3.5, 3.6, 3.2]} color={accent.color} intensity={12} distance={16} decay={2} />
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
