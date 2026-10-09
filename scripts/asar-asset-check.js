#!/usr/bin/env npx electron
/*
 * Do the sprites actually load out of the packaged app.asar?
 *
 * `scripts/package.js` proves the asar *contains* dist/assets/ and that every
 * shipped byte matches the verified build. That is necessary but it is not the
 * same claim as "the packaged window can use them": inside an asar the sprites
 * are not files on disk, they are entries in a virtual filesystem that Electron
 * has to serve through file://, and a relative `url(assets/stake.png)` in the
 * stylesheet has to resolve back into that archive.
 *
 * This runs the packaged index.html in a real window and asserts the pixels
 * arrive: each sprite loads, at its true 1:1 size, and a mask-image computed
 * style resolves to a URL inside the asar rather than to nothing. It is the
 * check that would have caught the build whose dist/assets/ directory did not
 * exist — the CSS was correct, the archive simply had no bytes behind it.
 *
 * Run with: npm run package:assets   (after npm run package)
 */

const { app, BrowserWindow } = require("electron");
const path = require("path");
const fs = require("fs");

const ROOT = path.join(__dirname, "..");
const ASAR = path.join(ROOT, "release", "abandoned-but-not-forgotten-win32-x64", "resources", "app.asar");
const INDEX = path.join(ASAR, "dist", "index.html");

/*
 * Expected 1:1 sizes, taken from the Aseprite sources rather than from whatever
 * the export happens to produce — a sprite exported at 2x would still "load",
 * and would silently break the pixel grid the design depends on.
 */
const SPRITES = {
  "assets/site-plan.png": [32, 32],
  "assets/ground-moon.png": [32, 18],
  "assets/ground-mars.png": [32, 18],
  "assets/stake.png": [16, 28],
  "assets/dither.png": [8, 8],
  "assets/cancel.png": [14, 14],
  "assets/mark-lander.png": [16, 28],
  "assets/mark-descent.png": [16, 28],
  "assets/mark-impact.png": [16, 28],
  "assets/mark-wreckage.png": [16, 28],
  "assets/mark-cluster.png": [16, 28]
};

// Vendored NASA imagery ships locally so the offline archive stays offline
// (connect-src 'none'). No exact-size contract — just has to load.
const NASA_IMAGES = [
  "assets/nasa-PIA12910.jpg",
  "assets/nasa-PIA21131.jpg"
];

const results = [];
const check = (name, pass, detail) => results.push({ name, pass, detail: detail || "" });

app.whenReady().then(async () => {
  if (!fs.existsSync(INDEX)) {
    console.log("");
    console.log(`  FAIL  no packaged UI at ${path.relative(ROOT, INDEX)} — run npm run package first`);
    app.exit(1);
    return;
  }

  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    show: false,
    webPreferences: { devTools: false, contextIsolation: true, sandbox: true }
  });

  const rendererErrors = [];
  win.webContents.on("console-message", (event) => {
    if (event.level >= 3) rendererErrors.push(String(event.message).slice(0, 200));
  });
  win.webContents.on("did-fail-load", (_e, code, desc, url) => {
    rendererErrors.push(`did-fail-load ${code} ${desc} ${url}`);
  });

  await win.loadFile(INDEX);
  await new Promise((r) => setTimeout(r, 700));

  const observed = await win.webContents.executeJavaScript(`(async () => {
    const names = ${JSON.stringify(Object.keys(SPRITES))};
    const nasaNames = ${JSON.stringify(NASA_IMAGES)};
    const loaded = {};
    for (const name of names.concat(nasaNames)) {
      const img = new Image();
      loaded[name] = await new Promise((res) => {
        img.onload = () => res([img.naturalWidth, img.naturalHeight]);
        img.onerror = () => res(null);
        img.src = name;
      });
    }
    const mark = document.querySelector('.mark');
    const style = mark ? getComputedStyle(mark) : null;
    return {
      loaded,
      maskUrl: style ? (style.webkitMaskImage || style.maskImage || '') : '',
      inlineBackground: style ? style.backgroundImage : ''
    };
  })()`);

  for (const [name, expected] of Object.entries(SPRITES)) {
    const got = observed.loaded[name];
    check(
      `${name} loads out of the asar at ${expected[0]}x${expected[1]}`,
      Array.isArray(got) && got[0] === expected[0] && got[1] === expected[1],
      got ? `${got[0]}x${got[1]}` : "failed to load"
    );
  }

  for (const name of NASA_IMAGES) {
    const got = observed.loaded[name];
    check(
      `${name} loads out of the asar`,
      Array.isArray(got) && got[0] > 0 && got[1] > 0,
      got ? `${got[0]}x${got[1]}` : "failed to load"
    );
  }

  /*
   * A loaded sprite is not the same as a wired-up sprite: this asserts the
   * computed mask URL actually points into app.asar, so the element that paints
   * the site plan is reading the archived file and not a fallback or nothing.
   */
  check(
    "a mask-image computed style resolves into app.asar",
    observed.maskUrl.includes("app.asar") && observed.maskUrl.includes("assets/"),
    observed.maskUrl ? observed.maskUrl.replace(/^.*app\.asar/, "app.asar").replace(/\\/g, "/") : "(empty)"
  );

  check("the packaged renderer reports no console errors", rendererErrors.length === 0, rendererErrors.join(" || ") || "clean");

  console.log("");
  for (const r of results) {
    console.log(`  ${r.pass ? "PASS" : "FAIL"}  ${r.name}${r.detail ? `  [${r.detail.slice(0, 160)}]` : ""}`);
  }
  const failed = results.filter((r) => !r.pass);
  console.log("");
  console.log(failed.length === 0 ? "ALL PACKAGED ASSET CHECKS PASSED" : `${failed.length} PACKAGED ASSET CHECK(S) FAILED`);
  console.log("");
  app.exit(failed.length === 0 ? 0 : 1);
});
