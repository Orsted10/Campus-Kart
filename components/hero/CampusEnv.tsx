"use client";

import { useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshReflectorMaterial, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { cloudSprite, facadeTextures, foliageSprite, glowSprite, textPanel } from "./procedural";
import { pointer } from "./heroState";

/* --------------------------------------------------------------------------
   CAMPUS ENVIRONMENT
   Chandigarh University, Unnao at blue hour: plaza, staircase terraces, the
   academic block with lit windows, landscaping, lamps, and a sunset sky the
   sculpture actually reflects. Everything shares one scene so the lighting is
   literally the same light on the monument and the architecture.
--------------------------------------------------------------------------- */

export type Tier = "high" | "low";

/* ------------------------------------------------------------- materials */

function useCampusMaterials() {
  return useMemo(() => {
    const concrete = new THREE.MeshStandardMaterial({
      color: "#2b3141",
      roughness: 0.86,
      metalness: 0.06,
    });
    const concreteDark = new THREE.MeshStandardMaterial({
      color: "#1c2130",
      roughness: 0.92,
      metalness: 0.05,
    });
    const stone = new THREE.MeshStandardMaterial({
      color: "#454d5f",
      roughness: 0.58,
      metalness: 0.14,
    });
    const metal = new THREE.MeshStandardMaterial({
      color: "#12161f",
      roughness: 0.42,
      metalness: 0.85,
    });
    const foliage = new THREE.MeshStandardMaterial({
      color: "#1d3a28",
      roughness: 0.95,
      metalness: 0,
      flatShading: true,
      emissive: new THREE.Color("#0a1710"),
      emissiveIntensity: 0.9,
    });
    const hedge = new THREE.MeshStandardMaterial({
      color: "#16291d",
      roughness: 0.98,
      metalness: 0,
      flatShading: true,
      emissive: new THREE.Color("#08130c"),
      emissiveIntensity: 0.8,
    });
    const warmStrip = new THREE.MeshStandardMaterial({
      color: "#40260f",
      emissive: new THREE.Color("#ffae63"),
      emissiveIntensity: 2.6,
      roughness: 0.4,
      metalness: 0.2,
      toneMapped: false,
    });
    const lampGlass = new THREE.MeshStandardMaterial({
      color: "#2a1c0d",
      emissive: new THREE.Color("#ffc98a"),
      emissiveIntensity: 3.4,
      toneMapped: false,
    });
    const glass = new THREE.MeshStandardMaterial({
      color: "#0a1220",
      roughness: 0.14,
      metalness: 0.4,
      emissive: new THREE.Color("#3d5f96"),
      emissiveIntensity: 0.28,
      transparent: true,
      opacity: 0.86,
    });
    const carBody = new THREE.MeshPhysicalMaterial({
      color: "#0f1524",
      roughness: 0.28,
      metalness: 0.7,
      clearcoat: 1,
      clearcoatRoughness: 0.15,
    });
    const tyre = new THREE.MeshStandardMaterial({ color: "#0a0a0c", roughness: 0.9 });
    return {
      concrete,
      concreteDark,
      stone,
      metal,
      foliage,
      hedge,
      warmStrip,
      lampGlass,
      glass,
      carBody,
      tyre,
    };
  }, []);
}

/* ------------------------------------------------------------------ sky */

function Sky() {
  const uniforms = useMemo(
    () => ({
      uTop: { value: new THREE.Color("#04081a") },
      uMid: { value: new THREE.Color("#101c46") },
      uHorizon: { value: new THREE.Color("#ff8f3d") },
      uGlow: { value: new THREE.Color("#ffdcac") },
      uSun: { value: new THREE.Vector3(0.33, 0.06, -0.94) },
    }),
    [],
  );

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms,
        vertexShader: /* glsl */ `
          varying vec3 vDir;
          void main() {
            vDir = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec3 vDir;
          uniform vec3 uTop;
          uniform vec3 uMid;
          uniform vec3 uHorizon;
          uniform vec3 uGlow;
          uniform vec3 uSun;
          void main() {
            vec3 d = normalize(vDir);
            float h = d.y;
            vec3 dir = normalize(uSun);

            // The camera sits low, so nearly all of the visible sky is the first
            // 15 degrees above the horizon. The afterglow has to live in that
            // band, otherwise the hero sky reads as a flat navy card.
            vec3 col = mix(uHorizon, uMid, smoothstep(0.0, 0.115, h));
            col = mix(col, uTop, smoothstep(0.11, 0.44, h));

            float sun = max(dot(d, dir), 0.0);
            col += uGlow * pow(sun, 150.0) * 3.0;
            col += uGlow * pow(sun, 9.0) * 0.3;

            // rose layer just above the hot band — sunset, not a colour stripe
            float band = pow(max(1.0 - abs(h - 0.075) * 11.0, 0.0), 2.0);
            col += vec3(0.36, 0.11, 0.15) * band * (0.2 + 0.8 * sun);

            // horizon light pools on the sun's side of the sky — strongly biased
            // to the sun so the far horizon stays cold instead of going pink
            float low = pow(max(1.0 - abs(h - 0.03) * 9.0, 0.0), 2.4);
            col += vec3(0.85, 0.36, 0.12) * low * pow(sun, 0.5) * 1.45;

            // ground haze below the horizon line
            col = mix(col, vec3(0.024, 0.031, 0.055), smoothstep(0.0, -0.2, h));

            gl_FragColor = vec4(col, 1.0);
          }
        `,
      }),
    [uniforms],
  );

  return (
    <mesh material={material} scale={[-1, 1, 1]} frustumCulled={false} renderOrder={-10}>
      <sphereGeometry args={[420, 40, 24]} />
    </mesh>
  );
}

