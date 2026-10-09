# Task Plan: "Abandoned but not Forgotten" — NASA Space Apps entry

## Goal

Deliver the strongest possible NASA Space Apps entry for the challenge
"Abandoned but not Forgotten: Storytelling about NASA's Discarded Equipment on
the Moon and Mars" — a hardlocked Electron app whose concept solves a real-world
problem and whose UI is the best possible version of it.

## Current Phase

Complete — built, verified, reviewed, documented, packaged, and audited.

## Phases

### Phase 1: Requirements & Discovery — complete

- [x] Read the relevant skill files (planning-with-files, design-methodology)
- [x] Confirm workspace and tooling state (electron / npm / node availability)
- [x] Name the core tension in the challenge title and turn it into a real problem
- [x] Research the strongest real-world problem entry points
- [x] Decide the single concept to build and document it in findings.md

### Phase 2: Concept & Design — complete

- [x] Define the app's one primary job and the supporting jobs
- [x] Design the data layer and the demo data strategy
- [x] Design the hardlocked Electron UX (shell, navigation, states, identity)
- [x] Validate the design against the design-methodology checklist

### Phase 3: Build the Artifact — complete

- [x] Scaffold the Electron project (hardlocked, DevTools cancelled)
- [x] Implement the data layer and seed pilot data
- [x] Build the UI shell and navigation
- [x] Build the core workflow end to end with real data
- [x] Hook the real-world action (propose a next action) into the app
- [x] Verify it runs as a standalone Electron app

### Phase 4: Quality & Presentation — complete

- [x] Self-critique the UI adversarially, from captures rather than code
- [x] Fix every defect the verification and review passes exposed
- [x] Write the judge-facing talk track (TALK_TRACK.md)

### Phase 5: Handoff — complete

- [x] Verify final files and run the app once more
- [x] Summarize concept, real-world problem, and how to present it

### Phase 7: Audit the boundary — complete

Opened by an audit request. Found by measurement, not by reading.

- [x] Prove or discard each suspected defect before changing anything
- [x] Make a failed boot still open a window, so the error screen is reachable
- [x] Escape LIKE wildcards and cap the query length
- [x] Validate every argument at the IPC boundary and refuse writes to missing records
- [x] Enforce the schema's foreign keys — including after every save, since `export()` reopens the connection
- [x] Report failed opens and refused writes instead of swallowing them
- [x] Keep keyboard focus when a column is redrawn
- [x] Add two harnesses so none of it can regress silently

### Phase 6: Ship a correct artifact — complete

Opened when the packaged build was inspected and turned out to be wrong.

- [x] Find out what the packaged app actually contains (it contained no artwork)
- [x] Replace the blacklist packaging step with an allowlist
- [x] Assert the shipped contract by reading the archive back
- [x] Boot the real executable and confirm it creates its archive
- [x] Confirm the sprites load out of the asar at true 1:1 size

## Key Questions

1. **What real problem hides behind the title?** Answered: false precision, lost
   rationale, institutional memory loss, and no coordination channel for what
   happens to heritage hardware next.
2. **Which concept maximizes impact while staying feasible?** A curator's
   workspace that treats each object as a living record with an uncertainty
   model and a next-actions queue — not a gallery.
3. **What is the honest scope?** Five curated pilot records in the exact shape a
   real feed would take, over a schema and workflow that are real. The app never
   claims precision it does not have; that honesty is the thesis.

## Decisions Made

| Decision | Rationale |
|---|---|
| Persistent planning via planning-with-files | Multi-phase, research-heavy, needs durable state on disk |
| Design-first, then build | Structure before style; flows before screens |
| Hardlocked Electron, no DevTools | User requirement, non-negotiable |
| Memory + stewardship framing, not nostalgia | The title is poetic; the entry has to solve something |
| Hand-authored CSS, not a framework | The subject is an archival document and should look like one |
| One restrained accent colour | Semantic colour (certainty) is the only colour that carries meaning |
| Central column warm serif, side columns cold sans | Story and evidence are different materials and must not look alike |
| `sql.js` (WASM) over a native driver | Real SQLite with no native compile step |
| Data directory injected by the host | Keeps the DB layer platform-free and testable under plain node |
| Two harnesses (headless data + real window) | A passing data test does not prove a GUI renders |
| Audit by measurement, not by reading | Every defect in the audit pass was reproduced with the falsifying output quoted before it was fixed. Two of the nine findings turned out to be my own fix, caught because the harness printed what it actually saw instead of agreeing with me |
| The window opens on every path, including failure | A designed error screen that cannot be reached is worse than no error screen — it is the appearance of handling a case |

