import { chromium } from "playwright";

const url = process.env.URL || "http://localhost:3111";
const out = process.env.OUT || "qa/_now.png";
const w = Number(process.env.W || 1440);
const h = Number(process.env.H || 900);
const y = Number(process.env.Y || 0);
const theme = process.env.THEME || "dark";
const wait = Number(process.env.WAIT || 2600);

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: w, height: h },
  colorScheme: theme,
  deviceScaleFactor: 1,
  reducedMotion: "no-preference",
});
await ctx.addInitScript((t) => {
  try {
    localStorage.setItem("ck-theme", t);
    sessionStorage.setItem("ck-intro", "1");
  } catch {}
}, theme);
const page = await ctx.newPage();
const errs = [];
page.on("console", (m) => {
  if (m.type() === "error") errs.push(m.text().slice(0, 300));
});
page.on("pageerror", (e) => errs.push("PAGEERROR " + String(e).slice(0, 300)));
await page.goto(url, { waitUntil: "load" }).catch(() => {});
await page.waitForTimeout(wait);
if (y) {
  await page.evaluate((to) => {
    if (window.lenis) window.lenis.scrollTo(to, { immediate: true });
    else window.scrollTo(0, to);
  }, y);
  await page.waitForTimeout(900);
}
await page.screenshot({ path: out });
console.log("shot ->", out, "errors:", errs.length ? errs.join(" | ") : "none");
await browser.close();
