# Progress

## Session 1 — Concept framing and toolchain check

- Read hyperframes, hyperframes-core, planning-with-files, design-methodology.
- Created task_plan.md, findings.md in the workspace.
- Confirmed node 24.18.0.0 and npm 12.0.1 are available.
- npm search confirms electron package is available.

### Concept decision

Settled on the strongest interpretation of the challenge title:

"Abandoned but not Forgotten" is treated as a **memory + stewardship** problem, not a nostalgic gallery.

The app is a curated, desktop-native workspace for the hardware NASA left on the Moon and Mars — each object is a living record with:
- What it is
- Where it is (with honest uncertainty for contested/approximate locations)
- Why it was abandoned
- What it taught us
- What its current status/context is
- Why it should not be forgotten
- What should happen next

That reframes "storytelling" into a real civic/heritage problem: preserve context, reduce ambiguity, and make legacy hardware usable by the people who will actually act on it — historians, educators, heritage advocates, and future-site planners.

MVP scope: a working Electron app with real structured data, a clear contribution/uncertainty model, and one end-to-end workflow. It is shipped with curated pilot data and an honest story about how richer data would plug in.

---

## Session 2 — Build, then verify it for real

The data layer was already passing. A passing data-layer test does **not** prove
a GUI renders, so this session was mostly about closing that gap honestly.

### Shipped

- **Runtime:** Electron 44, `sandbox: true`, `contextIsolation: true`,
  `nodeIntegration: false`, preload bridge only, DevTools requests cancelled in
  the main process. The renderer's entire API is 8 `archive:*` IPC channels.
- **Storage:** real in-process SQLite via `sql.js` (WASM, no native compile),
  persisted as a single portable file.
- **Seed:** 2 worlds, 5 pilot objects — Surveyor 1, Apollo 11 descent stage,
  Luna 2, Schiaparelli EDM lander, and the Mars landing failure pattern as a
  first-class category record.
- **UI:** hand-authored archival design system in `dist/` (no framework, no
  Tailwind — the subject is a document, so it should look like one).
  Three columns: the archive, the record, the provenance.
- **One window factory:** `src/window.js` holds the hardlock and the window
  configuration in a single place, so `main.js` and the harnesses cannot drift.
- **Hardlock:** `devTools: false` at the preference layer (so `openDevTools()`
  cannot open them) plus cancellation of `devtools-requested` as a second layer.

### Verification built this session

| Harness | What it proves |
|---|---|
| `scripts/verify.js` | Data layer + exact IPC contract, headless, isolated temp DB |
| `scripts/render-check.js` | The shipping window factory, real preload + CSP, live DOM, hardlock |
| `scripts/shots.js` | Eight rendered states into a self-contained contact sheet |

**Final state: 36 + 51 = 87 automated checks, zero failures, all three harnesses
exit 0.** The real entry point (`npm start`) was launched and confirmed after
every change to it, including the final window-factory refactor.

### Design review actually changed the UI

Capturing the rendered states (rather than asserting on the DOM) is what
surfaced the real problems. The visual pass produced concrete fixes:

- the rail encoded certainty as colour with **no key and no text equivalent**
- **filtering destroyed the open record** and reset the centre column
- **the write path vanished below 1180px** while the window's own `minWidth`
  was 1024 — a genuine dead end, not a cosmetic one
- the intro state dumped all its dead space at the bottom of the column

All four are fixed and now covered by checks.

### The design pass (measurable, not decorative)

The UI was redesigned against the `design-methodology` skill — diagnose before
decorating, structure before style — and every claim below is measured on the
rendered page rather than eyeballed:

1. **`.block p` was overriding `.block-label`.** Specificity 0,1,1 beat 0,1,0, so
   every section label rendered as 16px serif body text *in the body's own
   colour*. The record had no label system at all. Labels are now real `<h3>`s
   (the cause, not a specificity patch), monospaced, 10.5px, numbered 01–05 like
   a record sheet.
2. **Border soup.** Five identical full-width rules at a ~110px rhythm made five
   sections of unequal importance look equally important. Now: a short warm tick
   beside each label, separation by space, and the lesson — the payload of the
   record — as the one elevated surface (122px card against 58px siblings).
3. **Six AA contrast failures**, all fixed and re-measured: `.action-by` 2.86 →
   5.06, `.panel-label` / `.rail-count` / `.rail-key-title` / `.field label`
   3.09 → 5.51, `.stake dt` 3.26 → 5.19. Nothing in the UI is below 4.5:1 now.
