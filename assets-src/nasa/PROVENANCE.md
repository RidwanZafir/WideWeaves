# NASA media — provenance

Every non-pixel asset this app ships, where it came from, and what it is used
for. The pixel art in `assets-src/*.aseprite` is hand-drawn and needs no
citation; everything below is NASA's and is credited back to the source.

The app is offline by design (`connect-src 'none'`), so these files are
**vendored into the repository** rather than hot-linked. That is also why this
file exists: a vendored file with no recorded source is an untraceable claim.

## Photographs — `dist/assets/`

| File | Source | Credit | Used on |
|---|---|---|---|
| `nasa-PIA12910.jpg` (140 KB) | https://assets.science.nasa.gov/content/dam/science/psd/photojournal/pia/pia12/pia12910/PIA12910.jpg — [Photojournal record](https://science.nasa.gov/photojournal/surveyor-1-americas-first-soft-lunar-landing) | NASA/GSFC/Arizona State University | Surveyor 1 |
| `nasa-PIA21131.jpg` (2.5 MB) | https://assets.science.nasa.gov/content/dam/science/psd/photojournal/pia/pia21/pia21131/PIA21131.jpg — [library page](https://images.nasa.gov/details-PIA21131) | NASA/JPL-Caltech (MRO HiRISE) | Schiaparelli EDM lander, Mars landing failures |

**PIA12910** — *Surveyor 1 — America's First Soft Lunar Landing.* LRO Narrow
Angle Camera. NASA's caption is stored with the record and shown verbatim in the
app's evidence block.

**PIA21131** — *Closer Look at Schiaparelli Impact Site on Mars.* MRO HiRISE,
NASA/JPL-Caltech/University of Arizona. This is the honest one: the image shows
the scar, not an intact craft, which is the point the record is making.

> PIA21131 is the full-resolution 2.5 MB Photojournal file. It is displayed at
> 128×96 in the app, so a downscaled copy would cut roughly 2 MB from the archive
> with no visible difference. Kept full-size for now so the vendored file is
> bit-identical to NASA's.

## Video thumbnails — `dist/assets/`

These are YouTube thumbnail images, used only as static preview tiles. **No
video is embedded and nothing is streamed** — each card is a link that opens in
the user's browser. The app never loads a player, a script, or a cookie from
YouTube.

| File | Video | Channel |
|---|---|---|
| `yt-S9HdPi9Ikhk.jpg` | *Restored Apollo 11 Moonwalk — Original NASA EVA Footage (1969)* | NASA (official) |
| `yt-nr5Pj6GQL2o.jpg` | *Tour of the Moon in 4K* | NASA Goddard |
| `yt-Ki_Af_o9Q9s.jpg` | *Seven Minutes of Terror: The Challenges of Getting to Mars* | NASA Jet Propulsion Laboratory |
| `yt-C43KXGQuUuY.jpg` | *Schiaparelli's descent to Mars in real time* | ESA |

Thumbnails fetched from `https://i.ytimg.com/vi/<id>/hqdefault.jpg`. NASA media
is generally not copyright-restricted; the four video thumbnails here are used
for identification and citation of publicly published NASA/ESA material.

### One deliberate gap

**Surveyor 1 has no film.** No official NASA video of that specific hardware was
found. Rather than attach a video of something else and let the record imply it
was Surveyor, the entry ships with its photograph only — which is the same
honesty the app argues for everywhere else.

Similarly, **Luna 2's video is lunar context, not the hardware**: Luna 2 was
destroyed on impact, so no footage of it can exist. The record says so in the
caption rather than quietly borrowing an Apollo video.

## Re-fetching

```sh
# Photographs
curl -o dist/assets/nasa-PIA12910.jpg https://assets.science.nasa.gov/content/dam/science/psd/photojournal/pia/pia12/pia12910/PIA12910.jpg
curl -o dist/assets/nasa-PIA21131.jpg https://assets.science.nasa.gov/content/dam/science/psd/photojournal/pia/pia21/pia21131/PIA21131.jpg

# Video thumbnails
curl -o dist/assets/yt-S9HdPi9Ikhk.jpg https://i.ytimg.com/vi/S9HdPi9Ikhk/hqdefault.jpg
curl -o dist/assets/yt-nr5Pj6GQL2o.jpg https://i.ytimg.com/vi/nr5Pj6GQL2o/hqdefault.jpg
curl -o dist/assets/yt-Ki_Af_o9Q9s.jpg https://i.ytimg.com/vi/Ki_Af_o9Q9s/hqdefault.jpg
curl -o dist/assets/yt-C43KXGQuUuY.jpg https://i.ytimg.com/vi/C43KXGQuUuY/hqdefault.jpg
```

`scripts/package.js` asserts all six are present in the shipped archive, and
`scripts/asar-asset-check.js` asserts each one loads out of the asar at a
non-zero size — a vendored asset that never made it into the build is a claim
the deliverable cannot support.