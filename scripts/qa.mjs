import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = "http://localhost:3100";
const OUT = "qa";

const scenes = [
  ["hero", 0],
  ["hero-deep", 1500],
  ["chaos", "chaos+140"],
  ["converge-mid", "connect+1500"],
  ["converge-end", "connect+2650"],
  ["ecosystem", "ecosystem-80"],
  ["pulse-map", "pulse-60"],
  ["map", "map+140"],
  ["stories", "stories+900"],
  ["people", "people-60"],
  ["vendors", "vendors-60"],
  ["trust", "trust-40"],
  ["tech", "tech+1400"],
  ["partner", "partner-60"],
  ["footer", 99999],
];

async function shoot(browser, { name, width, height, theme, actions }) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    colorScheme: theme,
    deviceScaleFactor: 1,
  });
  await ctx.addInitScript((t) => {
    try {
      localStorage.setItem("ck-theme", t);
    } catch {}
  }, theme);
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" }).catch(() => {});
  await page.waitForTimeout(2300); // let the intro clear

  const topOf = async (spec) => {
    if (typeof spec === "number") return spec;
    const [id, delta] = spec.split(/([+-]\d+)$/);
    const d = delta ? Number(delta) : 0;
    const y = await page.evaluate((i) => document.getElementById(i)?.offsetTop ?? 0, id);
    return y + d;
  };

  for (const [sceneName, spec] of scenes) {
    const y = await topOf(spec);
    await page.evaluate((to) => {
      if (window.lenis) window.lenis.scrollTo(to, { immediate: true });
      else window.scrollTo(0, to);
    }, y);
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${OUT}/${name}-${sceneName}.png` });
  }

  if (actions) await actions(page, name);
  await ctx.close();
}

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();

/* ---------------------------------------------------------- desktop light */
await shoot(browser, {
  name: "d-light",
  width: 1440,
  height: 900,
  theme: "light",
  actions: async (page) => {
    // overlays
    await page.evaluate(() => window.lenis?.scrollTo(0, { immediate: true }));
    await page.getByRole("button", { name: /search campuskart/i }).click();
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${OUT}/d-light-overlay-search.png` });
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);

    const nav = page.getByRole("navigation", { name: "Primary" });
    await nav.getByRole("button", { name: "Login" }).click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${OUT}/d-light-overlay-login.png` });
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);

    await nav.getByRole("button", { name: "Get Started" }).click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${OUT}/d-light-overlay-register.png` });
    await page.keyboard.press("Escape");
    await page.waitForTimeout(400);

    // rides + essentials tabs
    const y = await page.evaluate(() => document.getElementById("ecosystem").offsetTop - 80);
    await page.evaluate((to) => window.lenis.scrollTo(to, { immediate: true }), y);
    await page.waitForTimeout(600);
    await page.getByRole("tab", { name: /RIDES/ }).click();
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${OUT}/d-light-ecosystem-rides.png` });
    await page.getByRole("tab", { name: /ESSENTIALS/ }).click();
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${OUT}/d-light-ecosystem-essentials.png` });

    // support drawer
    await page.evaluate(() => window.lenis.scrollTo(99999, { immediate: true }));
    await page.waitForTimeout(500);
    await page.getByRole("button", { name: "Support" }).first().click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${OUT}/d-light-overlay-support.png` });
    await page.keyboard.press("Escape");
    await page.waitForTimeout(400);

    // legal sheet
    await page.evaluate(() => window.lenis.scrollTo(99999, { immediate: true }));
    await page.waitForTimeout(400);
    await page.getByRole("button", { name: "Privacy" }).click();
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${OUT}/d-light-overlay-legal.png` });
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
  },
});

/* ---------------------------------------------------------- desktop dark */
await shoot(browser, { name: "d-dark", width: 1440, height: 900, theme: "dark" });

/* ------------------------------------------------------------- mobile */
await shoot(browser, { name: "m-light", width: 390, height: 844, theme: "light" });

/* ------------------------------------------------------ mobile menu open */
{
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    colorScheme: "light",
    hasTouch: true,
    isMobile: true,
  });
  await ctx.addInitScript(() => {
    try {
      localStorage.setItem("ck-theme", "light");
    } catch {}
  });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" }).catch(() => {});
  await page.waitForTimeout(2300);
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/m-light-menu.png` });
  await ctx.close();
}

/* ------------------------------------------------------- reduced motion */
{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: "light",
    reducedMotion: "reduce",
  });
  await ctx.addInitScript(() => {
    try {
      localStorage.setItem("ck-theme", "light");
    } catch {}
  });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" }).catch(() => {});
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/a11y-reduced-hero.png` });
  await page.evaluate(() => window.scrollTo(0, document.getElementById("connect").offsetTop + 2650));
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/a11y-reduced-converge.png` });
  await ctx.close();
}

await browser.close();
console.log("done");