4. **The intro had no way in and no anchor.** It is now a data-driven map of the
   archive — one horizon per world, one mark per record, flagged by certainty,
   generated from the same rows the rail lists so the picture cannot disagree
   with the data. The marks are real controls (click, Enter/Space, `aria-label`),
   so the overview is also an entry point.
5. **The two-material split is real, not a slogan.** The frame is cool
   (`rgb(12,16,24)`), the record is warm under a lamp (`rgb(18,16,9)` with a
   warm ramp and hairline), the frame speaks in mono, the record speaks in serif.
6. **States that previously did not exist**: a boot state that says *"Opening the
   archive…"* instead of showing an empty shell (`.app[data-boot]`, dropped on
   the first real render), a designed rail empty state, and a failure state that
   names the cause and what to try — verified by loading the shipping shell with
   no bridge at all.

Also added: `npm run preview` (`scripts/preview-server.js`) serves the real
renderer and the real data layer to a browser behind a shim of the preload
bridge, so the UI can be reviewed and measured without relaunching Electron.
`scripts/shots.js` was hardened with bounded waits — it was throwing roughly one
run in three while six PNG encodes competed for the main process; three
consecutive captures now pass.

**After the pass: 36 + 51 checks, zero failures, three consecutive clean
captures, and the real entry point (`npm start`) launched and confirmed.**

### Bugs found by verification (not by reading the code)

1. **`src/db.js` wrote to the wrong directory.** It tested a bare `app` it never
   imported, so the `userData` branch was unreachable and every install used
   `process.cwd()/data`. A packaged app in a read-only directory would have
   silently dropped written records. The data directory is now injected by the
   host; a regression check asserts it.
2. **The CSP blocked the app's own markup** — an inline `style` attribute was
   refused, so the action form's spacing never applied.
3. **`frame-ancestors` in a `<meta>` CSP** is ignored and warned on every boot.
4. **`main.js` registered a privileged `app://` scheme it never used.**
5. **The packaging script pinned Electron 35** while the dependency was 44.
6. **The "hardlocked, no DevTools" requirement was only one layer deep** and was
   only verified by reading `main.js` — the exact kind of unverified claim worth
   refusing. The window now also sets `devTools: false` (the preference-level
   lock that makes `openDevTools()` a genuine no-op), and the harness asserts
   against the running window that `isDevToolsOpened()` stays false, that the
   renderer has no ambient `require`/`process`, and that context isolation,
   sandboxing, and web security are all on.
7. **One of my own assertions was the bug, not the code.** I first checked the
   DevTools lock via `webContents.getLastWebPreferences()`, which returned
   `devTools: undefined`. Probing the getter showed it structurally omits
   `devTools`. Replaced with a behavioural test plus an assertion on the exact
   options object the factory ships — not weakened, corrected.

### Cleanup

Removed `builder_write.js`, `overwrite_package_json.js` (which targeted a stray
wrong directory and would have rewritten a stale package.json), and the stale
unreferenced `src/main.js` duplicate. Added `.gitignore` for `node_modules/`,
`data/`, `release/`, `shots/`.

### Where it stands

Feature-complete and verified. `npm start` runs the app; written next actions
persist to `%APPDATA%\abandoned-but-not-forgotten\data\archive.db`. The
judge-facing talk track, demo script, scope statement, and verification summary
live in `TALK_TRACK.md`.

### Honest limitations

- Five curated pilot records, not a NASA feed. Sources and stakeholders are
  representative entries in the right shape.
- The render harness runs the real window offscreen. It proves the DOM, styles,
  bridge, and workflow; it does not prove human-perceived polish.
- No installer was built — `npm run package` is wired but unpackaged.
  *(Superseded in Session 4: this was true when written. The build was later
  packaged, and packaging turned out to be hiding a real defect — see below.)*

---

## Session 3 — Aseprite pixel pass: flat surfaces, hand-drawn art

The brief arrived mid-review: *"aesprite there, and dont use gradients. its ass."*
Two requirements: make the imagery real pixel art through the connected Aseprite
MCP, and remove every gradient from the UI. The rewrites stayed
measurement-driven — the art was reviewed as ASCII text and every claim below is
a passing check, not an eyeball.

### Assets — drawn in Aseprite, shipped as CSS masks

Six sprites authored at final display size in `assets-src/*.aseprite`, exported
to `dist/assets/*.png`, and wired as CSS masks so the shape stays pixels while
the colour stays a token:

