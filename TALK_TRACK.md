# Abandoned but Not Forgotten — judge-facing talk track

## The one line

**Every object we left on the Moon and Mars is a record. The hardware is fine.
The record is what's rotting — and unlike the hardware, we can still fix it.**

## The problem this actually solves

The challenge title sounds nostalgic. Nostalgia is not a problem statement, so
the app treats the title as a **stewardship** problem and names four concrete
failures:

| Failure | What it costs |
|---|---|
| **False precision** | A site described with unearned exactness is worse than one marked "approximate". Downstream planning inherits the error. |
| **Lost rationale** | Every abandoned object encodes a decision — "leaving it was the plan" vs "this was lost on arrival". When the reason is dropped, the lesson drops with it. |
| **Institutional memory loss** | The people who knew why are retiring. The objects will outlive everyone who chose them. |
| **No coordination channel** | Future missions land near heritage hardware. Nobody owns the question "what should happen to this?" |

The app is the tool that fixes the first three and creates the fourth.

## Why a desktop app, and why locked down

- **Heritage work is an archival act.** A local SQLite file is an auditable,
  portable record that does not depend on a company's API surviving. The archive
  is the user's own file on their own machine.
- **It is a workspace, not a website.** Three columns, a named provenance pane,
  and a write path — the shape of a cataloguing tool, not a scroll. The frame is
  cold, monospaced and instrument-like; the record column is warm, grain-textured
  and serif. That split is the product's own claim — cold canvas, warm record —
  so the layout says it before a word is read.
- **The imagery is hand-drawn pixel art, and every surface is flat.** The
  masthead site plan, the two ground strips, the map stakes and the search-clear
  glyph are Aseprite sprites (`assets-src/*.aseprite`) exported to `dist/assets/`
  and applied as CSS masks — so the shape stays pixels while the colour stays a
  token, tinted per record by certainty. There is not one gradient or rounded
  corner in the stylesheet; the only texture is a diagonal dither stencil over
  the record at 5% opacity.
- **DevTools are disabled by design**, not for secrecy. This is a finished
  instrument for a non-technical curator: no console to wander into, no
  "why is it broken" state. Integrity is enforced at the process boundary.
- **It ships as a folder you double-click.** `release/abandoned-but-not-forgotten-win32-x64/`
  runs in place — no install, no Node, no network. The build is verified rather
  than assumed: the archive is read back and asserted, the executable is launched
  to confirm it comes up and creates its SQLite archive, and the sprites are
  confirmed to load out of the archive at true 1:1 size. The first build of this
  app shipped with **no artwork in it at all** — every pixel-art mask in the
  deliverable resolved to a missing file while the repository looked perfect —
  which is exactly why the artifact, and not just the source, is now under test.

## The interface argument

| Column | Job |
|---|---|
| **The archive** (left) | Everything, filterable by world and searchable down into *lessons*, not just titles. Encodes how well the location is known as colour — **with a key and a text equivalent**, because colour alone is not an encoding. |
| **The record** (centre) | The object's life: what it is, **why it was abandoned**, what it taught, where it is now, and how well we know that. |
| **Provenance** (right) | Where the claims come from, who is watching, and **what should happen next** — with a form that writes a real proposed action to disk. |

The centre column is warm serif (narrative). The side columns are cold sans
(structural metadata). That split is doing the argument: *the story and the
evidence are different materials and should not look alike.*

## Scope — stated honestly

**What is real:** the schema, the uncertainty model, the workflow, the write
path, the persistence, the locked-down runtime, a packaged Windows build you can
run without installing anything, and 302 automated checks across eight harnesses.

**What is curated:** five pilot objects across two worlds, with sources and
stakeholders written as representative entries. This is a demonstration dataset,
not a NASA data feed. The app never claims a precision it does not have — which
is the entire thesis, so the honesty is load-bearing rather than an apology.

**What would make it real:** wiring the record shape to existing public archives
(Lunar Reconnaissance Orbiter imagery, mission anomaly reports, heritage
registries) and letting a consortium of curators write to a shared record. The
data model is already shaped for that; the pilot set is small on purpose.

## Demo script — 3 minutes

0. **Launch it from the delivered folder**, not from a terminal.
   `release/abandoned-but-not-forgotten-win32-x64/abandoned-but-not-forgotten.exe`.
   Double-click, no install, no dependencies. Worth saying in one sentence: the
   thing you are about to see is the thing that was verified, byte for byte —
   the build is read back after packing and checked against the tested UI.

