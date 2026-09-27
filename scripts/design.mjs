import { chromium } from "playwright";

const BASE = "http://localhost:3100";
const report = [];
const ok = (n, pass, d = "") => report.push(`${pass ? "PASS" : "FAIL"}  ${n}${d ? " — " + d : ""}`);
const scaleOf = (m) => (m && m !== "none" ? Number(m.split("(")[1].split(",")[0]) : 1);

const browser = await chromium.launch();

/* --------------------------------------------------------- desktop pass */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "light" });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" }).catch(() => {});
  await page.waitForTimeout(2500);

  // nav never overlaps the headline at rest
  const geo = await page.evaluate(() => {
    const nav = document.querySelector("header nav").getBoundingClientRect();
    const h1 = document.querySelector("h1").getBoundingClientRect();
    const scene = document.querySelector("#top svg").getBoundingClientRect();
    return { navBottom: Math.round(nav.bottom), h1Top: Math.round(h1.top), sceneW: Math.round(scene.width), sceneH: Math.round(scene.height) };
  });
  ok("nav clears hero headline", geo.navBottom < geo.h1Top, JSON.stringify(geo));
  ok("hero scene has presence", geo.sceneW > 700 && geo.sceneH > 380, `${geo.sceneW}x${geo.sceneH}`);

  // hero camera push-in AND full reversal
  const sceneSel = "#top .sticky > div.absolute.left-1\\/2";
  const readScale = () => page.evaluate((s) => {
    const el = document.querySelector(s);
    return el ? getComputedStyle(el).transform : "none";
  }, sceneSel);
  const at0 = scaleOf(await readScale());
  await page.evaluate(() => window.lenis.scrollTo(1000, { immediate: true }));
  await page.waitForTimeout(1000);
  const at1 = scaleOf(await readScale());
  await page.evaluate(() => window.lenis.scrollTo(0, { immediate: true }));
  await page.waitForTimeout(1200);
  const back0 = scaleOf(await readScale());
  ok("hero camera pushes in on scroll", at1 > at0 + 0.15, `${at0.toFixed(2)} -> ${at1.toFixed(2)}`);
  ok("hero camera reverses on scroll up", Math.abs(back0 - at0) < 0.05, `${back0.toFixed(2)} vs ${at0.toFixed(2)}`);

  // nav recedes when scrolling down, returns when scrolling up
  await page.evaluate(() => window.lenis.scrollTo(900, { immediate: true }));
  await page.waitForTimeout(700);
  const hidden = await page.evaluate(() => Number(getComputedStyle(document.querySelector("header nav")).opacity));
  await page.evaluate(() => window.lenis.scrollTo(500, { immediate: true }));
  await page.waitForTimeout(700);
  const shown = await page.evaluate(() => Number(getComputedStyle(document.querySelector("header nav")).opacity));
  ok("nav recedes while scrolling down", hidden < 0.1, `opacity=${hidden}`);
  ok("nav returns when scrolling up", shown > 0.9, `opacity=${shown}`);

  // nav compacts after scroll
  await page.evaluate(() => window.lenis.scrollTo(1500, { immediate: true }));
  await page.waitForTimeout(600);
  await page.evaluate(() => window.lenis.scrollTo(1200, { immediate: true }));
  await page.waitForTimeout(700);
  const compact = await page.evaluate(() => {
    const nav = document.querySelector("header nav");
    return { bg: getComputedStyle(nav).backgroundColor, border: getComputedStyle(nav).borderTopColor };
  });
  ok("nav compacts with background", !/rgba\(0, 0, 0, 0\)|transparent/.test(compact.bg), compact.bg);

  // signature moment: convergence reveal AND reversal
  const connect = await page.evaluate(() => document.getElementById("connect").offsetTop);
  const headlineOpacity = () => page.evaluate(() => {
    const h = document.querySelector("#connect h2")?.parentElement;
    return h ? Number(getComputedStyle(h).opacity) : -1;
  });
  await page.evaluate((y) => window.lenis.scrollTo(y, { immediate: true }), connect + 2650);
  await page.waitForTimeout(1200);
  const revealed = await headlineOpacity();
  await page.evaluate((y) => window.lenis.scrollTo(y, { immediate: true }), connect + 600);
  await page.waitForTimeout(1200);
  const reverted = await headlineOpacity();
  await page.evaluate((y) => window.lenis.scrollTo(y, { immediate: true }), connect + 2650);
  await page.waitForTimeout(1000);
  const reRevealed = await headlineOpacity();
  ok("convergence headline reveals", revealed > 0.9, `opacity=${revealed}`);
  ok("convergence reverses when scrolling up", reverted < 0.25, `opacity=${reverted}`);
  ok("convergence replays when scrolling down again", reRevealed > 0.9, `opacity=${reRevealed}`);

  // trust path draws with scroll, retracts upward
  const trust = await page.evaluate(() => document.getElementById("trust").offsetTop);
  const dashOffset = () => page.evaluate(() => {
    const p = document.querySelector("#trust svg path[stroke-width='2.5']");
    return p ? Math.round(parseFloat(p.style.strokeDashoffset || "0")) : -1;
  });
  await page.evaluate((y) => window.lenis.scrollTo(y, { immediate: true }), trust - 900);
  await page.waitForTimeout(900);
  const offBefore = await dashOffset();
  await page.evaluate((y) => window.lenis.scrollTo(y, { immediate: true }), trust + 300);
  await page.waitForTimeout(900);
  const offAfter = await dashOffset();
  await page.evaluate((y) => window.lenis.scrollTo(y, { immediate: true }), trust - 900);
  await page.waitForTimeout(900);
  const offBack = await dashOffset();
  ok("trust path draws in", offAfter < offBefore - 100, `${offBefore} -> ${offAfter}`);
  ok("trust path retracts upward", offBack > offAfter + 100, `${offAfter} -> ${offBack}`);

  // map routes draw in
  const map = await page.evaluate(() => document.getElementById("map").offsetTop);
  await page.evaluate((y) => window.lenis.scrollTo(y, { immediate: true }), map + 900);
  await page.waitForTimeout(1000);
  const drawn = await page.evaluate(() => Math.round(parseFloat(document.querySelector("#map .map-route").style.strokeDashoffset || "0")));
  ok("map routes draw with scroll", Number.isFinite(drawn) && drawn < 60, `dashoffset=${drawn}`);

  // keyboard still scrolls the page with Lenis active
  await page.evaluate(() => window.lenis.scrollTo(0, { immediate: true }));
  await page.waitForTimeout(500);
  await page.keyboard.press("PageDown");
  await page.waitForTimeout(900);
  const ky = await page.evaluate(() => window.scrollY);
  ok("keyboard paging works with smooth scroll", ky > 300, `y=${ky}`);

  // focus ring is visible
  const outline = await page.evaluate(() => {
    const btn = document.querySelector("header nav button");
    btn.focus();
    const s = getComputedStyle(btn);
    return `${s.outlineStyle} ${s.outlineWidth}`;
  });
  ok("focus ring visible on focus", !/none 0px/.test(outline), outline);

  // anchor navigation from footer to top works
  await page.evaluate(() => window.lenis.scrollTo(999999, { immediate: true }));
  await page.waitForTimeout(600);
  await page.getByRole("button", { name: /see the campus map again/i }).click();
  await page.waitForTimeout(1800);
  const mapY = await page.evaluate(() => window.scrollY);
  const mapTop = await page.evaluate(() => document.getElementById("map").offsetTop);
  ok("footer CTA navigates to map", Math.abs(mapY - mapTop) < 260, `y=${mapY} target=${mapTop}`);

  await ctx.close();
}