| Sprite | Size | Used as |
|---|---|---|
| `site-plan.png` | 32×32 | masthead mark — a horizon with two things left standing on it |
| `ground-moon.png` | 32×18 | lunar ground strip, 12 colours, alpha-dithered tail rows |
| `ground-mars.png` | 32×18 | Martian strip, 13 colours — rim recoloured from `#d0a071` to `#b5794a` because the original collided with the ember accent |
| `stake.png` | 16×28 | one map stake: two sign boards, post, 12px mast, 4px foot |
| `cancel.png` | 14×14 | the search-clear glyph, replacing the UA's soft grey one |
| `dither.png` | 8×8 | the record's grain — a diagonal stencil at 5% opacity, replacing the radial "lamp" gradient |

Masks are authored at display size on purpose: a 2× sprite under a CSS mask gets
anti-aliased into soft edges, which is exactly what a pixel pass must not do.
`scripts/check-assets.js` decodes each PNG (IHDR/IDAT/zlib, all five filter
types) and asserts the contract: exact dimensions, uniform visible colour, shape
carried in alpha, zero partial-alpha pixels, palette size, a clear final row, and
— the real test — horizontal tileability, by comparing the seam's colour step
against the interior's rhythm. `--art` prints each sprite as ASCII; that is how
the art was reviewed, since this environment cannot display pixels.

### The stylesheet is now flat, and that is checked

- Every gradient is gone: the masthead is a flat void, the record is flat warm
  void + dither mask, the intro pull-quote lost its fade, and the boot state uses
  flat blocks with a `steps(2, end)` blink instead of a shimmer ramp.
- Every `border-radius` is gone — chips, rows, badges, buttons, focus ring: all
  hard pixel edges.
- The renderer no longer draws an SVG map. `archive:objects` now returns
  `world_code`, and `dist/app.js` groups on it and renders per world:
  `.map-ground` strips (the 32×18 sprite tiled at exactly 64×36,
  `image-rendering: pixelated`) with one `.map-mark` button per record, its
  `.map-stake` mask tinted by certainty. Stakes are evenly spaced on purpose —
  precise coordinates are the false-precision trap the app argues against.

The render harness now carries a flat/pixel contract: no gradient on any
rendered element, no non-zero corner radius, all six sprites loading through the
shipping CSP, two ground rows, five stakes with five distinct tones, the exact
tile size and `pixelated`, each mask resolving to its sprite, and a stake click
opening its record.

### Bugs found and fixed this session

1. **The map's only controls were 16px wide** (WCAG 2.5.8 minimum is 24×24).
   The button around the sprite now carries 4px side padding and a 24px floor:
   24×28 target, sprite unmoved, asserted by a check.
2. **My own harness edit broke the run.** Moving a probe inside a template
   literal ate its regex escapes — `/^url\(/` reached the renderer as
   `/^url(/` — and because one throwing probe aborted the harness, four unrelated
   checks were reported as failures on the run before. Fixed the escape, made the
   probe report instead of throw, and made the harness print the renderer console
   when it dies. The real defect was a `SyntaxError` the first error message
   never surfaced.

### Verification

- `node scripts/check-assets.js` — **24/24, exit 0** (`--art` reviewed).
- `node scripts/verify.js` — **36/36, exit 0** (still green after the
  `world_code` projection; it asserts field presence, not an exact key set).
- `npx electron scripts/render-check.js` — **67/67, exit 0**, including the new
  flat/pixel contract and the hit-target check.
- `npx electron scripts/shots.js` — **8/8 captures, exit 0**, contact sheet
  regenerated at `shots/contact-sheet.html`.
- Browser measurement pass at 1440×900 against the live preview server: WCAG
  sweep over intro, open record and dead-search states — **zero text below AA**;
  stake boxes 24×28 with even gaps and no overlap; sprites still 16×28 under the
  boxes.
- `npx electron .` smoke test — **4 processes, zero error lines in the log,
  clean kill**.

**Session totals: 36 + 67 + 24 = 127 automated checks, zero failures, plus the
8-capture render set.**

---

## Session 4 — The shipped artifact was wrong, and the repository looked fine

The previous session closed with "`npm run package` is wired but unpackaged" and
then named packaging as the next milestone. Doing it found two defects that no
amount of reading the repository would have surfaced, because both lived in the
build output rather than in the source.

The released bundle was dated 22:34 while the sprite work finished at 01:26 — the
build simply predated the art. Opening the archive showed what that meant:

```
/release/.../resources/app.asar
  \dist\app.js          \dist\index.html      \dist\styles.css
```

No `dist/assets/`. Every CSS mask in the shipped app pointed at a file that was
not in the archive, so the packaged window rendered the site plan, the ground
strips, the stakes, the grain and the search glyph as nothing — while the
repository's own `dist/` was correct and every harness passed against it. That is
the precise failure mode the whole verification effort exists to prevent: a green
suite that tests the source tree and says nothing about the artifact.

