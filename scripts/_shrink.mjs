import { PNG } from "pngjs";
import { readFileSync, writeFileSync } from "node:fs";

/* half-resolution box filter: keeps screenshots small enough to review */
const [src, dst, factorArg] = process.argv.slice(2);
/* integer only: the box filter indexes the source by x*factor, so a fractional
   factor walks off the row and the output comes back as garbage. */
const factor = Math.max(1, Math.round(Number(factorArg || 2)));
const png = PNG.sync.read(readFileSync(src));
const w = Math.floor(png.width / factor);
const h = Math.floor(png.height / factor);
const out = new PNG({ width: w, height: h });
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    let r = 0;
    let g = 0;
    let b = 0;
    let n = 0;
    for (let dy = 0; dy < factor; dy++) {
      for (let dx = 0; dx < factor; dx++) {
        const sx = x * factor + dx;
        const sy = y * factor + dy;
        const i = (png.width * sy + sx) << 2;
        r += png.data[i];
        g += png.data[i + 1];
        b += png.data[i + 2];
        n++;
      }
    }
    const o = (w * y + x) << 2;
    out.data[o] = r / n;
    out.data[o + 1] = g / n;
    out.data[o + 2] = b / n;
    out.data[o + 3] = 255;
  }
}
writeFileSync(dst, PNG.sync.write(out));
console.log(`shrunk ${src} -> ${dst} (${w}x${h})`);