/* ------------------------------------------------------- reduced motion */
{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
    colorScheme: "light",
  });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" }).catch(() => {});
  await page.waitForTimeout(1600);

  const state = await page.evaluate(() => ({
    lenis: Boolean(window.lenis),
    infinite: document.getAnimations().filter((a) => {
      const t = a.effect?.getComputedTiming?.();
      return t && (t.activeDuration === Infinity || t.iterations === Infinity);
    }).length,
  }));
  ok("reduced motion disables smooth scroll", !state.lenis, JSON.stringify(state));
  ok("reduced motion stops infinite loops", state.infinite === 0, `infinite=${state.infinite}`);

  // content still fully reachable
  const connect = await page.evaluate(() => document.getElementById("connect").offsetTop);
  await page.evaluate((y) => window.scrollTo(0, y + 2650), connect);
  await page.waitForTimeout(700);
  const op = await page.evaluate(() => {
    const h = document.querySelector("#connect h2")?.parentElement;
    return h ? Number(getComputedStyle(h).opacity) : -1;
  });
  ok("reduced motion still shows content", op > 0.9, `opacity=${op}`);
  await ctx.close();
}

/* ---------------------------------------------------------- mobile pass */
{
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    colorScheme: "light",
  });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" }).catch(() => {});
  await page.waitForTimeout(2500);

  const hero = await page.evaluate(() => {
    const h1 = document.querySelector("h1").getBoundingClientRect();
    const ctas = [...document.querySelectorAll("h1 ~ div button, h1 ~ * button")].slice(0, 2).map((b) => b.getBoundingClientRect().top);
    const scene = document.querySelector("#top svg").getBoundingClientRect();
    const chips = [...document.querySelectorAll("button")].filter((b) => /^(Food|Rides|Essentials)$/.test(b.textContent.trim()) && b.getBoundingClientRect().top > 400);
    return { h1Top: Math.round(h1.top), h1Bottom: Math.round(h1.bottom), sceneW: Math.round(scene.width), sceneH: Math.round(scene.height), chips: chips.length, ctaTops: ctas };
  });
  ok("mobile hero headline above the fold", hero.h1Bottom < 844, `bottom=${hero.h1Bottom}`);
  ok("mobile hero has scene", hero.sceneW >= 380 && hero.sceneH >= 250, `${hero.sceneW}x${hero.sceneH}`);
  ok("mobile hero has service chips", hero.chips >= 3, `chips=${hero.chips}`);

  // custom cursor must not render on touch
  const cursor = await page.evaluate(() => {
    const c = [...document.querySelectorAll("div")].find((d) => typeof d.className === "string" && d.className.includes("z-[150]"));
    return c ? getComputedStyle(c).display : "absent";
  });
  ok("custom cursor hidden on touch", cursor === "none" || cursor === "absent", cursor);

  // full-screen menu
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.waitForTimeout(900);
  const menu = await page.evaluate(() => {
    const links = [...document.querySelectorAll("header ~ div nav button, div[aria-hidden='false'] nav button")];
    const visible = links.filter((l) => l.getBoundingClientRect().height > 0 && getComputedStyle(l).visibility !== "hidden");
    const el = [...document.querySelectorAll("div")].find((d) => d.style.clipPath && d.style.clipPath.includes("inset"));
    return { links: visible.length, clip: el?.style.clipPath ?? "none" };
  });
  ok("mobile menu opens full screen", menu.links >= 6 && !/100%/.test(menu.clip), JSON.stringify(menu));
  await ctx.close();
}

await browser.close();
console.log(report.join("\n"));
const fails = report.filter((r) => r.startsWith("FAIL"));
console.log(`\n${report.length - fails.length}/${report.length} design checks passed`);