The second defect was the packaging method. `npm run package` handed
electron-packager the entire repository and trusted a blacklist to drop what was
unneeded. The resulting 37.4 MB archive shipped `findings.md`, `progress.md`,
`task_plan.md`, `TALK_TRACK.md`, `.freebuff/project-id`, `.gitignore`, the eight
capture PNGs and their 1.4 MB contact sheet, the verification harnesses
themselves, and — the bulk of it — electron-packager's own hoisted transitive
dependencies (`undici`, `@types/node`, `semver`, `sumchecker`, `@electron/get`,
…). A blacklist cannot enumerate what it does not know about; anything added to
the repository in future would have to be remembered. Of the archive's 606
entries, 26 were the application.

### The fix: an allowlist, and a check that the allowlist held

[`scripts/package.js`](scripts/package.js) replaces the one-liner. It passes an
`ignore` **function** that keeps only `/package.json`, `/main.js`, `/dist/**`,
`/src/**` and the three sql.js files the runtime actually reads (the wasm build
and its licence — not the asm fallbacks, worker builds, zipped dists or
devcontainer). Pruning is off because the pruner walks the dependency graph,
while the allowlist is now the single source of truth; anything new in the
repository is excluded by default rather than by remembering to exclude it.

Packing is not proof, so the script reads the archive back and asserts:

| Group | What it asserts | Checks |
|---|---|---|
| Required | every runtime file and all six sprites are present | 19 |
| Forbidden | no planning doc, capture, harness, dev module or sql.js bulk | 26 |
| Identity | packaged `dist/` is **byte-identical** to the verified `dist/` | 9 |
| Boot | the real `.exe` runs, window titled, sql.js loads its wasm from inside the archive, archive seeded | 5 |
| Assets | all six sprites load out of the asar at true 1:1 size, a mask resolves into `app.asar` | 8 |

Two of those groups needed new machinery rather than assertions.

`--boot` runs the actual executable against a throwaway `--user-data-dir`, so a
boot test never touches the real archive in `%APPDATA%`. This is the check that
matters most, because sql.js reads its `.wasm` with `fs.readFileSync`: a
packaging mistake there fails *inside* the archive and nowhere else, and no
amount of source-level testing would see it.

[`scripts/asar-asset-check.js`](scripts/asar-asset-check.js) covers the one claim
the identity check cannot. Knowing the archive *contains* the right bytes is not
knowing the packaged window can *use* them — inside an asar the sprites are not
files, they are entries in a virtual filesystem that Electron serves over
`file://`, and a relative `url(assets/stake.png)` in the stylesheet has to
resolve back into that archive. So it loads the packaged `index.html` in a real
window and asserts each sprite arrives at its true 1:1 size and that a computed
`mask-image` resolves to a path inside `app.asar`.

### What the new checks actually caught, in order

