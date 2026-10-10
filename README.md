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
`%APPDATA%\abandoned-but-not-forgotten\data\archive.db` and seeds eighteen
records (8 Moon, 10 Mars), each with a complete narrative, sources, and
reading metadata. From then on that file is yours. (Windows will show one SmartScreen
warning: the executable is unsigned — a signing budget, not a defect.)

A browser preview of the real renderer (in-memory data, nothing persisted):

```sh
npm run preview
```

## What it is

A curator's workspace as a single-column mission flow, not a gallery. Topbar
nav, full-bleed views, ledger, dossier — story first, archive second,
provenance last, from desktop down to the 400px window floor:

| Band | Job |
|---|---|
| **Views** (top) | Asymmetric image-led home hero, Moon/Mars collections, and the full story: dateline, mission spec sheet, and dated flight line, then what it is, **why it was abandoned**, what it taught, where it is now, how well we know that — plus the **complete written story** in sections, a hero image with credit, discreet reading controls and narration bar, film after the narrative, photo evidence, numbered references, and previous/next story navigation. |
| **The archive** (ledger) | Everything, filterable by world and story kind, searchable down into *narratives*, not just titles. Colour encodes how well the location is known — with a key and a text equivalent. Previews carry subtitles and reading time; the full story lives in the views above. |
| **Provenance** (dossier) | Sources, who cares, and **what should happen next** — with a form that writes a real proposed action to SQLite. |

The front door is a **Three.js observation viewport**: two surfaces — lunar and
Martian — generated from a fixed seed, with the eighteen records planted on them as
their real silhouettes (five authored shapes, reused). Drag to orbit, scroll to draw closer, click a mark to
open its record. It renders into a fixed low-resolution target and blits up
nearest-neighbour, so the 3D picture stays photographic inside an otherwise
quiet page. The hand-drawn Aseprite pixel art (masthead site plan, dither grain, silhouette
sprites) is unchanged, and **no gradient exists anywhere** — asserted by tests,
not by taste.

The visual system is an archival documentary theme: near-black canvas,
off-white ink, grey seconds, one muted rust accent (steel-grey for the Moon).
Literary serif display and narrative, sans UI, mono micro-labels; square
corners, hairline structure, asymmetric compositions per purpose. Certainty
dots keep their four muted tones as labeled data encoding, the viewport and
map stay as authored exhibit imagery, and there is no elevation vocabulary —
no shadows, no gradients, no enclose-everything boxes.

The 2D pixel map is the viewport's **fallback, not its inferior**: if WebGL is
unavailable the map comes back automatically. Append `#no3d` to force it. Both
surfaces read the same rows, so the picture cannot disagree with the data.

## NASA data used

Every record carries a **"The evidence"** block of photos in the reading
flow, and a **"Watch Related Video"** section directly underneath the complete
narrative — film after the story, never instead of it. Films load click-to-play
(thumbnail facade, `youtube-nocookie` embed, no autoplay); the four launch-era
thumbnails are vendored locally while newer films use the video's own thumbnail
with an offline fallback to title, attribution, and link. Links open in the
system browser. Rail rows are tagged `photo` / `film` so footage is visible
before a record is opened.

| Record | Photo | Film |
|---|---|---|
| Luna 2 | — | **Tour of the Moon in 4K**, NASA Goddard LRO visualization, honestly labelled as lunar context — no footage of Luna 2 can exist. `https://www.youtube.com/watch?v=nr5Pj6GQL2o` |
| Luna 9 | — | **The First Moon Landing Wasn't Apollo — And We Just Found It**, Sabine Hossenfelder (science educator). `https://www.youtube.com/watch?v=rrRauDKoTJM` |
| Surveyor 1 | **PIA12910** — Surveyor 1 on Oceanus Procellarum, LRO NAC (NASA/GSFC/ASU). `https://images.nasa.gov/details-PIA12910` | **America's First Lunar Surveyor: 50 Years Later**, NASA JPL official channel. `https://www.youtube.com/watch?v=FOWNrvvTIZM` |
| Surveyor 3 and its Apollo visitors | — | **Apollo 12: The Pinpoint Mission**, official NASA channel. `https://www.youtube.com/watch?v=l11sW5KOi_g` |
| Apollo 11 descent stage | — | **Restored Apollo 11 moonwalk**, official NASA channel. `https://www.youtube.com/watch?v=S9HdPi9Ikhk` |
| Lunokhod 1 | — | No independently verifiable YouTube copy exists; the record links the Smithsonian's collection page instead of embedding a guess. `https://airandspace.si.edu/multimedia-gallery/image/web12065-2011640jpg` |
| Apollo 15 and the Hadley rover | — | **Apollo 15: "Never Been on a Ride like this Before"**, official NASA channel. `https://www.youtube.com/watch?v=1Mqsd0ru_pc` |
| The lunar laser reflectors | — | **Apollo 11's last working experiment on the moon**, JILA Science (Univ. of Colorado / NIST). `https://www.youtube.com/watch?v=iwxrNurAuu8` |
| Mars 3 | — | **MARS 2 & 3 — Lander and Rover models**, Retro Space HD (independent space-history channel, not an agency source). `https://www.youtube.com/watch?v=SCqiG3xciC4` |
| Mars Pathfinder and Sojourner | — | **NASA's Mars Pathfinder & Sojourner Rover (360 View)**, NASA JPL official channel. `https://www.youtube.com/watch?v=9HGRReKUzfU` |
| Mars Global Surveyor | — | No independently verifiable YouTube copy exists; the record links JPL's official video page instead of embedding a guess. `https://www.jpl.nasa.gov/videos/mars-discoveries/` |
| Mars Polar Lander | — | **JPL and the Space Age: The Breaking Point**, NASA JPL official channel. `https://www.youtube.com/watch?v=kuYDkVRyMkg` |
| Beagle 2 | — | **Professor Mark Sims on finding Beagle 2**, University of Leicester interview. `https://www.youtube.com/watch?v=iAKAJR4N6zQ` |
| Spirit | — | **The Curious Life of a Mars Rover**, National Geographic (Nat Geo Live). `https://www.youtube.com/watch?v=7zpojhD4hpI` |
| Opportunity | — | **Opportunity: NASA Rover Completes Mars Mission**, NASA JPL official channel. `https://www.youtube.com/watch?v=1Ll-VHYxWXU` |
| Phoenix | — | **Phoenix Mars Landing: Nerves and Joy**, NASA JPL official channel. `https://www.youtube.com/watch?v=hH5pNFROlYU` |
| Schiaparelli EDM lander | **PIA21131** — impact site, MRO HiRISE. `https://images.nasa.gov/details-PIA21131` | **Schiaparelli's descent in real time**, ESA visualization. `https://www.youtube.com/watch?v=C43KXGQuUuY` |
| Mars landing failures | **PIA21131** (same) | **Seven Minutes of Terror**, NASA JPL Curiosity EDL. `https://www.youtube.com/watch?v=Ki_Af_o9Q9s` |