1. **Open cold. Do not click anything.**
   "Everything here is still out there." The map draws the archive itself: two
   ground strips — a lunar one and a Martian one, each hand-drawn in Aseprite —
   with five distinct silhouettes (lander, descent stage, impact, wreckage,
   cluster), one per record, shaped by what was left and tinted by how well we
   actually know it. Point to the field guide in the rail key that teaches those
   shapes. Say the point of it out loud: the overview *is* the list, so it cannot
   disagree with the data. Then read the key line: *its colour is how well we know
   it; its shape is what it is.* This is the only onboarding, and it is the
   argument, not a feature tour. (Every mark is a real button, and `/` jumps to
   search.)

2. **Click Surveyor 1.** *(the well-documented case)*
   Point at the badges: **Well documented** · **Intact · 1966**. Read the lesson
   pull quote. Then gesture at the right column: sources, who cares, and a
   starter next action. "This record is healthy. It knows what it knows."

3. **Click Schiaparelli EDM lander.** *(the honest-uncertainty case)*
   "**Reasonably certain** → **Wreckage**." Read: *"Impact and debris field
   expected near the intended landing site."* Say the sentence that carries the
   whole entry: **"No other tool in this space would write that sentence. Most
   would invent a coordinate."**

4. **Click Mars landing failures.**
   A category of hardware treated as one first-class record, because the pattern
   is the finding: *"Abandonment on Mars often begins at touchdown, before any
   science gets a chance."*

5. **Type `collision` into search.**
   It lands on Luna 2 via its *lesson*, not its title. "Search reaches the
   meaning, not the label."

6. **Filter to Mars.**
   The rail narrows to two records and **the record you were reading stays open**,
   with the rail saying *"Still reading Luna 2 — outside this filter."* "A filter
   must never cost you your place."

7. **Close on the workflow.** On Surveyor 1, type a real next action and submit.
   *"Two separate landing-site studies currently quote different radii for the
   same hardware."*
   "That was written to a real SQLite file. Quit the app, reopen it — it is still
   there. **This is the dent.** Not a museum, a work queue."

## Likely questions, honest answers

**"Where's your data from?"**
Five curated pilot records in the exact shape a real feed would take. The
uncertainty values and source kinds are modelled on how mission anomaly reports
and imagery archives actually describe hardware. Nothing is presented as NASA
data that isn't public-record-shaped, and the app labels weak claims as weak.

**"Why Electron instead of a website?"**
Because it is a curator's local instrument: an offline, ownable SQLite archive
with a locked runtime. A website would make the record someone else's asset.

**"Isn't 'abandoned' the wrong word?"**
For most of this hardware, yes — and the app says so in the first record you
open. Surveyor 1 reads: *"It completed its work and was not recovered. Leaving it
was not a failure; it was the plan."* Distinguishing deliberate abandonment from
failure is one of the four problems the app exists to fix.

**"How do I run it?"**
The delivered folder is portable — double-click the `.exe`, no installer and no
runtime needed. It is unsigned, so Windows will warn once; that is a signing
budget, not a defect. On first launch it creates its archive at
`%APPDATA%\abandoned-but-not-forgotten\data\archive.db` and seeds the five pilot
records; from then on that file is yours.

**"What happens if the build is broken?"**
It fails loudly instead of shipping quietly. That is not hypothetical: the first
packaged build was missing `dist/assets/` entirely, so the delivered app had no
artwork at all while every test on the source tree passed. Packaging now runs
from an allowlist, reads its own archive back, launches the executable to confirm
it comes up, and compares the packaged UI against the tested one byte for byte.

**"Can it scale past five objects?"**
The schema, indexes, filtering, and search are all data-driven from SQLite; the
five records are only a seed. `seedIfEmpty` refuses to run over a non-empty
archive, so real data would simply be loaded and left alone.

## Verification — what was actually run

Eight harnesses, all green on the final revision, zero failures — 302 checks:

