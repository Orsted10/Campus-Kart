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
  /* Anisotropy has to cover the worst-case foreshortening in the frame, not an
     arbitrary "looks fine" value. The academic blocks sit 70-115 m back and are
     seen almost edge-on, so their facades are minified hard along the view
     axis; at anisotropy 4 the mip chain could not keep up and the elevations
     broke up into horizontal streaks. Ask for the hardware maximum. */
  t.anisotropy = 16;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.magFilter = THREE.LinearFilter;
  t.generateMipmaps = true;
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
  g.addColorStop(0.0, "#1e6fd6");
  g.addColorStop(0.28, "#5fa8f2");
  g.addColorStop(0.46, "#b9dcfb");
  g.addColorStop(0.52, "#eef6ff");
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
  sun.addColorStop(0.14, "rgba(255,250,238,0.95)");
  sun.addColorStop(0.45, "rgba(255,240,208,0.4)");
  sun.addColorStop(1, "rgba(255,240,208,0)");
  ctx.fillStyle = sun;
  ctx.fillRect(0, 0, 512, 256);

  // bright cloud band — gives the glossy paint something white to catch
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  for (const [bx, by, bw, bh] of [
    [80, 60, 120, 26],
    [220, 40, 90, 20],
    [300, 96, 140, 24],
    [440, 52, 80, 18],
  ] as const) {
    const cl = ctx.createRadialGradient(bx, by, 4, bx, by, bw);
    cl.addColorStop(0, "rgba(255,255,255,0.62)");
    cl.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = cl;
    ctx.fillRect(bx - bw, by - bh, bw * 2, bh * 2);
  }

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
  sun.addColorStop(0, "rgba(255,232,200,1)");
  sun.addColorStop(0.2, "rgba(255,176,104,0.85)");
  sun.addColorStop(0.52, "rgba(206,98,66,0.32)");
  sun.addColorStop(1, "rgba(20,20,30,0)");
  ctx.fillStyle = sun;
  ctx.fillRect(0, 0, 512, 256);

  // cool bounce on the opposite side keeps reflections from reading flat
  const cool = ctx.createRadialGradient(90, 108, 10, 90, 108, 175);
  cool.addColorStop(0, "rgba(96,152,255,0.5)");
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
  /* Daylight paints the glazing as reflective glass rather than as a lit
     aperture — see the window loop below. */
  daylight?: boolean;
  /* width / height of the face this texture is mapped onto, so the painted
     cells keep their true proportions instead of being stretched. */
  aspect?: number;
}) {
  const { seed, cols = 26, rows = 13, wall = "#3a4152", lit = 0.28, warm = 0.9, aspect } = opts;
  /* The canvas has to share the elevation's own proportions. These blocks are
     roughly 2:1 (28 m x 14.5 m) and the facade was being painted on a 2:1
     canvas and then stretched across a 1.93:1 face, so every window came out
     about a quarter too wide — which reads as horizontal smear once the
     elevation is minified. Pass the real face aspect and the cells come out
     square. */
  const W = 1024;
  const H = Math.max(128, Math.round(W / (aspect ?? 2)));
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
  if (opts.daylight) {
    /* Daylight: a soft lift at the parapet where sky light lands, falling away
       gently to the shaded base. The night version bakes a hard 45% black into
       the bottom two-thirds to fake the uplight off the wet plaza, and in
       daylight that reads as a building standing in its own shadow. */
    shade.addColorStop(0, "rgba(255,255,255,0.1)");
    shade.addColorStop(0.4, "rgba(255,255,255,0)");
    shade.addColorStop(1, "rgba(46,58,76,0.2)");
  } else {
    shade.addColorStop(0, "rgba(255,196,140,0.16)");
    shade.addColorStop(0.45, "rgba(255,255,255,0)");
    shade.addColorStop(1, "rgba(0,0,0,0.45)");
  }
  base.ctx.fillStyle = shade;
  base.ctx.fillRect(0, 0, W, H);

  /* Spandrel joints. In daylight these want to be light (a raised concrete
     band catching sky) rather than dark, or the whole elevation reads as a
     wireframe instead of as floor plates. */
  base.ctx.strokeStyle = opts.daylight ? "rgba(238,232,218,0.4)" : "rgba(0,0,0,0.22)";
  base.ctx.lineWidth = 2;
  for (let i = 0; i <= cols; i++) {
    const x = (i / cols) * W;
    base.ctx.beginPath();
    base.ctx.moveTo(x, 0);
    base.ctx.lineTo(x, H);
    base.ctx.stroke();
  }
  base.ctx.strokeStyle = opts.daylight ? "rgba(58,72,92,0.22)" : "rgba(0,0,0,0.32)";
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

      /* Daylight glass. At night a window is a hole with a lamp behind it and
         the emissive map carries the whole read. In daylight it is the
         opposite: the glazing has to be painted as a dark, reflective pane,
         because the window grid is the only architecture the hero actually
         reads. Left as the near-black night fill it was fine; left with only a
         9% sheen on top it vanished into the wall and every block read as one
         flat beige slab. */
      if (opts.daylight) {
        /* Sky reflected in the pane: brighter at the top, deepening downward,
           which is what a vertical sheet of glass looking at a bright sky
           actually does. */
        const pane = base.ctx.createLinearGradient(0, y, 0, y + h);
        pane.addColorStop(0, "#7d97b4");
        pane.addColorStop(0.42, "#4a5f7c");
        pane.addColorStop(1, "#2d3c50");
        base.ctx.fillStyle = pane;
        base.ctx.fillRect(x, y, w, h);
        /* A hard specular band where the sky's brightest patch lands. */
        base.ctx.fillStyle = "rgba(226,240,255,0.5)";
        base.ctx.fillRect(x, y, w, Math.max(1, h * 0.07));
        /* Reveal shadow along the head and one jamb: the pane is set back into
           the wall, and without it the glass reads as paint on the surface. */
        base.ctx.fillStyle = "rgba(28,38,52,0.5)";
        base.ctx.fillRect(x, y, w, Math.max(1, h * 0.05));
        base.ctx.fillRect(x, y, Math.max(1, w * 0.035), h);
        /* Transom + mullion, so the glazing has a module rather than reading
           as one undivided sheet. */
        base.ctx.fillStyle = "rgba(226,220,206,0.55)";
        base.ctx.fillRect(x, y + h * 0.52, w, Math.max(1, h * 0.03));
        base.ctx.fillRect(x + w * 0.47, y, Math.max(1, w * 0.026), h);
        continue;
      }

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
  if (!opts.daylight) {
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
  }

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
  g.addColorStop(0, "rgba(0,0,0,0.88)");
  g.addColorStop(0.5, "rgba(0,0,0,0.74)");
  g.addColorStop(0.74, "rgba(0,0,0,0.3)");
  g.addColorStop(0.88, "rgba(0,0,0,0.06)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  return finish(c);
}

/* ------------------------------------------------------------ base glow ---
   The blue the plinth's lip throws onto the paving. Painted as an annulus
   rather than a blob: the disc's inner half is hidden under the collar, so all
   that ever reaches the eye is the bright band hugging the base — the hot
   puddle of light the reference sits in, and the one cue that a big white
   object is standing on the ground rather than hovering over it. */
export function baseGlow() {
  const S = 512;
  const { c, ctx } = canvas(S, S);
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, "rgba(150,205,255,0)");
  g.addColorStop(0.42, "rgba(150,205,255,0.05)");
  g.addColorStop(0.53, "rgba(170,216,255,0.4)");
  g.addColorStop(0.61, "rgba(198,230,255,0.82)");
  g.addColorStop(0.68, "rgba(176,220,255,0.4)");
  g.addColorStop(0.76, "rgba(150,205,255,0.1)");
  g.addColorStop(0.9, "rgba(130,190,255,0)");
  g.addColorStop(1, "rgba(130,190,255,0)");
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
export function pedestalLabel(mode: string = "dark", aspect: number = 5.42) {
  const isLight = mode === "light";
  /* The canvas is cut to the arc-to-height ratio of the band it wraps, which the
     plinth hands in: a squarer canvas stretches every letter sideways, and no
     amount of lighting or material work hides fat type. The wordmark has to be
     drawn in the proportions it will be read in. */
  const W = 2560;
  const H = Math.round(W / aspect);
  const { c, ctx } = canvas(W, H);
  ctx.clearRect(0, 0, W, H);
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  const SQUEEZE = 0.87; /* condensed caps: heavy and tall, never fat */
  const GAP = 15;
  const font = (size: number) => `900 ${size}px Inter, 'Helvetica Neue', Arial, sans-serif`;

  /* Ink: near-black against electric royal blue. The face of each word is a
     gradient rather than a flat fill — a flat fill in a scene that tone-maps
     every highlight ends up reading as paint, and this is cut acrylic. */
  const parts = isLight
    ? [
        { text: "CAMPUS", faceTop: "#3c4456", face: "#090c14", edge: "#04060b", bevel: "rgba(255,255,255,0.5)" },
        { text: "KART", faceTop: "#3d7cff", face: "#1a52ec", edge: "#0d2b9e", bevel: "rgba(255,255,255,0.72)" },
      ]
    : [
        { text: "CAMPUS", faceTop: "#ffffff", face: "#d9e3f2", edge: "#08183a", bevel: "rgba(255,255,255,0.9)" },
        { text: "KART", faceTop: "#86c4ff", face: "#2f8dff", edge: "#062a5c", bevel: "rgba(255,255,255,0.9)" },
      ];

  const runs = (size: number) => {
    ctx.font = font(size);
    return parts.map((p) => {
      let w = 0;
      for (const ch of p.text) w += ctx.measureText(ch).width + GAP;
      return { ...p, w: w - GAP };
    });
  };

  /* The wordmark is the same width on the plinth in both hours, so the size is
     solved rather than eyeballed: measure once, then take the scale that fills
     93% of the band, clamped so the caps stay inside two thirds of its height. */
  const probe = runs(400);
  const probeWidth = probe.reduce((s, p) => s + p.w, 0) * SQUEEZE;
  const size = Math.min(400 * ((W * 0.93) / probeWidth), (H * 0.66) / 0.72);
  const sized = runs(size);
  const natural = sized.reduce((s, p) => s + p.w, 0);

  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.scale(SQUEEZE, 1);
  ctx.translate(-W / 2, -H / 2);

  let x = (W - natural) / 2;
  const y = H / 2;
  const depth = size * 0.03;

  for (const p of sized) {
    const run = (
      dx: number,
      dy: number,
      fill: string | CanvasGradient,
      blur: number,
      alpha: number,
      outline = 0,
    ) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.filter = blur ? `blur(${blur}px)` : "none";
      let cx = x + dx;
      if (outline) {
        ctx.strokeStyle = fill;
        ctx.lineWidth = outline;
        ctx.lineJoin = "round";
        for (const ch of p.text) {
          ctx.strokeText(ch, cx, y + dy);
          cx += ctx.measureText(ch).width + GAP;
        }
      } else {
        ctx.fillStyle = fill;
        for (const ch of p.text) {
          ctx.fillText(ch, cx, y + dy);
          cx += ctx.measureText(ch).width + GAP;
        }
      }
      ctx.restore();
    };

    // 1. Ambient drop: the letterform's own shadow on the shell
    run(0, size * 0.035, "rgba(3,6,14,0.32)", size * 0.05, 0.6);
    // 2. Extruded edge, stacked down-right
    for (let d = depth; d > 0.5; d -= depth / 7) run(d * 0.5, d, p.edge, 0, 0.94);
    // 3. Cast bevel light: an offset copy the face then covers, so only the
    //    top-left rim survives — a flat face would have none
    run(-size * 0.004, -size * 0.022, p.bevel, 0, 0.5);
    // 4. Face. Stroked as well as filled: the heaviest weight a canvas font will
    //    give us is still lighter than the reference's cut acrylic, and a third
    //    of a millimetre of outline on each side is the difference between
    //    signage and bold body text.
    const face = ctx.createLinearGradient(0, y - size * 0.36, 0, y + size * 0.34);
    face.addColorStop(0, p.faceTop);
    face.addColorStop(1, p.face);
    run(0, 0, face, 0, 1);
    run(0, 0, face, 0, 1, size * 0.028)
    x += p.w;
  }

  ctx.restore();
  return finish(c);
}

