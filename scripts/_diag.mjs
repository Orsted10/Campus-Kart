import { chromium } from "playwright";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await ctx.addInitScript(() => {
  try {
    localStorage.setItem("ck-theme", "dark");
    sessionStorage.setItem("ck-intro", "1");
  } catch {}
});
const page = await ctx.newPage();
const logs = [];
page.on("console", (m) => logs.push(`${m.type()}: ${m.text().slice(0, 400)}`));
page.on("pageerror", (e) => logs.push("PAGEERROR " + String(e).slice(0, 500)));
await page.goto("http://localhost:3111", { waitUntil: "load" });
await page.waitForTimeout(7000);

const info = await page.evaluate(() => {
  const canvas = document.querySelector("canvas");
  const gl = canvas?.getContext("webgl2") || canvas?.getContext("webgl");
  return {
    canvas: canvas ? { w: canvas.width, h: canvas.height, cw: canvas.clientWidth, ch: canvas.clientHeight } : null,
    glVendor: gl ? gl.getParameter(gl.VERSION) : null,
    lost: gl ? (gl.isContextLost ? gl.isContextLost() : null) : null,
    hasThree: !!(window.__THREE__ || window.THREE),
  };
});
console.log("INFO", JSON.stringify(info));

// hide every overlay sibling so only the 3D layer is visible
await page.evaluate(() => {
  const section = document.getElementById("top");
  if (!section) return;
  section.querySelectorAll(":scope > div").forEach((el, i) => {
    if (i > 0) el.style.visibility = "hidden";
  });
});
await page.waitForTimeout(600);
await page.screenshot({ path: process.env.OUT || "qa/_scene.png", timeout: 90000, animations: "disabled" });
console.log("LOGS:", logs.slice(0, 12).join("\n"));
await browser.close();