1. **Missing sprites** — the reason for the whole pass. Confirmed by `npx asar
   list` showing `\dist\index.html` with no `\dist\assets\` at all.
2. **My own verify step, three times.** The archive listing, the extraction API
   and the comparison each disagreed about path form: `listPackage` returns
   `\dist\x`, `extractFile` splits on `path.sep` and so wants `dist\x` on
   Windows, and my first attempt used a leading slash in both directions. Each
   failure was a real `FAIL` line naming the file and the two byte counts, not a
   silent pass — which is why the identity check is worth having even though it
   checks something I "knew" was true.
3. **A 54-check verify that was passing while shipping 37 MB of build tooling.**
   Green checks on the source tree had said nothing about the artifact for an
   entire session.
4. **Two numbers in my own first draft of this section were wrong** — the
   archive entry count (608, which included two `npm notice` lines in the listing)
   and the headline size (39.2 MB, decimal, against the script's own MiB output of
   37.4). Corrected from the recorded listings rather than from memory.

### Verification

- `npm run package` — packs from the allowlist, then **54/54 package checks,
  exit 0**. Archive **37.4 MB → 0.8 MB**, 606 entries → 26.
- `npm run package:boot` — **5/5, exit 0**: app alive with its window up, titled
  "Abandoned but Not Forgotten"; `archive.db` written at 45,056 B; every table
  seeded (`worlds=2 objects=5 stakeholders=14 sources=12 next_actions=5`); zero
  bytes on stdout or stderr.
- `npm run package:assets` — **8/8, exit 0**: six sprites load from the asar at
  32×32, 32×18, 32×18, 16×28, 8×8, 14×14; mask resolves to
  `app.asar/dist/assets/site-plan.png`; renderer console clean.
- `npm run package:prove` chains all three — **exit 0**.
- The repo-side suites were re-run first and are unchanged: verify **36/36**,
  render-check **67/67**, check-assets **24/24**, all exit 0.

**Session totals: 54 + 5 + 8 = 67 new checks. Running total across six
harnesses: 36 + 67 + 24 + 54 + 5 + 8 = 194 automated checks, zero failures.**
*(Superseded in Session 5, which added two more harnesses and two more boot
checks — the current figure is 251 across eight. Recorded here as it stood.)*

### Where it stands

The `release/abandoned-but-not-forgotten-win32-x64/` bundle is now a correct
artifact: 235 MB executable, 0.8 MB archive, the verified UI inside it, and an
archive that the packaged app builds and seeds on first run. No installer
(`.msi`/NSIS) was produced — the bundle is a portable folder you run in place.

### Honest limitations

- The `.exe` was verified on **win32/x64 only**. `scripts/package.js` takes the
  platform and arch as constants; no other target was built or tested.
- "The sprites render in the packaged window" is established by the archive
  identity check plus the asar asset check, not by looking at the packaged
  window: this environment cannot display pixels. `--art` and computed styles
  remain the instruments.
- The boot check asserts the window *exists*, by title, and that the process
  survives; it does not assert what the window looks like.
- `electron` remains a runtime `dependency` rather than a `devDependency`. It is
  harmless under the allowlist — Electron is never copied into the archive — but
  it is conventional to move it.
- The executable is unsigned, so Windows SmartScreen will warn on first run.

---

## Session 5 — An audit of the boundary found eight things the UI was hiding

Asked to audit and improve. The audit was run as measurements rather than
reading, and every finding below was reproduced before it was fixed — the
falsifying output is quoted, because a defect you cannot demonstrate is a
suspicion.

### What was actually broken

**1. A damaged archive produced no window at all.** The highest-severity finding,
and the one that had been invisible for four sessions. `main.js` was:

```js
app.on("ready", async () => { await bootstrap(); createWindow(); });
```

so any failure inside `bootstrap()` skipped `createWindow()` entirely. A corrupt
`archive.db` gave three live processes, a blank desktop, and a single
`UnhandledPromiseRejectionWarning` on a stderr that nobody running a packaged app
will ever read. Worse, the renderer already had a screen for exactly this —
*fatal()*, "The archive did not open." — which **could never appear**, because the
renderer was never loaded to draw it. A designed error state that is unreachable
is worse than none: it is the appearance of handling a case.

**2. Search read `%` and `_` as wildcards.** The queries were parameterised — no
injection — but the *values* were passed straight into LIKE. Measured:
`q='%'` returned all five records, `q='_'` returned all five, and `q='surv%yor'`
returned **Surveyor**, because the percent sign completed the word. A user typing
`100%` or a mission code with an underscore gets silently wrong results.

**3. A next action could be filed against a record that does not exist.**
`addNextAction(999999, …)` returned `true` and inserted a row. `PRAGMA
foreign_keys` was `0`, so the schema's declared foreign keys were documentation.
The row is unreachable from every screen in the app — silent, permanent
corruption of the one thing this project argues must not be corrupted.

**4. And my first fix for #3 also failed, in a way worth keeping.** Adding
`PRAGMA foreign_keys = ON` at open looked right, and the audit still failed:
`PRAGMA foreign_keys is on -> got 0`. sql.js's `export()` **closes and reopens the
connection** in order to read the database file back, and that resets every
connection-level pragma. So enforcement lasted exactly until the first save. The
pragma now lives in `applyConnectionPragmas()`, called on open *and* after every
export, with the measurement recorded in the comment: after open it reads 1,
after `export()` it reads 0, and an orphan insert succeeds again.

**5. `objects(null)` crashed the IPC boundary.** `(_, opts = {})` covers
`undefined` only; `null` walked into `opts.worldCode` and threw. Same for
`object(undefined)`.

**6. The boundary trusted its caller.** No emptiness check, no length cap, no
target existence check. The renderer's `maxlength` is a courtesy to the typist;
the bridge is reachable without it.

**7. A record that would not open said nothing.** `selectObject`'s catch did
`state.record = null; render()` — so a failed open silently discarded the record
you were reading *and* gave no reason. A no-op that eats your place is the worst
of both.

**8. Activating a map stake with the keyboard dropped focus onto `<body>`.** Both
the rail rows and the stakes live in columns that selection re-renders, so
activating one destroyed the focused element. A keyboard user was silently
returned to the top of the document with no announcement.

**9. The first fix for #8 was wrong too** — the second self-caught error of the
session. I read `destroyed.matches(':focus-visible')` at *restore* time, after the
column had already been replaced, and a detached element can never match
`:focus-visible`. The check was therefore always false. The harness said so
plainly: `focus is not dropped onto <body> when the map is replaced [BUTTON -> BODY]`.
The modality signal is now captured while the element is still in the document.

### What the improvements are

| Fix | Where |
|---|---|
| The window opens on every path; a failed boot rejects every channel with the reason, so `fatal()` is reachable | [main.js](main.js) |
| Boot failures are phrased for a curator: the archive path, that it may be damaged, and that the file is *left in place* so nothing is discarded | `main.js` |
| Wildcards escaped, `ESCAPE '\'` declared, query length capped | [renderer-handlers.js](src/renderer-handlers.js) |
| Every argument validated: object ids are positive integers, action ≤ 140, reason ≤ 400, both non-empty, and the target must exist | `renderer-handlers.js` |
| `PRAGMA foreign_keys = ON` re-applied after every save, because `export()` reopens the connection | [db.js](src/db.js) |
| A damaged archive is diagnosed where it is read, with a `sqlite_master` probe, so the failure is attributed to the file | `db.js` |
| Failed opens are reported (`role="alert"`), and the record already on screen is kept | [app.js](dist/app.js) |
| Refused writes show the boundary's actual sentence next to the button | `app.js` |
| Focus moves to the heading of the record that opened, for keyboard interaction only | `app.js` |
| Two new flat surfaces, `.record-notice` and `.form-error`, asserted for 0 radius, no gradient and AA | [styles.css](dist/styles.css) |