Credits: NASA/JPL-Caltech, NASA/GSFC/Arizona State University (LROC),
NASA/JPL/University of Arizona (HiRISE). Images are used as cited references
with NASA's own captions — the app never claims precision it does not have.

## Verify it

```sh
npm test            # 6 source-side suites: data, boundary, window, assets, videos, render
npm run package     # repack from the allowlist + assert the artifact
npm run package:prove  # verify-only + boot the real .exe + asar asset check
```

404 automated checks across nine harnesses, zero failures. The packaged
`dist/` is asserted byte-identical to the verified build, and the real
executable is launched to confirm it comes up, seeds its archive, and serves
every sprite and NASA image out of the archive at true size.

| Harness | Scope | Checks |
|---|---|---|
| `scripts/verify.js` | Data layer + full IPC contract + watch coverage, headless | 55 |
| `scripts/check-assets.js` | PNG stencil/tile contract for all 11 sprites (`--art` prints them as ASCII) | 44 |
| `scripts/audit.js` | Trust boundary: LIKE wildcards, validation, orphans, foreign keys, field budget, migration | 42 |
| `scripts/audit-window.js` | Real window: keyboard focus, failure notice, flat surfaces, boot-failure screen | 18 |
| `scripts/render-check.js` | Real window: DOM, CSP, mission-control theme, responsive flow, workflow, persistence, narrow window, 3D viewport, archival documentary theme, reader + narration + screening room | 124 |
| `scripts/package.js` | Archive read-back: files present, dev artifacts absent, byte-identical `dist/` | 76 |
| `scripts/package.js --boot` | Real `.exe` boots, seeds every table, window titled | 7 |
| `scripts/check-videos.js` | Seed-level film coverage: valid IDs, attribution, no reuse | 19 |
| `scripts/asar-asset-check.js` | All sprites + NASA/YouTube images load out of the asar | 19 |

Design review captures: `shots/contact-sheet.html` (8 rendered states).

## Project layout

```
main.js            # bootstrap: archive opens first, window always opens
src/db.js          # SQLite via sql.js (WASM), host-injected data dir
src/seed.js        # versioned seed: 8 Moon + 10 Mars stories with citations
src/stories-moon.js # Moon library: full narratives, sources, metadata
src/stories-mars.js # Mars library: full narratives, sources, metadata
src/renderer-handlers.js  # 8 archive:* IPC channels, validated at the boundary
src/preload.js     # the renderer's only API (sandboxed, context-isolated)
src/window.js      # the one window factory (hardlock lives here)
dist/              # the shipped UI: index.html + styles.css + app.js + assets/
dist/app.js        # reader: full-story view, narration (speechSynthesis), filters
assets-src/        # Aseprite sources for all 11 sprites
scripts/           # verification harnesses + packager + preview server
scripts/export-web.js # static web export (fixture + bridge) for Vercel
shots/             # rendered-state captures + contact sheet
vendor/            # vendored three.js (bundled by esbuild, file:// safe)
src/scene.js       # the Three.js observation viewport
TALK_TRACK.md      # judge-facing talk track + 3-minute demo script
```

## Scope, honestly

**Real:** schema, uncertainty model, workflow, write path, persistence,
locked-down runtime, packaged Windows build, 404 checks.
**Curated:** eighteen complete stories (8 Moon, 10 Mars) with full narratives,
credible references, and preserved NASA/ESA photo and film links —
a demonstration library, not a NASA feed. **Next:** wire the record shape to
public archives (LRO imagery, anomaly reports, heritage registries) and let a
consortium of curators write to a shared record.
