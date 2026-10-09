# More pixel art + NASA resources — design notes

## Goal
- Push the interface toward ~80% pixel art without breaking the existing pixel/no-gradient rule, and make it feel less produced-smooth by using a deliberately lo-fi, archival feel.
- Tie records to real NASA material so the app stops reading like generated prose and reads more like a curated field record.
- Use Aseprite MCP to author/redraw sprites and tile-based UI pieces.

## Art direction
- Keep the palette voice (cold instrument vs warm record) but act more obscure: slightly less cleanup on edges, a few intentional dither gaps, a 1px grid discipline on UI.
- Expand sprite coverage:
  - New UI chrome sprites where it makes sense (e.g. check marks, world chips, focus ticks), still as CSS masks so they stay tintable.
  - One more marker sprite for Surveyor 3 / hardware-in-situ where the data supports it (not for hardware we don't have).
  - A small reusable pixel frame/scanline/grain layer is fine as long as it's a flat sprite, not a gradient.
- Every existing check in `scripts/check-assets.js` must still pass. No new sprites allowed if they break the stencil/tile contract.

## NASA sourcing (illustrative, for each record)
Illustrative examples only; final choice confirmed before shipping:

- Surveyor 1:
  - PIA02976 — Surveyor 1 Shadow (JPL)
  - PIA12910 — Surveyor 1 spacecraft on Oceanus Procellarum (JPL/GSFC/ASU)
  - LRC-1967-B701_P-04028 — Surveyor 1 on lunar surface
  - Reference the real NASA Image and Video Library page + JPL/PIA provenance notes.
- Surveyor 3 (Apollo 12 hardware still there):
  - as12-48-7121, AS12-48-7133, as12-48-7099 / as12-48-7110 — astronauts at Surveyor 3
  - Use only the Apollo-era photos that actually show the hardware; don't claim anything NASA didn't publish.
- Luna 2:
  - No good imagery of the hardware itself in NASA's catalog.
  - Use a LRO-era lunar surface context image only where it genuinely applies; otherwise keep the entry text-and-citation rather than forcing a photo.
- Schiaparelli EDM:
  - PIA21131 — Closer Look at Schiaparelli Impact Site on Mars (JPL/HiRISE)
  - Use it as the honest "we can see the scar, not the intact craft" image.
- Mars 98 landing failures (Mars Polar Lander / Deep Space 2 / Nozomi if applicable):
  - Pick one real supporting NASA image / landing site context / hardware photo rather than a generic spacer.
  - Do not invent a photo for a probe NASA doesn't have imagery for; mark it as such.

## NASA video handling
- Don't embed YouTube/IDM players. The app is a pixel archive, not a browser.
- Instead: cite NASA videos where they are genuinely story-bearing (JPL photojournal entries, NASA feature pages, official mission pages) as links plus a one-line note per record.
- Prefer native NASA image+caption assets over embedded video. Video only if it is the actual strongest item for the story and we still present it as a link/caption card, not a media player inside the app.

## Content voice
- Tone: less "explanatory AI doc", more field notebook. Terser. Concrete. Less cleanup on the emotional adjectives.
- Rewrite the weakest copy: intros, hints, empty states, marker tooltips, legend copy.
- Don't touch the thesis. Keep the 4 problems framing.

## Data model changes
- Add a `nasa` shape to `sources`/`stakeholders`-ish area only if needed, but ideally treat NASA material as sourced references already supported by existing schema (sources table). No schema expansion unless really needed.
- If adding image/video citation fields per record, add them carefully and add migration tests.

## Files to touch (tentative)
- `dist/styles.css` — pixel-ier UI; keep no-gradient rule.
- `dist/index.html` — new sprite slots, new source/video citation chrome.
- `dist/app.js` — new source listing, citation UI, maybe a small "NASA reference" panel.
- `src/seed.js` + `src/renderer-handlers.js` — per-record NASA references.
- `assets-src/*.aseprite` — new/redrawn sprites via Aseprite MCP.
- `dist/assets/*.png` — exports + `node scripts/check-assets.js --art` verification.
- `scripts/check-assets.js` — add specs for new sprites.
- `scripts/audit.js` + `scripts/render-check.js` as needed for new behaviors.

## Non-goals
- No embedding of full NASA video players.
- No schema expansion unless the content demands it.
- No removal of existing pixel/silhouette work; extend it.
