/* Abandoned but not Forgotten — visual capture.
 *
 * Design review needs eyes on pixels, not DOM assertions. This boots the real
 * window, freezes animation, drives the app into each key state, and writes
 * PNGs plus a self-contained contact sheet you can open anywhere.
 *
 * Run:  npx electron scripts/shots.js
 * Out:  shots/*.png  shots/contact-sheet.html
 */

const { app, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const os = require("os");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "shots");
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "abnf-shots-"));

app.setPath("userData", TMP);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const { initDb, closeDb } = require(path.join(ROOT, "src", "db"));
  const { seedIfEmpty } = require(path.join(ROOT, "src", "seed"));
  const { registerHandlers } = require(path.join(ROOT, "src", "renderer-handlers"));

  await initDb({ userDataDir: TMP });
  await seedIfEmpty();
  registerHandlers({ ipcMain });

  fs.mkdirSync(OUT, { recursive: true });

  // Same shipping window factory the app uses, so captures show the real thing.
  const { createWindow } = require(path.join(ROOT, "src", "window"));
  const win = createWindow({ width: 1440, height: 900, show: false });

  const run = (js) => win.webContents.executeJavaScript(js, true);

  // The window settles asynchronously: the search is debounced and every
  // selection is an IPC round trip. Steps that depend on a previous step wait
  // for the state they need instead of trusting a fixed sleep — a fixed sleep
  // is what made this capture intermittently throw while six PNG encodes were
  // competing for the main process. The wait is bounded and throws, so a real
  // regression still fails loudly.
  async function waitFor(js, label, timeout = 6000) {
    const started = Date.now();
    for (;;) {
      if (await run(js)) return;
      if (Date.now() - started > timeout) {
        throw new Error(`timed out waiting for ${label}`);
      }
      await sleep(100);
    }
  }

  await win.loadFile(path.join(ROOT, "dist", "index.html"));
  await sleep(600);

  // Freeze motion so captures are deterministic.
  await win.webContents.insertCSS(
    "*, *::before, *::after { animation: none !important; transition: none !important; }"
  );

  // capturePage on a never-shown window can come back blank on Windows.
  win.showInactive();
  await sleep(500);

  const shots = [];

  async function shot(name, caption) {
    await sleep(420);
    const img = await win.webContents.capturePage();
    const png = img.toPNG();
    const file = path.join(OUT, `${name}.png`);
    fs.writeFileSync(file, png);
    shots.push({ name, caption, file, bytes: png.length });
    console.log(`  ${png.length > 20000 ? "OK  " : "BLANK?"} ${name}.png  ${Math.round(png.length / 1024)} KB`);
  }

  // 1 — the forgetting: what the app says before you open anything
  await waitFor(`!!document.querySelector('.intro .map-ground')`, 'the archive map to draw');
  await shot("01-intro", "The stakes and the archive map, before you open a record");

  // 2 — a well-documented record, the happy path
  await run(`Array.from(document.querySelectorAll('#record-list .row'))
    .find(r => /Surveyor/.test(r.textContent)).click()`);
  await waitFor(`!!document.querySelector('#record .block-label')`, 'the Surveyor record to open');
  await shot("02-record-moon", "Surveyor 1 — high certainty, full provenance");

  // 3 — an honest-uncertainty record: the concept's core claim
  await run(`Array.from(document.querySelectorAll('#record-list .row'))
    .find(r => /Schiaparelli/.test(r.textContent)).click()`);
  await shot("03-record-uncertain", "Schiaparelli — wreckage, reasoned uncertainty");

  // 4 — the aggregate record that exists because the pattern matters
  await run(`Array.from(document.querySelectorAll('#record-list .row'))
    .find(r => /Mars landing failures/.test(r.textContent)).click()`);
  await shot("04-record-pattern", "The failure pattern as a first-class record");

  // 5 — filtering
  await run(`document.querySelector('#world-filters .chip[data-world="mars"]').click()`);
  await waitFor(`document.querySelectorAll('#record-list li').length === 2`, 'the Mars filter to narrow the rail');
  await shot("05-filter-mars", "World filter narrowing the rail");

  // 6 — search reaching into lessons, not just titles
  await run(`document.querySelector('#world-filters .chip[data-world=""]').click()`);
  await sleep(300);
  await run(`(() => { const s = document.getElementById('search'); s.value = 'collision';
    s.dispatchEvent(new Event('input', { bubbles: true })); })()`);
  await waitFor(`document.querySelectorAll('#record-list li').length === 1`, 'the search to narrow the rail to one record');
  await shot("06-search-lesson", "Search reaching into lessons, not just titles");

  // 7 — the workflow: a proposed next action being written
  await run(`(() => { const s = document.getElementById('search'); s.value = '';
    s.dispatchEvent(new Event('input', { bubbles: true })); })()`);
  await waitFor(
    `Array.from(document.querySelectorAll('#record-list .row')).some(r => /Surveyor/.test(r.textContent))`,
    'the unfiltered rail before a record is opened'
  );
  await sleep(200);
  await run(`Array.from(document.querySelectorAll('#record-list .row'))
    .find(r => /Surveyor/.test(r.textContent)).click()`);
  await waitFor(`!!document.getElementById('action-form')`, 'the next-action form after the record opens');
  await sleep(150);
  await run(`(() => {
    document.getElementById('action-text').value = 'Reconcile the site boundary against the latest LRO imagery before any future landing is planned nearby.';
    document.getElementById('action-why').value = 'Two separate landing-site studies currently quote different radii for the same hardware.';
    document.getElementById('action-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  })()`);
  await shot("07-workflow", "A reviewer proposing the next action, written to disk");

  // 8 — responsive: the provenance column yields below 1180px
  win.setContentSize(1080, 860);
  await shot("08-narrow", "Below 1180px all three columns tighten; the write path stays reachable");

  win.setContentSize(1440, 900);

  // ---- contact sheet ------------------------------------------------------
  const escaped = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const cells = shots
    .map((s) => {
      const b64 = fs.readFileSync(s.file).toString("base64");
      return `<figure><figcaption><b>${escaped(s.name)}</b><span>${escaped(s.caption)}</span></figcaption><img src="data:image/png;base64,${b64}" alt="${escaped(s.caption)}"></figure>`;
    })
    .join("\n");

  fs.writeFileSync(
    path.join(OUT, "contact-sheet.html"),
    `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Abandoned but Not Forgotten — capture</title>
<style>
  body { margin:0; padding:32px; background:#0a0c12; color:#e9e3d5;
         font:14px/1.5 "Segoe UI", system-ui, sans-serif; }
  h1 { font-size:18px; font-weight:600; letter-spacing:.04em; margin:0 0 4px; }
  .sub { color:#7a8798; margin:0 0 32px; font-size:12px; }
  figure { margin:0 0 44px; }
  figcaption { display:flex; gap:12px; align-items:baseline; margin-bottom:10px;
               font-size:12px; color:#7a8798; }
  figcaption b { color:#c98b4b; font-weight:600; letter-spacing:.08em; }
  img { width:100%; height:auto; display:block; border:1px solid #1d2531; border-radius:6px; }
</style></head><body>
<h1>Abandoned but not Forgotten — rendered states</h1>
<p class="sub">${shots.length} captures from the real Electron window (1440x900, frozen motion). Generated ${new Date().toISOString()}.</p>
${cells}
</body></html>`
  );

  const blank = shots.filter((s) => s.bytes <= 20000);
  console.log("");
  console.log(blank.length === 0 ? "ALL CAPTURES RENDERED CONTENT" : `${blank.length} CAPTURE(S) LOOK BLANK`);
  console.log(`contact sheet: ${path.join(OUT, "contact-sheet.html")}`);

  closeDb();
  try {
    fs.rmSync(TMP, { recursive: true, force: true });
  } catch (_) {}

  app.exit(blank.length === 0 ? 0 : 1);
}

app.whenReady().then(() =>
  main().catch((err) => {
    console.log("CAPTURE FAILED");
    console.log(err && err.stack ? err.stack : String(err));
    app.exit(1);
  })
);