/* ---------------------------------------------------------------- clouds */

function CloudBank({ tier }: { tier: Tier }) {
  const sprites = useMemo(() => {
    /* Cloud at blue hour is a DARK mass with a warm rim, not a glowing blob.
       Additive sprites here were blanketing the whole sky in lavender and were
       the single biggest reason the hero read as CGI. */
    const list: { pos: [number, number, number]; scale: number; opacity: number; tint: string }[] = [];
    const seedBase = [1, 2, 3, 4, 5, 6];
    seedBase.forEach((s, i) => {
      const t = i / (seedBase.length - 1);
      list.push({
        pos: [-190 + t * 430, 26 + (i % 3) * 14, -175 - (i % 2) * 70],
        scale: 200 + (i % 4) * 70,
        opacity: 0.3 - (i % 3) * 0.06,
        tint: i % 2 === 0 ? "#3a3550" : "#2e2c48",
      });
    });
    return list;
  }, []);

  const texture = useMemo(() => cloudSprite(5), []);
  const rim = useMemo(() => cloudSprite(5), []);
  if (tier === "low") return null;

  return (
    <group renderOrder={-9}>
      {sprites.map((s, i) => (
        <sprite key={i} position={s.pos} scale={[s.scale, s.scale * 0.24, 1]}>
          <spriteMaterial
            map={texture}
            color={s.tint}
            transparent
            opacity={s.opacity}
            depthWrite={false}
            fog={false}
          />
        </sprite>
      ))}
      {/* a warm edge on the sunward side, low and thin, so the deck has structure */}
      {[0, 1, 2].map((i) => (
        <sprite
          key={`r${i}`}
          position={[60 + i * 74, 20 + i * 6, -168 - i * 26]}
          scale={[150 + i * 26, 24 + i * 4, 1]}
        >
          <spriteMaterial
            map={rim}
            color="#ffb377"
            transparent
            opacity={0.26 - i * 0.05}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            fog={false}
          />
        </sprite>
      ))}
    </group>
  );
}

function SunGlow() {
  const texture = useMemo(() => glowSprite("255,205,150"), []);
  /* A sunset core, not a sky-wide gradient. At 250 units across this sprite
     spanned ~40 degrees and, once bloomed, washed the entire sky to pale grey. */
  return (
    <group renderOrder={-8}>
      <sprite position={[104, 9, -300]} scale={[104, 86, 1]}>
        <spriteMaterial
          map={texture}
          transparent
          opacity={0.66}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          fog={false}
        />
      </sprite>
      <sprite position={[92, 4, -290]} scale={[34, 30, 1]}>
        <spriteMaterial
          map={texture}
          color="#fff0d2"
          transparent
          opacity={0.5}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          fog={false}
        />
      </sprite>
    </group>
  );
}

/* ----------------------------------------------------------- architecture */

