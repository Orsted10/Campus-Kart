"use client";

import * as THREE from "three";

/* ------------------------------------------------------------------ utils
   Every texture in the hero is painted on a 2D canvas at load time. Nothing is
   fetched at runtime — no HDR environments, no image CDNs, no font files — so
   the first viewport stays fast and shares one material language. */

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("2d context unavailable");
  return { c, ctx };
}

function finish(c: HTMLCanvasElement, srgb = true) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.anisotropy = 4;
  t.needsUpdate = true;
  return t;
}

/* ------------------------------------------------------------------- sky ---
   Equirectangular gradient used as scene.environment so glossy surfaces
   actually reflect a sky. It has to match the hour: a pedestal standing in
   daylight that reflects a blue-hour sunset reads as a white cut-out no matter
   how the key light is aimed, because every highlight on it is the wrong
   colour. */
export function skyEnvironment(mode: string = "dark") {
  return mode === "light" ? daySkyEnvironment() : duskSkyEnvironment();
}

function daySkyEnvironment() {
  const { c, ctx } = canvas(512, 256);
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0.0, "#2f7fdd");
  g.addColorStop(0.28, "#6fb0ef");
  g.addColorStop(0.46, "#b6d9f8");
  g.addColorStop(0.52, "#eaf4ff");
  g.addColorStop(0.56, "#ffffff");
  g.addColorStop(0.62, "#dcd6cd");
  g.addColorStop(0.78, "#b3ada4");
  g.addColorStop(1.0, "#8d8579");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 256);

  // the sun itself, high and to the right of the monument, so the clearcoat
  // carries one honest highlight rather than a smear
  const sun = ctx.createRadialGradient(392, 74, 2, 392, 74, 120);
  sun.addColorStop(0, "rgba(255,255,255,1)");
  sun.addColorStop(0.14, "rgba(255,250,238,0.9)");
  sun.addColorStop(0.45, "rgba(255,240,208,0.32)");
  sun.addColorStop(1, "rgba(255,240,208,0)");
  ctx.fillStyle = sun;
  ctx.fillRect(0, 0, 512, 256);

  // warm ground bounce on the low half: plaza-reading reflections
  const bounce = ctx.createLinearGradient(0, 150, 0, 256);
  bounce.addColorStop(0, "rgba(226,214,196,0)");
  bounce.addColorStop(1, "rgba(222,206,184,0.5)");
  ctx.fillStyle = bounce;
  ctx.fillRect(0, 150, 512, 106);

  const t = finish(c);
  t.mapping = THREE.EquirectangularReflectionMapping;
  return t;
}

function duskSkyEnvironment() {
  const { c, ctx } = canvas(512, 256);
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0.0, "#05091a");
  g.addColorStop(0.24, "#0b1638");
  g.addColorStop(0.42, "#1d2c5e");
  g.addColorStop(0.53, "#4a4a7a");
  g.addColorStop(0.585, "#a8607a");
  g.addColorStop(0.63, "#e88a55");
  g.addColorStop(0.665, "#ffb877");
  g.addColorStop(0.70, "#6b4a52");
  g.addColorStop(0.78, "#241d28");
  g.addColorStop(1.0, "#06070c");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 256);

  // sunset core sitting behind the campus blocks
  const sun = ctx.createRadialGradient(360, 166, 4, 360, 166, 132);
  sun.addColorStop(0, "rgba(255,226,186,1)");
  sun.addColorStop(0.2, "rgba(255,168,96,0.72)");
  sun.addColorStop(0.52, "rgba(196,92,62,0.26)");
  sun.addColorStop(1, "rgba(20,20,30,0)");
  ctx.fillStyle = sun;
  ctx.fillRect(0, 0, 512, 256);

  // cool bounce on the opposite side keeps reflections from reading flat
  const cool = ctx.createRadialGradient(90, 108, 10, 90, 108, 175);
  cool.addColorStop(0, "rgba(84,140,255,0.4)");
  cool.addColorStop(1, "rgba(10,14,26,0)");
  ctx.fillStyle = cool;
  ctx.fillRect(0, 0, 512, 256);

  const t = finish(c);
  t.mapping = THREE.EquirectangularReflectionMapping;
  return t;
}

/* --------------------------------------------------------------- facades ---
   One texture per building face: concrete panels, window grid, and a matching
   emissive map where only the lit windows glow. Far cheaper than hundreds of
   window meshes and it keeps the campus reading as architecture, not boxes. */
