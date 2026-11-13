# AFTERLIGHT

**The missions ended. The stories didn't.**

AFTERLIGHT is an interactive expedition through the hardware humanity sent to the Moon, Mars and beyond. Visitors can inspect a machine in 3D, follow its journey, understand its science and discover what remained when its mission changed or ended.

Built for the [NASA Space Apps Challenge 2026: NASA's Discarded Equipment Storytelling](https://www.spaceappschallenge.org/2026/challenges/nasas-discarded-equipment-storytelling/), AFTERLIGHT brings mission history, engineering and source evidence into one browser experience.

[Explore the live project](https://afterlight-dun.vercel.app) · [Browse the source](https://github.com/RidwanZafir/WideWeaves)

## The problem

A rover's final transmission is memorable. The instruments that made its discoveries possible, the landing equipment discarded along the way and the records explaining its fate are harder to find together. That information is spread across mission pages, technical catalogues, photographs and historical accounts.

AFTERLIGHT connects those pieces. It gives a student or first-time visitor a way to ask: What was this object? Why did it need that design? What did it accomplish? Why was it left behind? What can the evidence actually tell us today?

Discarded hardware also carries space heritage. A descent stage or seismometer can explain an engineering decision and preserve a scientific story after its active work ends.

## The complete experience

The current catalogue contains **166 records: 82 associated with the Moon and 84 with Mars**. Records include vehicles, instruments, landing-system components and debris, with uncertain outcomes identified in their descriptions. This curated collection is not a complete planetary census or a count of 166 intact machines.

| Area | What visitors can do |
| --- | --- |
| Introduction and destination selection | Enter a cinematic expedition, meet Luffy the guide and choose the Moon or Mars. |
| Home | Discover each world's hardware through a 3D landing scene, featured equipment and science highlights. |
| Equipment archive | Search and filter by destination, category and status; sort by name, year or mission. |
| Equipment stories | Follow six chapters: beginning, journey, landing, mission, final days and legacy. Inspect the record, components and sources. |
| 3D viewer | Orbit, zoom, select components, toggle labels, separate an exploded model, reset the camera or enter fullscreen. |
| Planetary map | Explore 33 mapped sites on interactive globes and open related equipment records. |
| Missions and discoveries | Explore 37 timeline milestones and connect scientific findings to the machines that made them. |
| Learn | Read 21 knowledge cards covering planetary science and engineering. |
| Compare and gallery | Study two machines side by side and browse credited mission imagery with captions. |
| The numbers | Examine inventory figures with definitions, sources, dates and published, estimated or project-counted labels. |
| Games | Play Machine Snap, Rocket Quiz, Soft Landing, Find the Rover and Mission Order. |
| For students | Choose seven investigations, follow original sources and print an expedition log. |
| Deep space | Read eight stories about Voyager 1/2, New Horizons, Pioneer 10/11, Dawn, NEAR Shoemaker and Kepler. |
| About and sources | Understand the archive's methods, model interpretation, photography credits and mission references. |

Global search connects equipment, sites, facts, milestones and deep-space stories. Browser history supports returning to previous views. Discoveries, completed stories, unlocked facts and game achievements persist on the visitor's device.

## Why it is useful

**For learners**, the object becomes a starting point for understanding science. Selecting a rover component links its physical role to the mission's purpose; comparing machines exposes changes in power, mobility and landing design.

**For teachers and families**, investigations provide questions, suggested age ranges, steps and an evidence-based output. Learners can build a component-to-function table, compare landing sequences or explain what scientific value survived a mission's end. Activities ask them to record a source and an unresolved question, encouraging research rather than answer copying. Written answers remain in the learner's notebook; the app does not collect them.

**For public audiences**, stories make technical records approachable while retaining a path back to the publisher. Mission endings become part of a longer account of discovery.

**For future contributors**, one shared equipment record feeds the archive, search, comparison, gallery and related views.

## A short demonstration

1. [Open Opportunity](https://afterlight-dun.vercel.app/#/mars/equipment/opportunity). Read its mission and final days, then inspect the wheels, solar panels and instruments in the 3D viewer.
2. Compare it with another rover. Explain how a different power source or hardware suits a different mission.
3. Open the planetary map for location context, then follow a cited source to distinguish a documented fact from an interpretation.
4. Switch to the Moon and browse the archive. Investigate why an Apollo descent stage stayed behind while the crew returned.
5. Open **For students**, choose an investigation and print the expedition log. Finish with a knowledge card or game to revisit the ideas.

Search opens with **Ctrl/Cmd + K** or **/**. Arrow keys navigate search results and story chapters; **Escape** closes search or the menu. Sound can be turned off, and stories remain readable through text and subtitles.

## Evidence and interpretation

AFTERLIGHT uses curated mission records, NASA challenge resources, historical catalogues and credited imagery. Sources appear beside relevant content. The archive is included in the build: it does not automatically ingest live datasets, track spacecraft positions or continuously refresh mission status.

Several distinctions are essential:

- NASA's **796 lunar items** figure is a historical line-item count associated with its 2012 catalogue, including tools and other material. It is not 796 intact spacecraft or a current inventory.
- The **190+ objects on Mars** figure comes from an independent, non-exhaustive estimate at spaceartefacts.com. Statistics retain their cutoffs; unknown totals remain unknown.
- Equipment viewers use educational reconstructions, shared hardware-class schematics and illustrative debris. They simplify geometry and final condition, and are not flight CAD. Official NASA model downloads are linked separately where available. The introduction renders an official Apollo Lunar Module model alongside a reconstructed Mars rover.
- Captions distinguish object photography from representative hardware, illustrations and terrain context. A mission reference does not establish an individual object's exact coordinates.
- Operating spacecraft, retired missions and uncertain outcomes receive different descriptions. Deep-space stories retain their actual surface, orbital or outward-travelling context.

## Run locally

Requires **Node.js 20.9 or newer** and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:4310](http://localhost:4310). Check and build the application with:

```bash
npm run typecheck
npm run build
npm run start
```

The production server uses port 4310. No database, account or NASA API key is required.

Narration can optionally use ElevenLabs through the server's `/api/voice` route. Set `ELEVENLABS_API_KEY` in `.env.local` for development or in the deployment environment. Keep that key on the server. When the service is unavailable, narration falls back to browser speech; reading and navigation continue normally.

## Architecture and assets

AFTERLIGHT uses Next.js 16, React 19, TypeScript, Three.js, React Three Fiber, Tailwind CSS, Zustand, Framer Motion and GSAP. A single application shell manages hash-based views; shared typed data drives the archive and connected features.

```text
app/          Application entry, global styles and narration API
components/   Views, 3D scenes, models, story controls, games and guide
data/         Equipment, mission history, science, research and provenance
lib/          Navigation, local progress, speech and rendering profiles
public/       Mission images, textures, terrain, model and decoder assets
scripts/      Image fetching and globe-generation utilities
```

3D scenes load as needed and adjust rendering resolution to the device. Unavailable WebGL has a visual fallback with written content. The interface supports mobile layouts, keyboard operation and reduced-motion preferences. Progress is browser-local and does not sync across devices.

Mission photography retains publisher credits in `data/nasa-credits.json`. NASA media are generally public domain in the United States, subject to individual source-page and third-party notices. Solar System Scope textures use CC BY 4.0. NASA/USGS terrain and model sources are documented in the asset manifest. AFTERLIGHT is independent and does not imply NASA endorsement.

Ready-to-use assets are included. Image-fetch scripts overwrite images and regenerate credits; globe generation requires Python and Pillow. Ordinary setup does not require either utility.

## Why AFTERLIGHT deserves to win

AFTERLIGHT deserves to win because it makes the challenge's subject understandable, explorable and useful. It gives discarded equipment a complete story: the need that created it, the journey that delivered it, the science it enabled and the legacy that outlasted its mission.

Its strongest contribution is the connection between experience and evidence. Visitors move from a machine to a component, a scientific result and an original source. The 3D presentation invites curiosity; classroom investigations turn that curiosity into a concrete research task.

The project also treats credibility as part of its design. It separates estimates from published counts, schematics from official models and context images from artifact photographs. That makes it a stronger educational resource than a presentation that hides uncertainty behind impressive visuals.

With 166 catalogue records, guided stories, comparison, maps, science content, five games and seven investigations implemented, AFTERLIGHT offers a substantial working experience. Its case for winning rests on what visitors can do today: understand the hardware, question the evidence and carry the story forward.
