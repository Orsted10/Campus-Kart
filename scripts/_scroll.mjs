import { chromium } from "playwright";

const out = process.env.OUT || "qa/_scroll";
const steps = Number(process.env.STEPS || 8);
const w = Number(process.env.W || 1440);
const h = Number(process.env.H || 900);
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: "no-preference" });
await ctx.addInitScript(() => {
  try {
    localStorage.setItem("ck-theme", "dark");
    sessionStorage.setItem("ck-intro", "1");
  } catch {}
});
const page = await ctx.newPage();
await page.goto("http://localhost:3111", { waitUntil: "load" });
await page.waitForTimeout(14000);
const total = await page.evaluate(() => document.body.scrollHeight - window.innerHeight);
for (let i = 0; i < steps; i++) {
  const y = Math.round((total * i) / (steps - 1));
  await page.evaluate((to) => {
    if (window.lenis) window.lenis.scrollTo(to, { immediate: true });
    else window.scrollTo(0, to);
  }, y);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${out}-${i}.png`, timeout: 90000 });
}
console.log(`captured ${steps} frames, page height ${total}`);
await browser.close();
