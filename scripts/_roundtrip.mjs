import { chromium } from "playwright";
import { PNG } from "pngjs";
import { readFileSync } from "node:fs";

/* Does the hero return to the exact same framing after a scroll round trip?
   node scripts/_roundtrip.mjs                                                    */

const w = Number(process.env.W || 1440);
const h = Number(process.env.H || 900);
const dy = Number(process.env.DY || 1200);

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: w, height: h },
  deviceScaleFactor: 1,
  reducedMotion: "no-preference",
});
await ctx.addInitScript(() => {
  try {
    localStorage.setItem("ck-theme", "dark");
    sessionStorage.setItem("ck-intro", "1");
  } catch {}
});
const page = await ctx.newPage();
await page.goto("http://localhost:3111", { waitUntil: "load" });
await page.waitForTimeout(6000);

const snap = () =>
  page.evaluate(() => {
    const s = window.__ck;
    const c = s?.camera;
    const hero = document.getElementById("top");
    const canvas = document.querySelector("canvas");
    const r = (el) => {
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return [+b.left.toFixed(2), +b.top.toFixed(2), +b.width.toFixed(2), +b.height.toFixed(2)];
    };
    return {
      cam: c
        ? {
            p: [+c.position.x.toFixed(3), +c.position.y.toFixed(3), +c.position.z.toFixed(3)],
            rot: [+c.rotation.x.toFixed(4), +c.rotation.y.toFixed(4)],
          }
        : null,
      scrollY: window.scrollY,
      vw: [window.innerWidth, document.documentElement.clientWidth],
      ckScroll: hero ? getComputedStyle(hero).getPropertyValue("--ck-scroll").trim() : null,
      hero: r(hero),
      canvas: r(canvas),
      h1: r(document.querySelector("h1")),
      cards: r(document.querySelector('[data-ck="card-food"]')),
    };
  });

const shots = {};
const grab = async (tag) => {
  shots[tag] = await snap();
  await page.screenshot({ path: `qa/_rt-${tag}.png` });
};

await grab("a");
await page.mouse.move(w / 2, h / 2);
await page.mouse.wheel(0, dy);
await page.waitForTimeout(2200);
await grab("mid");
await page.mouse.wheel(0, -dy);
await page.waitForTimeout(3500);
await grab("b");

console.log(JSON.stringify(shots, null, 1));

const a = PNG.sync.read(readFileSync("qa/_rt-a.png"));
const b = PNG.sync.read(readFileSync("qa/_rt-b.png"));
let sum = 0;
let max = 0;
let moved = 0;
for (let i = 0; i < a.data.length; i += 4) {
  const d =
    Math.abs(a.data[i] - b.data[i]) +
    Math.abs(a.data[i + 1] - b.data[i + 1]) +
    Math.abs(a.data[i + 2] - b.data[i + 2]);
  sum += d;
  if (d > max) max = d;
  if (d > 24) moved++;
}
const px = a.data.length / 4;
console.log(
  "return diff: mean",
  (sum / px / 3).toFixed(3),
  "| max",
  max,
  "| pixels changed >8/255:",
  ((moved / px) * 100).toFixed(2) + "%",
);
await browser.close();
