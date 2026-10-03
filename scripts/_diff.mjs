import { PNG } from "pngjs";
import fs from "node:fs";

/* node scripts/_diff.mjs a.png b.png [x y w h]
   Per-row horizontal-streak energy. The banding in the bug report is rows of
   long horizontal runs, so: for each row, measure how strongly neighbouring
   pixels in the SAME row agree while rows disagree — i.e. the ratio of
   horizontal to vertical gradient energy. Streaky regions score high. */
const [a, b, xs, ys, ws, hs] = process.argv.slice(2);
const A = PNG.sync.read(fs.readFileSync(a));
const B = PNG.sync.read(fs.readFileSync(b));
const X = Number(xs || 0), Y = Number(ys || 0);
const W = Number(ws || A.width - X), H = Number(ws ? hs || A.height - Y : A.height - Y);
const luma = (p, x, y) => {
  const i = (p.width * y + x) << 2;
  return 0.2126 * p.data[i] + 0.7152 * p.data[i + 1] + 0.0722 * p.data[i + 2];
};
const score = (P) => {
  let hz = 0, vt = 0;
  for (let y = Y; y < Y + H; y++) {
    for (let x = X; x < X + W - 1; x++) hz += Math.abs(luma(P, x, y) - luma(P, x + 1, y));
    for (let y2 = Y; y2 < Y + H - 1; y2++)
      for (let x = X; x < X + W; x++) vt += Math.abs(luma(P, x, y2) - luma(P, x, y2 + 1));
  }
  return { hz: hz / (H * (W - 1)), vt: vt / ((H - 1) * W), ratio: hz / (H * (W - 1)) / (vt / ((H - 1) * W)) };
};
const sa = score(A), sb = score(B);
console.log(`region [${X},${Y} ${W}x${H}]`);
console.log(`  ${a}`);
console.log(`    horiz grad ${sa.hz.toFixed(2)}  vert grad ${sa.vt.toFixed(2)}  H/V ${sa.ratio.toFixed(2)}`);
console.log(`  ${b}`);
console.log(`    horiz grad ${sb.hz.toFixed(2)}  vert grad ${sb.vt.toFixed(2)}  H/V ${sb.ratio.toFixed(2)}`);
console.log(`\n  ratio change: ${sb.ratio > sa.ratio ? "MORE horizontal" : "LESS horizontal"} streaking`);