export type FacadeTextures = { map: THREE.Texture; emissive: THREE.Texture };

export function facadeTextures(opts: {
  seed: number;
  cols?: number;
  rows?: number;
  wall?: string;
  lit?: number;
  warm?: number;
}) {
  const { seed, cols = 26, rows = 13, wall = "#3a4152", lit = 0.28, warm = 0.9 } = opts;
  const W = 1024;
  const H = 512;
  const base = canvas(W, H);
  const glow = canvas(W, H);
  const rand = rng(seed);

  // wall with vertical panel joints and a slight top-down light falloff
  base.ctx.fillStyle = wall;
  base.ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 900; i++) {
    const x = rand() * W;
    const y = rand() * H;
    const s = rand() * 60 + 20;
    base.ctx.fillStyle = `rgba(255,255,255,${rand() * 0.02})`;
    base.ctx.fillRect(x, y, s, s);
  }
  const shade = base.ctx.createLinearGradient(0, 0, 0, H);
  shade.addColorStop(0, "rgba(255,196,140,0.16)");
  shade.addColorStop(0.45, "rgba(255,255,255,0)");
  shade.addColorStop(1, "rgba(0,0,0,0.45)");
  base.ctx.fillStyle = shade;
  base.ctx.fillRect(0, 0, W, H);

  base.ctx.strokeStyle = "rgba(0,0,0,0.22)";
  base.ctx.lineWidth = 2;
  for (let i = 0; i <= cols; i++) {
    const x = (i / cols) * W;
    base.ctx.beginPath();
    base.ctx.moveTo(x, 0);
    base.ctx.lineTo(x, H);
    base.ctx.stroke();
  }
  base.ctx.strokeStyle = "rgba(0,0,0,0.32)";
  base.ctx.lineWidth = 3;
  for (let r = 0; r <= rows; r++) {
    const y = (r / rows) * H;
    base.ctx.beginPath();
    base.ctx.moveTo(0, y);
    base.ctx.lineTo(W, y);
    base.ctx.stroke();
  }

  glow.ctx.fillStyle = "#000";
  glow.ctx.fillRect(0, 0, W, H);

  const cw = W / cols;
  const ch = H / rows;
  for (let r = 0; r < rows; r++) {
    for (let i = 0; i < cols; i++) {
      // wider, taller glazing: small portholes read as a CG office tower, big
      // glass does not. Campus buildings are mostly window.
      const pad = cw * 0.13;
      const x = i * cw + pad;
      const y = r * ch + ch * 0.16;
      const w = cw - pad * 2;
      const h = ch * 0.68;
      const isLit = rand() < lit;

      base.ctx.fillStyle = "#0a0e18";
      base.ctx.fillRect(x, y, w, h);
      base.ctx.fillStyle = "rgba(120,140,180,0.09)";
      base.ctx.fillRect(x, y, w, h * 0.2);

      if (isLit) {
        const warmish = rand() < warm;
        const hot = 0.72 + rand() * 0.28;
        const tint = warmish
          ? `rgba(255,${Math.round(180 + rand() * 40)},${Math.round(112 + rand() * 50)},${hot})`
          : `rgba(${Math.round(140 + rand() * 40)},${Math.round(196 + rand() * 30)},255,${hot * 0.85})`;
        glow.ctx.fillStyle = tint;
        glow.ctx.fillRect(x, y, w, h);
        // interior structure: blind, mullion, back wall
        glow.ctx.fillStyle = "rgba(0,0,0,0.22)";
        glow.ctx.fillRect(x + w * 0.44, y, w * 0.05, h);
        glow.ctx.fillRect(x, y + h * 0.52, w, h * 0.05);
        base.ctx.fillStyle = warmish ? "rgba(255,206,156,0.72)" : "rgba(188,220,255,0.66)";
        base.ctx.fillRect(x, y, w, h);
        // light spilling onto the slab below
        const spill = base.ctx.createLinearGradient(0, y + h, 0, y + h + ch * 0.28);
        spill.addColorStop(0, warmish ? "rgba(255,186,120,0.18)" : "rgba(150,200,255,0.14)");
        spill.addColorStop(1, "rgba(0,0,0,0)");
        base.ctx.fillStyle = spill;
        base.ctx.fillRect(x - cw * 0.1, y + h, w + cw * 0.2, ch * 0.3);
      }
    }
  }

  // warm ground floor where campus life actually happens
  const ground = base.ctx.createLinearGradient(0, H, 0, H - ch * 1.6);
  ground.addColorStop(0, "rgba(255,176,104,0.5)");
  ground.addColorStop(1, "rgba(255,176,104,0)");
  base.ctx.fillStyle = ground;
  base.ctx.fillRect(0, H - ch * 1.6, W, ch * 1.6);
  const groundGlow = glow.ctx.createLinearGradient(0, H, 0, H - ch * 1.6);
  groundGlow.addColorStop(0, "rgba(255,178,104,0.85)");
  groundGlow.addColorStop(1, "rgba(255,178,104,0)");
  glow.ctx.fillStyle = groundGlow;
  glow.ctx.fillRect(0, H - ch * 1.6, W, ch * 1.6);

  return { map: finish(base.c), emissive: finish(glow.c) };
}