function Block({
  position,
  size,
  seed,
  wall,
  lit = 0.24,
  warm = 0.85,
  cols = 26,
  rows = 13,
  sign,
}: {
  position: [number, number, number];
  size: [number, number, number];
  seed: number;
  wall: string;
  lit?: number;
  warm?: number;
  cols?: number;
  rows?: number;
  sign?: ReactNode;
}) {
  const tex = useMemo(
    () => facadeTextures({ seed, wall, lit, warm, cols, rows }),
    [seed, wall, lit, warm, cols, rows],
  );
  const face = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: tex.map,
        emissiveMap: tex.emissive,
        emissive: new THREE.Color("#ffffff"),
        emissiveIntensity: 1.55,
        roughness: 0.82,
        metalness: 0.08,
      }),
    [tex],
  );
  const side = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#232a38",
        roughness: 0.9,
        metalness: 0.06,
      }),
    [],
  );
  const roof = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#11151f", roughness: 0.95 }),
    [],
  );

  return (
    <group position={position}>        <mesh material={[side, side, roof, roof, face, face]} castShadow receiveShadow>
        <boxGeometry args={size} />
      </mesh>
      {sign}
    </group>
  );
}

function AcademicBlock() {
  const { concrete, concreteDark } = useCampusMaterials();
  const signTexture = useMemo(
    () =>
      textPanel({
        width: 1024,
        height: 320,
        lines: [
          { text: "CHANDIGARH UNIVERSITY", color: "rgba(226,233,242,0.86)", size: 84, spacing: 5 },
          { text: "UNNAO, UP", color: "rgba(178,190,206,0.7)", size: 54, spacing: 8 },
        ],
      }),
    [],
  );

  return (
    <group>
      {/* main academic mass, right and far behind the monument — it has to
          leave sky above it for the sunset to read */}
      <Block
        position={[27, 7.4, -72]}
        size={[28, 14.5, 22]}
        seed={11}
        wall="#323344"
        lit={0.42}
        warm={0.94}
        cols={18}
        rows={9}
        sign={
          <mesh position={[0, 3.2, 11.05]}>
            <planeGeometry args={[13.5, 4.2]} />
            <meshBasicMaterial
              map={signTexture}
              transparent
              toneMapped={false}
              opacity={0.85}
              color="#b9c6d8"
            />
          </mesh>
        }
      />
      {/* podium terraces lifting the block out of the ground plane */}
      <mesh position={[24, 1.6, -60]} material={concrete} receiveShadow castShadow>
        <boxGeometry args={[32, 3.2, 22]} />
      </mesh>
      <mesh position={[20, 3.6, -52]} material={concreteDark} receiveShadow>
        <boxGeometry args={[22, 1.4, 10]} />
      </mesh>
      {/* left academic wing, framing the sky on the other side */}      <Block position={[-30, 6.6, -78]} size={[30, 13, 20]}
        seed={23}
        wall="#2d2f40"
        lit={0.36}
        warm={0.92}
        cols={18}
        rows={9}
      />
      {/* far mid-rises: atmospheric depth, not detail */}
      <Block position={[-4, 8, -112]} size={[26, 16, 18]} seed={31} wall="#2b2e3d" lit={0.32} warm={0.82} cols={16} rows={11} />
      <Block position={[62, 6.4, -104]} size={[28, 13, 18]} seed={47} wall="#282b39" lit={0.3} warm={0.82} cols={17} rows={9} />
      <MidGround />
      {/* gateway colonnade at the plaza edge */}
      <Colonnade />
    </group>
  );
}

function Colonnade() {
  const { stone, glass, warmStrip } = useCampusMaterials();
  const pillars = [-11, -8, -5, -2, 1, 4];
  return (
    <group position={[9.5, 0, -20]} scale={0.86}>
      <mesh position={[0, 2.55, 0]} material={stone} castShadow receiveShadow>
        <boxGeometry args={[17, 0.65, 4]} />
      </mesh>
      {pillars.map((x, i) => (
        <mesh key={i} position={[x, 1.3, 1.6]} material={stone} castShadow receiveShadow>
          <cylinderGeometry args={[0.2, 0.24, 2.6, 12]} />
        </mesh>
      ))}
      {/* warm wash on the deck so the arcade does not read as a void */}
      <mesh position={[0, 0.16, 2.4]} material={warmStrip}>
        <boxGeometry args={[13, 0.05, 0.12]} />
      </mesh>
      {/* the lit rooms behind the arcade read as depth, not a wall */}
      <mesh position={[0, 1.5, -0.4]} material={glass}>
        <boxGeometry args={[16, 2.8, 0.4]} />
      </mesh>
      <mesh position={[0, 0.32, 1.5]} material={warmStrip}>
        <boxGeometry args={[15.4, 0.06, 0.14]} />
      </mesh>
    </group>
  );
}

