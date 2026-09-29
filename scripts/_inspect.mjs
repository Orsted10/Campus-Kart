import { chromium } from "playwright";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => {
  try {
    localStorage.setItem("ck-theme", "dark");
    sessionStorage.setItem("ck-intro", "1");
  } catch {}
});
const page = await ctx.newPage();
await page.emulateMedia({ reducedMotion: "no-preference" });
await page.goto("http://localhost:3111/" + (process.env.Q || "?solo=1"), { waitUntil: "load" });
await page.waitForTimeout(Number(process.env.WAIT || 14000));

const info = await page.evaluate(() => {
  const st = window.__ck;
  if (!st) return { err: "no store" };
  const out = [];
  st.scene.traverse((o) => {
    if (!o.isMesh) return;
    const g = o.geometry;
    if (!g) return;
    o.updateWorldMatrix(true, false);
    g.computeBoundingBox();
    const box = g.boundingBox.clone();
    box.applyMatrix4(o.matrixWorld);
    const type = g.type;
    out.push({
      type,
      name: o.name || "",
      params: (g.parameters && (g.parameters.radiusTop ?? g.parameters.radius ?? g.parameters.width)) ?? null,
      min: [box.min.x, box.min.y, box.min.z].map((v) => +v.toFixed(2)),
      max: [box.max.x, box.max.y, box.max.z].map((v) => +v.toFixed(2)),
      color: o.material?.color?.getHexString?.() ?? null,
    });
  });
  const cam = st.camera;
  let reflector = 0;
  let sprites = 0;
  st.scene.traverse((o) => {
    if (o.isMesh && o.material && o.material.constructor && o.material.constructor.name.includes("Reflector")) reflector++;
    if (o.isSprite) sprites++;
  });
  return {
    cam: [cam.position.x, cam.position.y, cam.position.z].map((v) => +v.toFixed(2)),
    count: out.length,
    reflector,
    sprites,
    reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    out: out.slice(0, 400),
  };
});
console.log(JSON.stringify(info, null, 1));
await browser.close();