/* ------------------------------------------------------------ paving ------
   Daylight reads the ground by its joints. A plain plane under a bright key
   clips to white, and a white plinth standing on a white plane has no edge to
   sit on — which is the whole of the "floating" read. Laid over the plaza
   material at ~2.4 m per slab, this gives the deck its scale, gives the camera
   something to travel across, and gives the pedestal a surface that is not the
   same value as the pedestal. */
export function plazaTexture() {
  const S = 1024;
  const { c, ctx } = canvas(S, S);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, S, S);
  const rand = rng(41);
  const n = 8; /* one texture tile holds 8x8 slabs */
  const cell = S / n;

  for (let iy = 0; iy < n; iy++) {
    for (let ix = 0; ix < n; ix++) {
      const v = Math.round(255 * (1 - rand() * 0.11));
      ctx.fillStyle = `rgb(${v},${v},${v})`;
      ctx.fillRect(ix * cell, iy * cell, cell, cell);
      /* grain inside the slab so a 92x repeat never reads as flat */
      for (let k = 0; k < 30; k++) {
        ctx.fillStyle = `rgba(134,124,110,${rand() * 0.06})`;
        ctx.fillRect(
          ix * cell + rand() * cell,
          iy * cell + rand() * cell,
          2 + rand() * 6,
          2 + rand() * 6,
        );
      }
    }
  }

  /* Wear. A deck that is perfectly even in tone reads as a surface *drop*:
     a few soft patches of grime are what tell the eye it is being walked on. */
  for (let i = 0; i < 26; i++) {
    const x = rand() * S;
    const y = rand() * S;
    const r = 40 + rand() * 130;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(104,96,84,${0.05 + rand() * 0.07})`);
    g.addColorStop(1, "rgba(104,96,84,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  /* The joints themselves. They have to survive being minified to a couple of
     pixels on screen: at 128 px per slab a 3 px line just mips away to a pale
     wash, which is what turned the first pass into a white grid on the deck. */
  for (let i = 0; i <= n; i++) {
    const p = i * cell;
    ctx.strokeStyle = "rgba(74,64,52,0.78)";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, S);
    ctx.moveTo(0, p);
    ctx.lineTo(S, p);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,252,246,0.34)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(p + 4, 0);
    ctx.lineTo(p + 4, S);
    ctx.moveTo(0, p + 4);
    ctx.lineTo(S, p + 4);
    ctx.stroke();
  }

  const t = finish(c);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  return t;
}

/* --------------------------------------------------------- base shadow ----
   The dark line where a pedestal meets the paving. A wide contact gradient
   cannot do this job: by the edge of a 5 m base its alpha has long gone, which
   is exactly why a bright plinth reads as hovering. Solid under the footprint,
   gone a metre past it. */
export function baseShadow() {
  const S = 256;
  const { c, ctx } = canvas(S, S);
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, "rgba(0,0,0,0.9)");
  g.addColorStop(0.6, "rgba(0,0,0,0.72)");
  g.addColorStop(0.78, "rgba(0,0,0,0.36)");
  g.addColorStop(0.9, "rgba(0,0,0,0.1)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  return finish(c);
}

/* ---------------------------------------------------------- lettering ---- */
export function textPanel(opts: {
  lines: { text: string; color: string; size: number; weight?: string; spacing?: number }[];
  width?: number;
  height?: number;
  background?: string;
  font?: string;
}) {
  const {
    lines,
    width = 1024,
    height = 512,
    background = "rgba(0,0,0,0)",
    font = "Inter, 'Helvetica Neue', Arial, sans-serif",
  } = opts;
  const { c, ctx } = canvas(width, height);
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const total = lines.reduce((s, l) => s + l.size * 1.35, 0);
  let y = height / 2 - total / 2;
  for (const line of lines) {
    y += line.size * 0.72;
    ctx.font = `${line.weight ?? "700"} ${line.size}px ${font}`;
    ctx.fillStyle = line.color;
    if (line.spacing) {
      // manual letter spacing for dimensional signage
      const gap = line.spacing;
      const chars = [...line.text];
      const widths = chars.map((ch) => ctx.measureText(ch).width + gap);
      const full = widths.reduce((s, w) => s + w, 0) - gap;
      let x = width / 2 - full / 2;
      for (let i = 0; i < chars.length; i++) {
        ctx.fillText(chars[i], x + widths[i] / 2 - gap / 2, y);
        x += widths[i];
      }
    } else {
      ctx.fillText(line.text, width / 2, y);
    }
    y += line.size * 0.63;
  }
  return finish(c);
}

/* ------------------------------------------------- pedestal lettering ----
   "CAMPUSKART" — dark slate CAMPUS, electric royal blue KART — drawn with deep
   3D extrusion depth, specular bevel top highlight, and rich drop shadows matching reference. */
export function pedestalLabel(mode: string = "dark") {
  const isLight = mode === "light";
  const W = 2048;
  const H = 512;
  const { c, ctx } = canvas(W, H);
  ctx.clearRect(0, 0, W, H);
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  const size = 225;
  const font = `900 ${size}px Inter, 'Helvetica Neue', Arial, sans-serif`;
  ctx.font = font;
  const spacing = 18;
  const parts = [
    {
      text: "CAMPUS",
      face: isLight ? "#0f172a" : "#f8fafc",
      edge: isLight ? "#020617" : "#081b33",
      top: isLight ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.85)",
      shadow: isLight ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.8)",
    },
    {
      text: "KART",
      face: isLight ? "#1d4ed8" : "#2f8dff",
      edge: isLight ? "#1e3a8a" : "#041c3e",
      top: isLight ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.95)",
      shadow: isLight ? "rgba(29,78,216,0.4)" : "rgba(47,141,255,0.6)",
    },
  ];
  const widths = parts.map((p) =>
    [...p.text].reduce((s, ch) => s + ctx.measureText(ch).width + spacing, 0) - spacing,
  );
  const total = widths.reduce((s, w) => s + w, 0);
  let x = (W - total) / 2;
  const y = H / 2;

  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    const drawRun = (
      dx: number,
      dy: number,
      color: string,
      blur: number,
      alpha: number,
    ) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.filter = blur ? `blur(${blur}px)` : "none";
      ctx.fillStyle = color;
      let cx = x + dx;
      for (const ch of p.text) {
        ctx.fillText(ch, cx, y + dy);
        cx += ctx.measureText(ch).width + spacing;
      }
      ctx.restore();
    };
    // 1. Soft glow/bloom backing
    drawRun(0, 0, p.face, 18, 0.45);
    // 2. Drop shadow under 3D relief
    drawRun(5, 12, p.shadow, 10, 0.45);
    // 3. Crisp 3D extrusion body layers
    for (let d = 14; d >= 1; d -= 1.2) drawRun(d * 0.45, d * 0.75, p.edge, 0, 0.96);
    // 4. Front face
    drawRun(0, 0, p.face, 0, 1);
    // 5. Bevel top highlight
    drawRun(0, -3.5, p.top, 0, 0.7);
    x += widths[i];
  }

  return finish(c);
}

/* ------------------------------------------------------ pedestal shell ----
   The satin metallic shell wrapped around the plinth drum. */
export function pedestalSkin() {
  const W = 1024;
  const H = 512;
  const { c, ctx } = canvas(W, H);

  const around = ctx.createLinearGradient(0, 0, W, 0);
  around.addColorStop(0.0, "#ffffff");
  around.addColorStop(0.12, "#ffffff");
  around.addColorStop(0.22, "#f1f5f9");
  around.addColorStop(0.38, "#e2e8f0");
  around.addColorStop(0.52, "#cbd5e1");
  around.addColorStop(0.66, "#b0c4de");
  around.addColorStop(0.8, "#e2e8f0");
  around.addColorStop(0.92, "#f8fafc");
  around.addColorStop(1.0, "#ffffff");
  ctx.fillStyle = around;
  ctx.fillRect(0, 0, W, H);

  ctx.globalCompositeOperation = "multiply";
  const up = ctx.createLinearGradient(0, 0, 0, H);
  up.addColorStop(0, "#ffffff");
  up.addColorStop(0.35, "#fafafa");
  up.addColorStop(0.75, "#edf2f7");
  up.addColorStop(1, "#e2e8f0");
  ctx.fillStyle = up;
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = "source-over";

  const rand = rng(17);
  // vertical brushing: a cast shell, not a shaded sphere
  for (let i = 0; i < 300; i++) {
    const x = rand() * W;
    ctx.fillStyle = `rgba(122,148,180,${rand() * 0.055})`;
    ctx.fillRect(x, 0, 1 + rand() * 3, H);
  }
  // micro speckle: keeps the clearcoat highlight from reading as plastic
  for (let i = 0; i < 1100; i++) {
    ctx.fillStyle = `rgba(255,255,255,${rand() * 0.06})`;
    ctx.fillRect(rand() * W, rand() * H, 2, 2);
  }
  // a whisper of grime where the shell meets the plaza — every real plinth has
  // it, and it is what stops the foot of the cylinder from floating
  const grit = ctx.createLinearGradient(0, H * 0.86, 0, H);
  grit.addColorStop(0, "rgba(88,110,138,0)");
  grit.addColorStop(1, "rgba(74,96,124,0.22)");
  ctx.fillStyle = grit;
  ctx.fillRect(0, H * 0.86, W, H * 0.14);

  return finish(c);
}

/* ------------------------------------------------------------- sprites ---- */
export function glowSprite(color = "255,190,120") {
  const S = 256;
  const { c, ctx } = canvas(S, S);
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, `rgba(${color},1)`);
  g.addColorStop(0.16, `rgba(${color},0.55)`);
  g.addColorStop(0.45, `rgba(${color},0.12)`);
  g.addColorStop(1, `rgba(${color},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  const t = finish(c);
  return t;
}

/** Soft out-of-focus foliage: a dark, edge-lit leaf mass used close to camera. */
export function foliageSprite(seed = 7, hue = "12, 26, 18") {
  const S = 512;
  const { c, ctx } = canvas(S, S);
  const rand = rng(seed);
  ctx.clearRect(0, 0, S, S);
  for (let i = 0; i < 90; i++) {
    const x = S * (0.1 + rand() * 0.8);
    const y = S * (0.35 + rand() * 0.65);
    const r = 18 + rand() * 74;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const lit = rand() < 0.22;
    g.addColorStop(0, lit ? "rgba(58,96,74,0.5)" : `rgba(${hue},0.72)`);
    g.addColorStop(0.7, `rgba(${hue},0.28)`);
    g.addColorStop(1, `rgba(${hue},0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  return finish(c);
}

/** Cloud bank: stacked soft blobs so the sunset band has structure. */
export function cloudSprite(seed = 3) {
  const S = 512;
  const { c, ctx } = canvas(S, S);
  const rand = rng(seed);
  for (let i = 0; i < 46; i++) {
    const x = S * (0.12 + rand() * 0.76);
    const y = S * (0.4 + rand() * 0.3);
    const r = 30 + rand() * 90;
    const g = ctx.createRadialGradient(x, y - r * 0.2, 0, x, y, r);
    g.addColorStop(0, `rgba(255,238,222,${0.2 + rand() * 0.3})`);
    g.addColorStop(0.55, `rgba(214,170,170,${0.1 + rand() * 0.16})`);
    g.addColorStop(1, "rgba(120,110,140,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y, r * 1.5, r * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  return finish(c);
}

/** Radial mask for the polished patch of plaza the monument stands on: solid
    under the plinth, gone by the edge, so a rendered reflective disc can be
    laid over the photograph without a visible rim. */
export function reflectionMask() {
  const S = 256;
  const { c, ctx } = canvas(S, S);
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.34, "rgba(255,255,255,0.92)");
  g.addColorStop(0.62, "rgba(255,255,255,0.5)");
  g.addColorStop(0.86, "rgba(255,255,255,0.16)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  return finish(c, false);
}

/** Radial contact shadow used to seat props on the plaza. */
export function contactShadow() {
  const S = 256;
  const { c, ctx } = canvas(S, S);
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, "rgba(0,0,0,0.85)");
  g.addColorStop(0.45, "rgba(0,0,0,0.5)");
  g.addColorStop(0.8, "rgba(0,0,0,0.12)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  return finish(c);
}
