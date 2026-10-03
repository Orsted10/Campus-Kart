import { PNG } from "pngjs";
import fs from "node:fs";

/* Per-row streak scan. The artifact is long HORIZONTAL runs: within a row,
   neighbouring pixels differ a lot (because the streak edges are vertical
   discontinuities) while vertically the row is smeared smooth. Measure, per row:
     h = mean |luma(x+1,y) - luma(x,y)|   (edge energy along the row)
     v = mean |luma(x,y+1) - luma(x,y)|   (edge energy between rows)
   A horizontally-streaked, vertically-smeared region has v << h. */
const inp = process.argv[2];
const png = PNG.sync.read(fs.readFileSync(inp));
const X0 = Number(process.argv[3] || 120);
const X1 = Number(process.argv[4] || 1320);
const Y0 = Number(process.argv[5] || 560);
const Y1 = Number(process.argv[6] || 800);
const luma = (x, y) => {
  const i = (png.width * y + x) << 2;
  return 0.2126 * png.data[i] + 0.7152 * png.data[i + 1] + 0.0722 * png.data[i + 2];
};
console.log(`${inp}  rows ${Y0}..${Y1}   (streak if h/v > 1.6)`);
console.log("   y :    h      v    h/v");
for (let y = Y0; y < Y1; y += 4) {
  let h = 0, hn = 0;
  for (let x = X0; x < X1 - 1; x++) { h += Math.abs(luma(x + 1, y) - luma(x, y)); hn++; }
  let v = 0, vn = 0;
  for (let x = X0; x < X1; x++) { v += Math.abs(luma(x, y + 1) - luma(x, y)); vn++; }
  h /= hn; v /= vn;
  const r = v > 0.01 ? h / v : 99;
  const flag = r > 1.6 ? "  <== STREAK" : "";
  console.log(`${String(y).padStart(5)}: ${h.toFixed(2).padStart(6)} ${v.toFixed(2).padStart(6)} ${r.toFixed(2).padStart(6)}${flag}`);
}