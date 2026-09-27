import { chromium } from "playwright";

const BASE = "http://localhost:3100";
const report = [];
const ok = (name, pass, detail = "") => report.push(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`);

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 820, height: 1100 },
  { name: "mobile", width: 390, height: 844 },
];

const browser = await chromium.launch();

for (const vp of VIEWPORTS) {
  for (const theme of ["light", "dark"]) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, colorScheme: theme });
    await ctx.addInitScript((t) => {
      try { localStorage.setItem("ck-theme", t); } catch {}
    }, theme);
    const page = await ctx.newPage();
    const errors = [];
    page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.goto(BASE, { waitUntil: "networkidle" }).catch(() => {});
    await page.waitForTimeout(2400);
    const tag = `${vp.name}/${theme}`;

    // 1. no horizontal overflow anywhere on the page
    const overflow = await page.evaluate(() => ({
      doc: document.documentElement.scrollWidth,
      win: window.innerWidth,
      worst: (() => {
        let worst = null;
        document.querySelectorAll("body *").forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.width === 0) return;
          if (r.right > window.innerWidth + 6) {
            // ignore elements clipped by an overflow-hidden ancestor
            let p = el.parentElement, clipped = false;
            while (p) {
              const s = getComputedStyle(p);
              if (s.overflowX === "hidden" || s.overflowX === "clip") { clipped = true; break; }
              p = p.parentElement;
            }
            if (!clipped && (!worst || r.right > worst.right))
              worst = { right: Math.round(r.right), tag: el.tagName + "." + String(el.className).slice(0, 60) };
          }
        });
        return worst;
      })(),
    }));
    ok(`${tag} no horizontal overflow`, overflow.doc <= overflow.win + 1 && !overflow.worst,
      `${overflow.doc}/${overflow.win}${overflow.worst ? " worst=" + JSON.stringify(overflow.worst) : ""}`);

    // 2. theme actually applied
    const applied = await page.evaluate(() => document.documentElement.dataset.theme);
    ok(`${tag} theme applied`, applied === theme, applied);

    // 3. every image loaded (scroll through first so lazy images enter view)
    await page.evaluate(async () => {
      const go = (y) => (window.lenis ? window.lenis.scrollTo(y, { immediate: true }) : window.scrollTo(0, y));
      const h = document.body.scrollHeight;
      for (let y = 0; y < h; y += window.innerHeight * 0.8) {
        go(y);
        await new Promise((r) => setTimeout(r, 90));
      }
      go(0);
    });
    await page.waitForTimeout(2500);
    const imgs = await page.evaluate(() =>
      [...document.images]
        .filter((i) => i.getClientRects().length > 0) // ignore display:none images (hidden scenes)
        .map((i) => ({ src: i.currentSrc || i.src, w: i.naturalWidth }))
        .filter((i) => i.w === 0),
    );
    ok(`${tag} all images loaded`, imgs.length === 0, JSON.stringify(imgs.slice(0, 3)));

    // 4. heading structure
    const heads = await page.evaluate(() =>
      [...document.querySelectorAll("h1,h2,h3")].map((h) => Number(h.tagName[1])),
    );
    ok(`${tag} single h1`, heads.filter((h) => h === 1).length === 1, `h1=${heads.filter((h) => h === 1).length}`);

    // 5. contrast of visible text across the whole page (sampled at several depths)
    const contrastAt = async (frac) =>
      page.evaluate((f) => {
        const v = Math.floor(document.body.scrollHeight * f);
        if (window.lenis) window.lenis.scrollTo(v, { immediate: true });
        else window.scrollTo(0, v);
        const lum = (c) => {
          const [r, g, b] = c.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number).map((v) => {
            v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
          });
          return 0.2126 * r + 0.7152 * g + 0.0722 * b;
        };
        const bgOf = (el) => {
          let n = el;
          while (n && n !== document.documentElement) {
            const s = getComputedStyle(n);
            const bg = s.backgroundColor;
            if (bg && !/rgba\(0, 0, 0, 0\)|transparent/.test(bg)) return bg;
            if (n !== el && (s.overflow === "hidden" || s.position === "fixed")) return getComputedStyle(document.body).backgroundColor;
            n = n.parentElement;
          }
          return getComputedStyle(document.body).backgroundColor;
        };
        const out = [];
        document.querySelectorAll("p, span, a, button, li, h1, h2, h3, h4, td, label, cite, legend, dt, dd").forEach((el) => {
          if (!el.firstChild || ![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 3)) return;
          const r = el.getBoundingClientRect();
          if (r.width < 8 || r.height < 6) return;
          if (r.top < -20 || r.top > window.innerHeight + 40) return;
          const s = getComputedStyle(el);
          if (s.visibility === "hidden" || Number(s.opacity) < 0.9) return; // skip transient/animated states
          const l1 = lum(s.color), l2 = lum(bgOf(el));
          const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
          const size = parseFloat(s.fontSize);
          const need = size >= 24 || (size >= 18.66 && Number(s.fontWeight) >= 700) ? 3 : 4.5;
          if (ratio < need) out.push({ txt: el.textContent.trim().slice(0, 34), ratio: ratio.toFixed(2), size, color: s.color });
        });
        return out.slice(0, 5);
      }, frac);
    const lowContrast = [];
    for (const frac of [0, 0.18, 0.36, 0.54, 0.72, 0.9]) {
      lowContrast.push(...(await contrastAt(frac)));
    }
    await page.evaluate(() => (window.lenis ? window.lenis.scrollTo(0, { immediate: true }) : window.scrollTo(0, 0)));
    ok(`${tag} text contrast ≥ AA`, lowContrast.length === 0, JSON.stringify(lowContrast));

    // 6. no console errors
    ok(`${tag} no console errors`, errors.length === 0, JSON.stringify(errors.slice(0, 3)));

    await ctx.close();
  }
}

/* ------------------------------------------------- interaction integrity */
try {
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(BASE, { waitUntil: "networkidle" }).catch(() => {});
  await page.waitForTimeout(2400);

  // theme toggle persists
  const before = await page.evaluate(() => document.documentElement.dataset.theme);
  await page.getByRole("button", { name: /switch to (light|dark) mode/i }).click();
  await page.waitForTimeout(1100);
  const after = await page.evaluate(() => document.documentElement.dataset.theme);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(600);
  const persisted = await page.evaluate(() => document.documentElement.dataset.theme);
  ok("theme toggles", before !== after, `${before} -> ${after}`);
  ok("theme persists across reload", persisted === after, persisted);

  // campus selector
  await page.waitForTimeout(1800);
  await page.getByRole("button", { name: /where do you campus|riyana institute/i }).first().click();
  await page.waitForTimeout(400);
  const opts = await page.getByRole("button", { name: /salt lake polytechnic/i }).count();
  ok("campus picker opens", opts > 0);
  if (opts) {
    await page.getByRole("button", { name: /salt lake polytechnic/i }).click();
    await page.waitForTimeout(500);
    const label = await page.getByText(/salt lake/i).first().isVisible().catch(() => false);
    ok("campus selection applies", label);
  }

  // nav scroll
  await page.getByRole("navigation", { name: "Primary" }).getByRole("button", { name: "Food" }).click();
  await page.waitForTimeout(1600);
  const y = await page.evaluate(() => window.scrollY);
  ok("nav Food scrolls to ecosystem", y > 5000, `y=${y}`);

  // service tabs switch demos
  const ridesTab = page.getByRole("tab", { name: /RIDES/ });
  await ridesTab.click();
  await page.waitForTimeout(700);
  const rideText = await page.getByText(/demo route · example campus/i).isVisible().catch(() => false);
  ok("rides tab shows ride demo", rideText);
  await page.getByRole("tab", { name: /ESSENTIALS/ }).click();
  await page.waitForTimeout(700);
  const shelf = await page.getByText(/hover \/ tap an item/i).isVisible().catch(() => false);
  ok("essentials tab shows shelf", shelf);

  // ride route: change pickup updates eta label
  await page.getByRole("tab", { name: /RIDES/ }).click();
  await page.waitForTimeout(500);
  const eta1 = await page.evaluate(() => document.querySelector("#ecosystem dl dd")?.textContent);
  await page.locator("#ecosystem fieldset").first().getByRole("button", { name: "Library", exact: true }).click();
  await page.waitForTimeout(500);
  const eta2 = await page.evaluate(() => document.querySelector("#ecosystem dl dd")?.textContent);
  ok("ride pickup change updates ETA", eta1 !== eta2, `${eta1} -> ${eta2}`);

  // food journey run
  await page.getByRole("tab", { name: /FOOD/ }).click();
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: /send it|run it again/i }).click();
  await page.waitForTimeout(5200);
  const arrived = await page.evaluate(() => document.body.innerText.toLowerCase().includes("arrived · collect"));
  ok("food journey completes to arrival", arrived);

  // search overlay
  await page.evaluate(() => {
    if (window.lenis) window.lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  });
  await page.waitForTimeout(400);
  await page.getByRole("button", { name: /search campuskart/i }).click();
  await page.waitForTimeout(600);
  await page.keyboard.type("charger");
  await page.waitForTimeout(400);
  const sugg = await page.getByText(/need a charger/i).first().isVisible().catch(() => false);
  ok("search filters suggestions", sugg);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);
  ok("escape closes search", (await page.getByRole("dialog", { name: "Search" }).count()) === 0);

  // login modal validation + success
  const nav = page.getByRole("navigation", { name: "Primary" });
  await nav.getByRole("button", { name: "Login" }).click();
  await page.waitForTimeout(700);
  const dlg = page.getByRole("dialog", { name: "Login" });
  ok("login modal opens", (await dlg.count()) > 0);
  await dlg.getByRole("button", { name: "Continue", exact: true }).click();
  await page.waitForTimeout(400);
  const invalid = await dlg.locator("[data-invalid='true']").count();
  ok("login validates empty input", invalid > 0, `invalid=${invalid}`);
  await dlg.locator("input").nth(0).fill("student@campus.edu");
  await dlg.locator("input[type=password]").fill("secret12");
  await dlg.getByRole("button", { name: "Continue", exact: true }).click();
  await page.waitForTimeout(1500);
  const done = await dlg.getByText(/demo interaction complete/i).first().isVisible().catch(() => false);
  ok("login demo success state", done);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);

  // register flow opens from hero CTA? (nav)
  await nav.getByRole("button", { name: "Get Started" }).click();
  await page.waitForTimeout(700);
  ok("register modal opens", (await page.getByRole("dialog", { name: "Create account" }).count()) > 0);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);

  // partner form validation + success
  await page.evaluate(() => {
    const el = document.getElementById("partner");
    if (window.lenis) window.lenis.scrollTo(el.offsetTop, { immediate: true });
    else window.scrollTo(0, el.offsetTop);
  });
  await page.waitForTimeout(700);
  const pf = page.locator("#partner form");
  await pf.getByRole("button", { name: /start the conversation/i }).click();
  await page.waitForTimeout(400);
  ok("partner form validates", (await pf.locator("[data-invalid='true']").count()) > 0);
  await pf.getByRole("textbox").nth(0).fill("Ankan");
  await pf.getByRole("textbox").nth(1).fill("ankan@college.edu");
  await pf.getByRole("textbox").nth(2).fill("Riyana Institute, Pune");
  await pf.getByRole("button", { name: /start the conversation/i }).click();
  await page.waitForTimeout(1400);
  ok("partner form demo success", await page.locator("#partner").getByText(/demo interaction complete/i).first().isVisible().catch(() => false));

  // support drawer
  await page.evaluate(() => window.lenis?.scrollTo(999999, { immediate: true }));
  await page.waitForTimeout(500);
  await page.getByRole("contentinfo").getByRole("button", { name: "Support" }).first().click();
  await page.waitForTimeout(700);
  ok("support drawer opens", (await page.getByRole("dialog", { name: "Support" }).count()) > 0);
  await page.getByRole("dialog", { name: "Support" }).getByRole("button", { name: /order issue/i }).click();
  await page.waitForTimeout(500);
  ok("support topic drill-down", await page.getByText(/no support backend/i).isVisible().catch(() => false));
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);

  // legal sheet
  await page.evaluate(() => window.lenis?.scrollTo(999999, { immediate: true }));
  await page.waitForTimeout(400);
  await page.getByRole("button", { name: "Privacy" }).click();
  await page.waitForTimeout(600);
  ok("legal sheet opens", await page.getByRole("dialog", { name: "Privacy Policy" }).count().then((c) => c > 0));
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);

  // 404 route
  const resp = await page.goto(BASE + "/definitely-not-here", { waitUntil: "domcontentloaded" });
  const nf = await page.getByText(/goes nowhere/i).isVisible().catch(() => false);
  ok("404 page renders", resp.status() === 404 && nf, `status=${resp.status()}`);

  // keyboard: tab reaches nav
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2400);
  await page.keyboard.press("Tab");
  const focused = await page.evaluate(() => document.activeElement?.tagName);
  ok("keyboard tab focuses first control", ["BUTTON", "A", "INPUT"].includes(focused), focused);

  ok("no page errors during interactions", errors.length === 0, JSON.stringify(errors.slice(0, 3)));
  await ctx.close();
} catch (e) {
  ok("interaction suite completed", false, String(e).split("\n")[0]);
}

await browser.close();
console.log(report.join("\n"));
const fails = report.filter((r) => r.startsWith("FAIL"));
console.log(`\n${report.length - fails.length}/${report.length} passed`);
process.exit(0);