/* --------------------------------------------------------------- stairs */

function Stairs() {
  const { stone, concreteDark, warmStrip } = useCampusMaterials();
  const steps = [0, 1, 2, 3, 4, 5, 6, 7];
  return (
    <group position={[7.4, 0, -2.2]}>
      {steps.map((i) => (
        <group key={i}>
          <mesh
            position={[0, i * 0.34 + 0.17, -i * 1.7]}
            material={i % 2 === 0 ? stone : concreteDark}
            receiveShadow
            castShadow
          >
            <boxGeometry args={[13 - i * 0.5, 0.34, 1.7]} />
          </mesh>
          {/* warm riser glow — the detail that makes the terrace feel inhabited */}
          <mesh position={[2.4, i * 0.34 + 0.05, -i * 1.7 + 0.88]} material={warmStrip}>
            <boxGeometry args={[8.6 - i * 0.5, 0.045, 0.07]} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 2.9, -13]} material={stone} receiveShadow>
        <boxGeometry args={[15, 0.5, 4]} />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------- plaza & lights */

function Plaza({ tier }: { tier: Tier }) {
  const { warmStrip } = useCampusMaterials();
  const random = useMemo(() => {
    const rand = (s: number) => {
      let a = s;
      return () => {
        a = (a * 16807) % 2147483647;
        return a / 2147483647;
      };
    };
    const r = rand(9);
    return Array.from({ length: tier === "high" ? 34 : 16 }, () => ({
      x: (r() - 0.5) * 46,
      z: 6 - r() * 26,
      rx: (r() - 0.5) * 0.5,
      ry: (r() - 0.5) * 0.5,
      s: 0.5 + r() * 1.1,
    }));
  }, [tier]);

  return (
    <group>
      {/* wet stone plaza — reflects the monument, the lamps and the sky */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -8]} receiveShadow>
        <planeGeometry args={[220, 150]} />
        {tier === "high" ? (
          <MeshReflectorMaterial
            resolution={1024}
            blur={[260, 80]}
            mixBlur={1.15}
            mixStrength={3.1}
            depthScale={1.1}
            minDepthThreshold={0.3}
            maxDepthThreshold={1.4}
            depthToBlurRatioBias={0.3}
            color="#141b2b"
            metalness={0.78}
            roughness={0.42}
          />
        ) : (
          <meshStandardMaterial color="#131a28" metalness={0.55} roughness={0.5} />
        )}
      </mesh>

      {/* paving joints: quiet emissive inlays that draw the eye inward */}
      {[
        [0, 4.6, 26],
        [-5.5, -3.5, 14],
        [5.5, -8.5, 14],
        [0, -13.4, 20],
      ].map(([x, z, w], i) => (
        <mesh key={i} position={[x, 0.012, z]} material={warmStrip} scale={[1, 1, 1]}>
          <boxGeometry args={[w, 0.02, 0.05]} />
        </mesh>
      ))}

      {/* landscaping stones so the plaza is not a bare plane */}
      {random.map((s, i) => (
        <RoundedBox
          key={i}
          args={[s.s, 0.12, s.s * 0.7]}
          radius={0.03}
          smoothness={2}
          position={[s.x, 0.06, s.z]}
          rotation={[0, s.ry * 2, 0]}
          receiveShadow
        >
          <meshStandardMaterial color="#161b28" roughness={0.5} metalness={0.25} />
        </RoundedBox>
      ))}
    </group>
  );
}

function Lamp({ position, tier, lit = true }: { position: [number, number, number]; tier: Tier; lit?: boolean }) {
  const { metal, lampGlass } = useCampusMaterials();
  const glow = useMemo(() => glowSprite("255,206,150"), []);
  return (
    <group position={position}>
      <mesh position={[0, 2.1, 0]} material={metal} castShadow>
        <cylinderGeometry args={[0.055, 0.075, 4.2, 8]} />
      </mesh>
      <mesh position={[0, 4.24, 0]} material={lampGlass} castShadow>
        <sphereGeometry args={[0.16, 12, 10]} />
      </mesh>        <sprite position={[0, 4.24, 0]} scale={[6.4, 6.4, 1]}>
        <spriteMaterial
          map={glow}
          transparent
          opacity={0.5}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          fog={false}
        />
      </sprite>
      {/* the pool of warm light each lamp throws on the stone for twelve metres
          around it — the single biggest cue that this campus is lit, not shaded */}
      <sprite position={[0, 1.5, 0]} scale={[15, 7.5, 1]}>
        <spriteMaterial
          map={glow}
          transparent
          opacity={0.11}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          fog={false}
        />
      </sprite>
      {tier === "high" && lit && (
        <pointLight position={[0, 4.2, 0]} color="#ffbe82" intensity={15} distance={19} decay={2} />
      )}
    </group>
  );
}

function Lamps({ tier }: { tier: Tier }) {
  const posts: { p: [number, number, number]; lit: boolean }[] = [        { p: [-11.5, 0, 1.2], lit: true },
    { p: [9.6, 0, -0.6], lit: true },
    { p: [-17.5, 0, -10.4], lit: tier === "high" },
    { p: [-24.5, 0, -4.2], lit: tier === "high" },
    { p: [17.5, 0, -8.6], lit: tier === "high" },
    { p: [13.6, 0, -16.2], lit: false },
    { p: [-7.4, 0, -16.6], lit: false },
    { p: [22, 0, 0.8], lit: false },
  ];
  return (
    <>
      {posts.map((l, i) => (
        <Lamp key={i} position={l.p} tier={tier} lit={l.lit} />
      ))}
    </>
  );
}

/* ------------------------------------------------------------ mid ground */

/** The band between the plaza and the academic blocks: trees, hedges, a lit
    walkway and street lamps, so the campus reads deep rather than two planes. */
function MidGround() {
  const { hedge, stone } = useCampusMaterials();
  const rows: [number, number, number, number][] = [
    [-26, 0.4, -26, 14],
    [26, 0.4, -30, 16],
    [-8, 0.4, -34, 12],
    [10, 0.4, -42, 18],
  ];
  return (
    <group>
      {/* lit walkway running across the campus */}
      <mesh position={[0, 0.05, -28]} material={stone} receiveShadow>
        <boxGeometry args={[90, 0.1, 5]} />
      </mesh>
      <mesh position={[0, 0.11, -25.6]}>
        <boxGeometry args={[86, 0.035, 0.1]} />
        <meshStandardMaterial
          color="#3a240f"
          emissive={new THREE.Color("#ffb066")}
          emissiveIntensity={1.1}
          toneMapped={false}
        />
      </mesh>
      {rows.map(([x, y, z, w], i) => (
        <RoundedBox
          key={i}
          args={[w, 0.85, 1.4]}
          radius={0.26}
          smoothness={3}
          position={[x, y, z]}
          material={hedge}
          castShadow
          receiveShadow
        />
      ))}
      {[
        { p: [-19, 0, -27] as [number, number, number], s: 1.1, seed: 61 },
        { p: [-7, 0, -31] as [number, number, number], s: 1.05, seed: 62 },
        { p: [6, 0, -30] as [number, number, number], s: 1.0, seed: 63 },
        { p: [18, 0, -34] as [number, number, number], s: 1.15, seed: 64 },
        { p: [30, 0, -38] as [number, number, number], s: 1.1, seed: 65 },
        { p: [-31, 0, -40] as [number, number, number], s: 1.2, seed: 66 },
      ].map((t, i) => (
        <Tree key={`m${i}`} position={t.p} scale={t.s} seed={t.seed} />
      ))}
      {[
        { p: [-16, 0, -21] as [number, number, number], lit: false },
        { p: [8, 0, -22] as [number, number, number], lit: false },
        { p: [27, 0, -24] as [number, number, number], lit: false },
      ].map((l, i) => (
        <Lamp key={`ml${i}`} position={l.p} tier="low" lit={l.lit} />
      ))}
    </group>
  );
}

/* ------------------------------------------------------------ landscaping */

function Tree({ position, scale = 1, seed = 1 }: { position: [number, number, number]; scale?: number; seed?: number }) {
  const { metal, foliage } = useCampusMaterials();
  const blobs = useMemo(() => {
    let a = seed * 9301;
    const rand = () => {
      a = (a * 9301 + 49297) % 233280;
      return a / 233280;
    };
    return Array.from({ length: 9 }, (_, i) => {
      const t = i / 8;
      const spread = 0.85 + t * 0.5;
      return {
        p: [
          (rand() - 0.5) * 2 * spread,
          3.05 + rand() * 1.5 + t * 0.5,
          (rand() - 0.5) * 2 * spread,
        ] as [number, number, number],
        r: 0.6 + rand() * 0.5,
        s: rand(),
      };
    });
  }, [seed]);

  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1.6, 0]} material={metal} castShadow>
        <cylinderGeometry args={[0.14, 0.24, 3.4, 7]} />
      </mesh>
      {blobs.map((b, i) => (
        <mesh key={i} position={b.p} material={foliage} castShadow rotation={[b.s * 2, b.s * 3, b.s]}>
          <icosahedronGeometry args={[b.r, 0]} />
        </mesh>
      ))}
    </group>
  );
}

