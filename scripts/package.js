#!/usr/bin/env node
/*
 * Packaging, as an allowlist instead of a blacklist.
 *
 * `npm run package` previously handed electron-packager the whole repository and
 * trusted it to drop what was not needed. Opening the resulting asar showed two
 * things wrong with that, neither of which was visible from the repository:
 *
 *   1. The shipped app contained no `dist/assets/` at all. The build predated
 *      the sprite work, so every CSS mask in the .exe pointed at a file that was
 *      not there and the pixel-art identity was simply absent from the artifact,
 *      while the repository looked correct.
 *   2. A blacklist cannot enumerate what it does not know about. The build
 *      shipped `findings.md`, `progress.md`, `task_plan.md`, `TALK_TRACK.md`,
 *      the eight capture PNGs and their 1.4 MB contact sheet, the verification
 *      harnesses, `.freebuff/project-id`, and roughly 39 MB of
 *      electron-packager's own hoisted transitive dependencies (`undici`,
 *      `@types/node`, `semver`, `sumchecker`, …). None of that belongs in a
 *      judge-facing artifact.
 *
 * So the filter is inverted: an allowlist of exactly what the app reads at
 * runtime. Anything added to this repository later — a new harness, a design
 * capture, a planning note — is excluded by default rather than by remembering
 * to exclude it. Module pruning is off (`prune: false`) because the pruner walks
 * the dependency graph rather than a list; with the allowlist as the single
 * source of truth there is nothing left for it to decide.
 *
 * Packing alone is not proof, so the script then reads the asar back and
 * asserts the shipped contract: every runtime file present, every sprite
 * present, no development artifact present, and — the part that catches a stale
 * build — the packaged `dist/` byte-identical to the `dist/` this repository
 * just verified. `--verify-only` runs that check against an existing artifact
 * without repacking.
 *
 * `--boot` goes one step further and runs the actual .exe against a throwaway
 * user-data directory, then asserts the window came up and sql.js loaded its
 * wasm out of the archive. That last one matters: sql.js reads its .wasm with
 * fs.readFileSync, so a packaging mistake there fails inside the archive and
 * nowhere else. The temp directory is passed with --user-data-dir, so a boot
 * test never touches the real archive in %APPDATA%.
 */

const path = require("path");
const fs = require("fs");
const os = require("os");
const crypto = require("crypto");
const { spawn, execFileSync } = require("child_process");
const asar = require("@electron/asar");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "release");
const NAME = "abandoned-but-not-forgotten";
const PLATFORM = "win32";
const ARCH = "x64";
const BUNDLE = path.join(OUT, `${NAME}-${PLATFORM}-${ARCH}`);
const ARCHIVE = path.join(BUNDLE, "resources", "app.asar");

/*
 * sql.js is the only runtime dependency. Ship the wasm build and its licence —
 * not the asm fallbacks, the worker builds, the zipped dists, the source maps,
 * or the devcontainer, which together are most of the package's bulk.
 */
const SQLJS_KEPT = [
  "/node_modules/sql.js/package.json",
  "/node_modules/sql.js/LICENSE",
  "/node_modules/sql.js/dist",
  "/node_modules/sql.js/dist/sql-wasm.js",
  "/node_modules/sql.js/dist/sql-wasm.wasm"
];

/*
 * Paths arrive normalised with forward slashes and a leading slash, relative to
 * the app directory (see electron-packager's copy-filter: the name is whatever
 * follows the resolved source dir). Directories have to be allowed too, or the
 * packager never descends into them.
 */
function keep(name) {
  if (name === "" || name === "/") return true;
  if (name === "/package.json" || name === "/main.js") return true;
  if (name === "/dist" || name.startsWith("/dist/")) return true;
  if (name === "/src" || name.startsWith("/src/")) return true;
  if (name === "/node_modules" || name === "/node_modules/sql.js") return true;
  if (SQLJS_KEPT.includes(name)) return true;
  return false;
}

