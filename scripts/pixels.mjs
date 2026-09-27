import { PNG } from "pngjs";
import { readFile, readdir } from "node:fs/promises";

const files = (await readdir("qa")).filter((f) => f.endsWith(".png"));
const report = [];
const ok = (n, pass, d = "") => report.push(`${pass ? "PASS" : "FAIL"}  ${n}${d ? " — " + d : ""}`);

const hexToRgb = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const LIGHT_BG = hexToRgb("#F4F0E8");
const DARK_BG = hexToRgb("#151515");

for (const file of files.sort()) {
  const png = PNG.sync.read(await readFile(`qa/${file}`));
  const { width: w, height: h, data } = png;
  const px = (x, y) => {
    const i = (y * w + x) * 4;
    return [data[i], data[i + 1], data[i + 2]];
  };
  const dark = file.includes("d-dark");

  // 1. background colour matches the theme
  const corner = px(3, 3);
  const bg = dark ? DARK_BG : LIGHT_BG;
  const bgDelta = Math.max(...corner.map((c, i) => Math.abs(c - bg[i])));
  ok(`${file} theme bg`, bgDelta <= 16, `corner=${corner.join(",")} expected~${bg.join(",")}`);

  // scenes designed around whitespace get a lower (but still real) floor
  const sparse = /converge-mid|chaos|tech|footer|pulse-map|overlay|map/.test(file);

  // 2. content coverage: pixels that clearly differ from the page background
  let content = 0, ink = 0, terracotta = 0, blue = 0, olive = 0;
  let darkRows = 0;
  const rowHasContent = new Array(h).fill(false);
  const step = 2;
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const [r, g, b] = px(x, y);
      const d = Math.max(Math.abs(r - bg[0]), Math.abs(g - bg[1]), Math.abs(b - bg[2]));
      if (d > 26) {
        content++;
        rowHasContent[y] = true;
      }
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      if (!dark && lum < 120) ink++; // counts primary AND muted text (excludes surfaces)
      if (dark && lum > 140) ink++;
      if (r > 120 && r - g > 35 && g > b && r - b > 55) terracotta++;
      if (b > 110 && b - r > 30 && b - g > 15) blue++;
      if (g > r && g > b && Math.abs(g - 70) < 60 && r > 60 && r < 130 && b < 110 && g - b > 10) olive++;
    }
    if (darkRows) darkRows = 0;
  }
  const total = Math.ceil(w / step) * Math.ceil(h / step);
  const coverage = content / total;
  ok(`${file} content coverage`, coverage >= (sparse ? 0.015 : 0.03), `${(coverage * 100).toFixed(1)}%`);

  // 3. largest empty horizontal band (too much dead space is a design smell)
  let run = 0, maxRun = 0, runAt = 0, maxRunAt = 0;
  for (let y = 0; y < h; y++) {
    if (!rowHasContent[y]) {
      if (run === 0) runAt = y;
      run++;
      if (run > maxRun) { maxRun = run; maxRunAt = runAt; }
    } else run = 0;
  }
  const emptyRatio = maxRun / h;
  ok(`${file} no dead band`, emptyRatio < 0.34, `${maxRun}px empty at y=${maxRunAt} (${(emptyRatio * 100).toFixed(0)}%)`);

  // 4. readable text presence (ink)
  ok(`${file} has text/ink`, ink / total >= (sparse ? 0.0014 : 0.006), `${((ink / total) * 100).toFixed(2)}%`);

  // 5. accent presence (soft expectations by scene)
  const expect = [];
  if (file.includes("hero")) expect.push(["blue", blue], ["terracotta", terracotta]);
  if (file.includes("ecosystem-rides")) expect.push(["blue", blue]);
  else if (file.includes("ecosystem-essentials")) expect.push(["olive", olive]);
  else if (file.includes("ecosystem")) expect.push(["terracotta", terracotta]);
  if (file.includes("map")) expect.push(["blue", blue]);
  for (const [name, count] of expect) {
    ok(`${file} accent ${name}`, count > (file.includes("hero-deep") ? 12 : 40), `${count}px`);
  }
}

console.log(report.join("\n"));
const fails = report.filter((r) => r.startsWith("FAIL"));
console.log(`\n${report.length - fails.length}/${report.length} pixel checks passed`);
