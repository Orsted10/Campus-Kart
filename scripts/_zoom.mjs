import { chromium } from "playwright";

/* Inspect a small region of the page at 4x: node scripts/_zoom.mjs
   env: URL, OUT, X, Y, W, H, SCALE */

const url = process.env.URL || "http://localhost:3111";
const out = process.env.OUT || "qa/_zoom.png";
const x = Number(process.env.X || 0);
const y = Number(process.env.Y || 0);
const w = Number(process.env.W || 200);
const h = Number(process.env.H || 100);
const scale = Number(process.env.SCALE || 4);

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: scale,
  colorScheme: "dark",
  reducedMotion: "no-preference",
});
await ctx.addInitScript(() => {
  try {
    localStorage.setItem("ck-theme", "dark");
    sessionStorage.setItem("ck-intro", "1");
  } catch {}
});
const page = await ctx.newPage();
await page.goto(url, { waitUntil: "load" });
await page.waitForTimeout(Number(process.env.WAIT || 6000));
await page.screenshot({ path: out, clip: { x, y, width: w, height: h } });
console.log(`zoom [${x},${y} ${w}x${h}] @${scale}x -> ${out}`);
await browser.close();