### Verification

Two new harnesses, because none of this was covered:

- [audit.js](scripts/audit.js) — headless, **37 checks**. Wildcards, the
  boundary, orphan prevention, FK enforcement, the field budget, and the happy
  path still working.
- [audit-window.js](scripts/audit-window.js) — a real window, **18 checks**. It
  reproduces a genuine keyboard interaction with a real key press before testing
  focus, deletes a record underneath the view to test the failure notice, measures
  the new surfaces, then closes the database and **reloads to prove the
  archive-closed screen is reachable**.

The packaging harness gained the failure path on the real executable:
`a damaged archive does not leave a windowless process` — 7 boot checks now, up
from 5.

| Suite | Checks | Exit |
|---|---|---|
| [audit.js](scripts/audit.js) | 37 | 0 |
| [audit-window.js](scripts/audit-window.js) | 18 | 0 |
| [verify.js](scripts/verify.js) | 36 | 0 |
| [check-assets.js](scripts/check-assets.js) | 24 | 0 |
| [render-check.js](scripts/render-check.js) | 67 | 0 |
| [package.js](scripts/package.js) | 54 | 0 |
| `package.js --boot` | 7 | 0 |
| [asar-asset-check.js](scripts/asar-asset-check.js) | 8 | 0 |

**251 checks, eight suites, zero failures.** `npm test` chains the five
source-side suites; `npm run package:prove` chains the three artifact-side ones.
The capture set was regenerated ([shots/contact-sheet.html](shots/contact-sheet.html),
8/8 rendered content) and the app repacked and re-verified: 26 entries, 0.8 MB
archive, sprites still 1:1 in the archive.

### Honest limitations

- The schema declares no `ON DELETE CASCADE`, which the new foreign-key
  enforcement made visible: deleting an object now requires deleting its sources,
  stakeholders and next actions first. Nothing in the app deletes a record, so
  nothing hits this yet — the window-audit harness had to, and does it by hand.
- Every write is still attributed to the literal `made_by = 'reviewer'`. The app
  records who cares about an object but not who is writing, which is a real gap
  for a stewardship tool and a schema change rather than a bug fix.
- `addNextAction` silently truncates an oversized action to 140 characters rather
  than refusing it. The form cannot produce one; the boundary can be called
  without the form.
- Focus after a rail click moves to the record heading, not back into the list.
  That is deliberate and consistent, but it does cost arrow-through-the-rail
  navigation.
- The three window-level behaviours are verified through synthetic interaction
  (a real key press, a real click, a real reload) and measured computed styles.
  Nothing here has been looked at by a human eye.

---

## Session 6 — NASA wiring + the renderer was empty (both fixed, measured)

Asked for a full submission audit: is it ready, is NASA material really used,
is the pixel art real. The audit found one missing wrapper and two real
defects, all fixed and verified.

### 1. NASA resources were defined but never stored (fixed)

