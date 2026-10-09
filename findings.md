# Findings & Decisions

## Requirements

- Challenge title: "Abandoned but not Forgotten — Storytelling about NASA's Discarded Equipment on the Moon and Mars"
- Deliverable: an app with a proper UI design
- Platform constraint: Electron, hardlocked, no access to DevTools
- The app should "make a dent in the world" — solve a real-world problem
- The concept should do what the challenge name suggests
- User is open to other tech if needed; leaving concept choice to me

## Research Findings

### 1. What the title is actually saying

- "Abandoned but not forgotten" is a memorial/legacy framing. It points at hardware that was left behind and is still there.
- "Storytelling about NASA's discarded equipment on the Moon and Mars" is the content lens: each object is a story, not just a catalog entry.
- The strongest interpretation is not "make a gallery of cool old spacecraft parts." It is: every abandoned piece of NASA hardware is a witness, a location, a lesson, and often a liability. The forgotten things still matter to people.

### 2. The real-world problem space this can plausibly touch

The concrete problems hiding behind the title:

- **Heritage and preservation risk.** Off-world artifacts are a finite, non-renewable record. Once disturbed or undocumented in detail, a site's context is degraded. This is a real concern in lunar/Mars policy discussions and planetary protection heritage circles.
- **Mission-memory / institutional memory loss.** Hardware abandonment is also a human story: why was it left, who built it, what did it teach, what decision let it stay. That narrative is often scattered, informal, and at risk of being lost.
- **Public understanding.** A lot of "abandoned equipment" rhetoric online is romanticized or imprecise. A credible tool that pairs each object with accurate context, location, status, and significance is a real civic/infrastructure contribution.
- **Downstream planning and coordination.** The practical long-term issue is that future missions, sites, heritage registers, educators, and the public need a trustworthy way to talk about what is there, what it is, and why it matters. A single authoritative-ish narrative+location+status tool is useful infrastructure, not a one-off story.

### 3. The strongest angle for a NASA Space Apps entry

A Space Apps entry scores when it is:
- Credible about the subject
- Clear about what it does and does not do
- Built around a tangible workflow, not a slogan
- Honest about data while still being compelling

Best fit concept direction: a desktop application that treats each abandoned object as a **living record** — location, what it is, why it was abandoned, what it taught, what its status is, who cares, and what should happen next. The tool's job is to make forgotten hardware legible and actionable, not merely nostalgic.

That reframes the whole thing from "storytelling" (presentation) to "memory + stewardship" (a real problem): preserve context, reduce ambiguity, make the legacy usable by the people who will actually act on it — curators, educators, mission historians, advocacy folks, and future-site planners.

### 4. Why this is a "dent in the world" concept

- It turns a poetic title into a real stewardship problem: forgotten hardware is a heritage and memory asset that can be degraded, misinterpreted, or lost.
- It gives a structured workflow that can accept contributions, verify what is known vs. uncertain, and connect each object to a next action rather than just a caption.
- It can be honest about uncertainty (plausible locations, contested status, lost documentation) instead of faking authority, which is the credible move for this subject.
- It is usable by a real audience even in MVP form: historians, educators, space-heritage enthusiasts, and mission-interested public.

### 5. Boundaries to be honest about now

- In MVP, the app is a credible tool and narrative framework shipped with curated/pilot data and a clear contribution story. It is not magically tapping into a secret NASA database.
- The honest story for judges: the problem is real, the framework is real, the demo shows the workflow on real-ish objects, and the architecture is built to grow with better data.

## Tech Stack (locked)

- Runtime: Electron, hardlocked, DevTools disabled.
- Data layer: **sql.js** — real SQLite in-process, pure JS/WASM, no native compilation. Gives us a genuine relational data layer in the MVP so the app is a working tool, not a mock screen.
- Data shape: relational schema with objects, locations, abandonment records, lessons, status, sources, uncertainty flags, and a next-actions ledger.
- UI: hand-authored HTML/CSS design system. No Tailwind. Archival/documentary subject wants an intentional bespoke system, not a utility bootstrap.
- Styling approach: CSS custom properties for the design tokens, reserved leitmotif classes for archive, object record, and provenance surfaces.

## Design Direction (locked)

### One sentence identity

An archival, cold-but-caring desktop workspace for forgotten space hardware — the UI should feel like a serious preservation tool that still lets each object's human story breathe.

### Visual language (recommended, not mandated)

- Palette: deep quiet space background as the canvas, warm paper/parchment tonality for narrative text, muted metallic accents for hardware identity, one restrained accent for emphasis (not loud neon). This keeps the app feeling documentary, not arcade.
- Type: a serif or serif-leaning narrative voice for the human story, a clean sans for structure and metadata. If both are generic system families, that is fine for MVP as long as they are used with intention and consistency.
- Texture: very subtle grain / scanned-document feel in the story surfaces only, so the app reads as preserved memory rather than flat modern SaaS.
- Motion: quiet and purposeful — reveals, transitions, and state changes should feel like turning pages and opening files, not like a showpiece.

### Information architecture

- Three tiers of experience:
  1. **The forgetting** — an opening that sets the stakes: this is hardware still out there, and memory of it is fragile.
  2. **The archive** — the working browse: filterable, searchable, grouped by world and era, each object presented as a record, not a postcard.
  3. **The object's life** — the deep view: identity, location, abandonment reason, lesson, status, who cares, what we still don't know, and a next-action hook.

- Core navigation model:
  - Left: archive browser with filters and search.
  - Center: object record / story.
  - Right (contextual): provenance, sources, uncertainty, and next actions.
- Empty states and partial data are first-class: this subject is full of "probably," "probably not," and "we lost the paperwork." The UI should treat that honestly.

### UX principles

- Document uncertainty, do not hide it.
- Make the human story primary; metadata supports it.
- Give every object a "what happens next" moment, not just a backstory.
- Design for the real usage case: someone opening this to understand one object deeply, then moving to compare several.

## Issues Encountered

| Issue | Resolution |
|-------|------------|
| init-session.sh did not produce an obvious .planning directory | Writing planning files directly next to the workspace |

## Resources

- Challenge title and framing: user prompt
- Skills read: hyperframes, hyperframes-core, planning-with-files, design-methodology
- Tech checks: node 24.18.0.0, npm 12.0.1, electron npm package available, sql.js 1.14.2, better-sqlite3 13.0.3, electron-store 11.0.2, postcss 8.5.29, autoprefixer 10.6.1

## Visual/Browser Findings

- None yet; design will be done from scratch for this concept.

---

*Update this file as discovery continues.*