| Harness | Scope | Result |
|---|---|---|
| [`scripts/audit.js`](scripts/audit.js) | The trust boundary: LIKE wildcards, argument validation, orphan writes, foreign-key enforcement, the field budget | **42 checks pass**, exit 0 |
| [`scripts/audit-window.js`](scripts/audit-window.js) | A real window: keyboard focus after a redraw, the failure notice, the new surfaces' contrast, and whether the archive-closed screen is reachable at all | **18 checks pass**, exit 0 |
| [`scripts/verify.js`](scripts/verify.js) | Data layer + full IPC contract, headless, isolated temp DB | **36 checks pass**, exit 0 |
| [`scripts/render-check.js`](scripts/render-check.js) | Real Electron window, real preload + CSP, live DOM | **72 checks pass**, exit 0 |
| [`scripts/check-assets.js`](scripts/check-assets.js) | Decodes all eleven shipped sprites; asserts the stencil and tile contract | **44 checks pass**, exit 0 |
| [`scripts/package.js`](scripts/package.js) | Reads the built archive back: runtime files present, sprites and NASA images present, no development artifact, and `dist/` byte-identical to the verified build | **68 checks pass**, exit 0 |
| [`scripts/package.js --boot`](scripts/package.js) | Runs the real `.exe` against a throwaway `--user-data-dir`: window titled, sql.js loads its wasm from inside the archive, every table seeded | **7 checks pass**, exit 0 |
| [`scripts/asar-asset-check.js`](scripts/asar-asset-check.js) | Loads the packaged UI in a window; all eleven sprites arrive out of the asar at true 1:1 size, both NASA images load, a mask resolves into the archive | **15 checks pass**, exit 0 |

The render harness is the one that matters for a UI claim: it builds the window
with [src/window.js](src/window.js) — the same factory `main.js` ships — loads
the real `dist/index.html`, and drives the real renderer. It asserts the
stylesheet survived the CSP, the preload bridge works under sandboxing, filtering
and search behave, the next-action form round-trips, the write survives a
reload, and the console is clean. It also checks the narrow window: at the
enforced 1024px minimum the workspace still fits without horizontal overflow and
the write path is still reachable.

**The "pixel art, no gradients" requirement is asserted, not claimed.** The
render harness walks every rendered element and fails on any gradient fill or
non-zero corner radius; it loads all eleven sprites plus both NASA images through the shipping CSP; and
it asserts the ground strips tile at exactly 2× nearest-neighbour, one stake per
record, each carrying its own certainty tone. The sprite files themselves are
guarded by a PNG decoder ([`scripts/check-assets.js`](scripts/check-assets.js))
that verifies the stencil contract — uniform colour, shape carried in alpha, no
partial-alpha pixels — and proves both ground strips are horizontally tileable
by comparing the seam against the interior rhythm. Because the environment this
was built in cannot display pixels, the art was reviewed as text: the checker
prints each sprite as ASCII (`--art`), and that output is what was actually
looked at.

**The hardlock is verified against the running window, not the source.** The
harness confirms the renderer has no ambient `require` or `process`, that
`nodeIntegration` is off, `contextIsolation` on, `sandbox` on, and — the headline
requirement — that `openDevTools()` is refused: `isDevToolsOpened()` stays false
even when the main process asks for it directly.

[`scripts/shots.js`](scripts/shots.js) captures eight rendered states into a
self-contained contact sheet at [`shots/contact-sheet.html`](shots/contact-sheet.html)
for design review.

**The artifact is checked, not just the source.** A green suite that tests the
repository proves nothing about the folder you hand over, and this project has a
concrete scar to prove it: the first packaged build was made *before* the pixel
pass and shipped with no `dist/assets/` at all. Every mask in the delivered app
pointed at a file that was not in the archive — so the site plan, the ground
strips, the stakes, the grain and the search glyph all rendered as nothing in the
one artifact a judge would actually open, while every harness passed against the
source tree. Packaging now runs from an allowlist rather than trusting a
blacklist, and the build is read back and asserted: the runtime files, all six
sprites, the *absence* of every planning note, capture sheet, harness and build
module, and — the check that would have caught it — the packaged `dist/`
byte-identical to the verified one. `npm run package:boot` then runs the actual
executable to confirm it comes up and builds its archive, and
`npm run package:assets` confirms the sprites load out of the archive over
`file://`. The build went from 37.4 MB to 0.8 MB in the process — 606 entries
down to 26 — almost all of the removed bulk being build tooling that had no
business being delivered.

### Defects this pass actually found and fixed

- **The database was being written to the wrong place.** `src/db.js` tested a
  bare `app` it never imported, so the `userData` branch was dead code and every
  install wrote to `process.cwd()/data`. In a packaged app that directory is
  often read-only, which would have silently dropped a judge's written records.
  The data directory is now injected by the host, and a check guards it.
- **The CSP was blocking the app's own markup.** An inline `style` attribute on
  the action form was refused, so its spacing never applied. Moved into the
  stylesheet.
- **`frame-ancestors` in a `<meta>` CSP** is ignored, and warned on every boot.
  Removed.
- **Colour-only encoding with no key** in the rail, and no text equivalent for
  screen readers. Added a legend and screen-reader text.
