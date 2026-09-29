import { PNG } from "pngjs";
import fs from "node:fs";

/* Crop a region out of a PNG: node scripts/_crop.mjs in.png out.png x y w h */
const [inp, outp, x, y, w, h] = process.argv.slice(2);
const src = PNG.sync.read(fs.readFileSync(inp));
const X = Number(x), Y = Number(y), W = Number(w), H = Number(h);
const dst = new PNG({ width: W, height: H });
for (let j = 0; j < H; j++) {
  for (let i = 0; i < W; i++) {
    const sx = Math.min(src.width - 1, Math.max(0, X + i));
    const sy = Math.min(src.height - 1, Math.max(0, Y + j));
    const s = (sy * src.width + sx) * 4;
    const d = (j * W + i) * 4;
    dst.data[d] = src.data[s];
    dst.data[d + 1] = src.data[s + 1];
    dst.data[d + 2] = src.data[s + 2];
    dst.data[d + 3] = 255;
  }
}
fs.writeFileSync(outp, PNG.sync.write(dst));
console.log(`crop ${inp} [${X},${Y} ${W}x${H}] -> ${outp}`);
