import { PNG } from "pngjs";
import fs from "node:fs";

/* Grid-scan the whole frame for horizontal streaking, skipping columns that
   are DOM overlays. Reports a coarse map so the artifact can be located
   without guessing coordinates. */
const inp = process.argv[2];
const png = PNG.sync.read(fs.readFileSync(inp));
const COLS = 16, ROWS = 10;
const luma = (x, y) => {
  const i = (png.width * y + x) << 2;
  return 0.2126 * png.data[i] + 0.7152 * png.data[i + 1] + 0.0722 * png.data[i + 2];
};
console.log(`${inp} ${png.width}x${png.height} — h/v streak ratio per cell (>1.6 = streaked)`);
for (let r = 0; r < ROWS; r++) {
  let line = "  ";
  for (let c = 0; c < COLS; c++) {
    const x0 = Math.floor((c * png.width) / COLS), x1 = Math.floor(((c + 1) * png.width) / COLS);
    const y0 = Math.floor((r * png.height) / ROWS), y1 = Math.floor(((r + 1) * png.height) / ROWS);
    let h = 0, hn = 0;
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1 - 1; x++) { h += Math.abs(luma(x + 1, y) - luma(x, y)); hn++; }
    let v = 0, vn = 0;
    for (let y = y0; y < y1 - 1; y++) for (let x = x0; x < x1; x++) { v += Math.abs(luma(x, y + 1) - luma(x, y)); vn++; }
    h /= hn; v /= vn;
    const q = v > 0.01 ? h / v : 99;
    line += q > 2.4 ? " @ " : q > 1.6 ? " # " : q > 1.15 ? " + " : " . ";
  }
  console.log(`r${String(r).padStart(2)}${line}`);
}
console.log("\n @ >2.4   # >1.6   + >1.15   . smooth");