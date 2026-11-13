// Second pass: pin specific, hand-checked NASA Image Library IDs so every
// equipment has an authentic, correctly-credited photograph.
import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";

const PINS = {
  opportunity: "PIA20750",
  spirit: "PIA16440",
  curiosity: "PIA16764",
  perseverance: "PIA24542",
  sojourner: "PIA11436",
  ingenuity: "PIA24466",
  lrv: "0102627",
  "lunar-module": "as11-40-5902",
  surveyor: "as12-48-7121",
  lunokhod: "PIA12976",
  viking: "PIA00396",
  insight: "PIA19811",
  phoenix: "PIA10701",
  zhurong: "PIA24914",
  "mars-surface": "PIA20332",
  "moon-surface": "S72-37257",
  "apollo-footprint": "as11-40-5877",
  earthrise: "as08-14-2383",
  "mars-horizon": "PIA17947",
  "lunar-closeup": "PIA12915",
};

const outDir = path.join(process.cwd(), "public", "images");
await mkdir(outDir, { recursive: true });
const creditPath = path.join(process.cwd(), "data", "nasa-credits.json");
const existing = JSON.parse(await readFile(creditPath, "utf8"));
const bySlug = new Map(existing.images.map((i) => [i.slug, i]));

for (const [slug, nasaId] of Object.entries(PINS)) {
  try {
    const metaRes = await fetch(`https://images-api.nasa.gov/search?nasa_id=${encodeURIComponent(nasaId)}`);
    const metaJson = await metaRes.json();
    const meta = metaJson?.collection?.items?.[0]?.data?.[0];
    if (!meta) throw new Error("no metadata");
    const assetRes = await fetch(`https://images-api.nasa.gov/asset/${encodeURIComponent(nasaId)}`);
    const assetJson = await assetRes.json();
    const files = (assetJson?.collection?.items ?? []).map((f) => f.href);
    const pick = (v) => files.find((f) => f.endsWith(`${v}.jpg`));
    const file = pick("~large") ?? pick("~orig") ?? pick("~medium");
    if (!file) throw new Error("no jpg asset");
    const res = await fetch(file);
    if (!res.ok) throw new Error(`http ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength < 50000) throw new Error(`too small ${buf.byteLength}`);
    await writeFile(path.join(outDir, `${slug}.jpg`), buf);
    bySlug.set(slug, {
      slug,
      file: `/images/${slug}.jpg`,
      title: meta.title,
      nasaId,
      credit: meta.secondary_creator || meta.center || "NASA",
      center: meta.center || "",
      date: meta.date_created || "",
      source: `https://images.nasa.gov/details/${nasaId}`,
      bytes: buf.byteLength,
    });
    console.log(`ok  ${slug} <- ${nasaId} (${Math.round(buf.byteLength / 1024)}kB) "${meta.title}"`);
  } catch (err) {
    console.log(`FAIL ${slug}: ${err.message}`);
  }
}

existing.images = [...bySlug.values()];
existing.pinnedAt = new Date().toISOString();
await writeFile(creditPath, JSON.stringify(existing, null, 2) + "\n");
console.log("credits written");