/* ---- the contract the artifact has to satisfy --------------------------- */

const REQUIRED = [
  "/package.json",
  "/main.js",
  "/dist/index.html",
  "/dist/styles.css",
  "/dist/app.js",
  "/dist/assets/cancel.png",
  "/dist/assets/dither.png",
  "/dist/assets/ground-mars.png",
  "/dist/assets/ground-moon.png",
  "/dist/assets/site-plan.png",
  "/dist/assets/stake.png",
  "/dist/assets/mark-lander.png",
  "/dist/assets/mark-descent.png",
  "/dist/assets/mark-impact.png",
  "/dist/assets/mark-wreckage.png",
  "/dist/assets/mark-cluster.png",
  "/dist/assets/nasa-PIA12910.jpg",
  "/dist/assets/nasa-PIA21131.jpg",
  "/dist/assets/yt-S9HdPi9Ikhk.jpg",
  "/dist/assets/yt-nr5Pj6GQL2o.jpg",
  "/dist/assets/yt-C43KXGQuUuY.jpg",
  "/dist/assets/yt-Ki_Af_o9Q9s.jpg",
  "/src/db.js",
  "/src/preload.js",
  "/src/renderer-handlers.js",
  "/src/seed.js",
  "/src/window.js",
  "/node_modules/sql.js/package.json",
  "/node_modules/sql.js/dist/sql-wasm.js",
  "/node_modules/sql.js/dist/sql-wasm.wasm"
];

const FORBIDDEN = [
  "/shots",
  "/scripts",
  "/assets-src",
  "/release",
  "/.freebuff",
  "/.gitignore",
  "/data",
  "/findings.md",
  "/progress.md",
  "/task_plan.md",
  "/TALK_TRACK.md",
  "/node_modules/electron",
  "/node_modules/electron-packager",
  "/node_modules/undici",
  "/node_modules/undici-types",
  "/node_modules/@types",
  "/node_modules/@electron",
  "/node_modules/@electron-internal",
  "/node_modules/semver",
  "/node_modules/sumchecker",
  "/node_modules/progress",
  "/node_modules/galactus",
  "/node_modules/sql.js/.devcontainer",
  "/node_modules/sql.js/dist/sql-asm.js",
  "/node_modules/sql.js/dist/sql-wasm-debug.wasm",
  "/node_modules/sql.js/dist/sqljs-all.zip"
];

const SHIPPED_DIST = ["index.html", "styles.css", "app.js"].concat(
  fs
    .readdirSync(path.join(ROOT, "dist", "assets"))
    .sort()
    .map((f) => `assets/${f}`)
);

function verify() {
  if (!fs.existsSync(ARCHIVE)) {
    console.log(`  FAIL  no artifact at ${path.relative(ROOT, ARCHIVE)} — run npm run package first`);
    return 1;
  }

  const entries = asar.listPackage(ARCHIVE).map((e) => e.replace(/\\/g, "/"));
  const set = new Set(entries);
  const has = (target) => set.has(target);
  const under = (dir) => entries.some((e) => e === dir || e.startsWith(`${dir}/`));

  const results = [];
  const check = (name, pass, detail) => results.push({ name, pass, detail: detail || "" });

  for (const f of REQUIRED) {
    check(`ships ${f}`, has(f));
  }

  for (const d of FORBIDDEN) {
    check(`does not ship ${d}`, !under(d));
  }

  /*
   * The stale-build guard. A packaged dist that differs from the repository
   * dist by one byte means the shipped UI is not the UI the harnesses passed,
   * which is exactly how the missing sprites went unnoticed.
   */
  for (const rel of SHIPPED_DIST) {
    // The two asar entry points disagree about the separator: listPackage
    // reports `/dist/x` (normalised above), while extractFile splits on
    // path.sep, so on Windows it needs `dist\x`.
    const archivePath = `/dist/${rel}`;
    if (!has(archivePath)) {
      check(`dist/${rel} is present to compare`, false);
      continue;
    }
    const shipped = asar.extractFile(ARCHIVE, path.join("dist", rel));
    const local = fs.readFileSync(path.join(ROOT, "dist", rel));
    check(
      `dist/${rel} matches the verified build exactly`,
      shipped.length === local.length && shipped.equals(local),
      `${shipped.length}B shipped vs ${local.length}B local`
    );
  }

  const bytes = fs.statSync(ARCHIVE).size;
  console.log("");
  for (const r of results) {
    console.log(`  ${r.pass ? "PASS" : "FAIL"}  ${r.name}${r.detail ? `  [${r.detail}]` : ""}`);
  }
  const failed = results.filter((r) => !r.pass);
  console.log("");
  console.log(
    `  ${entries.length} entries, ${(bytes / 1024 / 1024).toFixed(1)} MB asar, ` +
      `${(fs.statSync(path.join(BUNDLE, `${NAME}.exe`)).size / 1024 / 1024).toFixed(0)} MB exe`
  );
  console.log("");
  console.log(failed.length === 0 ? "ALL PACKAGE CHECKS PASSED" : `${failed.length} PACKAGE CHECK(S) FAILED`);
  return failed.length === 0 ? 0 : 1;
}