/* ------------------------------------------------------ pedestal shell ----
   The satin metallic shell wrapped around the plinth drum. */
export function pedestalSkin() {
  const W = 1024;
  const H = 512;
  const { c, ctx } = canvas(W, H);

  /* Daylight shell.

     The shell is wrapped once around the drum, so anything drawn here is drawn
     around 14 m of circumference. That is why the previous version went wrong:
     260 vertical brush strokes and three hard panel joints are perfectly
     reasonable marks on a flat swatch and catastrophic on a cylinder — they
     become 260 ribs and three stripes running the full height of a 3 m drum,
     reading as corrugated metal rather than as a smooth painted shell. Detail
     has to scale with the surface it lands on.

     What survives that rule is what varies *slowly*: the bounce gradient up
     the drum, the shade the cap throws, and the grime at the foot. Those are
     metres wide, so they read as form. The fine grain goes in the roughness,
     not the albedo, where it perturbs the gloss instead of drawing lines. */
  const base = ctx.createLinearGradient(0, 0, 0, H);
  base.addColorStop(0.0, "#dfe6ee");
  base.addColorStop(0.22, "#eef2f7");
  base.addColorStop(0.58, "#f6f8fb");
  base.addColorStop(0.86, "#e9eef4");
  base.addColorStop(1.0, "#d3dbe4");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, W, H);

  const rand = rng(17);

  /* Broad, soft cloudiness. Low frequency and feathered, so it survives being
     wrapped: the eye reads it as a faint unevenness in the paint film, which is
     exactly what a real painted shell has, and no single mark is resolvable. */
  ctx.globalCompositeOperation = "multiply";
  for (let i = 0; i < 26; i++) {
    const cx = rand() * W;
    const cy = rand() * H;
    const r = 90 + rand() * 190;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    const a = 0.012 + rand() * 0.022;
    g.addColorStop(0, `rgba(176,190,206,${a})`);
    g.addColorStop(1, "rgba(176,190,206,0)");
    ctx.fillStyle = g;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  }
  ctx.globalCompositeOperation = "source-over";

  /* Grime where the shell meets the plaza. Every outdoor plinth has it, and it
     is what stops the foot of the cylinder from floating. */
  const grit = ctx.createLinearGradient(0, H * 0.74, 0, H);
  grit.addColorStop(0, "rgba(96,116,142,0)");
  grit.addColorStop(0.55, "rgba(88,108,134,0.1)");
  grit.addColorStop(1, "rgba(70,90,116,0.3)");
  ctx.fillStyle = grit;
  ctx.fillRect(0, H * 0.74, W, H * 0.26);

  /* Shade thrown by the cap's overhang. Metres wide on the real object, so it
     holds up at every camera angle — and it is the single strongest depth cue
     on what is otherwise a plain vertical wall. */
  const under = ctx.createLinearGradient(0, 0, 0, H * 0.34);
  under.addColorStop(0, "rgba(108,128,152,0.34)");
  under.addColorStop(0.55, "rgba(108,128,152,0.1)");
  under.addColorStop(1, "rgba(108,128,152,0)");
  ctx.fillStyle = under;
  ctx.fillRect(0, 0, W, H * 0.34);

  return finish(c);
}