function Hedges() {
  const { hedge } = useCampusMaterials();
  const rows: [number, number, number, number][] = [
    [-11, 0.45, 3.2, 5.5],
    [-18.5, 0.45, -6.5, 9],
    [11.5, 0.45, 4.6, 6],
    [24, 0.45, -3.5, 12],
    [-24, 0.45, 1.5, 7],
  ];
  return (
    <>
      {rows.map(([x, y, z, w], i) => (
        <RoundedBox
          key={i}
          args={[w, 0.9, 1.3]}
          radius={0.28}
          smoothness={3}
          position={[x, y, z]}
          material={hedge}
          castShadow
          receiveShadow
        />
      ))}
    </>
  );
}

/** A cab idling at the gate — narrative for the Rides service, alive in 3D. */
function CampusCab() {
  const { carBody, tyre, glass } = useCampusMaterials();
  const beams = useMemo(() => glowSprite("255,224,178"), []);
  const cool = useMemo(() => glowSprite("96,166,255"), []);
  return (
    <group position={[-15.4, 0, -5.2]} rotation={[0, 0.34, 0]}>
      <mesh position={[0, 0.62, 0]} material={carBody} castShadow>
        <boxGeometry args={[4.1, 0.86, 1.85]} />
      </mesh>
      <mesh position={[-0.2, 1.24, 0]} material={glass} castShadow>
        <boxGeometry args={[2.3, 0.62, 1.7]} />
      </mesh>
      {[-1.35, 1.35].map((z) =>
        [-1.32, 1.32].map((x) => (
          <mesh key={`${x}${z}`} position={[x, 0.35, z]} rotation={[Math.PI / 2, 0, 0]} material={tyre}>
            <cylinderGeometry args={[0.35, 0.35, 0.26, 14]} />
          </mesh>
        )),
      )}
      {/* warm headlamps, cool registration-plate bounce */}
      <sprite position={[2.15, 0.62, 0.62]} scale={[2.4, 2.4, 1]}>
        <spriteMaterial map={beams} transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
      </sprite>
      <sprite position={[2.15, 0.62, -0.62]} scale={[2.4, 2.4, 1]}>
        <spriteMaterial map={beams} transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
      </sprite>
      <sprite position={[0, 0.06, 0]} scale={[6, 2.4, 1]}>
        <spriteMaterial map={cool} transparent opacity={0.34} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
      </sprite>
    </group>
  );
}

