# Abandoned but Not Forgotten

A desktop workspace for NASA's abandoned hardware on the Moon and Mars —
memory as a real, preservable thing. Built for the NASA Space Apps challenge
**"Abandoned but not Forgotten: Storytelling about NASA's Discarded Equipment
on the Moon and Mars."**

Every object we left on the Moon and Mars is a record. The hardware is fine.
The record is what's rotting — and unlike the hardware, we can still fix it.

## Run it

Two ways, no build step:

```sh
npm start
```

Or double-click the packaged build (Windows, no install, no Node, no network):

```
release/abandoned-but-not-forgotten-win32-x64/abandoned-but-not-forgotten.exe
```

On first launch the app creates its archive at
`%APPDATA%\abandoned-but-not-forgotten\data\archive.db` and seeds five pilot
records. From then on that file is yours. (Windows will show one SmartScreen
warning: the executable is unsigned — a signing budget, not a defect.)

A browser preview of the real renderer (in-memory data, nothing persisted):

```sh
npm run preview
```

## What it is

A curator's workspace, not a gallery. Three columns:

| Column | Job |
|---|---|
| **The archive** (left) | Everything, filterable by world, searchable down into *lessons*, not just titles. Colour encodes how well the location is known — with a key and a text equivalent. |
| **The record** (centre) | The object's life: what it is, **why it was abandoned**, what it taught, where it is now, how well we know that. |
| **Provenance** (right) | Sources, who cares, and **what should happen next** — with a form that writes a real proposed action to SQLite. |

The front door is a **Three.js observation viewport**: two surfaces — lunar and
Martian — generated from a fixed seed, with the five records planted on them as
their real silhouettes. Drag to orbit, scroll to draw closer, click a mark to
open its record. It renders into a fixed low-resolution target and blits up
nearest-neighbour, so the 3D picture is in the instrument's own pixel language.
The hand-drawn Aseprite pixel art (masthead site plan, dither grain, silhouette
sprites) is unchanged, and **no gradient or rounded corner exists anywhere** —
asserted by tests, not by taste.

The 2D pixel map is the viewport's **fallback, not its inferior**: if WebGL is
unavailable the map comes back automatically. Append `#no3d` to force it. Both
surfaces read the same rows, so the picture cannot disagree with the data.

## NASA data used

Every record carries a **"The evidence"** block in the reading flow — photos
and film with NASA's own captions, thumbnail images vendored locally so the
offline archive stays offline. Links open in the system browser. Rail rows are
tagged `photo` / `film` so footage is visible before a record is opened.

| Record | Photo | Film |
|---|---|---|
| Surveyor 1 | **PIA12910** — Surveyor 1 on Oceanus Procellarum, LRO NAC (NASA/GSFC/ASU). `https://images.nasa.gov/details-PIA12910` | — (no official NASA video for this hardware exists; none invented) |
| Apollo 11 descent stage | — | **Restored Apollo 11 moonwalk**, official NASA channel. `https://www.youtube.com/watch?v=S9HdPi9Ikhk` |
| Luna 2 | — | **Tour of the Moon in 4K**, NASA Goddard LRO visualization, honestly labelled as lunar context — no footage of Luna 2 can exist. `https://www.youtube.com/watch?v=nr5Pj6GQL2o` |
| Schiaparelli EDM lander | **PIA21131** — impact site, MRO HiRISE. `https://images.nasa.gov/details-PIA21131` | **Schiaparelli's descent in real time**, ESA visualization. `https://www.youtube.com/watch?v=C43KXGQuUuY` |
| Mars landing failures | **PIA21131** (same) | **Seven Minutes of Terror**, NASA JPL Curiosity EDL. `https://www.youtube.com/watch?v=Ki_Af_o9Q9s` |

Credits: NASA/JPL-Caltech, NASA/GSFC/Arizona State University (LROC),
NASA/JPL/University of Arizona (HiRISE). Images are used as cited references
with NASA's own captions — the app never claims precision it does not have.

## Verify it

```sh
npm test            # 5 source-side suites: data, boundary, window, assets, render
npm run package     # repack from the allowlist + assert the artifact
npm run package:prove  # verify-only + boot the real .exe + asar asset check
```

328 automated checks across eight harnesses, zero failures. The packaged
`dist/` is asserted byte-identical to the verified build, and the real
executable is launched to confirm it comes up, seeds its archive, and serves
every sprite and NASA image out of the archive at true size.

| Harness | Scope | Checks |
|---|---|---|
| `scripts/verify.js` | Data layer + full IPC contract, headless | 39 |
| `scripts/check-assets.js` | PNG stencil/tile contract for all 11 sprites (`--art` prints them as ASCII) | 44 |
| `scripts/audit.js` | Trust boundary: LIKE wildcards, validation, orphans, foreign keys, field budget, migration | 42 |
| `scripts/audit-window.js` | Real window: keyboard focus, failure notice, flat surfaces, boot-failure screen | 18 |
| `scripts/render-check.js` | Real window: DOM, CSP, pixel contract, workflow, persistence, narrow window, and the 3D viewport | 83 |
| `scripts/package.js` | Archive read-back: files present, dev artifacts absent, byte-identical `dist/` | 76 |
| `scripts/package.js --boot` | Real `.exe` boots, seeds every table, window titled | 7 |
| `scripts/asar-asset-check.js` | All sprites + NASA/YouTube images load out of the asar | 19 |

Design review captures: `shots/contact-sheet.html` (8 rendered states).

## Project layout

```
main.js            # bootstrap: archive opens first, window always opens
src/db.js          # SQLite via sql.js (WASM), host-injected data dir
src/seed.js        # 2 worlds, 5 pilot objects, NASA citations
src/renderer-handlers.js  # 8 archive:* IPC channels, validated at the boundary
src/preload.js     # the renderer's only API (sandboxed, context-isolated)
src/window.js      # the one window factory (hardlock lives here)
dist/              # the shipped UI: index.html + styles.css + app.js + assets/
assets-src/        # Aseprite sources for all 11 sprites
scripts/           # verification harnesses + packager + preview server
shots/             # rendered-state captures + contact sheet
vendor/            # vendored three.js (bundled by esbuild, file:// safe)
src/scene.js       # the Three.js observation viewport
TALK_TRACK.md      # judge-facing talk track + 3-minute demo script
```

## Scope, honestly

**Real:** schema, uncertainty model, workflow, write path, persistence,
locked-down runtime, packaged Windows build, 302 checks.
**Curated:** five pilot records with representative sources/stakeholders —
a demonstration dataset, not a NASA feed. **Next:** wire the record shape to
public archives (LRO imagery, anomaly reports, heritage registries) and let a
consortium of curators write to a shared record.