/* -------------------------------------------------------- pedestal gloss --
   Fine grain for the shell's ROUGHNESS rather than its colour. On the albedo
   this same grain is what drew 260 visible ribs around the drum; as roughness
   it only breaks up the clearcoat highlight, which is what a real painted
   surface does with it, and it costs no edges at all. Returned non-sRGB: it is
   a scalar, not a colour. */
export function pedestalGloss() {
  const S = 512;
  const { c, ctx } = canvas(S, S);
  ctx.fillStyle = "#6e6e6e";
  ctx.fillRect(0, 0, S, S);
  const rand = rng(29);
  /* Isotropic speckle. No preferred direction — a directional grain at this
     scale is exactly the ribbing we are removing. */
  for (let i = 0; i < 5200; i++) {
    const v = 96 + rand() * 54;
    ctx.fillStyle = `rgba(${v | 0},${v | 0},${v | 0},0.5)`;
    const s = 1 + rand() * 2;
    ctx.fillRect(rand() * S, rand() * S, s, s);
  }
  /* Faint broad patchiness in the polish, so the reflection wanders slightly
     instead of sitting as one perfect sheet. */
  for (let i = 0; i < 18; i++) {
    const cx = rand() * S;
    const cy = rand() * S;
    const r = 40 + rand() * 110;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, `rgba(140,140,140,${0.05 + rand() * 0.07})`);
    g.addColorStop(1, "rgba(140,140,140,0)");
    ctx.fillStyle = g;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  }
  return finish(c, false);
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

/** Radial alpha for the polished apron of plaza the monument stands on: solid
    under the plinth, gone a few metres out, so a smooth reflective surface can
    be laid over the paving without a rim. The pavers stay visible through it —
    this is a decal, not a plate. */
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