## Errors Encountered

| Error | Resolution |
|---|---|
| `init-session.sh` produced no visible `.planning` dir | Used the template content directly and wrote planning files next to the workspace |
| Worked in a wrong hand-made directory for part of session 1 | Re-anchored to the real workspace; the stray directory is unrelated and ignored |
| `require("sql.js")` treated as a constructor | It returns `initSqlJs`; must be awaited, then `new SQLModule.Database(...)` |
| Meta CSP `frame-ancestors` warned on every boot | Removed — the directive is ignored in a `<meta>` policy |
| CSP refused an inline `style` attribute | Moved the spacing into `styles.css`; never relax to `'unsafe-inline'` |
| **DB written to `process.cwd()` instead of `userData`** | `src/db.js` tested a bare `app` it never imported, so the branch was dead. Data dir is now injected by the host, with a regression check |
| Action button lost below 1180px | The provenance column was `display: none` while the window minimum was 1024px. Columns now tighten instead of dropping |
| Filtering reset the whole workspace | The open record now survives filtering; the rail reports it is outside the filter |
| "No DevTools" was only verified by reading the source | Added `devTools: false` as a second lock layer and asserted `openDevTools()` is refused in the running window |
| `getLastWebPreferences()` returned `devTools: undefined` | The getter structurally omits `devTools`; the assertion was wrong, not the lock. Test moved to behaviour + the shipped options object |
| **The packaged build contained no `dist/assets/`** | The bundle predated the pixel pass, so every sprite mask in the delivered app pointed at a missing file while the repository was correct. Packaging now compares the packaged `dist/` byte-for-byte against the verified one |
| Packaging shipped planning notes, captures, harnesses and the bulk of its build tooling | A blacklist cannot enumerate what it does not know about. Inverted to an allowlist of exactly what the runtime reads; archive 37.4 MB → 0.8 MB, 606 entries → 26 |
| `asar.listPackage`, `asar.extractFile` and the compare step disagreed on path separators | `listPackage` returns `\dist\x`, `extractFile` splits on `path.sep` (so `dist\x` on Windows). Normalised the listing, used `path.join` for extraction |
| **A damaged archive produced no window** — a bootstrap failure skipped `createWindow()`, leaving live processes and a blank desktop | The window now always opens and every channel rejects with the reason, so the renderer's existing "The archive did not open." state is reachable. Verified on the packaged `.exe` |
| Search returned the whole archive for `%`, and `surv%yor` matched "Surveyor" | Parameterised queries still passed wildcards through to LIKE. Escaped `%`, `_` and `\`, declared `ESCAPE '\'`, capped the length |
| **`PRAGMA foreign_keys = ON` read back as 0** after the first save, so enforcement lasted one write | sql.js's `export()` closes and reopens the connection, resetting connection-level pragmas. Moved into `applyConnectionPragmas()`, called on open and after every export |
| A next action could be filed against a non-existent object, creating an unreachable row | `PRAGMA foreign_keys` was off. Now enforced, plus an explicit existence check so the failure arrives as a sentence |
| `objects(null)` threw `Cannot read properties of null` at the IPC boundary | A default parameter only covers `undefined`. Normalised the argument and validated every field |
| **My own focus fix never fired** — `BUTTON -> BODY` | I read `:focus-visible` at restore time, after the element was detached, where it can never match. The modality is now captured while the element is still connected |

## Notes

- The challenge title does two jobs: a "storytelling" framing and a concrete
  subject. The strongest entries convert the poetic half into a problem and then
  build the tool that moves it.
- Building the verification harness *before* trusting the UI was the highest
  leverage decision in this project: every serious defect found here was found by
  running the app, not by reading it.
- Five of the seven fixes in the final pass were invisible to code review and
  obvious the moment the app was rendered and looked at.
