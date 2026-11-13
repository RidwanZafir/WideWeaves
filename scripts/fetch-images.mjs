// Downloads public-domain NASA imagery for AFTERLIGHT from the NASA Image and
// Video Library API (no key required) and records per-image credit metadata.
// Run with: npm run assets:images
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const SHOTS = [
  { slug: "opportunity", q: ["opportunity rover mars surface", "opportunity rover", "mer opportunity panorama"] },
  { slug: "spirit", q: ["spirit rover mars surface", "spirit rover"] },
  { slug: "curiosity", q: ["curiosity rover self portrait", "curiosity rover mars", "msl curiosity panorama"] },
  { slug: "perseverance", q: ["perseverance rover selfie", "perseverance rover mars surface"] },
  { slug: "sojourner", q: ["sojourner rover mars", "pathfinder rover sojourner", "mars pathfinder"] },
  { slug: "ingenuity", q: ["ingenuity helicopter mars", "ingenuity mars helicopter"] },
  { slug: "lrv", q: ["lunar roving vehicle apollo 16", "lunar roving vehicle"] },
  { slug: "lunar-module", q: ["apollo 11 lunar module eagle surface", "apollo lunar module moon"] },
  { slug: "surveyor", q: ["surveyor 3 apollo 12", "surveyor 3 moon"] },
  { slug: "lunokhod", q: ["lunokhod lunar rover", "luna 17"] },
  { slug: "viking", q: ["viking 1 lander mars", "viking mars lander"] },
  { slug: "insight", q: ["insight lander mars", "insight mars"] },
  { slug: "phoenix", q: ["phoenix lander mars", "phoenix mars arctic"] },
  { slug: "zhurong", q: ["zhurong rover mars", "tianwen-1"] },
  { slug: "mars-surface", q: ["mars panorama gale crater", "mars panorama mount sharp"] },
  { slug: "moon-surface", q: ["apollo 17 lunar surface", "apollo 15 lunar surface"] },
  { slug: "apollo-footprint", q: ["apollo 11 bootprint lunar", "apollo 11 footprint"] },
  { slug: "earthrise", q: ["earthrise apollo 8", "earth from moon"] },
  { slug: "mars-horizon", q: ["mars horizon curiosity", "mars sunset curiosity"] },
  { slug: "lunar-closeup", q: ["moon crater lro", "lunar reconnaissance orbiter crater"] },
];

const outDir = path.join(process.cwd(), "public", "images");
await mkdir(outDir, { recursive: true });
const credits = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`http ${res.status}`);
  return res.json();
}

async function bestFile(nasaId) {
  const asset = await fetchJson(`https://images-api.nasa.gov/asset/${encodeURIComponent(nasaId)}`);
  const files = (asset?.collection?.items ?? []).map((f) => f.href).filter(Boolean);
  const byVariant = (v) => files.find((f) => f.endsWith(`${v}.jpg`));
  return byVariant("~large") ?? byVariant("~medium") ?? byVariant("~orig") ?? byVariant("~small");
}

for (const shot of SHOTS) {
  let saved = null;
  outer: for (const query of shot.q) {
    let items = [];
    try {
      const json = await fetchJson(
        `https://images-api.nasa.gov/search?media_type=image&page_size=10&q=${encodeURIComponent(query)}`,
      );
      items = (json?.collection?.items ?? []).filter((i) => i?.data?.[0]?.nasa_id);
    } catch {
      continue;
    }
    for (const item of items.slice(0, 6)) {
      const meta = item.data[0];
      try {
        const file = await bestFile(meta.nasa_id);
        if (!file) continue;
        const imgRes = await fetch(file);
        if (!imgRes.ok) continue;
        const buf = Buffer.from(await imgRes.arrayBuffer());
        if (buf.byteLength < 90000) continue;
        const filename = `${shot.slug}.jpg`;
        await writeFile(path.join(outDir, filename), buf);
        saved = {
          slug: shot.slug,
          file: `/images/${filename}`,
          title: meta.title,
          nasaId: meta.nasa_id,
          credit: meta.secondary_creator || meta.center || "NASA",
          center: meta.center || "",
          date: meta.date_created || "",
          source: `https://images.nasa.gov/details/${meta.nasa_id}`,
          bytes: buf.byteLength,
          query,
        };
        console.log(`ok  ${shot.slug} <- ${meta.nasa_id} (${Math.round(buf.byteLength / 1024)}kB) "${meta.title}"`);
        break outer;
      } catch {
        /* try next candidate */
      }
    }
    await sleep(120);
  }
  if (!saved) {
    console.log(`FAIL ${shot.slug}`);
    credits.push({ slug: shot.slug, file: null });
  } else {
    credits.push(saved);
  }
  await sleep(200);
}

await writeFile(
  path.join(process.cwd(), "data", "nasa-credits.json"),
  JSON.stringify({ fetchedAt: new Date().toISOString(), images: credits }, null, 2) + "\n",
);
console.log(`\n${credits.filter((c) => c.file).length}/${SHOTS.length} images saved`);