- **Filtering threw away the open record** and reset the centre column. Fixed.
- **The next-action workflow disappeared on narrow windows.** Below 1180px the
  provenance column was `display: none` — while the window's own `minWidth` is
  1024, so a user could reach a width where acting was impossible. The columns
  now tighten instead.
- **`main.js` registered a privileged `app://` scheme it never used**, and the
  packaging script pinned a stale Electron 35 while the dependency was 44.
  Both removed.
- **The hardlock was one layer thin.** The window relied only on cancelling
  `devtools-requested`. It now also sets `devTools: false`, the preference-level
  lock that makes `openDevTools()` a no-op, and the window configuration lives in
  one factory that `main.js` and both harnesses share — so the tests can no
  longer drift from what ships.
- **One assertion of mine was wrong, not the lock.** I first asserted the lock
  through `webContents.getLastWebPreferences()`, which returned
  `devTools: undefined`. That getter structurally does not report `devTools`; the
  behavioural test and an assertion on the exact shipped options object now
  cover both layers instead.
- **The map's only controls were 16px wide.** The stake sprite is 16×28 and the
  button around it had no padding, so the map's one way in failed the 24×24
  target-size minimum. The button is now the box around the sprite — 24×28, the
  sprite itself unmoved — and a check holds it there.
- **And one of my own harness edits broke the run.** A probe rewritten inside a
  template literal lost its regex escapes — `/^url\(/` reached the renderer as
  `/^url(/` — and a single throwing probe took every later check down with it.
  Fixed the escape, wrapped the probe so it reports instead of throws, and made
  the harness print the renderer console when it dies. The first error message
  ("check the renderer console") had hidden the actual syntax error.
- **The delivered build had no artwork in it.** The packaged archive predated
  the pixel pass, so it contained `dist/app.js`, `dist/index.html`, and
  `dist/styles.css` and nothing else — no `dist/assets/`. Every sprite mask in
  the shipped app resolved to a missing file, and the design the whole pass was
  about was absent from the only artifact anyone would run. Found by listing the
  archive's contents, not by reading any code.
- **The packaging step shipped the workshop.** A blacklist-driven build delivered
  the planning notes, this talk track, `.freebuff/project-id`, the design
  captures, the verification harnesses, and the bulk of electron-packager's own
  hoisted dependencies. Replaced with an allowlist of exactly what the runtime
  reads, so future additions are excluded by default; the archive fell from
  37.4 MB to 0.8 MB across 26 entries.
- **A damaged archive produced no window at all.** A failure inside the database
  bootstrap skipped window creation, so a corrupt file gave three live processes,
  a blank desktop, and a warning on a stderr nobody running a packaged app reads —
  while the app's own *"The archive did not open."* screen, which it had been
  written with, could never appear. The window now always opens and the failure
  travels to it as the reason every call rejects. A designed error state that can
  never be reached is worse than none.
- **Search read `%` and `_` as wildcards.** Queries were parameterised, but the
  values went straight into LIKE: `q='%'` returned the entire archive and
  `q='surv%yor'` returned **Surveyor**, the percent sign completing the word for
  the user. A mission code containing an underscore searched wrongly. Wildcards
  are now escaped with a declared `ESCAPE` character.
- **A next action could be filed against a record that does not exist.** It
  returned `true` and wrote a row no screen could ever show, because `PRAGMA
  foreign_keys` was off and the schema's foreign keys were decoration. Enforced
  now — and the first fix for it failed for a reason worth knowing: sql.js's
  `export()` closes and reopens the connection, silently resetting
  connection-level pragmas, so enforcement lasted exactly until the first save.
  The pragma is re-applied after every write.
- **Failures were silent in the UI.** Opening a record that would not load
  discarded the record you were reading and said nothing; a refused write
  re-enabled its button with no explanation. Both now carry a sentence, and the
  record already on screen is kept.
- **A map stake activated by keyboard dropped focus onto `<body>`.** The stakes
  live in the column that selection redraws, so the focused element was destroyed
  and a keyboard user was returned to the top of the document without a word.
  Focus now lands on the heading of the record that opened — for keyboard
  interaction only, so a mouse click does not sprout an outline.
- **And twice in one pass, the finding was my own fix.** `PRAGMA foreign_keys`
  set once at open read back as 0 after the first save; and my focus restoration
  checked `:focus-visible` on an element that had already been detached from the
  document, where it can never match. Both were caught by the harness printing
  exactly what it saw — `got 0` and `BUTTON -> BODY` — not by re-reading the code.