`src/seed.js` carried `nasaId/nasaUrl/nasaCaption` (PIA12910, PIA21131) but the
`sources` table had no columns for them and the INSERT dropped them — proven by
seeding a temp archive and dumping the table (no PIA IDs, no URLs). The
renderer already had a NASA card, so it sat hidden forever. Fix: `nasa_id /
nasa_url / nasa_caption` columns in `src/db.js` (schema + additive migration
for old archives), persisted in `src/seed.js`, returned in
`src/renderer-handlers.js`. Both NASA images are now vendored locally
(`dist/assets/nasa-PIA12910.jpg` 140 KB LRO, `nasa-PIA21131.jpg` 2.6 MB
HiRISE) so the offline archive stays offline under `connect-src 'none'`; the
credit links open in the system browser via a `setWindowOpenHandler` allowlist
(NASA domains only) in `src/window.js`.

### 2. The renderer treated the async bridge as sync (fixed, big)

`src/preload.js` uses `ipcRenderer.invoke` (Promises) but `dist/app.js` read
every channel synchronously — so the shipped window booted to an **empty rail,
zero records**, while the old screenshots showed a working app. The rewrite
also lost the intro map, the `fatal()` boot-failure screen, the rail-note,
`li` rows, and the `action-form` id the harnesses demand. `dist/app.js` was
rewritten: async bridge throughout, intro pixel map (2 grounds, 5 distinct
stakes), 4-panel provenance (Sources now live there, all actions
newest-first), `li` rows with text-equivalent certainty, selection surviving
filters with the outside-filter note, keyboard-only focus to the record
heading (`e.detail === 0`), `role="alert"` failure notice, reachable fatal
screen with rail-count `unavailable`. Two visual bugs caught on captures: the
author `display:grid` beating `[hidden]` (hollow box in the masthead) and
wrapping filter chips. `scripts/shots.js` selector updated; all 8 captures
regenerated against the new UI.

### Verification (all measured this session)

`npm test`: audit **42**, audit-window **18**, verify **36**, check-assets
**44**, render-check **72** — all exit 0. `npm run package` + `package:prove`:
68 + 7 boot + 15 asar-asset (now covers all 11 sprites + both NASA images).
Archive 33 entries, 3.5 MB asar. **302 checks, eight suites, zero failures.**

### Submission wrapper (new)

`README.md` (run / NASA table / verification / layout), `SUBMISSION.md`
(project-page draft with credits, demo beats, link checklist),
`TALK_TRACK.md` figures corrected to 302. Still for the user: push to a
public repo, record the 3-minute demo video, paste the project page.

### Honest limitations

- The `.exe` is still win32/x64 only, unsigned (SmartScreen warns once).
- PIA21131 at 2.6 MB is the full-res Photojournal JPEG; a downscaled copy
  would trim ~2 MB off the asar with no visible difference at 72px.
- `TALK_TRACK.md` history sections still narrate past sessions as they stood;
  only the summary figures were updated.

---

## Session 7 — Real videos, one navigation model, UI that isn't vibeslop

The user looked at the app and said three things: where are the videos, the
navigation is confusing, the UI looks vibecoded — and pasted the
design-methodology skill. Diagnosis before decoration:

- **Discoverability failure (the actual bug):** videos existed nowhere. Only
  3/5 records had any media, served as a squeezed masthead card.
- **Frankenstein navigation:** map stakes and rail rows both opened records
  with nothing saying so; the masthead did four jobs (title, media card,
  filters, search).
- **Shouting match in the masthead:** title + photo card + chips + search all
  competed for primary weight.

### Media: four official videos, verified by search, vendored locally

| Record | Video | Source |
|---|---|---|
| Apollo 11 descent stage | Restored Apollo 11 moonwalk (`S9HdPi9Ikhk`) | Official NASA channel |
| Luna 2 | Tour of the Moon in 4K (`nr5Pj6GQL2o`) | NASA Goddard; labelled as context, since no Luna 2 footage can exist |
| Schiaparelli | Descent in real time (`C43KXGQuUuY`) | ESA visualization |
| Mars landing failures | Seven Minutes of Terror (`Ki_Af_o9Q9s`) | NASA JPL |

Surveyor 1 deliberately got no video — no official NASA video for that
hardware was found, and inventing one would be the false-precision move the
app argues against. Thumbnails vendored (`dist/assets/yt-*.jpg`, 20–42 KB,
JPEG magic bytes checked). Videos stored as `kind: "Video"` source rows, so no
schema migration was needed; thumbs derive from the `v=` param, PIA photos
from the existing map. `setWindowOpenHandler` allowlist extended to
youtube.com / youtu.be / esa.int.

### Navigation: one model, stated in the UI

