# Space Apps submission draft — paste into the project page

## Title

Abandoned but Not Forgotten — a stewardship workspace for NASA's discarded
hardware on the Moon and Mars

## Elevator pitch (1 paragraph)

Every object we left on the Moon and Mars is a record — and the record is
what's rotting. This desktop app treats each piece of abandoned hardware as a
living file: what it is, why it was left, what it taught us, how well we know
where it is, who cares, and what should happen next. It never fakes precision
it doesn't have, and it turns readers into curators with a real write path:
propose a next action and it lands in a local SQLite archive that survives
restarts. Hand-drawn pixel art throughout, zero gradients, fully offline.

## Challenge fit

The challenge asks for storytelling about discarded equipment. Nostalgia is
not a problem statement, so the entry names four concrete failures and fixes
them: **false precision** (sites marked approximate instead of invented
coordinates), **lost rationale** (abandonment reason kept with the object),
**institutional memory loss** (lessons attached before the people retire),
and **no coordination channel** (a next-actions queue per record).

## Data used (judges check this)

- **PIA12910** — Surveyor 1 on Oceanus Procellarum (LRO NAC;
  NASA/GSFC/Arizona State University). Vendored thumbnail, NASA's own caption,
  link to https://images.nasa.gov/details-PIA12910
- **PIA21131** — Schiaparelli impact site on Mars (MRO HiRISE;
  NASA/JPL/University of Arizona). Caption + link to
  https://images.nasa.gov/details-PIA21131
- Curated pilot records (Surveyor 1, Apollo 11 descent stage, Luna 2,
  Schiaparelli EDM, Mars landing failures as a first-class category) modelled
  on how mission anomaly reports and imagery archives actually describe
  hardware. Labelled as demonstration data, not a NASA feed.

## Demo (3 minutes)

1. Launch `release/abandoned-but-not-forgotten-win32-x64/abandoned-but-not-forgotten.exe`.
   Two pixel ground strips, five stakes — colour is certainty, shape is kind.
2. Click **Surveyor 1**: the healthy record. Read the lesson, note the NASA
   PIA12910 card with real LRO imagery.
3. Click **Schiaparelli**: "No other tool in this space would write that
   sentence. Most would invent a coordinate."
4. Type `collision` in search: lands on Luna 2 via its *lesson*.
5. Filter to Mars: the open record stays, the rail explains why.
6. File a next action on Surveyor 1, quit, reopen — still there. The dent.

Full script: `TALK_TRACK.md`. Screenshots: `shots/contact-sheet.html`.

## Tech

Electron 44 (sandboxed, context-isolated, DevTools disabled at two layers),
SQLite via sql.js (WASM, zero native deps), hand-authored CSS, Aseprite pixel
art. 302 automated checks, eight harnesses, packaged artifact verified
byte-for-byte. Windows portable build included; runs offline.

## Team

- [Your name / handle] — concept, build, verification, pixel art
- NASA imagery: NASA/JPL-Caltech, LROC (ASU), HiRISE (U. Arizona) — credited
  in-app per record

## Links to attach

- [ ] GitHub repo URL (this folder, pushed)
- [ ] Demo video URL (record the 3-minute script above; unlisted is fine)
- [ ] `shots/contact-sheet.html` stills as backup if the video fails
