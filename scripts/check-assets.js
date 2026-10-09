/* Abandoned but not Forgotten — pixel asset check.
 *
 * The interface ships hand-drawn pixel art from Aseprite. Nobody on the build
 * side can eyeball a PNG, so the assets get decoded and asserted instead:
 *
 *   - exact dimensions (pixel art scaled by a non-integer factor is mush)
 *   - the mask contract: assets used as CSS masks are read through their ALPHA
 *     channel, so the shape must live in alpha and the RGB must be uniform.
 *     Aseprite writes mask pixels as opaque black, which is fine for a stencil
 *     and useless as a colour — so this asserts the contract that matters
 *     instead of hoping for white.
 *   - the terrain contract: a repeating ground strip must fade to fully clear
 *     alpha at the bottom (a dithered edge that never reaches zero alpha is
 *     just a gradient with extra steps) and must not seam at the tile join.
 *
 * `--art` prints every sprite as an ASCII map with a palette legend, which is
 * how this art gets reviewed on a machine with no image viewer.
 *
 * Run:  node scripts/check-assets.js [--art]
 * Exit: 0 if every asset matches its spec, 1 otherwise.
 */

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const ROOT = path.join(__dirname, "..");
const DIR = path.join(ROOT, "dist", "assets");
const SHOW_ART = process.argv.includes("--art");

/* What each asset must be, and why. `mask: true` means the file is used as a
   CSS mask and is tinted by the stylesheet, so only its alpha channel is read. */
const SPEC = {
  "ground-moon.png": { width: 32, height: 18, minColors: 5, fadeToClear: true, seamless: true },
  "ground-mars.png": { width: 32, height: 18, minColors: 5, fadeToClear: true, seamless: true },
  // Masks are authored at their final display size on purpose: a CSS mask is
  // rasterised smoothly when scaled, so a 1x sprite blown up to 2x would come
  // out anti-aliased — the opposite of the point.
  "dither.png": { width: 8, height: 8, mask: true },
  "stake.png": { width: 16, height: 28, mask: true },
  // One marker per kind of thing left behind, so the map's shape says WHAT is
  // out there and its colour still says how well we know it. All five share the
  // stake's 16x28 footprint so every mark sits on the same ground line.
  "mark-lander.png": { width: 16, height: 28, mask: true },
  "mark-descent.png": { width: 16, height: 28, mask: true },
  "mark-impact.png": { width: 16, height: 28, mask: true },
  "mark-wreckage.png": { width: 16, height: 28, mask: true },
  "mark-cluster.png": { width: 16, height: 28, mask: true },
  "cancel.png": { width: 14, height: 14, mask: true },
  "site-plan.png": { width: 32, height: 32, mask: true }
};

function decodePng(file) {
  const buf = fs.readFileSync(file);
  const sig = [137, 80, 78, 71, 13, 10, 26, 10];
  for (let i = 0; i < 8; i++) if (buf[i] !== sig[i]) throw new Error("not a PNG");

  let offset = 8;
  let header = null;
  const idat = [];
  while (offset < buf.length) {
    const length = buf.readUInt32BE(offset);
    const type = buf.toString("ascii", offset + 4, offset + 8);
    const data = buf.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      header = {
        width: data.readUInt32BE(0),
        height: data.readUInt32BE(4),
        bitDepth: data[8],
        colorType: data[9],
        interlace: data[12]
      };
    } else if (type === "IDAT") idat.push(data);
    offset += 12 + length;
    if (type === "IEND") break;
  }
  if (!header) throw new Error("no IHDR");
  if (header.bitDepth !== 8) throw new Error("only 8-bit supported");
  if (header.interlace !== 0) throw new Error("interlaced PNG not supported");

  const channels = { 0: 1, 2: 3, 4: 2, 6: 4 }[header.colorType];
  if (!channels) throw new Error("unsupported color type " + header.colorType);

  const raw = zlib.inflateSync(Buffer.concat(idat));
  const bpp = channels;
  const stride = header.width * bpp;
  const out = Buffer.alloc(header.height * stride);

  let pos = 0;
  for (let y = 0; y < header.height; y++) {
    const filter = raw[pos++];
    const line = raw.subarray(pos, pos + stride);
    pos += stride;
    const cur = out.subarray(y * stride, (y + 1) * stride);
    const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : null;

    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? cur[i - bpp] : 0;
      const b = prev ? prev[i] : 0;
      const c = prev && i >= bpp ? prev[i - bpp] : 0;
      const x = line[i];
      let value;
      switch (filter) {
        case 0: value = x; break;
        case 1: value = x + a; break;
        case 2: value = x + b; break;
        case 3: value = x + ((a + b) >> 1); break;
        case 4: {
          const p = a + b - c;
          const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
          value = x + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
          break;
        }
        default: throw new Error("unknown filter " + filter);
      }
      cur[i] = value & 0xff;
    }
  }

  const px = (x, y) => {
    const i = y * header.width * channels + x * channels;
    if (channels === 4) return { r: out[i], g: out[i + 1], b: out[i + 2], a: out[i + 3] };
    if (channels === 2) return { r: out[i], g: out[i], b: out[i], a: out[i + 1] };
    return { r: out[i], g: out[i + 1], b: out[i + 2], a: 255 };
  };

  return { header, channels, px };
}

const LETTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function asciiArt(img, label) {
  const { width, height } = img.header;
  // Only visible pixels count: a clear pixel's RGB is whatever the encoder left
  // there and means nothing.
  const colors = new Map();
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = img.px(x, y);
      if (p.a === 0) continue;
      const key = `${p.r},${p.g},${p.b}`;
      if (!colors.has(key)) colors.set(key, LETTERS[colors.size % LETTERS.length]);
    }
  }
  const isMask = colors.size === 1;

  const lines = [];
  for (let y = 0; y < height; y++) {
    let row = "";
    for (let x = 0; x < width; x++) {
      const p = img.px(x, y);
      if (p.a === 0) row += " ";
      else if (isMask) row += p.a > 192 ? "#" : p.a > 64 ? "+" : ".";
      else {
        const letter = colors.get(`${p.r},${p.g},${p.b}`);
        row += p.a > 250 ? letter : letter.toLowerCase();
      }
    }
    lines.push(`    |${row}|`);
  }

  const legend = isMask
    ? "mask (alpha only: # opaque, + partial, . faint, blank clear)"
    : [...colors.entries()].map(([rgb, letter]) => `${letter}=#${rgb.split(",").map((n) => Number(n).toString(16).padStart(2, "0")).join("")}`).join(" ");

  console.log(`\n  ${label}`);
  console.log(lines.join("\n"));
  console.log(`    ${legend}`);
}

function main() {
  const results = [];
  const check = (name, pass, detail) => results.push({ name, pass: !!pass, detail: detail === undefined ? "" : String(detail) });

  for (const [file, spec] of Object.entries(SPEC)) {
    const full = path.join(DIR, file);
    if (!fs.existsSync(full)) {
      check(`${file} exists`, false, "missing");
      continue;
    }

    let img;
    try {
      img = decodePng(full);
    } catch (err) {
      check(`${file} decodes`, false, err.message);
      continue;
    }

    const { width, height } = img.header;
    check(`${file} is ${spec.width}x${spec.height}`, width === spec.width && height === spec.height, `${width}x${height}`);

    const colors = new Map();
    let clear = 0, opaque = 0, partial = 0;
    const alphaByRow = [];
    for (let y = 0; y < height; y++) {
      let rowMax = 0;
      for (let x = 0; x < width; x++) {
        const p = img.px(x, y);
        if (p.a > 0) colors.set(`${p.r},${p.g},${p.b}`, (colors.get(`${p.r},${p.g},${p.b}`) || 0) + 1);
        if (p.a === 0) clear++;
        else if (p.a === 255) opaque++;
        else partial++;
        rowMax = Math.max(rowMax, p.a);
      }
      alphaByRow.push(rowMax);
    }

    // The mask contract: CSS reads masks through alpha, so RGB only has to be
    // uniform for the tint to be predictable.
    if (spec.mask) {
      check(`${file} is a uniform-colour stencil`, colors.size === 1, `${colors.size} visible rgb value(s)`);
      check(`${file} carries a shape in alpha`, opaque > 0 && clear > 0, `${opaque} opaque / ${clear} clear`);
      check(`${file} has no soft edges`, partial === 0, `${partial} partial-alpha px`);
    }
    if (spec.minColors) {
      check(`${file} has a real palette`, colors.size >= spec.minColors, `${colors.size} colours`);
    }
    if (spec.fadeToClear) {
      const bottom = alphaByRow[height - 1];
      const above = alphaByRow[height - 2];
      check(`${file} fades to fully clear (no hard cut)`, bottom === 0 && above <= 64, `last row max=${bottom}, row above=${above}`);
    }
    if (spec.seamless) {
      // A strip tiles cleanly when the join looks like any other point in the
      // row. Two things can spoil that: a colour step at the join that exists
      // nowhere inside the row, or a dithered rhythm whose gap across the join
      // does not match the gaps inside it. Comparing *invisible* pixels' RGB
      // (as an earlier version of this check did) proves nothing — a clear
      // pixel's colour is whatever the encoder left behind.
      const seen = (p) => p.a > 0;
      const dist = (p, q) => Math.abs(p.r - q.r) + Math.abs(p.g - q.g) + Math.abs(p.b - q.b);
      const faults = [];

      for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) row.push(img.px(x, y));
        const left = row[0];
        const right = row[width - 1];

        if (seen(left) && seen(right)) {
          const interior = [];
          for (let x = 0; x < width - 1; x++) {
            if (seen(row[x]) && seen(row[x + 1])) interior.push(dist(row[x], row[x + 1]));
          }
          const ceiling = interior.length ? Math.max(...interior) : 0;
          const join = dist(right, left);
          if (join > ceiling) faults.push(`row ${y}: join colour step ${join} > interior max ${ceiling}`);
        } else if (seen(left) !== seen(right)) {
          const drawn = [];
          for (let x = 0; x < width; x++) if (seen(row[x])) drawn.push(x);
          if (drawn.length > 1) {
            const gaps = [];
            for (let i = 1; i < drawn.length; i++) gaps.push(drawn[i] - drawn[i - 1]);
            const modal = gaps.slice().sort((a, b) => a - b)[Math.floor(gaps.length / 2)];
            const joinGap = width - 1 - drawn[drawn.length - 1] + drawn[0] + 1;
            if (Math.abs(joinGap - modal) > 1) faults.push(`row ${y}: join gap ${joinGap} vs interior rhythm ${modal}`);
          }
        }
      }
      check(`${file} is horizontally tileable`, faults.length === 0, faults.slice(0, 3).join(" | ") || "join matches interior rhythm");
    }

    if (SHOW_ART) asciiArt(img, file);
  }

  console.log("");
  const failed = results.filter((r) => !r.pass);
  for (const r of results) {
    console.log(`  ${r.pass ? "PASS" : "FAIL"}  ${r.name}${r.detail ? `  [${r.detail}]` : ""}`);
  }
  console.log("");
  console.log(failed.length === 0 ? "ALL ASSET CHECKS PASSED" : `${failed.length} ASSET CHECK(S) FAILED`);
  process.exit(failed.length === 0 ? 0 : 1);
}

main();
