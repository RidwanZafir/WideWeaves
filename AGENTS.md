# AGENTS.md

## What this is

Electron curator workspace for NASA abandoned hardware on Moon and Mars. 18 seeded records (8 Moon in `src/stories-moon.js`, 10 Mars in `src/stories-mars.js`). SQLite via sql.js WASM, no native deps. `README.md` and `package.json` scripts are truth; `TALK_TRACK.md` history still says 5 records and old check counts.

## Run

```sh
npm start      # real app, persists to %APPDATA%\abandoned-but-not-forgotten\data\archive.db and seeds once
npm run preview  # browser preview of real renderer, in-memory only, nothing persists
```

Portable build: `release/abandoned-but-not-forgotten-win32-x64/abandoned-but-not-forgotten.exe` runs with no install, no Node, no network. Unsigned, so one SmartScreen warning is expected. Win32/x64 only.

## Verify

```sh
npm test            # 6 source suites in this order, 404 checks total with artifact side
npm run package:prove  # artifact side only: package:check + package:boot + package:assets
```

`npm test` runs `audit`, `audit:window`, `verify.js`, `check-assets.js`, `check-videos.js`, `render-check.js`. The three `electron scripts/...` harnesses need Electron headless (SwiftShader). Do not run them with plain node.

Focused runs:

```sh
node scripts/verify.js
node scripts/audit.js
node scripts/check-assets.js --art   # prints sprites as ASCII, the only way to review art headless
node scripts/check-videos.js
electron scripts/render-check.js
electron scripts/audit-window.js
node scripts/package.js --verify-only
node scripts/package.js --boot       # uses throwaway --user-data-dir, never touches real archive
```

`web/` is gitignored static export. Build it with `node scripts/export-web.js` (`vercel-build` on Vercel). `shots/contact-sheet.html` holds 8 rendered states.

## Architecture

- `main.js`: opens archive first, then window. Window always opens even on boot failure; failure rejects every IPC channel with a sentence so renderer `fatal()` stays reachable. Never restore the old `await bootstrap(); createWindow()` order.
- `src/window.js`: the one window factory (hardlock `devTools: false` plus cancel of `devtools-requested`, `Menu.setApplicationMenu(null)`, CSP, `setWindowOpenHandler` allowlist for NASA, YouTube, ESA). `main.js` and harnesses share it. Do not fork it.
- `src/db.js`: data dir is injected by host (`app.getPath("userData")`). `PRAGMA foreign_keys = ON` lives in `applyConnectionPragmas()` called on open and after every save, because sql.js `export()` closes and reopens the connection and resets pragmas.
- `src/renderer-handlers.js`: the only API, 8 `archive:*` channels. Validate ids as positive ints, action 140 chars and reason 400 chars non-empty with existence check. Escape LIKE `% _ \` with declared `ESCAPE '\'` and cap query length.
- `src/seed.js`: `SEED_VERSION = 5`. Empty archive seeds whole, old archive backfills by title and name. Never overwrite curator rows.
- `scripts/package.js`: allowlist packager (`package.json`, `main.js`, `dist/**`, `src/**`, 3 sql.js files only). New repo files are excluded by default; add explicitly if runtime needs them. Asserts required files present, dev artifacts absent, packaged `dist/` byte identical to verified `dist/`.
- `dist/` is the shipped UI (`index.html`, `styles.css`, `app.js`, `assets/`). Do not hand edit `dist/scene.bundle.js`; it is built from `src/scene.js` with esbuild from `vendor/` three.js. `src/scene.js` renders to a fixed 384x240 target blitted up nearest neighbour. Append `#no3d` to force the 2D pixel map fallback. Both surfaces read the same rows.
- CSP is locked: no `unsafe-inline` (move spacing into `styles.css`), `connect-src none` (thumbnails vendored in `dist/assets/`), links open in system browser only.

## UI contract, enforced by tests

Flat archival theme only. No gradients, no border radius, no shadows anywhere. Square corners, hairline rules, dither stencil at 5 percent as the only texture. Serif for narrative, sans for structure, mono for micro labels. Sprites in `assets-src/*.aseprite` export to `dist/assets/*.png` as CSS masks: uniform RGB with shape in alpha, zero partial alpha pixels, ground strips tileable at 64x36 pixelated. `render-check.js` fails on any gradient or radius. Certainty color always ships with a key and text equivalent.

## Pitch script rules

Local judging allows 240 seconds. Structure follows the Space Apps Glory model, 1 minute per quadrant after a 45 second open:

- 01 WHO 0:00 to 0:45, attention and who the team is, first 15 seconds hooks without setup
- 02 WHY 0:45 to 1:45, why the record rotting matters and who it affects, one killer data point
- 03 WHAT 1:45 to 2:45, big idea plus live demo of one record open, one search, one filter
- 04 HOW 2:45 to 4:00, file a next action live, quit and reopen proof, what is needed next

The spoken script lives in `PITCH_SCRIPT_240.md`. Format matches `EXPLAINER_SCRIPT.md`: `SAY` lines read aloud, `SCREEN` cues for clicks. Pace 140 words per minute, so SAY text stays under 560 words. Film goes after the narrative, never instead of it. Say PIA numbers aloud as letters and digits. Never apologize for the dataset; the line is pilot records in the exact shape a real feed takes.

Write all pitch prose in plain human voice:

- no em or en dashes, use comma, period, colon, or parentheses
- no not-X-but-Y contrasts, no one sentence closers, no Let's dive in or Here's the thing openers
- no triads, no repeated closers, no bold labels with colons
- plain is, are, and has over serves as, features, boasts, or showcases
- sentence case headings, straight quotes, no emojis or arrows
- keep specific names, numbers, PIA ids, and file paths; cut inflated words such as crucial, pivotal, robust, vibrant, landscape, delve, showcase, tapestry, and testament
- end on the last concrete fact
