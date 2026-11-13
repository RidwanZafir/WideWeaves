# AFTERLIGHT

**The missions ended. The stories didn't.**

An interactive 3D expedition through the human-made hardware left on the Moon and Mars — built for the NASA Space Apps Challenge 2026 brief *“Abandoned but not Forgotten: Storytelling about NASA’s Discarded Equipment on the Moon and Mars.”*

## Run it

```bash
npm install
npm run dev        # http://localhost:4310
npm run build      # production build
```

Requires Node 20.9 or newer.

## What’s in the experience

| Area | What you get |
| --- | --- |
| **Intro** | Cinematic title card → Luffy the guide introduces the expedition (typewriter dialogue, poses, speech-bubble narration via the Web Speech API, replay). |
| **Home** | Cinematic 3D landing scene per destination (Mars rover / lunar module on levelled terrain, Earth rise, atmosphere, drifting dust), destination rail, equipment cards, record panel, stats teaser, timeline, knowledge cards. |
| **Explore** | Full catalogue with filters (planet, category, status), sort (name, year, mission) and search. |
| **Equipment detail** | Six-stage guided story, overview, **3D model** with assembled / exploded view, component selection, mission timeline, discoveries, gallery and sources. |
| **3D viewer** | Auto-framed procedural reconstructions, orbit / zoom / pan / reset / fullscreen, exploded component offsets, floating component labels, selected-component panel. |
| **Map** | Interactive 3D globe (Moon / Mars) with landing-site markers typed by status, search, info card and “explore” hand-off. |
| **Stats** | Animated counts with a *separate* breakdown by object type, and an explicit published-vs-estimated badge plus sources for every number. |
| **Missions, Discoveries, Learn, Gallery, Compare** | Cited timeline milestones, discovery write-ups, knowledge cards, original image metadata, and side-by-side comparison with mission references. |
| **Deep Space** | Eight spacecraft stories with four chapters each: Voyager 1/2, New Horizons, Pioneer 10/11, Dawn, NEAR Shoemaker and Kepler. Separate operating and retired craft; locations describe their actual surface, orbit or region. |
| **Students & About** | Seven source-based investigations and a searchable NASA research library covering every supplied challenge resource, NASA Open Data, NASA APIs, Earthdata and JPL. |
| **Story mode** | Chapter-by-chapter cinematic documentary with prev / next / skip / replay, keyboard arrows and subtitles. |

## Structure

```
app/                 Next.js App Router entry (single-page shell, hash routing)
components/
  three/             HeroScene, IntroScene, Scene3D (WebGL guard + lazy mount)
  models/            EquipmentModel — procedural, articulated reconstructions
  viewer/            EquipmentViewer (orbit, exploded view, labels)
  views/             One component per route
  sections/          Equipment cards, record panel, lightbox
  guide/             Luffy character + guide dock
data/                Typed mission data: equipment, sites, stats, timeline,
                     knowledge, components, guide lines, NASA credits
lib/                 Zustand store (routing, progress, sound) + speech helpers
scripts/             One-off asset fetchers (NASA image API, map pins)
public/              Textures + NASA imagery (public domain)
```

All mission content lives in `data/` as typed objects — adding a machine means adding one record, and it appears in the catalogue, search, map, comparison and stats automatically.

## Data honesty

* Moon totals come from NASA’s 2012 *Catalogue of Manmade Material on the Moon* (NASA/TP-2012-216051); Mars totals are from the independent spaceartefacts.com inventory and are labelled **estimated**, not measured.
* Item counts are never presented as counts of intact machines — the stats view states the definition, the source and the verification date for every figure, and marks reconstructions as reconstructions.
* Each equipment record identifies its model provenance as an official agency model or an educational reconstruction; reconstructions are not flight CAD.

## NASA challenge resources

The [2026 challenge resource list](https://www.spaceappschallenge.org/2026/challenges/nasas-discarded-equipment-storytelling/?tab=resources) is mapped in `data/resources.ts`. Specific mission references support NASA/JPL equipment records and appear throughout the stories, map context, comparison, discoveries and timeline. The research library explains each resource's scope, access requirements and use. The classroom investigations connect hardware to science and require learners to follow the evidence.

The archive is curated into the build; source links do not automatically ingest datasets or refresh mission status. The image scripts use NASA's keyless Image and Video Library API. Some services at api.nasa.gov require a standard NASA API key; there is no Space Apps-specific key. Earthdata is an Earth observation research path, and some services require Earthdata Login. No API key is needed to run AFTERLIGHT.

NSSDCA links supplied under LRV and ALSEP headings identify their parent Apollo spacecraft. Those references do not establish an individual item's coordinates. Map positions retain their existing approximate coordinate compilation and separate location provenance from mission context. Dawn, NEAR, Pioneer and Kepler belong in their actual off-world locations, despite the challenge placing their links under its Mars heading.

Source review on 13 November 2026 incorporates NASA's report that Perseverance surpassed Opportunity's 45.16 km rover distance record on 11 October 2026, reaching 45.22 km. Historic lunar and Mars inventory totals retain their original dates and definitions.

## Performance & accessibility

Scenes are lazily mounted (IntersectionObserver), rendering resolution is capped by device profile, and unavailable WebGL falls back to photography or a gradient plus the written record. Reduced-motion preferences limit motion rather than disabling every animation. The current public asset inventory contains 38 files totaling 14,213,966 bytes (about 13.6 MiB).

## Credits

Planetary maps: [Solar System Scope](https://www.solarsystemscope.com/textures) (CC BY 4.0). Mission photography: NASA / JPL-Caltech (public domain). Full per-image attribution is generated in `data/nasa-credits.json` and listed in-app under **About → Sources**.