- Media moved into the record reading flow (**The evidence** block after the
  lede) — the masthead is back to one job: identity + find.
- Rail rows carry `photo` / `film` tags from new `has_video` / `has_photo`
  flags on the list query (constant LIKE patterns, not user input).
- Intro hint now reads: "Two ways in: the map above, the index on the left."
- Sources panel links say what they are: "Watch on YouTube" vs "NASA PIA…".

### Verification

`npm test` all green; `verify.js` gained 3 checks (video attached, per-record
media flags); package contract + asar check extended to the 4 thumbnails.
**317 checks, eight suites, zero failures.** 8 captures regenerated; the Mars
pattern and Surveyor records were eyeballed — evidence block, play marks,
rail tags, clean masthead. Docs (README table, TALK_TRACK figures, SUBMISSION
demo) updated to match.

---

## Session 8 — Navigation calibration with Kole Jain + design-methodology

Ran the Kole Jain loop (intent → precedent → edges → differentiate → one tier
up → de-vibe-code) on top of the methodology's structural diagnosis. Honest
outcome: no new intent exists, so no restructure — the IA (map front door,
rail index, record story, provenance evidence+action) is the conventional
archive pattern and stays. The pass was calibration, five surgical changes:

1. **Rail media tags demoted** from ember to dim. Five tagged rows made the
   accent noise; emphasis is relative, and the evidence block now carries it.
2. **Row meta restored to two edges** (world left, media+era right group) —
   the receipt principle; the floating middle tag broke edge cleanliness.
3. **Masthead readout de-duplicated**: was "5 records", identical to the rail
   count — a repeated KPI. Now "5 records · 2 worlds" (archive size vs view).
4. **Links rescued from browser-default blue** (the one de-vibe tell left):
   `.entry-sub a` in ember-bright, paper on hover.
5. **Intro lede trimmed** to ~16 words: "Colour is certainty; shape is kind."

No harness, schema, or count changes. Full suite + package:prove green,
captures regenerated, intro eyeballed. Committed as session 8.

---

## Session 9 — Three.js observation viewport (and one buried-mark bug)

The ask was an overhaul good enough to win. Rather than re-skin, the front door
got a real 3D surface — an observation viewport, which is the same intent the 2D
map already served (orient before you read), not a new feature.

### What ships

- `src/scene.js` (bundled by esbuild to `dist/scene.bundle.js`, ~510 KB IIFE):
  two seeded-noise strips, five marks planted on them as their own Aseprite
  silhouettes, a low sun for long shadows, orbit-drag + wheel zoom, idle drift,
  raycast picking, and a **fixed 384×240 render target blitted up
  nearest-neighbour** — the 3D is pixelated on purpose, so the identity holds.
- Marks are sampled through a shader that reads *alpha only*. The shipped PNGs
  are masks (uniform RGB, shape in alpha), so multiplying a tint through them
  would render black — a trap the 2D CSS masks never had.
- Camera fit is computed from the bounding box and the *horizontal* fov, because
  the canvas is wide and short: a vertical-fov fit put the whole archive in a
  thin band down the middle of the frame.
- `#no3d` forces the 2D pixel map, which is the fallback for WebGL failure.
  Both read the same rows, so both surfaces agree by construction.

### The bug that made it look cheap

Marks were placed at `ground + 1.5` while their geometry had grown to 9.8 tall —
so every mark was buried 3.4 units *under* the surface and only its top showed.
Three captures were spent on lighting and framing before the cause was obvious:
the anchoring, not the lighting. Fixed with `MARK_HALF_HEIGHT`, plus a thin base
disc so each mark reads as set on ground rather than hovering.

### What the harness says

`render-check.js` grew from 72 to **83** checks: the bundle loads, the scene
comes up, five marks are planted and are five distinct silhouettes, the internal
target is ≤512×320 (pixelation contract), the canvas is nearest-neighbour, the
scene is actually animating (93→118 frames — a never-shown window gets no
requestAnimationFrame at all, which the first attempt hit), and — the one worth
having — **clicking a mark opens its record**, driven by real pointer events at
coordinates the scene reports itself. `audit-window.js` now loads `#no3d`
because its focus checks drive the 2D map.

Total: **328 checks, eight suites, zero failures.**

### Honest limitations

- Three.js is vendored in `vendor/` and bundled by esbuild from source; the
  build is not reproducible in this repo (no package.json dependency), though
  the committed bundle is what ships.
- The 3D intro is where the GPU time goes; opening a record disposes the scene.
- WebGL was available headlessly via SwiftShader, so the fallback path is
  verified *only* through the forced `#no3d` lever, never by a real GPU failure.
