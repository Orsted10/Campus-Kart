import { chromium } from "playwright";

const query = process.env.Q || "";
const out = process.env.OUT || "qa/_scene.png";
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: Number(process.env.W || 1440), height: Number(process.env.H || 900) },
  deviceScaleFactor: Number(process.env.DSF || 1),
  reducedMotion: "no-preference",
});
await ctx.addInitScript(() => {
  try {
    localStorage.setItem("ck-theme", "dark");
    sessionStorage.setItem("ck-intro", "1");
  } catch {}
});
const page = await ctx.newPage();
const logs = [];
page.on("console", (m) => logs.push(`${m.type()}: ${m.text().slice(0, 300)}`));
page.on("pageerror", (e) => logs.push("PAGEERROR " + String(e).slice(0, 400)));
await page.goto("http://localhost:3111/" + query, { waitUntil: "load" });
await page.waitForTimeout(Number(process.env.WAIT || 14000));

const info = await page.evaluate(() => {
  const w = window;
  const st = w.__ck;
  if (!st) return { err: "no r3f store" };
  let meshes = 0;
  let lights = 0;
  const names = [];
  st.scene.traverse((o) => {
    if (o.isMesh) meshes++;
    if (o.isLight) lights++;
    if (names.length < 8 && o.isMesh) names.push(o.type + ":" + (o.material?.type ?? "?"));
  });
  const cam = st.camera;
  return {
    meshes,
    lights,
    names,
    cam: [cam.position.x.toFixed(2), cam.position.y.toFixed(2), cam.position.z.toFixed(2)],
    fov: cam.fov,
    env: !!st.scene.environment,
    fog: st.scene.fog ? [st.scene.fog.color.getHexString(), st.scene.fog.density] : null,
    toneMapping: st.gl.toneMapping,
  };
});
console.log("PROBE", JSON.stringify(info));

await page.evaluate(() => {
  document.querySelectorAll("#top > div").forEach((el, i) => {
    if (i > 0) el.style.visibility = "hidden";
  });
});
await page.waitForTimeout(500);
const clip = process.env.CLIP
  ? (() => {
      const [x, y, w, h] = process.env.CLIP.split(",").map(Number);
      return { x, y, width: w, height: h };
    })()
  : undefined;
await page.screenshot({ path: out, timeout: 90000, clip });
console.log("LOGS:", logs.slice(0, 10).join("\n"));
await browser.close();