/* ---- does the built thing actually run? --------------------------------- */

const EXE = path.join(BUNDLE, `${NAME}.exe`);
const TABLES = ["worlds", "objects", "stakeholders", "sources", "next_actions"];


const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function windowTitleOf(pid) {
  if (process.platform !== "win32") return "";
  try {
    return execFileSync(
      "powershell",
      ["-NoProfile", "-Command", `(Get-Process -Id ${pid} -ErrorAction SilentlyContinue).MainWindowTitle`],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }
    ).trim();
  } catch (_) {
    return "";
  }
}

function stopTree(pid) {
  try {
    if (process.platform === "win32") {
      execFileSync("taskkill", ["/pid", String(pid), "/T", "/F"], { stdio: "ignore" });
    } else {
      process.kill(pid, "SIGKILL");
    }
  } catch (_) {}
}

async function boot() {
  const results = [];
  const check = (name, pass, detail) => results.push({ name, pass, detail: detail || "" });

  if (!fs.existsSync(EXE)) {
    console.log("");
    console.log(`  FAIL  no executable at ${path.relative(ROOT, EXE)} — run npm run package first`);
    return 1;
  }

  const userData = fs.mkdtempSync(path.join(os.tmpdir(), "abnf-boot-"));
  const child = spawn(EXE, [`--user-data-dir=${userData}`], { stdio: ["ignore", "pipe", "pipe"] });

  let output = "";
  child.stdout.on("data", (d) => (output += d));
  child.stderr.on("data", (d) => (output += d));
  let exited = false;
  child.on("exit", (code) => { exited = true; output += `\n[exit ${code}]`; });

  const archive = path.join(userData, "data", "archive.db");
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline && !exited && !fs.existsSync(archive)) {
    await sleep(250);
  }
  // The window is created after the database boots, so give it a moment to appear.
  await sleep(2500);

  const alive = !exited;
  const dbExists = fs.existsSync(archive);
  const dbBytes = dbExists ? fs.statSync(archive).size : 0;

  const title = alive ? windowTitleOf(child.pid) : "";

  const counts = {};
  if (dbExists && dbBytes > 0) {
    const SQL = require("sql.js");
    const module = await SQL();
    const db = new module.Database(fs.readFileSync(archive));
    for (const t of TABLES) {
      const r = db.exec(`SELECT COUNT(*) FROM ${t}`);
      counts[t] = r.length ? r[0].values[0][0] : -1;
    }
    db.close();
  }

  if (alive) stopTree(child.pid);

  check("the app is still running 2.5s after its window was due", alive, exited ? output.trim().slice(-200) : "alive");
  check("sql.js loaded its wasm from inside the asar and built the archive", dbExists && dbBytes > 0, `${dbBytes}B at ${path.relative(process.cwd(), archive).replace(/\.\./g, "…")}`);
  check(
    "every table was seeded",
    TABLES.every((t) => counts[t] > 0),
    TABLES.map((t) => `${t}=${counts[t]}`).join(" ")
  );
  check(`the window came up titled "Abandoned but Not Forgotten"`, title === "Abandoned but Not Forgotten", title || "(no window title)");
  check("the packaged app printed nothing to stdout or stderr", output.trim() === "", output.trim().slice(0, 200) || "silent");

  try {
    fs.rmSync(userData, { recursive: true, force: true });
  } catch (_) {}

  /*
   * The failure path, on the real executable.
   *
   * This is the defect the audit turned up, verified on the shipped artifact: a
   * damaged archive used to skip createWindow() entirely, leaving live processes
   * and nothing on screen. A window is the whole assertion — if the app can open
   * one, it can draw its own "The archive did not open." screen.
   */
  const damagedDir = fs.mkdtempSync(path.join(os.tmpdir(), "abnf-boot-damaged-"));
  fs.mkdirSync(path.join(damagedDir, "data"), { recursive: true });
  fs.writeFileSync(path.join(damagedDir, "data", "archive.db"), crypto.randomBytes(4096));

  const damaged = spawn(EXE, [`--user-data-dir=${damagedDir}`], { stdio: ["ignore", "pipe", "pipe"] });
  let damagedOutput = "";
  damaged.stdout.on("data", (d) => (damagedOutput += d));
  damaged.stderr.on("data", (d) => (damagedOutput += d));
  let damagedExited = false;
  damaged.on("exit", () => (damagedExited = true));

  await sleep(12000);

  const damagedAlive = !damagedExited;
  const damagedTitle = damagedAlive ? windowTitleOf(damaged.pid) : "";
  if (damagedAlive) stopTree(damaged.pid);

  check(
    "a damaged archive does not leave a windowless process",
    damagedAlive && damagedTitle === "Abandoned but Not Forgotten",
    damagedExited ? "the process exited on its own" : `title="${damagedTitle}"`
  );
  check(
    "the boot failure is reported for a developer running from a terminal",
    /the archive could not be opened/.test(damagedOutput),
    damagedOutput.trim().split("\n")[0].slice(0, 160) || "(silent)"
  );

  try {
    fs.rmSync(damagedDir, { recursive: true, force: true });
  } catch (_) {}

  console.log("");
  for (const r of results) {
    console.log(`  ${r.pass ? "PASS" : "FAIL"}  ${r.name}${r.detail ? `  [${r.detail}]` : ""}`);
  }
  const failed = results.filter((r) => !r.pass);
  console.log("");
  console.log(failed.length === 0 ? "ALL BOOT CHECKS PASSED" : `${failed.length} BOOT CHECK(S) FAILED`);
  return failed.length === 0 ? 0 : 1;
}

async function main() {
  const verifyOnly = process.argv.includes("--verify-only");
  const bootOnly = process.argv.includes("--boot");

  if (bootOnly) {
    process.exit(verify() === 0 ? await boot() : 1);
  }

  if (!verifyOnly) {
    const packager = require("electron-packager");
    console.log(`  packing ${NAME} for ${PLATFORM}/${ARCH} from an allowlist`);
    const built = await packager({
      dir: ROOT,
      name: NAME,
      platform: PLATFORM,
      arch: ARCH,
      out: OUT,
      overwrite: true,
      asar: true,
      prune: false,
      quiet: true,
      ignore: (name) => !keep(name)
    });
    for (const p of built) console.log(`  wrote ${path.relative(ROOT, p)}`);
  }

  process.exit(verify());
}


main().catch((err) => {
  console.log("");
  console.log("  FAIL  packaging threw");
  console.log(err && err.stack ? err.stack : String(err));
  process.exit(1);
});