/** Delivery crate at the steps — narrative for the Essentials service. */
function DeliveryProps() {
  const { concrete } = useCampusMaterials();
  const card = new THREE.MeshStandardMaterial({ color: "#7a5230", roughness: 0.85 });
  const tape = new THREE.MeshStandardMaterial({ color: "#1f6fe0", roughness: 0.6, emissiveIntensity: 0.3 });
  return (
    <group position={[9.4, 0, -5.2]} rotation={[0, -0.4, 0]}>
      <RoundedBox args={[1.15, 0.82, 0.85]} radius={0.04} smoothness={2} position={[0, 0.41, 0]} castShadow receiveShadow>
        <primitive object={card} attach="material" />
      </RoundedBox>
      <mesh position={[0, 0.44, 0.43]} material={tape} rotation={[0, 0, 0]}>
        <planeGeometry args={[0.22, 0.8]} />
      </mesh>
      <mesh position={[0, 0.83, 0]} material={tape} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.15, 0.22]} />
      </mesh>
      <RoundedBox args={[0.62, 0.44, 0.5]} radius={0.03} smoothness={2} position={[0.72, 0.22, 0.2]} rotation={[0, 0.5, 0]} castShadow>
        <primitive object={concrete} attach="material" />
      </RoundedBox>
    </group>
  );
}

