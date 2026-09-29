import { chromium } from "playwright";

const id = process.env.ID || "how";
const delta = Number(process.env.D || 200);
const out = process.env.OUT || "qa/_at.png";
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
await page.waitForTimeout(Number(process.env.WAIT || 14000));
const y = await page.evaluate((i) => (document.getElementById(i)?.offsetTop ?? 0), id);
await page.evaluate((to) => {
  if (window.lenis) window.lenis.scrollTo(to, { immediate: true });
  else window.scrollTo(0, to);
}, y + delta);
await page.waitForTimeout(1600);
await page.screenshot({ path: out, timeout: 90000 });
console.log("shot", id, "@", y + delta);
await browser.close();