/* ------------------------------------------------------------ foreground */

function ForegroundBlur({ tier }: { tier: Tier }) {
  const leafA = useMemo(() => foliageSprite(3), []);
  const leafB = useMemo(() => foliageSprite(12), []);
  const bokeh = useMemo(() => glowSprite("255,190,140"), []);
  const cool = useMemo(() => glowSprite("140,190,255"), []);
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!group.current) return;
    const g = group.current;
    g.position.x += (pointer.x * 1.5 - g.position.x) * Math.min(1, delta * 2.4);
    g.position.y += (-pointer.y * 0.42 - g.position.y) * Math.min(1, delta * 2.4);
  });

  return (
    <group ref={group} position={[0, 0, 4.6]}>
      {[
        { p: [-3.9, 1.1, -1.6] as [number, number, number], s: 4.6, t: leafA, o: 0.95 },
        { p: [4.6, 0.7, -1.2] as [number, number, number], s: 3.9, t: leafB, o: 0.9 },
        { p: [-5.4, 0.5, -2.6] as [number, number, number], s: 3.2, t: leafB, o: 0.7 },
      ].map((f, i) => (
        <sprite key={i} position={f.p} scale={[f.s, f.s * 0.72, 1]} renderOrder={6}>
          <spriteMaterial map={f.t} transparent opacity={f.o} depthWrite={false} />
        </sprite>
      ))}
      {tier === "high" &&
        [
          { p: [-2.3, 1.6, -1] as [number, number, number], s: 2.1, t: bokeh, o: 0.24, c: "#ffc98a" },
          { p: [-3.1, 0.7, -0.6] as [number, number, number], s: 1.6, t: bokeh, o: 0.2, c: "#ff9d5c" },
          { p: [3.4, 2.1, -1.4] as [number, number, number], s: 2.4, t: cool, o: 0.18, c: "#8fbaff" },
          { p: [2.6, 1.1, -0.9] as [number, number, number], s: 1.5, t: cool, o: 0.16, c: "#9ec6ff" },
          { p: [-1.2, 2.4, -1.8] as [number, number, number], s: 1.9, t: bokeh, o: 0.16, c: "#ffd7ae" },
        ].map((b, i) => (
          <sprite key={`b${i}`} position={b.p} scale={[b.s, b.s, 1]} renderOrder={7}>
            <spriteMaterial
              map={b.t}
              color={b.c}
              transparent
              opacity={b.o}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              fog={false}
            />
          </sprite>
        ))}
    </group>
  );
}

/* -------------------------------------------------------------- assembly */

export default function CampusEnv({ tier }: { tier: Tier }) {
  return (
    <group>
      <Sky />
      <CloudBank tier={tier} />
      <SunGlow />
      <AcademicBlock />
      <Stairs />
      <Plaza tier={tier} />
      <Lamps tier={tier} />
      <Hedges />
      {[
        { p: [-15.5, 0, -4.6] as [number, number, number], s: 0.95, seed: 2 },
        { p: [10.6, 0, -1.4] as [number, number, number], s: 0.9, seed: 5 },
        { p: [21.5, 0, -7.4] as [number, number, number], s: 1.0, seed: 8 },
        { p: [-24, 0, -11] as [number, number, number], s: 1.05, seed: 13 },
        { p: [30, 0, -20] as [number, number, number], s: 1.1, seed: 21 },
        { p: [-33, 0, -24] as [number, number, number], s: 1.15, seed: 34 },
        { p: [19, 0, -26] as [number, number, number], s: 1.05, seed: 44 },
      ].map((t, i) => (
        <Tree key={i} position={t.p} scale={t.s} seed={t.seed} />
      ))}
      <CampusCab />
      <DeliveryProps />
      <ForegroundBlur tier={tier} />
    </group>
  );
}
